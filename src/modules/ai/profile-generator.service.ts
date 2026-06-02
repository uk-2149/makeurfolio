// --------------------------------------------------------------------------
// Profile Generator Service (Gemini)
// --------------------------------------------------------------------------
// Calls Gemini with structured output to generate a NormalizedProfile.
// Validates output with Zod. Retries up to 2 times on parse failure.
// Never returns unvalidated AI output.
// --------------------------------------------------------------------------

import { gemini } from "@/src/lib/gemini";
import { GeminiError, ValidationError } from "@/src/lib/errors";
import { logger } from "@/src/lib/logger";
import {
  NormalizedProfileSchema,
  type NormalizedProfile,
} from "./profile.schema";
import { SYSTEM_PROMPT, buildUserPrompt } from "./prompts";
import type { GithubSummary } from "@/src/modules/github/github.types";
import type { OnProgressCallback } from "../generation/generation.types";

const SERVICE = "ProfileGenerator";
const GEMINI_MODEL = "gemini-2.5-flash";
const MAX_RETRIES = 2;

interface GenerateProfileInput {
  githubSummary?: GithubSummary;
  resumeText?: string;
}

/**
 * Generate a NormalizedProfile from GitHub data and/or resume text.
 *
 * Uses Gemini structured output with Zod validation.
 * Retries up to MAX_RETRIES times on validation failure.
 */
export async function generateProfile(
  input: GenerateProfileInput,
  onProgress?: OnProgressCallback
): Promise<NormalizedProfile> {
  if (!input.githubSummary && !input.resumeText) {
    throw new ValidationError(
      "At least one data source (GitHub or resume) is required"
    );
  }

  logger.info(SERVICE, "Starting profile generation...", {
    hasGithub: !!input.githubSummary,
    hasResume: !!input.resumeText,
  });
  logger.time("gemini-generation");

  const userPrompt = buildUserPrompt({
    githubSummary: input.githubSummary,
    resumeText: input.resumeText,
  });

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_RETRIES + 1; attempt++) {
    try {
      await onProgress?.(`Building developer profile... (Attempt ${attempt})`, "Gemini analyzing experience", 65);
      logger.info(SERVICE, `Gemini call attempt ${attempt}/${MAX_RETRIES + 1}`);

      const response = await gemini.models.generateContent({
        model: GEMINI_MODEL,
        contents: userPrompt,
        config: {
          systemInstruction: SYSTEM_PROMPT,
          temperature: 0.2,
          responseMimeType: "application/json",
        },
      });

      const rawText = response.text;

      if (!rawText) {
        throw new GeminiError("Gemini returned empty response", {
          attempt,
        });
      }

      await onProgress?.("Structuring experience and formatting output...", "Generating recruiter-friendly content", 80);
      logger.info(SERVICE, "Gemini response received", {
        responseLength: rawText.length,
        tokenUsage: response.usageMetadata,
      });

      // Parse JSON from response
      let parsed: unknown;
      try {
        parsed = JSON.parse(rawText);
      } catch {
        throw new GeminiError(
          "Gemini returned invalid JSON",
          { attempt, rawPreview: rawText.slice(0, 200) }
        );
      }

      // Validate with Zod
      const result = NormalizedProfileSchema.safeParse(parsed);

      if (!result.success) {
        const issues = result.error.issues
          .slice(0, 5)
          .map((i) => `${i.path.join(".")}: ${i.message}`)
          .join("; ");

        logger.warn(SERVICE, `Zod validation failed: ${issues}`, {
          attempt,
          issueCount: result.error.issues.length,
        });

        if (attempt <= MAX_RETRIES) {
          continue; // Retry with the same prompt
        }

        throw new ValidationError(
          `Gemini output failed schema validation after ${MAX_RETRIES + 1} attempts: ${issues}`,
          { issueCount: result.error.issues.length }
        );
      }

      logger.timeEnd(SERVICE, "gemini-generation");
      await onProgress?.(`Profile generated successfully! Parsed ${result.data.projects.length} projects and ${result.data.skills.length} skills.`, "Validating profile schema", 85);
      logger.info(SERVICE, "Profile generated and validated successfully", {
        projectCount: result.data.projects.length,
        skillCount: result.data.skills.length,
        experienceCount: result.data.experience.length,
      });

      return result.data;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (error instanceof ValidationError || error instanceof GeminiError) {
        if (attempt > MAX_RETRIES) {
          logger.timeEnd(SERVICE, "gemini-generation");
          throw error;
        }
        logger.warn(SERVICE, `Attempt ${attempt} failed, retrying...`);
        continue;
      }

      // Unexpected error — don't retry
      logger.timeEnd(SERVICE, "gemini-generation");
      throw new GeminiError(
        `Profile generation failed: ${lastError.message}`,
        { attempt }
      );
    }
  }

  // Should be unreachable, but TypeScript needs it
  logger.timeEnd(SERVICE, "gemini-generation");
  throw new GeminiError(
    `Profile generation failed after all retries: ${lastError?.message}`,
  );
}
