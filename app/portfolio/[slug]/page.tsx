import { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/src/lib/prisma";
import { getPortfolioUrl } from "@/src/lib/portfolio-url";
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
  const title = portfolio.metaTitle || `${portfolio.fullName || portfolio.name} — Portfolio`;
  const description = portfolio.metaDescription || portfolio.headline || portfolio.summary || "Developer Portfolio";
  const url = getPortfolioUrl(resolvedParams.slug);

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: "profile",
      locale: "en_US",
      url,
      siteName: "makeurfolio",
      title,
      description,
      ...(portfolio.avatarUrl && {
        images: [
          {
            url: portfolio.avatarUrl,
            width: 400,
            height: 400,
            alt: `${portfolio.fullName || portfolio.name}'s profile picture`,
          },
        ],
      }),
    },
    twitter: {
      card: "summary",
      title,
      description,
      ...(portfolio.avatarUrl && { images: [portfolio.avatarUrl] }),
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

// Build JSON-LD Person structured data from portfolio
function buildPersonJsonLd(portfolio: NonNullable<Awaited<ReturnType<typeof getPortfolio>>>) {
  const url = getPortfolioUrl(portfolio.slug);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const jsonLd: Record<string, any> = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: portfolio.fullName || portfolio.name,
    url,
    ...(portfolio.headline && { jobTitle: portfolio.headline }),
    ...(portfolio.bio && { description: portfolio.bio }),
    ...(portfolio.email && { email: portfolio.email }),
    ...(portfolio.location && {
      address: {
        "@type": "PostalAddress",
        addressLocality: portfolio.location,
      },
    }),
    ...(portfolio.avatarUrl && { image: portfolio.avatarUrl }),
  };

  // Add social/sameAs links from the socialLinks relation
  const sameAs = portfolio.socialLinks
    .filter((link) => link.visible && link.url)
    .map((link) => link.url);
  if (sameAs.length > 0) jsonLd.sameAs = sameAs;

  // Add current work organization
  const currentJob = portfolio.experiences.find((e) => e.currentlyWorking);
  if (currentJob?.company) {
    jsonLd.worksFor = {
      "@type": "Organization",
      name: currentJob.company,
    };
  }

  // Add skills as knowsAbout
  const skillNames = portfolio.skills.map((s) => s.name);
  if (skillNames.length > 0) {
    jsonLd.knowsAbout = skillNames;
  }

  return jsonLd;
}

export default async function PortfolioPage({ params, searchParams }: PortfolioPageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const isEditMode = resolvedSearchParams.mode === "edit";

  const portfolio = await getPortfolio(resolvedParams.slug);
  if (!portfolio) {
    notFound();
  }

  const personJsonLd = buildPersonJsonLd(portfolio);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
      <LivePortfolioRenderer initialPortfolio={portfolio} isEditMode={isEditMode} />
    </>
  );
}

