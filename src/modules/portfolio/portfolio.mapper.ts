// --------------------------------------------------------------------------
// Portfolio Mapper
// --------------------------------------------------------------------------
// Pure functions to transform NormalizedProfile (and GitHub data) into
// Prisma-compatible payloads. Handles slug generation, date parsing,
// skill categorization fallbacks, and featured project logic.
// --------------------------------------------------------------------------

import type { Prisma } from "@/app/generated/prisma/client";
import { DataSource, PortfolioStatus, SkillCategory } from "@/app/generated/prisma/client";
import type { PortfolioCreateInput } from "./portfolio.types";
import type { GithubRepoScored } from "@/src/modules/github/github.types";
import { normalizeSocialLink } from "@/src/lib/social-utils";

/**
 * Generate a URL-friendly slug from a string.
 */
export function generateBaseSlug(name: string): string {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // Remove special chars
    .replace(/[\s-]+/g, "-") // Replace spaces/multiple hyphens with a single hyphen
    .replace(/^-+|-+$/g, ""); // Trim hyphens from start/end

  if (!base) return "portfolio";
  return base;
}

/**
 * Safely parse a date string (e.g., "YYYY-MM", "YYYY", "Month YYYY") into a JS Date.
 */
export function parseDate(dateStr: string | null | undefined): Date | null {
  if (!dateStr) return null;

  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return null;
    return d;
  } catch {
    return null;
  }
}

/**
 * Map a string category to the Prisma enum. Fallback to OTHER.
 */
function mapSkillCategory(categoryStr: string): SkillCategory {
  if (Object.values(SkillCategory).includes(categoryStr as SkillCategory)) {
    return categoryStr as SkillCategory;
  }
  return SkillCategory.OTHER;
}

/**
 * Maps the combined AI profile and GitHub summary into a Prisma portfolio create payload.
 */
export function mapToPrismaPayload(
  input: PortfolioCreateInput,
  slug: string
): Prisma.PortfolioCreateInput {
  const { profile, githubSummary, portfolioName, githubUsername } = input;
  const { personalInfo } = profile;

  // 1. Projects mapping
  const projectsInput: Prisma.ProjectCreateWithoutPortfolioInput[] = profile.projects.map(
    (p, index) => {
      // Find matching GitHub repo to attach metadata
      let githubRepo: GithubRepoScored | undefined;
      let githubMetadataInput: Prisma.GithubProjectMetadataCreateNestedOneWithoutProjectInput | undefined;

      if (githubSummary && p.githubUrl) {
        // Simple heuristic: match URL suffix or name
        githubRepo = githubSummary.repositories.find(
          (r) =>
            r.htmlUrl === p.githubUrl ||
            (p.title && r.name.toLowerCase() === p.title.toLowerCase())
        );

        if (githubRepo) {
          githubMetadataInput = {
            create: {
              stars: githubRepo.stars,
              forks: githubRepo.forks,
              primaryLanguage: githubRepo.language,
              openIssues: githubRepo.openIssues,
              repositorySize: githubRepo.size,
              score: githubRepo.score,
              lastCommitDate: parseDate(githubRepo.pushedAt),
              topics: githubRepo.topics,
              readme: githubRepo.readme,
            },
          };
        }
      }

      // Feature the top 3 projects (we can just use the first 3 if they are sorted by score/importance)
      // Since project-merge sorts them, index 0,1,2 get featured.
      const featured = index < 3;
      const featuredOrder = featured ? index + 1 : null;

      // Determine sources
      const sources: DataSource[] = [DataSource.AI];
      if (githubRepo) sources.push(DataSource.GITHUB);
      if (input.profile.projects.length > 0) sources.push(DataSource.RESUME); // simplistic attribution

      return {
        title: p.title,
        description: p.description,
        githubUrl: p.githubUrl,
        liveUrl: p.liveUrl,
        techStack: p.techStack ?? [],
        aiSummary: p.aiSummary,
        featured,
        featuredOrder,
        sources,
        ...(githubMetadataInput ? { githubMetadata: githubMetadataInput } : {}),
      };
    }
  );

  return {
    slug,
    name: portfolioName,
    status: PortfolioStatus.PUBLISHED,
    githubUsername,
    user: input.userId ? { connect: { id: input.userId } } : undefined,

    fullName: personalInfo.fullName,
    headline: personalInfo.headline,
    bio: githubSummary?.user.bio ?? null, // Prefer GitHub bio if available
    email: personalInfo.email,
    phone: personalInfo.phone,
    location: personalInfo.location ?? githubSummary?.user.location,
    avatarUrl: personalInfo.avatarUrl ?? githubSummary?.user.avatarUrl,
    resumeUrl: null,
    showResume: true,
    showExperience: true,
    showEducation: true,
    showCertifications: true,
    showAchievements: true,
    themeId: "minimal-editorial",
    summary: profile.summary,

    profileScore: null, // Can be calculated later

    lastGithubSync: githubSummary ? new Date() : null,

    experiences: {
      create: profile.experience.map((e, i) => ({
        company: e.company,
        role: e.role,
        employmentType: e.employmentType,
        location: e.location,
        startDate: parseDate(e.startDate),
        endDate: parseDate(e.endDate),
        currentlyWorking: e.currentlyWorking,
        description: e.description,
        skillsUsed: e.skillsUsed ?? [],
        sortOrder: i,
      })),
    },

    educations: {
      create: profile.education.map((e, i) => ({
        institution: e.institution,
        degree: e.degree,
        fieldOfStudy: e.fieldOfStudy,
        grade: e.grade,
        startDate: parseDate(e.startDate),
        endDate: parseDate(e.endDate),
        description: e.description,
        sortOrder: i,
      })),
    },

    skills: {
      create: profile.skills.map((s) => ({
        name: s.name,
        category: mapSkillCategory(s.category),
        sources: [DataSource.AI],
      })),
    },

    socialLinks: {
      create: (() => {
        const uniqueUrls = new Set<string>();
        const links: any[] = [];
        (profile.socialLinks ?? []).forEach((link) => {
          const normalized = normalizeSocialLink(link.url);
          const urlLower = normalized.url.toLowerCase();
          if (!uniqueUrls.has(urlLower)) {
            uniqueUrls.add(urlLower);
            links.push({
              label: normalized.label,
              url: normalized.url,
              icon: normalized.icon,
              sortOrder: links.length,
              visible: true,
            });
          }
        });
        return links;
      })(),
    },

    projects: {
      create: projectsInput,
    },

    certifications: {
      create: profile.certifications.map((c) => ({
        title: c.title,
        issuer: c.issuer,
        issueDate: parseDate(c.issueDate),
        credentialUrl: c.credentialUrl,
      })),
    },

    achievements: {
      create: profile.achievements.map((a) => ({
        title: a.title,
        description: a.description,
        achievedAt: parseDate(a.achievedAt),
      })),
    },
  };
}
