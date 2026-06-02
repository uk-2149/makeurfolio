import { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/src/lib/prisma";
import { getSocialIconComponent } from "@/src/lib/social-utils";
import { ExternalLink, MapPin, Mail, Briefcase, Calendar, ChevronRight, FileText, Code2 as GithubIcon } from "lucide-react";
import React from "react";
import Link from "next/link";
interface PortfolioPageProps {
  params: Promise<{ slug: string }>;
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
  if (!portfolio) {
    return null;
  }
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
export default async function PortfolioPage({ params }: PortfolioPageProps) {
  const resolvedParams = await params;
  const portfolio = await getPortfolio(resolvedParams.slug);
  if (!portfolio) {
    notFound();
  }
  // Force a clean light-mode editorial theme for this specific template
  return (
    <div className="min-h-screen bg-[#FCFCFC] text-gray-900 font-sans selection:bg-gray-900 selection:text-white">
      <div className="max-w-3xl mx-auto px-6 py-24 md:py-32 space-y-32">
        
        {/* HEADER / INTRO */}
        <header className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-heading font-bold tracking-tight text-gray-900">
              {portfolio.fullName || portfolio.name}
            </h1>
            {portfolio.headline && (
              <p className="text-xl md:text-2xl text-gray-600 font-medium">
                {portfolio.headline}
              </p>
            )}
          </div>
          
          <div className="flex flex-wrap gap-4 text-sm text-gray-500 font-medium">
            {portfolio.location && (
              <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {portfolio.location}</span>
            )}
            {portfolio.email && (
              <a href={`mailto:${portfolio.email}`} className="flex items-center gap-1.5 hover:text-gray-900 transition-colors">
                <Mail className="w-4 h-4" /> {portfolio.email}
              </a>
            )}
          </div>
          {/* ABOUT */}
          {portfolio.bio && (
            <div className="prose prose-gray prose-p:leading-relaxed max-w-none text-gray-600">
              {portfolio.bio.split("\n").map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          )}

          {/* Social Links & Resume */}
          <div className="flex flex-wrap gap-3 pt-4">
            {portfolio.socialLinks.map((link) => {
              const Icon = getSocialIconComponent(link.icon || "globe");
              return (
                <a 
                  key={link.id} 
                  href={link.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-full text-sm font-medium hover:border-gray-900 hover:shadow-sm transition-all"
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </a>
              );
            })}
            
            {portfolio.showResume && portfolio.resumeUrl && (
              <a 
                href={portfolio.resumeUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-1.5 bg-gray-900 text-white border border-gray-900 rounded-full text-sm font-medium hover:bg-gray-800 transition-all"
              >
                <FileText className="w-4 h-4" />
                <span>Resume</span>
              </a>
            )}
          </div>
        </header>
        {/* PROJECTS (HERO SECTION) */}
        {portfolio.projects.length > 0 && (
          <section className="space-y-8">
            <h2 className="text-2xl font-heading font-bold text-gray-900">Selected Work</h2>
            <div className="grid grid-cols-1 gap-6">
              {portfolio.projects.map((project) => (
                <div key={project.id} className="group relative bg-white border border-gray-100 rounded-2xl p-6 md:p-8 hover:shadow-lg hover:border-gray-200 transition-all duration-300">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="text-xl font-heading font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {project.title}
                      </h3>
                      <div className="flex gap-2 shrink-0">
                        {project.githubUrl && (
                          <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="p-2 text-gray-400 hover:text-gray-900 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors">
                            <GithubIcon className="w-4 h-4" />
                          </a>
                        )}
                        {project.liveUrl && (
                          <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="p-2 text-gray-400 hover:text-gray-900 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors">
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>
                    {project.description && (
                      <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                        {project.description}
                      </p>
                    )}
                    {Array.isArray(project.techStack) && project.techStack.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-2">
                        {project.techStack.map((tech: any, i: number) => (
                          <span key={i} className="px-2.5 py-1 bg-gray-50 border border-gray-100 text-gray-600 text-xs font-medium rounded-md">
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
        {/* EXPERIENCE */}
        {portfolio.showExperience && portfolio.experiences.length > 0 && (
          <section className="space-y-8">
            <h2 className="text-2xl font-heading font-bold text-gray-900">Experience</h2>
            <div className="space-y-12">
              {portfolio.experiences.map((exp) => (
                <div key={exp.id} className="relative">
                  <div className="flex flex-col md:flex-row md:items-baseline gap-2 md:gap-8 mb-3">
                    <div className="w-full md:w-1/4 shrink-0 text-sm font-medium text-gray-500 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {exp.startDate ? new Date(exp.startDate).getFullYear() : "Past"} — {exp.currentlyWorking ? "Present" : (exp.endDate ? new Date(exp.endDate).getFullYear() : "")}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-lg font-heading font-bold text-gray-900">{exp.role}</h3>
                      <p className="text-gray-900 font-medium">{exp.company}</p>
                    </div>
                  </div>
                  {exp.description && (
                    <div className="md:pl-[calc(25%+2rem)] text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                      {exp.description}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
        {/* EVERYTHING ELSE */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 pt-8 border-t border-gray-100">
          
          {/* EDUCATION */}
          {portfolio.showEducation && portfolio.educations.length > 0 && (
            <section className="space-y-6">
              <h2 className="text-xl font-heading font-bold text-gray-900">Education</h2>
              <div className="space-y-6">
                {portfolio.educations.map((edu) => (
                  <div key={edu.id} className="space-y-1">
                    <h3 className="font-heading font-bold text-gray-900">{edu.institution}</h3>
                    <p className="text-sm text-gray-600">{edu.degree} in {edu.fieldOfStudy}</p>
                    {(edu.startDate || edu.endDate) && (
                      <p className="text-xs text-gray-400 font-medium">
                        {edu.startDate ? new Date(edu.startDate).getFullYear() : ""} — {edu.endDate ? new Date(edu.endDate).getFullYear() : "Present"}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
          {/* SKILLS */}
          {portfolio.skills.length > 0 && (
            <section className="space-y-6">
              <h2 className="text-xl font-heading font-bold text-gray-900">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {portfolio.skills.map((skill) => (
                  <span key={skill.id} className="px-3 py-1.5 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-md shadow-sm">
                    {skill.name}
                  </span>
                ))}
              </div>
            </section>
          )}
          {/* CERTIFICATIONS */}
          {portfolio.showCertifications && portfolio.certifications.length > 0 && (
            <section className="space-y-6">
              <h2 className="text-xl font-heading font-bold text-gray-900">Certifications</h2>
              <div className="space-y-4">
                {portfolio.certifications.map((cert) => (
                  <div key={cert.id} className="group">
                    <h3 className="font-heading font-bold text-gray-900 flex items-center gap-1.5">
                      {cert.title}
                      {cert.credentialUrl && (
                        <a href={cert.credentialUrl} target="_blank" rel="noopener noreferrer" className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <ExternalLink className="w-3.5 h-3.5 text-gray-400 hover:text-gray-900" />
                        </a>
                      )}
                    </h3>
                    <p className="text-sm text-gray-600">{cert.issuer}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
          {/* ACHIEVEMENTS */}
          {portfolio.showAchievements && portfolio.achievements.length > 0 && (
            <section className="space-y-6">
              <h2 className="text-xl font-heading font-bold text-gray-900">Awards & Recognition</h2>
              <div className="space-y-4">
                {portfolio.achievements.map((ach) => (
                  <div key={ach.id} className="space-y-1">
                    <h3 className="font-heading font-bold text-gray-900">{ach.title}</h3>
                    {ach.description && <p className="text-sm text-gray-600">{ach.description}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
        
        {/* FOOTER */}
        <footer className="pt-24 pb-12 text-center border-t border-gray-100">
          <p className="text-sm text-gray-400 font-medium">
            © {new Date().getFullYear()} {portfolio.fullName || portfolio.name}.
          </p>
          <div className="mt-4 flex items-center justify-center gap-1 text-xs text-gray-300">
            Powered by <Link href="/" className="font-semibold text-gray-400 hover:text-gray-900 transition-colors">makeurfolio</Link>
          </div>
        </footer>
      </div>
    </div>
  );
}
