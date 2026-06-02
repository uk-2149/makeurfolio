// --------------------------------------------------------------------------
// Gemini Prompt Builders
// --------------------------------------------------------------------------
// System prompt + user prompt construction. The system prompt enforces:
//   - JSON-only output matching NormalizedProfile
//   - Resume-first for personal data, GitHub-first for technical data
//   - Strict anti-hallucination rules
//   - Skill categorization into the SkillCategory enum
// --------------------------------------------------------------------------

import type { GithubSummary } from "@/src/modules/github/github.types";

const SKILL_CATEGORIES = `LANGUAGE, FRONTEND, BACKEND, DATABASE, DEVOPS, CLOUD, BLOCKCHAIN, TOOL, OTHER`;

export const SYSTEM_PROMPT = `You are a structured data extraction engine for developer portfolio generation.

Your task: Convert raw developer information (resume text and/or GitHub profile data) into a structured JSON profile.

CRITICAL RULES:
1. Output ONLY valid JSON matching the exact schema. No markdown. No prose. No explanation.
2. If information is unavailable, return null for that field. NEVER invent or infer data.
3. Never infer dates. If a date is not explicitly stated, return null.
4. Never infer companies. If a company name is not explicitly stated, return null.
5. Never invent achievements. Only include achievements explicitly mentioned.
6. Never invent metrics or numbers. Only include metrics explicitly mentioned.
7. Never invent project URLs. Only include URLs explicitly provided.

DATA PRIORITY:
- PREFER RESUME for: fullName, email, phone, education, work experience, certifications
- PREFER GITHUB for: projects, technical skills, avatarUrl
- BIO GENERATION: Always generate a detailed personal bio. If both GitHub and Resume data are provided, you MUST heavily prioritize the Resume for the bio. Use the Resume's professional summary, objective, and experience as the primary source for the bio, and only sprinkle in GitHub data for extra technical context.
- SOCIAL LINKS: Aggressively hunt for and extract ANY professional, personal, or public URLs from both the Resume and GitHub profile (including READMEs). This includes GitHub, LinkedIn, Twitter/X, Telegram, YouTube, Medium, Dev.to, Hashnode, Discord, or Personal Blogs. Output only the raw URL string. Normalization will happen on the backend.
- If both sources mention the same project, merge them into one entry. Do NOT duplicate.

SKILL CATEGORIZATION:
Categorize every skill into exactly one of: ${SKILL_CATEGORIES}

Examples:
- JavaScript, TypeScript, Python, Rust, Go, Java, C++ → LANGUAGE
- React, Vue, Angular, Next.js, Svelte, HTML, CSS, Tailwind → FRONTEND
- Node.js, Express, Django, FastAPI, Spring, NestJS → BACKEND
- PostgreSQL, MongoDB, MySQL, Redis, DynamoDB, Supabase → DATABASE
- Docker, Kubernetes, CI/CD, GitHub Actions, Terraform → DEVOPS
- AWS, GCP, Azure, Vercel, Cloudflare → CLOUD
- Solidity, Web3, Ethereum, Smart Contracts → BLOCKCHAIN
- Git, VS Code, Figma, Jira, Postman → TOOL
- Everything else → OTHER

PROJECT SUMMARIES:
For each project, write a concise 2-3 sentence technical summary (aiSummary) focused on:
- What the project does architecturally
- Key technical decisions or patterns used
- Measurable impact if available (only if explicitly stated)

OUTPUT FORMAT:
{
  "personalInfo": {
    "fullName": string,
    "headline": string | null,
    "email": string | null,
    "phone": string | null,
    "location": string | null,
    "avatarUrl": string | null
  },
  "summary": string,
  "experience": [
    {
      "company": string,
      "role": string,
      "employmentType": string | null,
      "location": string | null,
      "startDate": string | null,
      "endDate": string | null,
      "currentlyWorking": boolean,
      "description": string | null,
      "skillsUsed": string[] | null
    }
  ],
  "education": [
    {
      "institution": string,
      "degree": string | null,
      "fieldOfStudy": string | null,
      "grade": string | null,
      "startDate": string | null,
      "endDate": string | null,
      "description": string | null
    }
  ],
  "skills": [
    { "name": string, "category": "${SKILL_CATEGORIES}" }
  ],
  "projects": [
    {
      "title": string,
      "description": string | null,
      "githubUrl": string | null,
      "liveUrl": string | null,
      "techStack": string[] | null,
      "aiSummary": string | null
    }
  ],
  "certifications": [
    {
      "title": string,
      "issuer": string,
      "issueDate": string | null,
      "credentialUrl": string | null
    }
  ],
  "achievements": [
    {
      "title": string,
      "description": string | null,
      "achievedAt": string | null
    }
  ],
  "socialLinks": [
    { "url": string }
  ]
}`;

