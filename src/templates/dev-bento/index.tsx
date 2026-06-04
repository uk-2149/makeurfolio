/**
 * Dev Bento Template — Asymmetric bento card grid for developers.
 * Dark glassmorphism cards with coloured accent borders.
 * Best for: Developers
 */
"use client";
import React from "react";
import Link from "next/link";
import { ExternalLink, MapPin, Mail, Code2, FileText } from "lucide-react";
import type { PortfolioThemeProps } from "@/src/themes/shared/types";
import { groupSkillsByCategory, formatDateRange, splitProjects, getPrimarySocials } from "@/src/themes/shared/utils";
import { EditableField } from "@/src/components/editor/editable-field";
import { useLiveSync } from "@/src/hooks/use-live-sync";

export default function DevBentoTemplate({ portfolio: initialPortfolio, theme, isEditMode = false }: PortfolioThemeProps) {
  const portfolio = useLiveSync(initialPortfolio, isEditMode);
  const { featured, regular } = splitProjects(portfolio.projects);
  const skillsByCategory = groupSkillsByCategory(portfolio.skills);
  const socials = getPrimarySocials(portfolio.socialLinks, 5);
  const topProjects = (featured.length ? featured : regular).slice(0, 4);

  const C = theme.colors;
  const F = theme.typography.fontFamily;
  const ACCENT = C.primary;

  return (
    <div className="min-h-screen" style={{ background: C.canvas, color: C.ink, fontFamily: F }}>
      <div className="max-w-6xl mx-auto px-5 py-16 space-y-6">

        {/* ── BENTO TOP ROW ── */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Hero card — spans 8 cols */}
          <div className="md:col-span-8 p-8 rounded-2xl border relative overflow-hidden" style={{ background: C.surface, borderColor: C.border }}>
            <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-10" style={{ background: ACCENT, filter: "blur(60px)" }} />
            <div className="relative z-10">
              <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium mb-5" style={{ background: `${ACCENT}22`, color: ACCENT, border: `1px solid ${ACCENT}44` }}>
                Developer Portfolio
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-3 leading-tight" style={{ letterSpacing: "-1.5px" }}>
                <EditableField fieldKey="fullName" value={portfolio.fullName || portfolio.name} isEditMode={isEditMode} />
              </h1>
              {portfolio.headline && (
                <div className="text-lg mb-6" style={{ color: C.mute }}>
                   <EditableField fieldKey="headline" value={portfolio.headline} isEditMode={isEditMode} />
                </div>
              )}
              <div className="flex flex-wrap gap-3">
                {portfolio.location && <span className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border" style={{ color: C.mute, borderColor: C.border }}><MapPin className="w-3.5 h-3.5" />{portfolio.location}</span>}
                {portfolio.email && <a href={`mailto:${portfolio.email}`} className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border" style={{ color: C.mute, borderColor: C.border }}><Mail className="w-3.5 h-3.5" />{portfolio.email}</a>}
                {portfolio.showResume && portfolio.resumeUrl && <a href={portfolio.resumeUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm px-4 py-1.5 rounded-lg font-medium" style={{ background: ACCENT, color: "#fff" }}><FileText className="w-3.5 h-3.5" />Résumé</a>}
              </div>
            </div>
          </div>

          {/* Stats card — 4 cols */}
          <div className="md:col-span-4 p-6 rounded-2xl border flex flex-col justify-between" style={{ background: C.surface, borderColor: C.border }}>
            <h2 className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: C.mute }}>At a glance</h2>
            <div className="space-y-4">
              {[{l:"Projects",v:portfolio.projects.length},{l:"Skills",v:portfolio.skills.length},{l:"Roles",v:portfolio.experiences.length}].map(({l,v}) => (
                <div key={l} className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: C.mute }}>{l}</span>
                  <span className="text-2xl font-bold" style={{ color: ACCENT }}>{v}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 pt-4">
              {socials.map(s => <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer" className="text-xs px-2.5 py-1 rounded border" style={{ color: C.mute, borderColor: C.border }}>{s.label}</a>)}
            </div>
          </div>
        </div>

        {/* ── PROJECTS BENTO ── */}
        {topProjects.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-widest mb-4" style={{ color: C.mute }}>Selected Work</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {topProjects.map((p, i) => (
                <div key={p.id} className="p-6 rounded-2xl border flex flex-col" style={{ background: C.surface, borderColor: i === 0 ? ACCENT : C.border, boxShadow: i === 0 ? `0 0 0 1px ${ACCENT}` : undefined }}>
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="font-bold text-lg leading-tight">
                      <EditableField fieldKey={`projects.${p._originalIndex}.title`} value={p.title} isEditMode={isEditMode} />
                    </h3>
                    <div className="flex gap-2 shrink-0 ml-3">
                      {p.githubUrl && <a href={p.githubUrl} target="_blank" rel="noopener noreferrer" style={{ color: C.mute }}><Code2 className="w-4 h-4" /></a>}
                      {p.liveUrl && <a href={p.liveUrl} target="_blank" rel="noopener noreferrer" style={{ color: C.mute }}><ExternalLink className="w-4 h-4" /></a>}
                    </div>
                  </div>
                  <div className="text-sm leading-relaxed flex-1 mb-4" style={{ color: C.mute }}>
                    <EditableField fieldKey={`projects.${p._originalIndex}.description`} value={p.description || p.aiSummary || ""} isEditMode={isEditMode} />
                  </div>
                  {Array.isArray(p.techStack) && p.techStack.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-auto">
                      {p.techStack.map((t: unknown, ti: number) => <span key={ti} className="text-xs px-2.5 py-1 rounded-lg" style={{ background: `${ACCENT}15`, color: ACCENT }}>{String(t)}</span>)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── SKILLS + EXPERIENCE ROW ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Skills — 5 cols */}
          {portfolio.skills.length > 0 && (
            <div className="lg:col-span-5 p-6 rounded-2xl border" style={{ background: C.surface, borderColor: C.border }}>
              <h2 className="text-xs font-semibold uppercase tracking-widest mb-5" style={{ color: C.mute }}>Skills</h2>
              <div className="space-y-5">
                {Object.entries(skillsByCategory).map(([cat, skills]) => (
                  <div key={cat}>
                    <div className="text-xs mb-2 font-medium" style={{ color: C.mute }}>{cat}</div>
                    <div className="flex flex-wrap gap-1.5">
                      {skills.map(s => (
                        <span key={s.id} className="text-xs px-2.5 py-1 rounded-lg border inline-block" style={{ color: C.ink, borderColor: C.border }}>
                          <EditableField fieldKey={`skills.${s._originalIndex}.name`} value={s.name} isEditMode={isEditMode} />
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Experience — 7 cols */}
          {portfolio.showExperience && portfolio.experiences.length > 0 && (
            <div className="lg:col-span-7 p-6 rounded-2xl border" style={{ background: C.surface, borderColor: C.border }}>
              <h2 className="text-xs font-semibold uppercase tracking-widest mb-5" style={{ color: C.mute }}>Experience</h2>
              <div className="space-y-6">
                {portfolio.experiences.map((exp, idx) => (
                  <div key={exp.id} className="border-l-2 pl-4" style={{ borderColor: ACCENT }}>
                    <div className="flex items-baseline justify-between gap-3 mb-1">
                      <h3 className="font-semibold text-sm">
                        <EditableField fieldKey={`experiences.${idx}.role`} value={exp.role} isEditMode={isEditMode} />
                      </h3>
                      <span className="text-xs shrink-0 font-mono" style={{ color: C.mute }}>{formatDateRange(exp.startDate, exp.endDate, exp.currentlyWorking)}</span>
                    </div>
                    <div className="text-sm font-medium mb-1" style={{ color: ACCENT }}>
                      <EditableField fieldKey={`experiences.${idx}.company`} value={exp.company} isEditMode={isEditMode} />
                    </div>
                    {exp.description && (
                      <div className="text-xs leading-relaxed whitespace-pre-wrap" style={{ color: C.mute }}>
                        <EditableField fieldKey={`experiences.${idx}.description`} value={exp.description} isEditMode={isEditMode} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── EDUCATION + CERTS BOTTOM ── */}
        {(portfolio.showEducation || portfolio.showCertifications) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {portfolio.showEducation && portfolio.educations.length > 0 && (
              <div className="p-6 rounded-2xl border" style={{ background: C.surface, borderColor: C.border }}>
                <h2 className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: C.mute }}>Education</h2>
                {portfolio.educations.map((edu, idx) => (
                  <div key={edu.id} className="mb-3">
                    <div className="font-semibold text-sm">
                      <EditableField fieldKey={`educations.${idx}.institution`} value={edu.institution} isEditMode={isEditMode} />
                    </div>
                    <div className="text-xs" style={{ color: C.mute }}>
                      <EditableField fieldKey={`educations.${idx}.degree`} value={edu.degree || ""} isEditMode={isEditMode} /> · <EditableField fieldKey={`educations.${idx}.fieldOfStudy`} value={edu.fieldOfStudy || ""} isEditMode={isEditMode} />
                    </div>
                  </div>
                ))}
              </div>
            )}
            {portfolio.showCertifications && portfolio.certifications.length > 0 && (
              <div className="p-6 rounded-2xl border" style={{ background: C.surface, borderColor: C.border }}>
                <h2 className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: C.mute }}>Certifications</h2>
                <div className="space-y-3">
                  {portfolio.certifications.map(c => (
                    <div key={c.id} className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium">{c.title}</div>
                        <div className="text-xs" style={{ color: C.mute }}>{c.issuer}</div>
                      </div>
                      {c.credentialUrl && <a href={c.credentialUrl} target="_blank" rel="noopener noreferrer" style={{ color: ACCENT }}><ExternalLink className="w-3.5 h-3.5" /></a>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <footer className="text-center py-6 text-xs" style={{ color: C.mute }}>
          Powered by <Link href="/" className="hover:underline" style={{ color: ACCENT }}>makeurfolio</Link>
        </footer>
      </div>
    </div>
  );
}
