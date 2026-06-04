/**
 * Linear Theme — Inspired by Linear's design language.
 * Deep dark canvas (#010102) with a lavender-blue accent (#5e6ad2).
 * 4-step surface ladder, no drop-shadows, -3px display tracking.
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
  canvas: "#010102",
  surface: "#13141a",
  surfaceElevated: "#1a1b23",
  surfaceHighlight: "#24252e",
  border: "#282933",
  ink: "#f4f5f8",
  mute: "#8a8f98",
  accent: "#5e6ad2",
};

export default function LinearTheme({ portfolio: initialPortfolio, isEditMode = false }: PortfolioThemeProps) {
  const portfolio = useLiveSync(initialPortfolio, isEditMode);
  const { featured, regular } = splitProjects(portfolio.projects);
  const skillsByCategory = groupSkillsByCategory(portfolio.skills);
  const primarySocials = getPrimarySocials(portfolio.socialLinks, 4);
  const displayProjects = featured.length > 0 ? featured : regular.slice(0, 5);

  return (
    <div
      className="min-h-screen font-sans selection:bg-[#5e6ad2] selection:text-white"
      style={{ background: C.canvas, color: C.ink, fontFamily: "Inter, system-ui, sans-serif" }}
    >
      <div className="max-w-[1200px] mx-auto px-6 py-12 md:py-24 grid grid-cols-1 lg:grid-cols-12 gap-16">
        
        {/* LEFT COLUMN: STICKY SIDEBAR */}
        <aside className="lg:col-span-4 lg:sticky lg:top-24 h-max space-y-10">
          <div>
            <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium mb-6" style={{ background: C.surface, color: C.accent, border: `1px solid ${C.border}` }}>
              Crafting Software
            </div>
            <h1 className="text-4xl md:text-5xl font-semibold mb-4 leading-none" style={{ letterSpacing: "-0.04em", color: C.ink }}>
              <EditableField fieldKey="fullName" value={portfolio.fullName || portfolio.name} isEditMode={isEditMode} />
            </h1>
            {portfolio.headline && (
              <div className="text-lg md:text-xl font-medium" style={{ color: C.mute, letterSpacing: "-0.02em" }}>
                <EditableField fieldKey="headline" value={portfolio.headline} isEditMode={isEditMode} />
              </div>
            )}
          </div>
          
          <div className="space-y-4">
             {(portfolio.bio || portfolio.summary) && (
               <div className="text-sm leading-relaxed" style={{ color: C.mute }}>
                 <EditableField fieldKey="summary" value={portfolio.bio || portfolio.summary || ""} isEditMode={isEditMode} />
               </div>
             )}
          </div>

          <div className="space-y-3">
             <div className="flex flex-col gap-2">
                {portfolio.location && (
                  <div className="flex items-center gap-3 text-sm px-4 py-2.5 rounded-lg" style={{ background: C.surface, border: `1px solid ${C.border}`, color: C.mute }}>
                    <MapPin className="w-4 h-4" />{portfolio.location}
                  </div>
                )}
                {portfolio.email && (
                  <a href={`mailto:${portfolio.email}`} className="flex items-center gap-3 text-sm px-4 py-2.5 rounded-lg hover:bg-[#1a1b23] transition-colors" style={{ background: C.surface, border: `1px solid ${C.border}`, color: C.mute }}>
                    <Mail className="w-4 h-4" />{portfolio.email}
                  </a>
                )}
             </div>
             
             <div className="flex flex-wrap gap-2">
                {primarySocials.map((link) => (
                  <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="text-sm px-4 py-2 rounded-lg hover:bg-[#1a1b23] transition-colors flex-1 text-center" style={{ background: C.surface, border: `1px solid ${C.border}`, color: C.mute }}>
                    {link.label}
                  </a>
                ))}
             </div>

             {portfolio.showResume && portfolio.resumeUrl && (
                <a href={portfolio.resumeUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full text-sm font-medium px-4 py-3 rounded-lg mt-4 transition-colors hover:opacity-90" style={{ background: C.ink, color: C.canvas }}>
                  <FileText className="w-4 h-4" />View Résumé
                </a>
             )}
          </div>
        </aside>

        {/* RIGHT COLUMN: MAIN CONTENT */}
        <main className="lg:col-span-8 space-y-24">
           
           {/* PROJECTS */}
           {portfolio.projects.length > 0 && (
             <section>
               <h2 className="text-xl font-semibold mb-8" style={{ color: C.ink, letterSpacing: "-0.02em" }}>Selected Projects</h2>
               <div className="space-y-6">
                 {displayProjects.map((project) => (
                   <div key={project.id} className="p-6 rounded-xl transition-colors hover:bg-[#13141a]" style={{ border: `1px solid ${C.border}`, background: C.canvas }}>
                     <div className="flex items-start justify-between mb-4">
                       <h3 className="text-lg font-medium" style={{ color: C.ink }}>
                         <EditableField fieldKey={`projects.${project._originalIndex}.title`} value={project.title} isEditMode={isEditMode} />
                       </h3>
                       <div className="flex items-center gap-2 shrink-0 ml-4">
                         {project.githubUrl && <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="p-2 rounded-md hover:bg-[#24252e] transition-colors" style={{ background: C.surface, color: C.mute }}><Github className="w-4 h-4" /></a>}
                         {project.liveUrl && <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="p-2 rounded-md hover:bg-[#24252e] transition-colors" style={{ background: C.surface, color: C.mute }}><ExternalLink className="w-4 h-4" /></a>}
                       </div>
                     </div>
                     <div className="text-sm leading-relaxed mb-5" style={{ color: C.mute }}>
                       <EditableField fieldKey={`projects.${project._originalIndex}.description`} value={project.description || project.aiSummary || ""} isEditMode={isEditMode} />
                     </div>
                     {Array.isArray(project.techStack) && project.techStack.length > 0 && (
                       <div className="flex flex-wrap gap-2 mt-auto">
                         {project.techStack.map((tech: unknown, idx: number) => (
                           <span key={idx} className="px-2.5 py-1 text-xs rounded-md" style={{ background: C.surfaceElevated, color: C.mute, border: `1px solid ${C.border}` }}>{String(tech)}</span>
                         ))}
                       </div>
                     )}
                   </div>
                 ))}
               </div>
             </section>
           )}

           {/* EXPERIENCE */}
           {portfolio.showExperience && portfolio.experiences.length > 0 && (
             <section>
               <h2 className="text-xl font-semibold mb-8" style={{ color: C.ink, letterSpacing: "-0.02em" }}>Experience</h2>
               <div className="space-y-6">
                 {portfolio.experiences.map((exp, idx) => (
                   <div key={exp.id} className="p-6 rounded-xl" style={{ border: `1px solid ${C.border}`, background: C.surface }}>
                     <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2 mb-2">
                       <h3 className="text-base font-medium" style={{ color: C.ink }}>
                         <EditableField fieldKey={`experiences.${idx}.role`} value={exp.role} isEditMode={isEditMode} />
                       </h3>
                       <span className="text-xs font-mono shrink-0" style={{ color: C.mute }}>{formatDateRange(exp.startDate, exp.endDate, exp.currentlyWorking)}</span>
                     </div>
                     <div className="text-sm font-medium mb-4" style={{ color: C.accent }}>
                       <EditableField fieldKey={`experiences.${idx}.company`} value={exp.company} isEditMode={isEditMode} />
                     </div>
                     {exp.description && (
                       <div className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: C.mute }}>
                         <EditableField fieldKey={`experiences.${idx}.description`} value={exp.description} isEditMode={isEditMode} />
                       </div>
                     )}
                   </div>
                 ))}
               </div>
             </section>
           )}

           {/* SKILLS */}
           {portfolio.skills.length > 0 && (
             <section>
               <h2 className="text-xl font-semibold mb-8" style={{ color: C.ink, letterSpacing: "-0.02em" }}>Skills</h2>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 {Object.entries(skillsByCategory).map(([cat, skills]) => (
                   <div key={cat} className="p-5 rounded-xl" style={{ border: `1px solid ${C.border}`, background: C.surface }}>
                     <h3 className="text-sm font-medium mb-4" style={{ color: C.ink }}>{cat}</h3>
                     <div className="flex flex-wrap gap-2">
                       {skills.map((skill) => (
                         <span key={skill.id} className="px-2.5 py-1 text-xs rounded-md inline-block" style={{ background: C.surfaceElevated, color: C.mute, border: `1px solid ${C.border}` }}>
                           <EditableField fieldKey={`skills.${skill._originalIndex}.name`} value={skill.name} isEditMode={isEditMode} />
                         </span>
                       ))}
                     </div>
                   </div>
                 ))}
               </div>
             </section>
           )}
           
           {/* EDUCATION & CERTS */}
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
             {portfolio.showEducation && portfolio.educations.length > 0 && (
               <section>
                 <h2 className="text-lg font-semibold mb-6" style={{ color: C.ink, letterSpacing: "-0.02em" }}>Education</h2>
                 <div className="space-y-4">
                   {portfolio.educations.map((edu, idx) => (
                     <div key={edu.id} className="p-4 rounded-xl" style={{ border: `1px solid ${C.border}`, background: C.surface }}>
                       <div className="mb-2">
                         <h3 className="text-sm font-medium" style={{ color: C.ink }}>
                           <EditableField fieldKey={`educations.${idx}.institution`} value={edu.institution} isEditMode={isEditMode} />
                         </h3>
                         <span className="text-xs font-mono block mt-1" style={{ color: C.mute }}>{formatDateRange(edu.startDate, edu.endDate)}</span>
                       </div>
                       <div className="text-sm" style={{ color: C.mute }}>
                         <EditableField fieldKey={`educations.${idx}.degree`} value={edu.degree || ""} isEditMode={isEditMode} /> in <EditableField fieldKey={`educations.${idx}.fieldOfStudy`} value={edu.fieldOfStudy || ""} isEditMode={isEditMode} />
                       </div>
                     </div>
                   ))}
                 </div>
               </section>
             )}

             {portfolio.showCertifications && portfolio.certifications.length > 0 && (
               <section>
                 <h2 className="text-lg font-semibold mb-6" style={{ color: C.ink, letterSpacing: "-0.02em" }}>Certifications</h2>
                 <div className="space-y-4">
                   {portfolio.certifications.map((cert) => (
                     <div key={cert.id} className="flex items-start justify-between gap-4 p-4 rounded-xl" style={{ border: `1px solid ${C.border}`, background: C.surface }}>
                       <div>
                         <h3 className="text-sm font-medium" style={{ color: C.ink }}>{cert.title}</h3>
                         <p className="text-xs mt-1" style={{ color: C.mute }}>{cert.issuer}</p>
                       </div>
                       {cert.credentialUrl && <a href={cert.credentialUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-md hover:bg-[#24252e] transition-colors" style={{ background: C.surfaceElevated, color: C.mute }}><ExternalLink className="w-3.5 h-3.5" /></a>}
                     </div>
                   ))}
                 </div>
               </section>
             )}
           </div>

           <footer className="pt-12 text-sm border-t" style={{ borderColor: C.border, color: C.mute }}>
              © {new Date().getFullYear()} {portfolio.fullName || portfolio.name} · Powered by <Link href="/" className="hover:text-white transition-colors">makeurfolio</Link>
           </footer>
        </main>
      </div>
    </div>
  );
}
