// --------------------------------------------------------------------------
// Generation Module Types
// --------------------------------------------------------------------------

import { GenerationStatus } from "@/app/generated/prisma/client";

export interface GenerationInput {
  githubUsername?: string;
  resumeBuffer?: Buffer;
  resumeFileName?: string;
  portfolioName: string;
  userId?: string;
  generationId?: string;
}

export const PROGRESS_MAP: Record<GenerationStatus, number> = {
  [GenerationStatus.QUEUED]: 0,
  [GenerationStatus.FETCHING_GITHUB]: 25,
  [GenerationStatus.PARSING_RESUME]: 50,
  [GenerationStatus.GENERATING_PROFILE]: 75,
  [GenerationStatus.COMPLETED]: 100,
  [GenerationStatus.FAILED]: 100,
};

export type OnProgressCallback = (message: string, step?: string, progress?: number) => Promise<void>;
