import { NextRequest, NextResponse } from "next/server";
import { findGenerationById } from "@/src/modules/generation/generation.repository";
import { PROGRESS_MAP } from "@/src/modules/generation/generation.types";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  
  if (!resolvedParams.id) {
    return NextResponse.json(
      { success: false, error: { code: "VALIDATION_ERROR", message: "Generation ID is required", statusCode: 400 } },
      { status: 400 }
    );
  }

  try {
    const generation = await findGenerationById(resolvedParams.id);

    if (!generation) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Generation not found", statusCode: 404 } },
        { status: 404 }
      );
    }

    // If the database has a specific progress, use it. Otherwise fallback to the map.
    const progress = generation.progress > 0 
      ? generation.progress 
      : (PROGRESS_MAP[generation.status] ?? 0);

    return NextResponse.json(
      {
        success: true,
        data: {
          generationId: generation.id,
          status: generation.status,
          progress,
          currentStep: generation.currentStep,
          activityLogs: generation.activityLogs,
          portfolioId: generation.portfolioId,
          portfolioSlug: generation.portfolio?.slug,
          errorMessage: generation.errorMessage,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in generation status route:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Internal Server Error", statusCode: 500 } },
      { status: 500 }
    );
  }
}
