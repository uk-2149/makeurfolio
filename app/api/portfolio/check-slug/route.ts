import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { validateSlug } from "@/src/lib/slug";

export type CheckSlugStatus = "available" | "taken" | "reserved" | "invalid" | "error";

export interface CheckSlugResponse {
  status: CheckSlugStatus;
  message?: string;
  suggestions?: string[];
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");

    if (!slug) {
      return NextResponse.json(
        { status: "invalid", message: "Slug is required" },
        { status: 400 }
      );
    }

    // 1. Client-side rules validation
    const validation = validateSlug(slug);
    if (validation.status !== "valid") {
      return NextResponse.json(
        {
          status: validation.status, // "invalid" or "reserved"
          message: validation.message,
        } as CheckSlugResponse,
        { status: 200 } // Return 200 because the endpoint worked correctly
      );
    }

    // 2. Database availability check
    const existing = await prisma.portfolio.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json(
        { status: "available" } as CheckSlugResponse,
        {
          status: 200,
          headers: {
            "Cache-Control": "private, max-age=60",
          },
        }
      );
    }

    // 3. Slug is taken. Generate suggestions.
    const baseSlug = slug.substring(0, 30); // Prevent suggestions from exceeding 40 chars
    
    // Generate an array of variants
    const variantsToTry = [
      `${baseSlug}-dev`,
      `${baseSlug}-portfolio`,
      `${baseSlug}-web`,
      `${baseSlug}-123`,
      `${baseSlug}-me`,
      `${baseSlug}-01`,
      `${baseSlug}-tech`,
      `${baseSlug}${Math.floor(1000 + Math.random() * 9000)}`, // Random 4-digit
    ];

    // Single DB query to check all variants
    const takenVariants = await prisma.portfolio.findMany({
      where: { slug: { in: variantsToTry } },
      select: { slug: true },
    });

    const takenSet = new Set(takenVariants.map((p) => p.slug));
    
    // Filter out the taken ones and take the first 3
    const availableSuggestions = variantsToTry
      .filter((v) => !takenSet.has(v) && validateSlug(v).status === "valid")
      .slice(0, 3);

    return NextResponse.json(
      {
        status: "taken",
        message: "This URL is already taken.",
        suggestions: availableSuggestions,
      } as CheckSlugResponse,
      { status: 200 }
    );
  } catch (error) {
    console.error("Error checking slug:", error);
    return NextResponse.json(
      { status: "error", message: "Failed to check availability." } as CheckSlugResponse,
      { status: 500 }
    );
  }
}
