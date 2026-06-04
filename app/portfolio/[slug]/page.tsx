import { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/src/lib/prisma";
import { LivePortfolioRenderer } from "@/src/components/portfolio/live-portfolio-renderer";

interface PortfolioPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ mode?: string }>;
}

async function getPortfolio(slug: string) {
  const portfolio = await prisma.portfolio.findUnique({
    where: { slug },
    include: {
      experiences: { orderBy: { sortOrder: "asc" } },
      educations: { orderBy: { sortOrder: "asc" } },
      projects: { orderBy: { featuredOrder: "asc" } },
      skills: true,
      socialLinks: { orderBy: { sortOrder: "asc" }, where: { visible: true } },
      certifications: { orderBy: { issueDate: "desc" } },
      achievements: { orderBy: { achievedAt: "desc" } },
    },
  });
  if (!portfolio) return null;
  
  // Record a view asynchronously
  prisma.portfolioView.create({
    data: { portfolioId: portfolio.id },
  }).catch(() => {});
  
  return portfolio;
}

export async function generateMetadata({ params }: PortfolioPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const portfolio = await getPortfolio(resolvedParams.slug);
  if (!portfolio) {
    return { title: "Portfolio Not Found" };
  }
  return {
    title: portfolio.metaTitle || `${portfolio.fullName || portfolio.name} — Portfolio`,
    description: portfolio.metaDescription || portfolio.headline || portfolio.summary || "Developer Portfolio",
  };
}

export default async function PortfolioPage({ params, searchParams }: PortfolioPageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const isEditMode = resolvedSearchParams.mode === "edit";

  const portfolio = await getPortfolio(resolvedParams.slug);
  if (!portfolio) {
    notFound();
  }

  return <LivePortfolioRenderer initialPortfolio={portfolio} isEditMode={isEditMode} />;
}
