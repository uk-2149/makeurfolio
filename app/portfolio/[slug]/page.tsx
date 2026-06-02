import { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/src/lib/prisma";
import { getSocialIconComponent } from "@/src/lib/social-utils";
import { ExternalLink, MapPin, Mail, Calendar, FileText, Code2 as GithubIcon, ChevronDown } from "lucide-react";
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

export default async function PortfolioPage({ params }: PortfolioPageProps) {
  const resolvedParams = await params;
  const portfolio = await getPortfolio(resolvedParams.slug);
  if (!portfolio) {
    notFound();
  }

  const featuredProjects = portfolio.projects.filter(p => p.featured);
  const regularProjects = portfolio.projects.filter(p => !p.featured);

  // Group skills by category
  const skillsByCategory = portfolio.skills.reduce((acc, skill) => {
    if (!acc[skill.category]) acc[skill.category] = [];
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, typeof portfolio.skills>);

  // Determine top tech for "About" metadata
  const topTech = portfolio.skills.slice(0, 3).map(s => s.name).join(", ");
  
  // Primary Social Links (Top 4)
  const primarySocials = portfolio.socialLinks.slice(0, 4);

  return (
    <div className="min-h-screen bg-[#FCFCFC] text-[#111111] font-sans selection:bg-[#111111] selection:text-white pb-32 architectural-bg relative">
      
      {/* Subtle Top Glow Effect */}
      <div className="absolute top-0 inset-x-0 h-[500px] pointer-events-none opacity-30 mix-blend-multiply" style={{
        background: 'radial-gradient(circle at 50% 0%, rgba(100, 150, 255, 0.15) 0%, rgba(252, 252, 252, 0) 70%)'
      }} />

      <main className="max-w-[1100px] mx-auto px-6 py-24 md:py-32 space-y-32 relative z-10">
        
        {/* HERO SECTION */}
        <section className="space-y-10">
          <div className="space-y-6">
            <h1 className="text-5xl md:text-7xl font-heading font-extrabold tracking-tight text-[#111111] leading-tight max-w-4xl">
              {portfolio.fullName || portfolio.name}
            </h1>
            {portfolio.headline && (
              <p className="text-xl md:text-3xl font-heading text-[#666666] font-medium leading-snug max-w-3xl">
                {portfolio.headline}
              </p>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-6 text-[15px] text-[#666666] font-medium pt-4">
            <div className="flex items-center gap-6">
              {portfolio.location && (
                <span className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {portfolio.location}</span>
              )}
              {portfolio.email && (
                <a href={`mailto:${portfolio.email}`} className="flex items-center gap-2 hover:text-[#111111] transition-colors">
                  <Mail className="w-4 h-4" /> {portfolio.email}
                </a>
              )}
            </div>

            <div className="hidden sm:block w-px h-5 bg-gray-200" />
            
            <div className="flex flex-wrap items-center gap-6">
              {primarySocials.map((link) => (
                <a 
                  key={link.id} 
                  href={link.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-[#111111] transition-colors underline-offset-4 hover:underline"
                >
                  {link.label}
                </a>
              ))}
              
              {/* Optional Resume Link */}
              {portfolio.showResume && portfolio.resumeUrl && (
                <a 
                  href={portfolio.resumeUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-[#111111] font-semibold hover:opacity-70 transition-opacity"
                >
                  <FileText className="w-4 h-4" /> Resume
                </a>
              )}
            </div>
          </div>
        </section>

        {/* ABOUT SECTION */}
        {(portfolio.bio || portfolio.summary) && (
          <section className="space-y-8">
            <h2 className="text-xl font-heading font-bold text-[#111111] tracking-tight">About Me</h2>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8 items-start">
              <div className="md:col-span-4">
                <div className="flex flex-col gap-4">
                <div className="p-4 bg-gray-50/50 border border-gray-100 rounded-xl">
                  <div className="text-[13px] text-[#666666] font-medium mb-1">Experience</div>
                  <div className="font-heading font-bold text-lg text-[#111111]">
                    {portfolio.experiences.length > 0 ? `${portfolio.experiences.length}+ Roles` : "Entry Level"}
                  </div>
                </div>
                <div className="p-4 bg-gray-50/50 border border-gray-100 rounded-xl">
                  <div className="text-[13px] text-[#666666] font-medium mb-1">Projects Built</div>
                  <div className="font-heading font-bold text-lg text-[#111111]">
                    {portfolio.projects.length} Shipped
                  </div>
                </div>
                {topTech && (
                  <div className="p-4 bg-gray-50/50 border border-gray-100 rounded-xl">
                    <div className="text-[13px] text-[#666666] font-medium mb-1">Top Tech</div>
                    <div className="font-heading font-bold text-lg text-[#111111]">
                      {topTech}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="md:col-span-8 md:pl-12">
              <div className="prose prose-lg prose-gray prose-p:leading-relaxed max-w-none text-[#444444]">
                {(portfolio.bio || portfolio.summary || "").split("\n").map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
            </div>
            </div>
          </section>
        )}

        {/* FEATURED WORK */}
        {portfolio.projects.length > 0 && (
          <section className="space-y-12">
            <h2 className="text-2xl font-heading font-bold text-[#111111] tracking-tight">Selected Work</h2>
            
            {/* Featured Case Studies */}
            {featuredProjects.length > 0 && (
              <div className="space-y-12">
                {featuredProjects.map((project) => (
                  <div key={project.id} className="group relative bg-white border border-gray-100 rounded-3xl p-8 md:p-12 shadow-sm hover:shadow-xl hover:border-gray-200 transition-all duration-500 overflow-hidden">
                    <div className="space-y-6 flex flex-col justify-center max-w-4xl">
                      <div className="space-y-2">
                        <h3 className="text-3xl font-heading font-extrabold text-[#111111] tracking-tight">
                          {project.title}
                        </h3>
                        {project.aiSummary && (
                          <p className="text-lg font-medium text-[#666666] leading-snug">
                            {project.aiSummary}
                          </p>
                        )}
                      </div>
                      
                      {project.description && (
                        <p className="text-[#666666] leading-relaxed text-[15px]">
                          {project.description}
                        </p>
                      )}
                      
                      {Array.isArray(project.techStack) && project.techStack.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-2">
                          {project.techStack.map((tech: any, i: number) => (
                            <span key={i} className="px-3 py-1.5 bg-gray-50 text-[#666666] text-xs font-semibold rounded-lg">
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex gap-4 pt-4">
                        {project.liveUrl && (
                          <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-5 py-2.5 bg-[#111111] text-white rounded-full text-sm font-semibold hover:bg-gray-800 transition-colors">
                            View Project <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                        {project.githubUrl && (
                          <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-[#111111] rounded-full text-sm font-semibold hover:bg-gray-50 transition-colors">
                            <GithubIcon className="w-4 h-4" /> GitHub
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Regular Projects Grid */}
            {regularProjects.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                {regularProjects.map((project) => (
                  <div key={project.id} className="group bg-white border border-gray-100 rounded-2xl p-8 hover:shadow-md hover:border-gray-200 transition-all duration-300 flex flex-col h-full">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <h3 className="text-xl font-heading font-bold text-[#111111]">
                        {project.title}
                      </h3>
                      <div className="flex gap-2 shrink-0">
                        {project.githubUrl && (
                          <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="p-2 text-gray-400 hover:text-[#111111] bg-gray-50 rounded-full hover:bg-gray-100 transition-colors">
                            <GithubIcon className="w-4 h-4" />
                          </a>
                        )}
                        {project.liveUrl && (
                          <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="p-2 text-gray-400 hover:text-[#111111] bg-gray-50 rounded-full hover:bg-gray-100 transition-colors">
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>
                    
                    {project.description && (
                      <p className="text-[#666666] leading-relaxed text-[14px] mb-6 flex-grow">
                        {project.description}
                      </p>
                    )}
                    
                    {Array.isArray(project.techStack) && project.techStack.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-auto">
                        {project.techStack.map((tech: any, i: number) => (
                          <span key={i} className="px-2.5 py-1 bg-gray-50 border border-gray-100 text-[#666666] text-xs font-medium rounded-md">
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* SKILLS */}
        {portfolio.skills.length > 0 && (
          <section className="space-y-10">
            <h2 className="text-2xl font-heading font-bold text-[#111111] tracking-tight">Capabilities</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {Object.entries(skillsByCategory).map(([category, skills]) => (
                <div key={category} className="space-y-4">
                  <h3 className="text-sm font-semibold text-[#666666] uppercase tracking-wider">{category}</h3>
                  <div className="flex flex-col gap-2">
                    {skills.map((skill) => (
                      <div key={skill.id} className="text-[15px] font-medium text-[#111111]">
                        {skill.name}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* EXPERIENCE */}
        {portfolio.showExperience && portfolio.experiences.length > 0 && (
          <section className="space-y-10">
            <h2 className="text-2xl font-heading font-bold text-[#111111] tracking-tight">Experience</h2>
            <div className="border-l border-gray-200 pl-6 md:pl-8 space-y-16">
              {portfolio.experiences.map((exp) => (
                <div key={exp.id} className="relative group">
                  {/* Timeline dot */}
                  <div className="absolute -left-[31px] md:-left-[39px] top-1.5 w-3 h-3 bg-white border-2 border-gray-300 rounded-full group-hover:border-[#111111] transition-colors" />
                  
                  <div className="flex flex-col md:flex-row md:items-baseline gap-2 md:gap-8 mb-4">
                    <div className="w-full md:w-1/4 shrink-0 text-sm font-semibold text-gray-400 tracking-wide">
                      {exp.startDate ? new Date(exp.startDate).getFullYear() : "Past"} — {exp.currentlyWorking ? "Present" : (exp.endDate ? new Date(exp.endDate).getFullYear() : "")}
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-xl font-heading font-extrabold text-[#111111]">{exp.role}</h3>
                      <p className="text-[#666666] font-medium text-[15px]">{exp.company}</p>
                    </div>
                  </div>
                  {exp.description && (
                    <div className="md:pl-[calc(25%+2rem)] text-[15px] text-[#666666] leading-relaxed whitespace-pre-wrap">
                      {exp.description}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* EVERYTHING ELSE */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 pt-16">
          
          {/* EDUCATION */}
          {portfolio.showEducation && portfolio.educations.length > 0 && (
            <section className="space-y-8">
              <h2 className="text-xl font-heading font-bold text-[#111111] tracking-tight">Education</h2>
              <div className="space-y-8">
                {portfolio.educations.map((edu) => (
                  <div key={edu.id} className="space-y-2">
                    <h3 className="font-heading font-bold text-lg text-[#111111]">{edu.institution}</h3>
                    <p className="text-[15px] text-[#666666]">{edu.degree} in {edu.fieldOfStudy}</p>
                    {(edu.startDate || edu.endDate) && (
                      <p className="text-sm text-gray-400 font-medium">
                        {edu.startDate ? new Date(edu.startDate).getFullYear() : ""} — {edu.endDate ? new Date(edu.endDate).getFullYear() : "Present"}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* CERTIFICATIONS */}
          {portfolio.showCertifications && portfolio.certifications.length > 0 && (
            <section className="space-y-8">
              <h2 className="text-xl font-heading font-bold text-[#111111] tracking-tight">Certifications</h2>
              <div className="space-y-6">
                {portfolio.certifications.map((cert) => (
                  <div key={cert.id} className="group">
                    <h3 className="font-heading font-bold text-lg text-[#111111] flex items-center gap-2">
                      {cert.title}
                      {cert.credentialUrl && (
                        <a href={cert.credentialUrl} target="_blank" rel="noopener noreferrer" className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <ExternalLink className="w-4 h-4 text-gray-400 hover:text-[#111111]" />
                        </a>
                      )}
                    </h3>
                    <p className="text-[15px] text-[#666666] mt-1">{cert.issuer}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ACHIEVEMENTS */}
          {portfolio.showAchievements && portfolio.achievements.length > 0 && (
            <section className="space-y-8">
              <h2 className="text-xl font-heading font-bold text-[#111111] tracking-tight">Awards & Recognition</h2>
              <div className="space-y-6">
                {portfolio.achievements.map((ach) => (
                  <div key={ach.id} className="space-y-2">
                    <h3 className="font-heading font-bold text-lg text-[#111111]">{ach.title}</h3>
                    {ach.description && <p className="text-[15px] text-[#666666]">{ach.description}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
        
        {/* FOOTER */}
        <footer className="pt-24 pb-8 border-t border-gray-100 mt-32">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left">
              <h3 className="font-heading font-bold text-lg text-[#111111]">Built by {portfolio.fullName || portfolio.name}</h3>
              <p className="text-[#666666] text-[15px] mt-1">Open to opportunities and collaborations.</p>
            </div>
            
            <div className="flex items-center gap-6 text-[14px] font-medium text-[#666666]">
              {primarySocials.map((link) => (
                <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="hover:text-[#111111] transition-colors">
                  {link.label}
                </a>
              ))}
            </div>
          </div>
          
          <div className="mt-16 flex justify-between items-center text-xs text-gray-400 font-medium">
             <span>© {new Date().getFullYear()} {portfolio.fullName || portfolio.name}.</span>
             <div className="flex items-center gap-1">
               Powered by <Link href="/" className="font-semibold text-gray-400 hover:text-[#111111] transition-colors">makeurfolio</Link>
             </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
