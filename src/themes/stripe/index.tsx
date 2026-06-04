/**
 * Stripe Theme — Inspired by Stripe's design language.
 * Alternating left/right rows for projects and experiences.
 * Financial-infrastructure aesthetic with gradient mesh hero, 
 * indigo CTA (#533afd) and cream-navy card tints.
 * PURE PRESENTATION COMPONENT. No data fetching.
 */
"use client";

import React from "react";
import Link from "next/link";
import { ExternalLink, MapPin, Mail, FileText, Code2 as Github } from "lucide-react";
import type { PortfolioThemeProps } from "../shared/types";
import {
  groupSkillsByCategory,
  formatDateRange,
  splitProjects,
  getPrimarySocials,
} from "../shared/utils";
import { EditableField } from "@/src/components/editor/editable-field";
import { useLiveSync } from "@/src/hooks/use-live-sync";

const C = {
  canvas: "#ffffff",
  surface: "#f5e9d4", 
  brandNavy: "#1c1e54",
  primary: "#533afd",
  ink: "#0a2540",
  body: "#425466",
  hairline: "#e6e6e6",
};

export default function StripeTheme({ portfolio: initialPortfolio, isEditMode = false }: PortfolioThemeProps) {
  const portfolio = useLiveSync(initialPortfolio, isEditMode);
  const { featured, regular } = splitProjects(portfolio.projects);
  const skillsByCategory = groupSkillsByCategory(portfolio.skills);
  const primarySocials = getPrimarySocials(portfolio.socialLinks, 4);
  const displayProjects = featured.length > 0 ? featured : regular.slice(0, 4);

  return (
    <div
      className="min-h-screen font-sans selection:bg-[#533afd] selection:text-white"
      style={{ background: C.canvas, color: C.ink, fontFamily: "system-ui, -apple-system, sans-serif" }}
    >
      {/* GRADIENT MESH HERO */}
      <section className="relative overflow-hidden pb-12">
        <div className="absolute inset-0 pointer-events-none opacity-40" style={{
          background: "radial-gradient(ellipse at 0% 0%, #f5e9d4 0%, transparent 50%), radial-gradient(ellipse at 100% 0%, #dcecfa 0%, transparent 50%), radial-gradient(ellipse at 50% 100%, #e6e0f5 0%, transparent 50%)"
        }} />
        
        {/* Navigation band */}
        <div className="relative z-10 flex items-center justify-between px-6 py-6 max-w-[1140px] mx-auto">
           <div className="font-bold text-lg" style={{ color: C.ink }}>
             <EditableField fieldKey="fullName" value={portfolio.fullName || portfolio.name} isEditMode={isEditMode} />
           </div>
           <div className="flex items-center gap-4">
             {primarySocials.map((link) => (
               <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium hover:opacity-70 transition-opacity" style={{ color: C.body }}>
                 {link.label}
               </a>
             ))}
           </div>
        </div>

        <div className="relative z-10 max-w-[1140px] mx-auto px-6 py-20 md:py-32 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
           <div>
             <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold mb-6 uppercase tracking-widest" style={{ background: "rgba(83, 58, 253, 0.1)", color: C.primary }}>
               Developer Portfolio
             </div>
             <div className="text-5xl md:text-6xl font-bold leading-[1.1] mb-6" style={{ color: C.ink, letterSpacing: "-1px" }}>
               Building the infrastructure for the internet.
             </div>
             {portfolio.headline && (
               <div className="text-xl mb-8 leading-relaxed" style={{ color: C.body }}>
                 <EditableField fieldKey="headline" value={portfolio.headline} isEditMode={isEditMode} />
               </div>
             )}
             
             <div className="flex items-center gap-4 mb-8">
               <a href={`mailto:${portfolio.email || "#"}`} className="px-6 py-3 rounded-full text-sm font-bold transition-all hover:opacity-90 shadow-lg hover:shadow-xl" style={{ background: C.primary, color: "#fff" }}>
                 Start a conversation
               </a>
               {portfolio.showResume && portfolio.resumeUrl && (
                 <a href={portfolio.resumeUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold transition-colors hover:bg-gray-50" style={{ color: C.ink }}>
                   View Résumé <ExternalLink className="w-4 h-4" />
                 </a>
               )}
             </div>

             <div className="flex flex-wrap gap-4 text-sm font-medium" style={{ color: C.body }}>
                {portfolio.location && <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" />{portfolio.location}</span>}
                {portfolio.email && <span className="flex items-center gap-1.5"><Mail className="w-4 h-4" />{portfolio.email}</span>}
             </div>
           </div>
           
           {/* Abstract hero graphic area */}
           <div className="hidden md:block relative h-full min-h-[400px]">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] rounded-full opacity-20" style={{ background: `linear-gradient(135deg, ${C.primary}, #00d2ff)`, filter: "blur(80px)" }} />
              {/* Optional: we could put an image here, but relying on abstract shapes is safer for generic portfolios */}
              <div className="absolute right-0 top-1/4 w-64 h-32 rounded-2xl shadow-2xl bg-white rotate-6 p-4" style={{ border: `1px solid ${C.hairline}` }}>
                 <div className="w-1/2 h-3 bg-gray-200 rounded-full mb-4" />
                 <div className="w-3/4 h-2 bg-gray-100 rounded-full mb-2" />
                 <div className="w-full h-2 bg-gray-100 rounded-full mb-2" />
                 <div className="w-2/3 h-2 bg-gray-100 rounded-full" />
              </div>
              <div className="absolute left-10 bottom-1/4 w-48 h-48 rounded-full shadow-xl bg-white -rotate-12 p-6 flex flex-col justify-center" style={{ border: `1px solid ${C.hairline}` }}>
                 <div className="text-3xl font-bold mb-1" style={{ color: C.primary }}>{portfolio.projects.length}+</div>
                 <div className="text-sm font-medium" style={{ color: C.body }}>Projects Deployed</div>
              </div>
           </div>
        </div>
      </section>

      <main className="space-y-32 pb-32">

        {/* ABOUT (Centered) */}
        {(portfolio.bio || portfolio.summary) && (
          <section className="max-w-[800px] mx-auto px-6 text-center">
            <h2 className="text-2xl font-bold mb-6" style={{ color: C.ink }}>About Me</h2>
            <div className="text-lg leading-relaxed" style={{ color: C.body }}>
              <EditableField fieldKey="summary" value={portfolio.summary || portfolio.bio || ""} isEditMode={isEditMode} />
            </div>
          </section>
        )}

        {/* PROJECTS (Alternating Left/Right Rows) */}
        {portfolio.projects.length > 0 && (
          <section className="max-w-[1140px] mx-auto px-6">
            <h2 className="text-3xl font-bold mb-16 text-center" style={{ color: C.ink, letterSpacing: "-0.5px" }}>Selected Projects</h2>
            <div className="space-y-24">
              {displayProjects.map((project, i) => {
                 const isEven = i % 2 === 0;
                 return (
                   <div key={project.id} className={`flex flex-col md:flex-row gap-12 items-center ${!isEven ? "md:flex-row-reverse" : ""}`}>
                     {/* Text side */}
                     <div className="flex-1 space-y-6">
                        <h3 className="text-2xl font-bold" style={{ color: C.ink }}>
                          <EditableField fieldKey={`projects.${project._originalIndex}.title`} value={project.title} isEditMode={isEditMode} />
                        </h3>
                        <div className="text-lg leading-relaxed" style={{ color: C.body }}>
                          <EditableField fieldKey={`projects.${project._originalIndex}.description`} value={project.description || project.aiSummary || ""} isEditMode={isEditMode} />
                        </div>
                        {Array.isArray(project.techStack) && project.techStack.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {project.techStack.map((tech: unknown, idx: number) => (
                              <span key={idx} className="px-3 py-1 text-sm font-medium rounded-full" style={{ background: C.surface, color: C.ink }}>{String(tech)}</span>
                            ))}
                          </div>
                        )}
                        <div className="flex items-center gap-4 pt-2">
                          {project.liveUrl && <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm font-bold transition-colors hover:opacity-70" style={{ color: C.primary }}>View live site <ExternalLink className="w-4 h-4" /></a>}
                          {project.githubUrl && <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm font-bold transition-colors hover:opacity-70" style={{ color: C.body }}><Github className="w-4 h-4" /> Source code</a>}
                        </div>
                     </div>
                     {/* Abstract "Image" side */}
                     <div className="flex-1 w-full aspect-video rounded-2xl flex items-center justify-center relative overflow-hidden shadow-sm" style={{ background: isEven ? "#f6f9fc" : C.surface }}>
                        <div className="absolute inset-0 opacity-50" style={{ background: `radial-gradient(circle at center, ${C.primary}15 0%, transparent 70%)` }} />
                        <div className="w-3/4 h-3/4 bg-white rounded-xl shadow-lg border p-6 flex flex-col gap-4" style={{ borderColor: C.hairline }}>
                           <div className="w-1/3 h-4 rounded-full bg-gray-200" />
                           <div className="w-full h-2 rounded-full bg-gray-100" />
                           <div className="w-5/6 h-2 rounded-full bg-gray-100" />
                           <div className="w-full h-2 rounded-full bg-gray-100" />
                        </div>
                     </div>
                   </div>
                 );
              })}
            </div>
          </section>
        )}

        {/* EXPERIENCE (Navy Band) */}
        {portfolio.showExperience && portfolio.experiences.length > 0 && (
          <section className="py-24" style={{ background: C.brandNavy }}>
            <div className="max-w-[800px] mx-auto px-6 text-white">
              <h2 className="text-3xl font-bold mb-12 text-center" style={{ letterSpacing: "-0.5px" }}>Experience</h2>
              <div className="space-y-12 relative before:absolute before:inset-y-0 before:left-[11px] md:before:left-1/2 before:w-px before:bg-white/20">
                {portfolio.experiences.map((exp, i) => {
                   const isEven = i % 2 === 0;
                   return (
                     <div key={exp.id} className={`relative flex flex-col md:flex-row gap-8 ${isEven ? "md:flex-row-reverse" : ""}`}>
                        {/* Timeline dot */}
                        <div className="absolute left-0 md:left-1/2 top-1 w-6 h-6 rounded-full border-4 -ml-[11px] md:-ml-3" style={{ background: C.primary, borderColor: C.brandNavy }} />
                        
                        <div className="flex-1 md:text-right pl-10 md:pl-0 pr-0 md:pr-12">
                           {isEven ? (
                              <h3 className="text-xl font-bold mb-1 text-left">
                                <EditableField fieldKey={`experiences.${i}.role`} value={exp.role} isEditMode={isEditMode} />
                              </h3>
                           ) : (
                              <div className="text-sm font-medium mb-1" style={{ color: "#8792a2" }}>{formatDateRange(exp.startDate, exp.endDate, exp.currentlyWorking)}</div>
                           )}
                           {isEven ? (
                              <div className="text-lg font-medium mb-3 text-left" style={{ color: "#00d4ff" }}>
                                <EditableField fieldKey={`experiences.${i}.company`} value={exp.company} isEditMode={isEditMode} />
                              </div>
                           ) : (
                              <h3 className="text-xl font-bold mb-1">
                                <EditableField fieldKey={`experiences.${i}.role`} value={exp.role} isEditMode={isEditMode} />
                              </h3>
                           )}
                           {isEven ? (
                              <div className="text-sm font-medium mb-1 text-left" style={{ color: "#8792a2" }}>{formatDateRange(exp.startDate, exp.endDate, exp.currentlyWorking)}</div>
                           ) : (
                              <div className="text-lg font-medium mb-3" style={{ color: "#00d4ff" }}>
                                <EditableField fieldKey={`experiences.${i}.company`} value={exp.company} isEditMode={isEditMode} />
                              </div>
                           )}
                           
                        </div>
                        <div className="flex-1 pl-10 md:pl-12">
                           <div className="text-base leading-relaxed" style={{ color: "#adbdcc" }}>
                             <EditableField fieldKey={`experiences.${i}.description`} value={exp.description || ""} isEditMode={isEditMode} />
                           </div>
                        </div>
                     </div>
                   );
                })}
              </div>
            </div>
          </section>
        )}

        {/* SKILLS & CERTS (Grid) */}
        <section className="max-w-[1140px] mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-16">
          {/* Skills */}
          {portfolio.skills.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-8" style={{ color: C.ink }}>Skills & Technologies</h2>
              <div className="space-y-6">
                {Object.entries(skillsByCategory).map(([cat, skills]) => (
                  <div key={cat}>
                    <h3 className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color: C.body }}>{cat}</h3>
                    <div className="flex flex-wrap gap-2">
                      {skills.map((skill) => (
                        <span key={skill.id} className="px-4 py-2 text-sm font-medium rounded-lg inline-block" style={{ background: "#f6f9fc", color: C.ink, border: `1px solid ${C.hairline}` }}>
                          <EditableField fieldKey={`skills.${skill._originalIndex}.name`} value={skill.name} isEditMode={isEditMode} />
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Educations & Certs */}
          <div className="space-y-12">
            {portfolio.showEducation && portfolio.educations.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-8" style={{ color: C.ink }}>Education</h2>
                <div className="space-y-6">
                  {portfolio.educations.map((edu, idx) => (
                    <div key={edu.id} className="pb-6 border-b" style={{ borderColor: C.hairline }}>
                       <h3 className="text-lg font-bold mb-1" style={{ color: C.ink }}>
                         <EditableField fieldKey={`educations.${idx}.institution`} value={edu.institution} isEditMode={isEditMode} />
                       </h3>
                       <div className="text-base font-medium mb-2" style={{ color: C.body }}>
                         <EditableField fieldKey={`educations.${idx}.degree`} value={edu.degree || ""} isEditMode={isEditMode} /> in <EditableField fieldKey={`educations.${idx}.fieldOfStudy`} value={edu.fieldOfStudy || ""} isEditMode={isEditMode} />
                       </div>
                       <span className="text-sm font-medium" style={{ color: C.primary }}>{formatDateRange(edu.startDate, edu.endDate)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {portfolio.showCertifications && portfolio.certifications.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-8" style={{ color: C.ink }}>Certifications</h2>
                <div className="space-y-4">
                  {portfolio.certifications.map((cert) => (
                    <div key={cert.id} className="flex items-center justify-between gap-4 p-4 rounded-xl" style={{ background: "#f6f9fc", border: `1px solid ${C.hairline}` }}>
                      <div>
                        <h3 className="text-base font-bold" style={{ color: C.ink }}>{cert.title}</h3>
                        <p className="text-sm font-medium" style={{ color: C.body }}>{cert.issuer}</p>
                      </div>
                      {cert.credentialUrl && <a href={cert.credentialUrl} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full hover:bg-white transition-colors" style={{ color: C.primary }}><ExternalLink className="w-4 h-4" /></a>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="py-12 border-t" style={{ borderColor: C.hairline, background: "#f6f9fc" }}>
        <div className="max-w-[1140px] mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm font-medium" style={{ color: C.body }}>
            © {new Date().getFullYear()} {portfolio.fullName || portfolio.name}.
          </div>
          <div className="flex items-center gap-1 text-sm font-medium" style={{ color: C.body }}>
            Powered by <Link href="/" className="ml-1 font-bold transition-colors hover:opacity-70" style={{ color: C.primary }}>makeurfolio</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
