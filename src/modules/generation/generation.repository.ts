// --------------------------------------------------------------------------
// Generation Repository
// --------------------------------------------------------------------------
// Data access for the PortfolioGeneration lifecycle entity.
// --------------------------------------------------------------------------

import { prisma } from "@/src/lib/prisma";
import type { Prisma, PortfolioGeneration } from "@/app/generated/prisma/client";
import { GenerationStatus } from "@/app/generated/prisma/client";

export async function createGeneration(
  githubUsername?: string,
  id?: string
): Promise<PortfolioGeneration> {
  return prisma.portfolioGeneration.create({
    data: {
      id,
      githubUsername,
      status: GenerationStatus.QUEUED,
    },
  });
}

export async function updateGenerationStatus(
  id: string,
  status: GenerationStatus,
  errorMessage?: string,
  portfolioId?: string
): Promise<PortfolioGeneration> {
  const data: Prisma.PortfolioGenerationUpdateInput = { status };

  if (errorMessage) {
    data.errorMessage = errorMessage;
  }

  if (portfolioId) {
    data.portfolio = { connect: { id: portfolioId } };
  }

  if (status === GenerationStatus.COMPLETED || status === GenerationStatus.FAILED) {
    data.completedAt = new Date();
  }

  return prisma.portfolioGeneration.update({
    where: { id },
    data,
  });
}

export async function findGenerationById(id: string) {
  return prisma.portfolioGeneration.findUnique({
    where: { id },
    include: {
      portfolio: {
        select: { id: true, slug: true },
      },
    },
  });
}

export async function appendGenerationLog(
  id: string,
  message: string,
  currentStep?: string,
  progress?: number
): Promise<void> {
  const newLog = {
    timestamp: new Date().toISOString(),
    message,
  };

  const data: Prisma.PortfolioGenerationUpdateInput = {};
  
  if (currentStep) data.currentStep = currentStep;
  if (progress !== undefined) data.progress = progress;

  // Prisma PostgreSQL handles appending to JSON arrays via jsonb_build_array or direct update
  // A simple way to append without fetching is using raw query, or just fetch and update.
  // Since this is MVP and we might have race conditions on array append, let's just fetch and update:
  const current = await prisma.portfolioGeneration.findUnique({
    where: { id },
    select: { activityLogs: true }
  });
  
  const logs = Array.isArray(current?.activityLogs) ? current.activityLogs : [];
  data.activityLogs = [...logs, newLog] as Prisma.InputJsonValue;

  await prisma.portfolioGeneration.update({
    where: { id },
    data,
  });
}
