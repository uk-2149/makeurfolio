import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    
    if (!session?.user) {
      return NextResponse.json(
        { 
          success: false, 
          error: { code: "UNAUTHORIZED", message: "Unauthorized access", statusCode: 401 } 
        },
        { status: 401 }
      );
    }
    
    const resolvedParams = await params;
    
    if (!resolvedParams.id) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Portfolio ID is required", statusCode: 400 } },
        { status: 400 }
      );
    }
    const portfolio = await prisma.portfolio.findUnique({
      where: { id: resolvedParams.id },
      include: {
        experiences: { orderBy: { sortOrder: 'asc' } },
        educations: { orderBy: { sortOrder: 'asc' } },
        skills: true,
        projects: { orderBy: { featuredOrder: 'asc' } },
        certifications: { orderBy: { issueDate: 'desc' } },
        achievements: { orderBy: { achievedAt: 'desc' } },
        socialLinks: { orderBy: { sortOrder: 'asc' } },
      }
    });
    if (!portfolio) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Portfolio not found", statusCode: 404 } },
        { status: 404 }
      );
    }
    // Ownership verification
    if (portfolio.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "You do not have permission to edit this portfolio", statusCode: 403 } },
        { status: 403 }
      );
    }
    
    return NextResponse.json(
      { success: true, data: portfolio },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching portfolio for editor:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to fetch portfolio data", statusCode: 500 } },
      { status: 500 }
    );
  }
}
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized access", statusCode: 401 } },
        { status: 401 }
      );
    }
    
    const resolvedParams = await params;
    if (!resolvedParams.id) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Portfolio ID is required", statusCode: 400 } },
        { status: 400 }
      );
    }

    // First check ownership
    const existingPortfolio = await prisma.portfolio.findUnique({
      where: { id: resolvedParams.id },
      select: { userId: true }
    });
    if (!existingPortfolio) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Portfolio not found", statusCode: 404 } },
        { status: 404 }
      );
    }
    if (existingPortfolio.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "You do not have permission to edit this portfolio", statusCode: 403 } },
        { status: 403 }
      );
    }
    const body = await request.json();
    const {
      experiences,
      educations,
      skills,
      projects,
      certifications,
      achievements,
      socialLinks,
      templateId,
      id,
      createdAt,
      updatedAt,
      userId,
      ...baseFields
    } = body;
    const updatedPortfolio = await prisma.portfolio.update({
      where: { id: resolvedParams.id },
      data: {
        ...baseFields,
        templateId,
        skills: skills ? {
          deleteMany: {},
          create: skills.map((s: any, index: number) => ({ 
            name: s.name, 
            category: s.category || "OTHER",
            sortOrder: index
          }))
        } : undefined,
        experiences: experiences ? {
          deleteMany: {},
          create: experiences.map((e: any, index: number) => ({
            company: e.company,
            role: e.role,
            location: e.location,
            startDate: e.startDate ? new Date(e.startDate) : null,
            endDate: e.endDate ? new Date(e.endDate) : null,
            currentlyWorking: e.currentlyWorking || false,
            description: e.description,
            sortOrder: index,
          }))
        } : undefined,
        projects: projects ? {
          deleteMany: {},
          create: projects.map((p: any, index: number) => ({
            title: p.title,
            description: p.description,
            githubUrl: p.githubUrl,
            liveUrl: p.liveUrl,
            featured: p.featured || false,
            featuredOrder: index,
            sortOrder: index,
          }))
        } : undefined,
        educations: educations ? {
          deleteMany: {},
          create: educations.map((e: any, index: number) => ({
            institution: e.institution,
            degree: e.degree,
            fieldOfStudy: e.fieldOfStudy,
            startDate: e.startDate ? new Date(e.startDate) : null,
            endDate: e.endDate ? new Date(e.endDate) : null,
            description: e.description,
            sortOrder: index,
          }))
        } : undefined,
        certifications: certifications ? {
          deleteMany: {},
          create: certifications.map((c: any, index: number) => ({
            title: c.title,
            issuer: c.issuer,
            issueDate: c.issueDate ? new Date(c.issueDate) : null,
            credentialUrl: c.credentialUrl,
            sortOrder: index,
          }))
        } : undefined,
        achievements: achievements ? {
          deleteMany: {},
          create: achievements.map((a: any, index: number) => ({
            title: a.title,
            description: a.description,
            achievedAt: a.achievedAt ? new Date(a.achievedAt) : null,
            sortOrder: index,
          }))
        } : undefined,
        socialLinks: socialLinks ? {
          deleteMany: {},
          create: socialLinks.map((sl: any, index: number) => ({
            label: sl.label,
            url: sl.url,
            icon: sl.icon,
            visible: sl.visible !== undefined ? sl.visible : true,
            sortOrder: index,
          }))
        } : undefined,
      },
      include: {
        skills: true,
        experiences: { orderBy: { sortOrder: 'asc' } },
        educations: { orderBy: { sortOrder: 'asc' } },
        projects: { orderBy: { featuredOrder: 'asc' } },
        certifications: { orderBy: { issueDate: 'desc' } },
        achievements: { orderBy: { achievedAt: 'desc' } },
        socialLinks: { orderBy: { sortOrder: 'asc' } },
      }
    });
    
    return NextResponse.json(
      { success: true, data: updatedPortfolio },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error updating portfolio:", error?.message || error);
    if (error?.code) console.error("Prisma Code:", error.code);
    if (error?.meta) console.error("Prisma Meta:", error.meta);

    // Handle slug uniqueness race conditions
    if (error?.code === "P2002" && error?.meta?.target?.includes("slug")) {
      return NextResponse.json(
        { success: false, error: { code: "SLUG_TAKEN", message: "This URL is already taken. Please choose another one.", statusCode: 409 } },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to update portfolio: " + (error?.message || "Unknown"), statusCode: 500 } },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized access", statusCode: 401 } },
        { status: 401 }
      );
    }
    
    const resolvedParams = await params;
    
    if (!resolvedParams.id) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Portfolio ID is required", statusCode: 400 } },
        { status: 400 }
      );
    }
    
    const portfolio = await prisma.portfolio.findUnique({
      where: { id: resolvedParams.id },
      select: { userId: true }
    });
    
    if (!portfolio) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Portfolio not found", statusCode: 404 } },
        { status: 404 }
      );
    }
    
    if (portfolio.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "You do not have permission to delete this portfolio", statusCode: 403 } },
        { status: 403 }
      );
    }
    
    await prisma.portfolio.delete({
      where: { id: resolvedParams.id }
    });
    
    return NextResponse.json(
      { success: true, message: "Portfolio deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting portfolio:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to delete portfolio", statusCode: 500 } },
      { status: 500 }
    );
  }
}
