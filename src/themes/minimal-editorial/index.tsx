/**
 * Minimal Editorial Theme
 *
 * A clean, recruiter-first portfolio layout inspired by Read.cv, Linear,
 * and high-end editorial websites. Prioritizes readability, generous
 * whitespace, and an intentional content hierarchy.
 *
 * Content Flow: Hero → About → Featured Work → Skills → Experience →
 *               Education → Certifications → Achievements → Footer
 *
 * This is a PURE PRESENTATION component. It must NEVER import Prisma,
 * call fetch(), or access any data source directly.
 */

import React from "react";
import Link from "next/link";
import { ExternalLink, MapPin, Mail, FileText, Code2 as GithubIcon } from "lucide-react";
import { EditableField } from "@/src/components/editor/editable-field";
import { EditableArrayItem } from "@/src/components/editor/editable-array-item";
import { useLiveSync } from "@/src/hooks/use-live-sync";
import type { PortfolioThemeProps } from "../shared/types";
import {
  groupSkillsByCategory,
  formatDateRange,
  splitProjects,
  getPrimarySocials,
  getTopTechString,
} from "../shared/utils";

export default function MinimalEditorialTheme({ portfolio: initialPortfolio, isEditMode = false }: PortfolioThemeProps) {
  const portfolio = useLiveSync(initialPortfolio, isEditMode);
  const { featured: featuredProjects, regular: regularProjects } = splitProjects(portfolio.projects);
  const skillsByCategory = groupSkillsByCategory(portfolio.skills);
  const topTech = getTopTechString(portfolio.skills);
  const primarySocials = getPrimarySocials(portfolio.socialLinks);

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
              <EditableField fieldKey="fullName" value={portfolio.fullName || portfolio.name} isEditMode={isEditMode} />
            </h1>
            {portfolio.headline && (
              <p className="text-xl md:text-3xl font-heading text-[#666666] font-medium leading-snug max-w-3xl">
                <EditableField fieldKey="headline" value={portfolio.headline} isEditMode={isEditMode} />
              </p>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-6 text-[15px] text-[#666666] font-medium pt-4">
            <div className="flex items-center gap-6">
              {portfolio.location && (
                <span className="flex items-center gap-2"><MapPin className="w-4 h-4" /> <EditableField fieldKey="location" value={portfolio.location} isEditMode={isEditMode} /></span>
              )}
              {portfolio.email && (
                <a href={`mailto:${portfolio.email}`} className="flex items-center gap-2 hover:text-[#111111] transition-colors">
                  <Mail className="w-4 h-4" /> <EditableField fieldKey="email" value={portfolio.email} isEditMode={isEditMode} />
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
                <EditableField fieldKey="summary" value={portfolio.summary || portfolio.bio || ""} isEditMode={isEditMode} />
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
                  <EditableArrayItem
                    key={project.id}
                    arrayPath="projects"
                    index={project._originalIndex}
                    isEditMode={isEditMode}
                    className="group relative bg-white border border-gray-100 rounded-3xl p-8 md:p-12 shadow-sm hover:shadow-xl hover:border-gray-200 transition-all duration-500 overflow-hidden"
                  >
                    <div className="space-y-6 flex flex-col justify-center max-w-4xl">
                      <div className="space-y-2">
                        <h3 className="text-3xl font-heading font-extrabold text-[#111111] tracking-tight">
                          <EditableField fieldKey={`projects.${project._originalIndex}.title`} value={project.title} isEditMode={isEditMode} />
                        </h3>
                        <div className="text-lg font-medium text-[#666666] leading-snug">
                          <EditableField fieldKey={`projects.${project._originalIndex}.description`} value={project.description || project.aiSummary || ""} isEditMode={isEditMode} />
                        </div>
                      </div>
                      
                      {Array.isArray(project.techStack) && project.techStack.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-2">
                          {project.techStack.map((tech: unknown, i: number) => (
                            <span key={i} className="px-3 py-1.5 bg-gray-50 text-[#666666] text-xs font-semibold rounded-lg">
                              {String(tech)}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center gap-4 pt-4">
                        {project.liveUrl && (
                          <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#111111] text-white text-sm font-bold rounded-xl hover:bg-[#333333] hover:-translate-y-0.5 transition-all">
                            View Live <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                        {project.githubUrl && (
                          <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-50 text-[#111111] text-sm font-bold rounded-xl hover:bg-gray-100 hover:-translate-y-0.5 transition-all">
                            Source <GithubIcon className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  </EditableArrayItem>
                ))}
              </div>
            )}

            {/* Regular Projects Grid */}
            {regularProjects.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                {regularProjects.map((project) => (
                  <EditableArrayItem
                    key={project.id}
                    arrayPath="projects"
                    index={project._originalIndex}
                    isEditMode={isEditMode}
                    className="group bg-white border border-gray-100 rounded-2xl p-8 hover:shadow-md hover:border-gray-200 transition-all duration-300 flex flex-col h-full"
                  >
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <h3 className="text-xl font-heading font-bold text-[#111111]">
                        <EditableField fieldKey={`projects.${project._originalIndex}.title`} value={project.title} isEditMode={isEditMode} />
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
                    
                    <div className="text-[#666666] leading-relaxed text-[14px] mb-6 flex-grow">
                      <EditableField fieldKey={`projects.${project._originalIndex}.description`} value={project.description || ""} isEditMode={isEditMode} />
                    </div>
                    
                    {Array.isArray(project.techStack) && project.techStack.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-auto">
                        {project.techStack.map((tech: unknown, i: number) => (
                          <span key={i} className="px-2.5 py-1 bg-gray-50 border border-gray-100 text-[#666666] text-xs font-medium rounded-md">
                            {String(tech)}
                          </span>
                        ))}
                      </div>
                    )}
                  </EditableArrayItem>
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
                      <EditableArrayItem 
                        key={skill.id} 
                        arrayPath="skills"
                        index={skill._originalIndex}
                        isEditMode={isEditMode}
                        className="text-[15px] font-medium text-[#111111]"
                      >
                        <EditableField fieldKey={`skills.${skill._originalIndex}.name`} value={skill.name} isEditMode={isEditMode} />
                      </EditableArrayItem>
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
              {portfolio.experiences.map((exp, idx) => (
                <EditableArrayItem 
                  key={exp.id} 
                  arrayPath="experiences"
                  index={idx}
                  isEditMode={isEditMode}
                  className="relative group"
                >
                  {/* Timeline dot */}
                  <div className="absolute -left-[31px] md:-left-[39px] top-1.5 w-3 h-3 bg-white border-2 border-gray-300 rounded-full group-hover:border-[#111111] transition-colors" />
                  
                  <div className="flex flex-col md:flex-row md:items-baseline gap-2 md:gap-8 mb-4">
                    <div className="w-full md:w-1/4 shrink-0 text-sm font-semibold text-gray-400 tracking-wide">
                      {formatDateRange(exp.startDate, exp.endDate, exp.currentlyWorking)}
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-xl font-heading font-extrabold text-[#111111]">
                        <EditableField fieldKey={`experiences.${idx}.role`} value={exp.role} isEditMode={isEditMode} />
                      </h3>
                      <div className="text-[#666666] font-medium text-[15px]">
                        <EditableField fieldKey={`experiences.${idx}.company`} value={exp.company} isEditMode={isEditMode} />
                      </div>
                    </div>
                  </div>
                  <div className="md:pl-[calc(25%+2rem)] text-[15px] text-[#666666] leading-relaxed whitespace-pre-wrap">
                    <EditableField fieldKey={`experiences.${idx}.description`} value={exp.description || ""} isEditMode={isEditMode} />
                  </div>
                </EditableArrayItem>
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
                {portfolio.educations.map((edu, idx) => (
                  <EditableArrayItem 
                    key={edu.id} 
                    arrayPath="educations"
                    index={idx}
                    isEditMode={isEditMode}
                    className="space-y-2"
                  >
                    <h3 className="font-heading font-bold text-lg text-[#111111]">
                      <EditableField fieldKey={`educations.${idx}.institution`} value={edu.institution} isEditMode={isEditMode} />
                    </h3>
                    <div className="text-[15px] text-[#666666]">
                      <EditableField fieldKey={`educations.${idx}.degree`} value={edu.degree || ""} isEditMode={isEditMode} /> in <EditableField fieldKey={`educations.${idx}.fieldOfStudy`} value={edu.fieldOfStudy || ""} isEditMode={isEditMode} />
                    </div>
                    {(edu.startDate || edu.endDate) && (
                      <p className="text-sm text-gray-400 font-medium">
                        {formatDateRange(edu.startDate, edu.endDate)}
                      </p>
                    )}
                  </EditableArrayItem>
                ))}
              </div>
            </section>
          )}

          {/* CERTIFICATIONS */}
          {portfolio.showCertifications && portfolio.certifications.length > 0 && (
            <section className="space-y-8">
              <h2 className="text-xl font-heading font-bold text-[#111111] tracking-tight">Certifications</h2>
              <div className="space-y-6">
                {portfolio.certifications.map((cert, idx) => (
                  <EditableArrayItem 
                    key={cert.id} 
                    arrayPath="certifications"
                    index={idx}
                    isEditMode={isEditMode}
                    className="group"
                  >
                    <h3 className="font-heading font-bold text-lg text-[#111111] flex items-center gap-2">
                      <EditableField fieldKey={`certifications.${idx}.title`} value={cert.title} isEditMode={isEditMode} />
                      {cert.credentialUrl && (
                        <a href={cert.credentialUrl} target="_blank" rel="noopener noreferrer" className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <ExternalLink className="w-4 h-4 text-gray-400 hover:text-[#111111]" />
                        </a>
                      )}
                    </h3>
                    <p className="text-[15px] text-[#666666] mt-1">
                      <EditableField fieldKey={`certifications.${idx}.issuer`} value={cert.issuer} isEditMode={isEditMode} />
                    </p>
                  </EditableArrayItem>
                ))}
              </div>
            </section>
          )}

          {/* ACHIEVEMENTS */}
          {portfolio.showAchievements && portfolio.achievements.length > 0 && (
            <section className="space-y-8">
              <h2 className="text-xl font-heading font-bold text-[#111111] tracking-tight">Awards & Recognition</h2>
              <div className="space-y-6">
                {portfolio.achievements.map((ach, idx) => (
                  <EditableArrayItem 
                    key={ach.id} 
                    arrayPath="achievements"
                    index={idx}
                    isEditMode={isEditMode}
                    className="space-y-2"
                  >
                    <h3 className="font-heading font-bold text-lg text-[#111111]">
                      <EditableField fieldKey={`achievements.${idx}.title`} value={ach.title} isEditMode={isEditMode} />
                    </h3>
                    <p className="text-[15px] text-[#666666]">
                      <EditableField fieldKey={`achievements.${idx}.description`} value={ach.description || ""} isEditMode={isEditMode} />
                    </p>
                  </EditableArrayItem>
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
