/**
 * Notion Theme — Inspired by Notion's design language.
 * Deep navy hero band (#0a1530), purple CTA (#5645d4), centered hero layout,
 * pastel card tints (peach/rose/mint/lavender/sky), 8px-radius rectangular
 * buttons (NOT pills), 12px-radius cards.
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
  primary: "#5645d4",
  brandNavy: "#0a1530",
  ink: "#1a1a1a",
  charcoal: "#37352f",
  slate: "#5d5b54",
  steel: "#787671",
  canvas: "#ffffff",
  surface: "#f6f5f4",
  hairline: "#e5e3df",
  hairlineStrong: "#c8c4be",
  onDark: "#ffffff",
  tintPeach: "#ffe8d4",
  tintRose: "#fde0ec",
  tintMint: "#d9f3e1",
  tintLavender: "#e6e0f5",
  tintSky: "#dcecfa",
  tintYellow: "#fef7d6",
};

const CARD_TINTS = [C.tintPeach, C.tintMint, C.tintSky, C.tintLavender, C.tintRose, C.tintYellow];

export default function NotionTheme({ portfolio: initialPortfolio, isEditMode = false }: PortfolioThemeProps) {
  const portfolio = useLiveSync(initialPortfolio, isEditMode);
  const { featured, regular } = splitProjects(portfolio.projects);
  const skillsByCategory = groupSkillsByCategory(portfolio.skills);
  const primarySocials = getPrimarySocials(portfolio.socialLinks, 4);
  const displayProjects = featured.length > 0 ? featured : regular.slice(0, 4);

  return (
    <div className="min-h-screen font-sans selection:bg-[#5645d4] selection:text-white" style={{ background: C.canvas, color: C.ink, fontFamily: "Inter, -apple-system, system-ui, 'Segoe UI', sans-serif" }}>

      {/* NAVY HERO BAND */}
      <section className="relative overflow-hidden" style={{ background: C.brandNavy }}>
        {/* Subtle dot decoration */}
        <div className="absolute inset-0 pointer-events-none opacity-20" style={{
          backgroundImage: "radial-gradient(circle, rgba(86,69,212,0.6) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }} />
        <div className="relative z-10 max-w-[1280px] mx-auto px-6 py-32 md:py-44 text-center">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-medium mb-8" style={{ background: "rgba(86,69,212,0.3)", color: "#c4bbf8", border: "1px solid rgba(86,69,212,0.5)" }}>
            Developer Portfolio
          </div>
          <h1 className="text-5xl md:text-7xl font-semibold text-white mb-6 mx-auto max-w-3xl leading-[1.05]" style={{ letterSpacing: "-2px" }}>
            <EditableField fieldKey="fullName" value={portfolio.fullName || portfolio.name} isEditMode={isEditMode} />
          </h1>
          {portfolio.headline && (
            <div className="text-xl md:text-2xl text-white/70 mb-10 mx-auto max-w-2xl leading-snug font-normal" style={{ letterSpacing: "-0.5px" }}>
              <EditableField fieldKey="headline" value={portfolio.headline} isEditMode={isEditMode} />
            </div>
          )}

          <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
            {portfolio.location && (
              <span className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg text-white/70" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}>
                <MapPin className="w-3.5 h-3.5" />{portfolio.location}
              </span>
            )}
            {portfolio.email && (
              <a href={`mailto:${portfolio.email}`} className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg text-white/70" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}>
                <Mail className="w-3.5 h-3.5" />{portfolio.email}
              </a>
            )}
            {primarySocials.map((link) => (
              <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="text-sm px-4 py-2 rounded-lg text-white/70" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}>
                {link.label}
              </a>
            ))}
          </div>

          <div className="flex items-center justify-center gap-3">
            <a href={`mailto:${portfolio.email || "#"}`} className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-white transition-colors" style={{ background: C.primary }}>
              Get in Touch
            </a>
            {portfolio.showResume && portfolio.resumeUrl && (
              <a href={portfolio.resumeUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors" style={{ background: "rgba(255,255,255,0.1)", color: C.onDark, border: "1px solid rgba(255,255,255,0.2)" }}>
                <FileText className="w-4 h-4" />Résumé
              </a>
            )}
          </div>
        </div>
      </section>

      <main className="max-w-[1280px] mx-auto px-6 pb-32 space-y-24 pt-20">

        {/* ABOUT */}
        {(portfolio.bio || portfolio.summary) && (
          <section className="grid grid-cols-1 md:grid-cols-12 gap-10">
            <div className="md:col-span-4">
              <h2 className="text-3xl font-semibold mb-8" style={{ color: C.ink, letterSpacing: "-0.5px" }}>About</h2>
              <div className="space-y-4">
                {[
                  { label: "Experience", value: portfolio.experiences.length > 0 ? `${portfolio.experiences.length}+ roles` : "Entry level" },
                  { label: "Projects", value: `${portfolio.projects.length} shipped` },
                  { label: "Skills", value: `${portfolio.skills.length} tools` },
                ].map((stat, i) => (
                  <div key={stat.label} className="p-4 rounded-xl" style={{ background: CARD_TINTS[i % CARD_TINTS.length] }}>
                    <div className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: C.slate }}>{stat.label}</div>
                    <div className="text-xl font-semibold" style={{ color: C.charcoal }}>{stat.value}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="md:col-span-8 text-[17px] leading-[1.7] space-y-4" style={{ color: C.charcoal }}>
              <EditableField fieldKey="summary" value={portfolio.summary || portfolio.bio || ""} isEditMode={isEditMode} />
            </div>
          </section>
        )}

        {/* PROJECTS — pastel card grid */}
        {portfolio.projects.length > 0 && (
          <section className="space-y-10">
            <h2 className="text-3xl font-semibold" style={{ color: C.ink, letterSpacing: "-0.5px" }}>Selected Work</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {displayProjects.map((project, i) => (
                <div key={project.id} className="flex flex-col p-8 rounded-xl" style={{ background: CARD_TINTS[i % CARD_TINTS.length], border: `1px solid ${C.hairline}` }}>
                  <div className="flex items-start justify-between mb-5">
                    <h3 className="text-2xl font-semibold" style={{ color: C.charcoal }}>
                      <EditableField fieldKey={`projects.${project._originalIndex}.title`} value={project.title} isEditMode={isEditMode} />
                    </h3>
                    <div className="flex items-center gap-2 shrink-0 ml-4">
                      {project.githubUrl && (
                        <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg transition-colors" style={{ color: C.slate, background: "rgba(255,255,255,0.5)", border: `1px solid ${C.hairline}` }}>
                          <Github className="w-4 h-4" />
                        </a>
                      )}
                      {project.liveUrl && (
                        <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors" style={{ background: C.primary, color: "#fff" }}>
                          View <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="text-[15px] leading-relaxed flex-1 mb-6" style={{ color: C.slate }}>
                    <EditableField fieldKey={`projects.${project._originalIndex}.description`} value={project.description || project.aiSummary || ""} isEditMode={isEditMode} />
                  </div>
                  {Array.isArray(project.techStack) && project.techStack.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-auto">
                      {project.techStack.map((tech: unknown, idx: number) => (
                        <span key={idx} className="px-3 py-1 text-xs font-medium rounded-lg" style={{ background: "rgba(255,255,255,0.6)", color: C.charcoal, border: `1px solid ${C.hairline}` }}>{String(tech)}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
            {featured.length > 0 && regular.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {regular.map((project, i) => (
                  <div key={project.id} className="p-6 rounded-xl flex flex-col" style={{ background: CARD_TINTS[(i + 2) % CARD_TINTS.length], border: `1px solid ${C.hairline}` }}>
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-[15px] font-semibold" style={{ color: C.charcoal }}>
                        <EditableField fieldKey={`projects.${project._originalIndex}.title`} value={project.title} isEditMode={isEditMode} />
                      </h3>
                      <div className="flex gap-1.5 shrink-0 ml-2">
                        {project.githubUrl && <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" style={{ color: C.slate }}><Github className="w-4 h-4" /></a>}
                        {project.liveUrl && <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" style={{ color: C.slate }}><ExternalLink className="w-4 h-4" /></a>}
                      </div>
                    </div>
                    <div className="text-sm leading-relaxed flex-1" style={{ color: C.steel }}>
                      <EditableField fieldKey={`projects.${project._originalIndex}.description`} value={project.description || ""} isEditMode={isEditMode} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* SKILLS */}
        {portfolio.skills.length > 0 && (
          <section className="space-y-10 p-10 rounded-2xl" style={{ background: C.surface }}>
            <h2 className="text-3xl font-semibold" style={{ color: C.ink, letterSpacing: "-0.5px" }}>Skills & Tools</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(skillsByCategory).map(([category, skills], i) => (
                <div key={category} className="p-6 rounded-xl" style={{ background: CARD_TINTS[i % CARD_TINTS.length], border: `1px solid ${C.hairline}` }}>
                  <h3 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: C.slate }}>{category}</h3>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill) => (
                      <span key={skill.id} className="px-3 py-1.5 text-xs font-medium rounded-lg inline-block" style={{ background: "rgba(255,255,255,0.65)", color: C.charcoal, border: `1px solid ${C.hairline}` }}>
                        <EditableField fieldKey={`skills.${skill._originalIndex}.name`} value={skill.name} isEditMode={isEditMode} />
                      </span>
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
            <h2 className="text-3xl font-semibold" style={{ color: C.ink, letterSpacing: "-0.5px" }}>Experience</h2>
            <div className="space-y-0">
              {portfolio.experiences.map((exp, idx) => (
                <div key={exp.id} className={`py-8 ${idx < portfolio.experiences.length - 1 ? `border-b` : ""}`} style={{ borderColor: C.hairline }}>
                  <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2 mb-3">
                    <div>
                      <h3 className="text-xl font-semibold" style={{ color: C.ink, letterSpacing: "-0.3px" }}>
                        <EditableField fieldKey={`experiences.${idx}.role`} value={exp.role} isEditMode={isEditMode} />
                      </h3>
                      <div className="text-[15px] mt-0.5" style={{ color: C.slate }}>
                        <EditableField fieldKey={`experiences.${idx}.company`} value={exp.company} isEditMode={isEditMode} />
                      </div>
                    </div>
                    <span className="text-sm shrink-0 font-mono" style={{ color: C.steel }}>{formatDateRange(exp.startDate, exp.endDate, exp.currentlyWorking)}</span>
                  </div>
                  <div className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: C.charcoal }}>
                    <EditableField fieldKey={`experiences.${idx}.description`} value={exp.description || ""} isEditMode={isEditMode} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* EDUCATION + CERTS + ACHIEVEMENTS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          {portfolio.showEducation && portfolio.educations.length > 0 && (
            <section className="space-y-8">
              <h2 className="text-2xl font-semibold" style={{ color: C.ink, letterSpacing: "-0.5px" }}>Education</h2>
              <div className="space-y-4">
                {portfolio.educations.map((edu, i) => (
                  <div key={edu.id} className="p-5 rounded-xl" style={{ background: CARD_TINTS[(i + 4) % CARD_TINTS.length], border: `1px solid ${C.hairline}` }}>
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h3 className="font-semibold text-[15px]" style={{ color: C.charcoal }}>
                        <EditableField fieldKey={`educations.${i}.institution`} value={edu.institution} isEditMode={isEditMode} />
                      </h3>
                      {(edu.startDate || edu.endDate) && <span className="text-xs font-mono shrink-0" style={{ color: C.steel }}>{formatDateRange(edu.startDate, edu.endDate)}</span>}
                    </div>
                    <div className="text-sm" style={{ color: C.slate }}>
                      <EditableField fieldKey={`educations.${i}.degree`} value={edu.degree || ""} isEditMode={isEditMode} /> in <EditableField fieldKey={`educations.${i}.fieldOfStudy`} value={edu.fieldOfStudy || ""} isEditMode={isEditMode} />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
          <div className="space-y-12">
            {portfolio.showCertifications && portfolio.certifications.length > 0 && (
              <section className="space-y-6">
                <h2 className="text-2xl font-semibold" style={{ color: C.ink, letterSpacing: "-0.5px" }}>Certifications</h2>
                <div className="space-y-3">
                  {portfolio.certifications.map((cert) => (
                    <div key={cert.id} className="flex items-center justify-between gap-4 p-4 rounded-xl group" style={{ background: C.surface, border: `1px solid ${C.hairline}` }}>
                      <div>
                        <h3 className="text-[15px] font-semibold" style={{ color: C.ink }}>{cert.title}</h3>
                        <p className="text-sm mt-0.5" style={{ color: C.slate }}>{cert.issuer}</p>
                      </div>
                      {cert.credentialUrl && (
                        <a href={cert.credentialUrl} target="_blank" rel="noopener noreferrer" className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-lg" style={{ color: C.primary, background: C.canvas, border: `1px solid ${C.hairline}` }}>
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
            {portfolio.showAchievements && portfolio.achievements.length > 0 && (
              <section className="space-y-6">
                <h2 className="text-2xl font-semibold" style={{ color: C.ink, letterSpacing: "-0.5px" }}>Achievements</h2>
                <div className="space-y-3">
                  {portfolio.achievements.map((ach, i) => (
                    <div key={ach.id} className="p-4 rounded-xl" style={{ background: CARD_TINTS[(i + 1) % CARD_TINTS.length], border: `1px solid ${C.hairline}` }}>
                      <h3 className="text-[15px] font-semibold" style={{ color: C.charcoal }}>{ach.title}</h3>
                      {ach.description && <p className="text-sm mt-1 leading-relaxed" style={{ color: C.slate }}>{ach.description}</p>}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer style={{ borderTop: `1px solid ${C.hairline}`, background: C.canvas }}>
        <div className="max-w-[1280px] mx-auto px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm" style={{ color: C.steel }}>© {new Date().getFullYear()} {portfolio.fullName || portfolio.name}. All rights reserved.</div>
          <div className="flex items-center gap-6 text-sm" style={{ color: C.steel }}>
            {primarySocials.map((link) => (
              <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity">{link.label}</a>
            ))}
            <span>Powered by <Link href="/" className="font-semibold hover:underline underline-offset-4" style={{ color: C.primary }}>makeurfolio</Link></span>
          </div>
        </div>
      </footer>
    </div>
  );
}