/**
 * Build the user-facing prompt with available data sources.
 */
export function buildUserPrompt(params: {
  githubSummary?: GithubSummary;
  resumeText?: string;
}): string {
  const parts: string[] = [];

  parts.push("Generate a NormalizedProfile JSON from the following developer data:\n");

  if (params.resumeText) {
    parts.push("=== RESUME TEXT ===");
    // Truncate extremely long resumes to stay within context window
    const truncated = params.resumeText.length > 15_000
      ? params.resumeText.slice(0, 15_000) + "\n\n[... truncated ...]"
      : params.resumeText;
    parts.push(truncated);
    parts.push("=== END RESUME ===\n");
  }

  if (params.githubSummary) {
    const { user, repositories, allLanguages, profileReadme } = params.githubSummary;

    parts.push("=== GITHUB PROFILE ===");
    parts.push(`Name: ${user.name ?? "N/A"}`);
    parts.push(`Bio: ${user.bio ?? "N/A"}`);
    parts.push(`Location: ${user.location ?? "N/A"}`);
    parts.push(`Company: ${user.company ?? "N/A"}`);
    parts.push(`Avatar: ${user.avatarUrl ?? "N/A"}`);
    parts.push(`Blog: ${user.blog ?? "N/A"}`);
    parts.push(`Twitter: ${user.twitterUsername ?? "N/A"}`);
    parts.push(`Languages: ${allLanguages.join(", ")}`);
    parts.push("");

    if (profileReadme) {
      parts.push("--- Profile README ---");
      const truncatedReadme = profileReadme.length > 3000
        ? profileReadme.slice(0, 3000) + "\n[... truncated ...]"
        : profileReadme;
      parts.push(truncatedReadme);
      parts.push("--- End Profile README ---\n");
    }

    parts.push(`--- Top ${repositories.length} Repositories ---`);
    for (const repo of repositories) {
      parts.push(`\nRepository: ${repo.name}`);
      parts.push(`  URL: ${repo.htmlUrl}`);
      parts.push(`  Description: ${repo.description ?? "N/A"}`);
      parts.push(`  Stars: ${repo.stars} | Forks: ${repo.forks}`);
      parts.push(`  Language: ${repo.language ?? "N/A"}`);
      parts.push(`  Languages: ${repo.languages.join(", ") || "N/A"}`);
      parts.push(`  Topics: ${repo.topics.join(", ") || "N/A"}`);
      parts.push(`  Homepage: ${repo.homepage ?? "N/A"}`);
      if (repo.readme) {
        const truncatedRepoReadme = repo.readme.length > 2000
          ? repo.readme.slice(0, 2000) + "\n[... truncated ...]"
          : repo.readme;
        parts.push(`  README:\n${truncatedRepoReadme}`);
      }
    }
    parts.push("--- End Repositories ---");
    parts.push("=== END GITHUB ===\n");
  }

  parts.push("Generate the NormalizedProfile JSON now. Output ONLY the JSON object.");

  return parts.join("\n");
}
