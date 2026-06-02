// --------------------------------------------------------------------------
// Portfolio Service
// --------------------------------------------------------------------------
// Orchestrates portfolio creation, ensuring slug uniqueness before DB write.
// --------------------------------------------------------------------------

import { logger } from "@/src/lib/logger";
import { NotFoundError } from "@/src/lib/errors";
import { generateBaseSlug, mapToPrismaPayload } from "./portfolio.mapper";
import {
  createPortfolioWithRelations,
  findPortfolioBySlug,
  checkSlugExists,
} from "./portfolio.repository";
import type {
  PortfolioCreateInput,
  PortfolioWithRelations,
} from "./portfolio.types";
import type { OnProgressCallback } from "../generation/generation.types";

const SERVICE = "PortfolioService";

export async function createPortfolio(
  input: PortfolioCreateInput,
  onProgress?: OnProgressCallback
): Promise<PortfolioWithRelations> {
  logger.info(SERVICE, "Creating portfolio...");
  logger.time("portfolio-creation");

  await onProgress?.("Generating unique portfolio URL...", "Generating unique URL", 92);
  const baseSlug = generateBaseSlug(input.profile.personalInfo.fullName);
  let finalSlug = baseSlug;
  let counter = 1;

  // Ensure slug uniqueness
  while (await checkSlugExists(finalSlug)) {
    // If base slug exists, append a short random string or counter
    const suffix = Math.random().toString(36).substring(2, 6);
    finalSlug = `${baseSlug}-${suffix}`;
    counter++;
    if (counter > 10) {
      throw new Error("Failed to generate unique slug after 10 attempts");
    }
  }

  logger.info(SERVICE, `Generated unique slug: ${finalSlug}`);

  await onProgress?.("Mapping data to database schema...", "Saving content", 95);
  const payload = mapToPrismaPayload(input, finalSlug);

  await onProgress?.("Writing to database...", "Saving content", 98);
  const portfolio = await createPortfolioWithRelations(payload);

  logger.timeEnd(SERVICE, "portfolio-creation");
  logger.info(SERVICE, `Portfolio created successfully`, {
    portfolioId: portfolio.id,
    slug: portfolio.slug,
  });

  return portfolio;
}

export async function getPortfolio(
  slug: string
): Promise<PortfolioWithRelations> {
  const portfolio = await findPortfolioBySlug(slug);

  if (!portfolio) {
    throw new NotFoundError("Portfolio", slug);
  }

  return portfolio;
}
