/**
 * Vercel Theme — Inspired by Vercel's stark aesthetic.
 * Near-white canvas (#fafafa) with deep black ink (#171717),
 * multi-color mesh gradient hero (cyan -> violet -> amber),
 * monospace technical typography for eyebrows, and stacked-shadow cards.
 * PURE PRESENTATION COMPONENT. No data fetching.
 */
"use client";

import React from "react";
import Link from "next/link";
import { ExternalLink, MapPin, Mail, FileText, Code2 as Github } from "lucide-react";
import type { PortfolioThemeProps } from "../shared/types";
import { EditableField } from "@/src/components/editor/editable-field";
import { useLiveSync } from "@/src/hooks/use-live-sync";
import {
  groupSkillsByCategory,
  formatDateRange,
  splitProjects,
  getPrimarySocials,
} from "../shared/utils";

const C = {
  canvas: "#fafafa",
  ink: "#171717",
  surface: "#ffffff",
  surfaceElevated: "#f5f5f5",
  border: "#eaeaea",
  mute: "#666666",
  monospaced: "#000000",
};

export default function VercelTheme({ portfolio: initialPortfolio, isEditMode = false }: PortfolioThemeProps) {
  const portfolio = useLiveSync(initialPortfolio, isEditMode);
  const { featured, regular } = splitProjects(portfolio.projects);
  const skillsByCategory = groupSkillsByCategory(portfolio.skills);
  const primarySocials = getPrimarySocials(portfolio.socialLinks, 4);
  const displayProjects = featured.length > 0 ? featured : regular.slice(0, 5);

  return (
    <div
      className="min-h-screen font-sans selection:bg-black selection:text-white"
      style={{ background: C.canvas, color: C.ink, fontFamily: "Geist, Inter, system-ui, sans-serif" }}
    >
      {/* MESH GRADIENT HERO */}
      <section className="relative overflow-hidden border-b" style={{ borderColor: C.border, background: C.canvas }}>
        {/* Vercel-style triangular/conic mesh */}
        <div className="absolute inset-0 pointer-events-none opacity-40">
          <div style={{
            position: "absolute", top: "-50%", left: "-10%", width: "120%", height: "200%",
            background: "conic-gradient(from 180deg at 50% 50%, #00d2ff 0deg, #3a00ff 180deg, #ff0080 360deg)",
            filter: "blur(120px)", opacity: 0.15, transform: "scale(1.2)"
          }} />
        </div>
        <div className="relative z-10 max-w-[1024px] mx-auto px-6 py-24 md:py-36 flex flex-col items-center text-center">
          <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-mono font-medium mb-8" style={{ background: C.surface, color: C.monospaced, border: `1px solid ${C.border}` }}>
            <span className="w-2 h-2 rounded-full mr-2 animate-pulse" style={{ background: "#0070f3" }} />
            Deployed to Internet
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter text-[#111] mb-6 text-balance">
            <EditableField fieldKey="fullName" value={portfolio.fullName || portfolio.name} isEditMode={isEditMode} />
          </h1>
          {portfolio.headline && (
            <div className="text-xl md:text-2xl mb-10 max-w-2xl text-balance font-medium text-[#666]">
              <EditableField fieldKey="headline" value={portfolio.headline} isEditMode={isEditMode} />
            </div>
          )}

          <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
            {portfolio.location && (
              <span className="flex items-center gap-2 text-sm px-4 py-2 rounded-full" style={{ background: C.surface, border: `1px solid ${C.border}`, color: C.mute }}>
                <MapPin className="w-4 h-4" />{portfolio.location}
              </span>
            )}
            {portfolio.email && (
              <a href={`mailto:${portfolio.email}`} className="flex items-center gap-2 text-sm px-4 py-2 rounded-full hover:border-black transition-colors" style={{ background: C.surface, border: `1px solid ${C.border}`, color: C.mute }}>
                <Mail className="w-4 h-4" />{portfolio.email}
              </a>
            )}
            {primarySocials.map((link) => (
              <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="text-sm px-4 py-2 rounded-full hover:border-black transition-colors" style={{ background: C.surface, border: `1px solid ${C.border}`, color: C.mute }}>
                {link.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <a href={`mailto:${portfolio.email || "#"}`} className="px-6 py-2.5 rounded-full text-sm font-medium transition-transform hover:scale-105" style={{ background: "#000", color: "#fff", boxShadow: "0 4px 14px 0 rgba(0,0,0,0.39)" }}>
              Contact Me
            </a>
            {portfolio.showResume && portfolio.resumeUrl && (
              <a href={portfolio.resumeUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium transition-colors hover:bg-gray-100" style={{ background: C.surface, color: C.ink, border: `1px solid ${C.border}` }}>
                <FileText className="w-4 h-4" />Résumé
              </a>
            )}
          </div>
        </div>
      </section>

      <main className="max-w-[1024px] mx-auto px-6 pb-32 space-y-24 pt-16">

        {/* ABOUT & SKILLS BENTO */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-8 p-8 rounded-2xl flex flex-col justify-center" style={{ background: C.surface, border: `1px solid ${C.border}`, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <h2 className="text-xs font-mono uppercase mb-4" style={{ color: C.mute }}>~ / about</h2>
            <div className="prose prose-gray max-w-none text-[#444] leading-relaxed">
              <EditableField fieldKey="summary" value={portfolio.summary || portfolio.bio || ""} isEditMode={isEditMode} />
            </div>
          </div>
          
          <div className="md:col-span-4 p-8 rounded-2xl flex flex-col" style={{ background: C.surfaceElevated, border: `1px solid ${C.border}` }}>
             <h2 className="text-xs font-mono uppercase mb-4" style={{ color: C.mute }}>~ / stats</h2>
             <div className="space-y-6 flex-1">
                {[{l:"Projects",v:portfolio.projects.length},{l:"Skills",v:portfolio.skills.length},{l:"Roles",v:portfolio.experiences.length}].map(({l,v}) => (
                  <div key={l} className="flex items-center justify-between">
                    <span className="text-sm font-medium" style={{ color: C.mute }}>{l}</span>
                    <span className="text-2xl font-semibold tracking-tight" style={{ color: C.ink }}>{v}</span>
                  </div>
                ))}
             </div>
          </div>

          {/* Skills Grid */}
          {portfolio.skills.length > 0 && (
            <div className="md:col-span-12 p-8 rounded-2xl" style={{ background: C.surface, border: `1px solid ${C.border}`, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
              <h2 className="text-xs font-mono uppercase mb-6" style={{ color: C.mute }}>~ / tech_stack</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                 {Object.entries(skillsByCategory).map(([cat, skills]) => (
                    <div key={cat}>
                      <h3 className="text-sm font-semibold mb-3" style={{ color: C.ink }}>{cat}</h3>
                      <ul className="space-y-2">
                        {skills.map(s => <li key={s.id} className="text-sm" style={{ color: C.mute }}>
                          <EditableField fieldKey={`skills.${s._originalIndex}.name`} value={s.name} isEditMode={isEditMode} />
                        </li>)}
                      </ul>
                    </div>
                 ))}
              </div>
            </div>
          )}
        </section>

        {/* PROJECTS HORIZONTAL SCROLL */}
        {portfolio.projects.length > 0 && (
          <section>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
              <h2 className="text-2xl font-bold tracking-tight" style={{ color: C.ink }}>Deployments</h2>
              <div className="h-px flex-1 mx-4 hidden sm:block" style={{ background: C.border }} />
            </div>
            
            <div className="flex overflow-x-auto pb-8 snap-x gap-6 -mx-6 px-6" style={{ scrollbarWidth: 'none' }}>
              {displayProjects.map((project) => (
                <div key={project.id} className="min-w-[85vw] sm:min-w-[400px] max-w-[450px] flex flex-col p-6 rounded-xl snap-center shrink-0 transition-shadow hover:shadow-lg" style={{ background: C.surface, border: `1px solid ${C.border}`, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold truncate mr-4" style={{ color: C.ink }}>
                      <EditableField fieldKey={`projects.${project._originalIndex}.title`} value={project.title} isEditMode={isEditMode} />
                    </h3>
                    <div className="flex items-center gap-2 shrink-0">
                      {project.githubUrl && <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-md hover:bg-gray-100 transition-colors" style={{ color: C.mute }}><Github className="w-4 h-4" /></a>}
                      {project.liveUrl && <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-md hover:bg-gray-100 transition-colors" style={{ color: C.mute }}><ExternalLink className="w-4 h-4" /></a>}
                    </div>
                  </div>
                  <div className="text-sm leading-relaxed flex-1 mb-5 line-clamp-4" style={{ color: C.mute }}>
                    <EditableField fieldKey={`projects.${project._originalIndex}.description`} value={project.description || project.aiSummary || ""} isEditMode={isEditMode} />
                  </div>
                  {Array.isArray(project.techStack) && project.techStack.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-auto pt-4" style={{ borderTop: `1px dashed ${C.border}` }}>
                      {project.techStack.slice(0, 5).map((tech: unknown, idx: number) => (
                        <span key={idx} className="font-mono text-[11px] px-2 py-0.5 rounded-md" style={{ background: C.surfaceElevated, color: C.monospaced, border: `1px solid ${C.border}` }}>{String(tech)}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* EXPERIENCE & EDUCATION */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {portfolio.showExperience && portfolio.experiences.length > 0 && (
            <section>
              <h2 className="text-xl font-bold tracking-tight mb-8" style={{ color: C.ink }}>Experience</h2>
              <div className="space-y-8">
                {portfolio.experiences.map((exp, idx) => (
                  <div key={exp.id} className="relative pl-6 border-l" style={{ borderColor: C.border }}>
                    <div className="absolute w-2.5 h-2.5 rounded-full -left-[5.5px] top-1.5" style={{ background: C.surface, border: `2px solid ${C.ink}` }} />
                    <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2 mb-2">
                      <h3 className="text-base font-semibold" style={{ color: C.ink }}>
                        <EditableField fieldKey={`experiences.${idx}.role`} value={exp.role} isEditMode={isEditMode} />
                      </h3>
                      <span className="text-xs font-mono shrink-0" style={{ color: C.mute }}>{formatDateRange(exp.startDate, exp.endDate, exp.currentlyWorking)}</span>
                    </div>
                    <div className="text-sm font-medium mb-3" style={{ color: C.mute }}>
                      <EditableField fieldKey={`experiences.${idx}.company`} value={exp.company} isEditMode={isEditMode} />
                    </div>
                    {exp.description && (
                      <div className="text-sm leading-relaxed" style={{ color: C.mute }}>
                        <EditableField fieldKey={`experiences.${idx}.description`} value={exp.description} isEditMode={isEditMode} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          <div className="space-y-12">
            {portfolio.showEducation && portfolio.educations.length > 0 && (
              <section>
                <h2 className="text-xl font-bold tracking-tight mb-8" style={{ color: C.ink }}>Education</h2>
                <div className="space-y-6">
                  {portfolio.educations.map((edu, idx) => (
                    <div key={edu.id} className="p-5 rounded-xl transition-colors hover:bg-gray-50" style={{ border: `1px solid ${C.border}` }}>
                      <div className="flex justify-between items-start mb-2">
                         <h3 className="text-sm font-semibold" style={{ color: C.ink }}>
                           <EditableField fieldKey={`educations.${idx}.institution`} value={edu.institution} isEditMode={isEditMode} />
                         </h3>
                         <span className="text-xs font-mono shrink-0" style={{ color: C.mute }}>{formatDateRange(edu.startDate, edu.endDate)}</span>
                      </div>
                      <div className="text-sm" style={{ color: C.mute }}>
                        <EditableField fieldKey={`educations.${idx}.degree`} value={edu.degree || ""} isEditMode={isEditMode} /> in <EditableField fieldKey={`educations.${idx}.fieldOfStudy`} value={edu.fieldOfStudy || ""} isEditMode={isEditMode} />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Certs & Achievements */}
            {portfolio.showCertifications && portfolio.certifications.length > 0 && (
              <section>
                <h2 className="text-xl font-bold tracking-tight mb-6" style={{ color: C.ink }}>Certifications</h2>
                <div className="space-y-3">
                  {portfolio.certifications.map((cert) => (
                    <div key={cert.id} className="flex items-center justify-between gap-4 p-4 rounded-lg" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
                      <div>
                        <h3 className="text-sm font-semibold" style={{ color: C.ink }}>{cert.title}</h3>
                        <p className="text-xs mt-1" style={{ color: C.mute }}>{cert.issuer}</p>
                      </div>
                      {cert.credentialUrl && <a href={cert.credentialUrl} target="_blank" rel="noopener noreferrer" className="p-2 rounded-md hover:bg-gray-100" style={{ color: C.mute }}><ExternalLink className="w-4 h-4" /></a>}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>

      </main>

      {/* FOOTER */}
      <footer style={{ borderTop: `1px solid ${C.border}`, background: C.surface }}>
        <div className="max-w-[1024px] mx-auto px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm" style={{ color: C.mute }}>© {new Date().getFullYear()} {portfolio.fullName || portfolio.name}</div>
          <div className="flex items-center gap-1 text-sm font-mono" style={{ color: C.mute }}>
            ▲ Powered by <Link href="/" className="ml-1 font-medium hover:text-black transition-colors" style={{ color: C.ink }}>makeurfolio</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
