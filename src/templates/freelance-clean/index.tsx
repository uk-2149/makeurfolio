/**
 * Freelance Clean Template — Single-column, conversion-focused.
 * Every section drives toward a hiring action. Sticky CTA at top.
 * Clean white + amber accent. Best for: Freelancers.
 */
"use client";
import React from "react";
import Link from "next/link";
import { ExternalLink, MapPin, Mail, FileText, Code2, CheckCircle } from "lucide-react";
import type { PortfolioThemeProps } from "@/src/themes/shared/types";
import { groupSkillsByCategory, formatDateRange, splitProjects, getPrimarySocials } from "@/src/themes/shared/utils";
import { EditableField } from "@/src/components/editor/editable-field";
import { useLiveSync } from "@/src/hooks/use-live-sync";

export default function FreelanceCleanTemplate({ portfolio: initialPortfolio, theme, isEditMode = false }: PortfolioThemeProps) {
  const portfolio = useLiveSync(initialPortfolio, isEditMode);
  const { featured, regular } = splitProjects(portfolio.projects);
  const skillsByCategory = groupSkillsByCategory(portfolio.skills);
  const socials = getPrimarySocials(portfolio.socialLinks, 4);
  const displayProjects = (featured.length ? featured : regular).slice(0, 6);

  const C = theme.colors;
  const F = theme.typography.fontFamily;
  const ACCENT = C.primary;

  return (
    <div className="min-h-screen" style={{ background: C.canvas, color: C.ink, fontFamily: F }}>

      {/* ── STICKY CTA HEADER ── */}
      <header className="sticky top-0 z-30 border-b backdrop-blur-md" style={{ background: `${C.canvas}E6`, borderColor: C.border }}>
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <span className="font-bold text-base">
               <EditableField fieldKey="fullName" value={portfolio.fullName || portfolio.name} isEditMode={isEditMode} />
            </span>
            {portfolio.headline && <span className="text-sm ml-2 hidden sm:inline" style={{ color: C.mute }}>— {portfolio.headline}</span>}
          </div>
          <div className="flex items-center gap-3">
            {socials.slice(0, 2).map(s => <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer" className="text-sm hidden sm:block" style={{ color: C.mute }}>{s.label}</a>)}
            <a href={`mailto:${portfolio.email || "#"}`} className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg" style={{ background: ACCENT, color: C.canvas }}>
              <Mail className="w-3.5 h-3.5" />Hire Me
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-16 space-y-20">

        {/* HERO */}
        <section className="text-center space-y-5 py-12">
          {portfolio.avatarUrl && (
            <img src={portfolio.avatarUrl} alt={portfolio.fullName || ""} className="w-24 h-24 rounded-full mx-auto object-cover ring-4 ring-offset-4" style={{ "--tw-ring-color": ACCENT, backgroundColor: C.surface } as any} />
          )}
          <h1 className="text-5xl md:text-6xl font-bold leading-tight" style={{ letterSpacing: "-2px" }}>
            <EditableField fieldKey="fullName" value={portfolio.fullName || portfolio.name} isEditMode={isEditMode} />
          </h1>
          {portfolio.headline && (
            <div className="text-xl md:text-2xl" style={{ color: C.mute, letterSpacing: "-0.3px" }}>
              <EditableField fieldKey="headline" value={portfolio.headline} isEditMode={isEditMode} />
            </div>
          )}
          {(portfolio.bio || portfolio.summary) && (
            <div className="text-base leading-relaxed max-w-xl mx-auto" style={{ color: C.mute }}>
               <EditableField fieldKey="summary" value={portfolio.summary || portfolio.bio || "No bio provided."} isEditMode={isEditMode} />
            </div>
          )}
          <div className="flex flex-wrap justify-center gap-3 pt-4">
            {portfolio.location && <span className="flex items-center gap-1.5 text-sm" style={{ color: C.mute }}><MapPin className="w-3.5 h-3.5" />{portfolio.location}</span>}
            {portfolio.email && <a href={`mailto:${portfolio.email}`} className="flex items-center gap-2 text-sm font-medium px-5 py-2.5 rounded-xl border-2" style={{ color: C.ink, borderColor: ACCENT }}>
              <Mail className="w-4 h-4" />Let&apos;s Talk
            </a>}
            {portfolio.showResume && portfolio.resumeUrl && (
              <a href={portfolio.resumeUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-xl" style={{ background: ACCENT, color: C.canvas }}>
                <FileText className="w-4 h-4" />Download CV
              </a>
            )}
          </div>
        </section>

        {/* WHAT I DO */}
        {portfolio.skills.length > 0 && (
          <section className="p-8 rounded-2xl" style={{ background: C.surfaceElevated || C.surface }}>
            <h2 className="text-2xl font-bold mb-6" style={{ letterSpacing: "-0.5px" }}>What I Do</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.entries(skillsByCategory).map(([cat, skills]) => (
                <div key={cat} className="p-5 rounded-xl border" style={{ background: C.canvas, borderColor: C.border }}>
                  <h3 className="font-semibold text-sm mb-3" style={{ color: ACCENT }}>{cat}</h3>
                  <div className="space-y-1.5">
                    {skills.map(s => (
                      <div key={s.id} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-3.5 h-3.5 shrink-0" style={{ color: ACCENT }} />
                        <EditableField fieldKey={`skills.${s._originalIndex}.name`} value={s.name} isEditMode={isEditMode} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* WORK */}
        {displayProjects.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-6" style={{ letterSpacing: "-0.5px" }}>Recent Work</h2>
            <div className="space-y-5">
              {displayProjects.map(p => (
                <div key={p.id} className="p-6 rounded-xl border flex flex-col sm:flex-row sm:items-start gap-5" style={{ background: C.surface, borderColor: C.border }}>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1">
                      <EditableField fieldKey={`projects.${p._originalIndex}.title`} value={p.title} isEditMode={isEditMode} />
                    </h3>
                    <div className="text-sm leading-relaxed mb-3" style={{ color: C.mute }}>
                      <EditableField fieldKey={`projects.${p._originalIndex}.description`} value={p.description || p.aiSummary || ""} isEditMode={isEditMode} />
                    </div>
                    {Array.isArray(p.techStack) && p.techStack.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {p.techStack.map((t: unknown, ti: number) => <span key={ti} className="text-xs px-2.5 py-1 rounded-md font-medium" style={{ background: `${ACCENT}1A`, color: ACCENT }}>{String(t)}</span>)}
                      </div>
                    )}
                  </div>
                  <div className="flex sm:flex-col gap-2 shrink-0">
                    {p.liveUrl && <a href={p.liveUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-lg" style={{ background: ACCENT, color: C.canvas }}><ExternalLink className="w-3.5 h-3.5" />View</a>}
                    {p.githubUrl && <a href={p.githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-lg border" style={{ borderColor: C.border, color: C.mute }}><Code2 className="w-3.5 h-3.5" />Code</a>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* EXPERIENCE */}
        {portfolio.showExperience && portfolio.experiences.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-6" style={{ letterSpacing: "-0.5px" }}>Experience</h2>
            <div className="space-y-0">
              {portfolio.experiences.map((exp, idx) => (
                <div key={exp.id} className={`py-6 ${idx < portfolio.experiences.length - 1 ? "border-b" : ""}`} style={{ borderColor: C.border }}>
                  <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 mb-2">
                    <h3 className="font-bold text-lg">
                      <EditableField fieldKey={`experiences.${idx}.role`} value={exp.role} isEditMode={isEditMode} />
                    </h3>
                    <span className="text-sm shrink-0" style={{ color: C.mute }}>{formatDateRange(exp.startDate, exp.endDate, exp.currentlyWorking)}</span>
                  </div>
                  <div className="font-semibold text-sm mb-2" style={{ color: ACCENT }}>
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

        {/* BIG CTA */}
        <section className="text-center p-12 rounded-2xl" style={{ background: ACCENT }}>
          <h2 className="text-3xl font-bold text-white mb-3" style={{ color: C.canvas }}>Ready to work together?</h2>
          <p className="mb-6" style={{ color: `${C.canvas}CC` }}>Let&apos;s turn your ideas into reality.</p>
          <a href={`mailto:${portfolio.email || "#"}`} className="inline-flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-base" style={{ background: C.canvas, color: ACCENT }}>
            <Mail className="w-4 h-4" />Get in Touch
          </a>
        </section>
      </main>

      <footer className="border-t py-6 text-center text-sm" style={{ borderColor: C.border, color: C.mute }}>
        © {new Date().getFullYear()} {portfolio.fullName || portfolio.name} · <Link href="/" className="hover:underline" style={{ color: ACCENT }}>makeurfolio</Link>
      </footer>
    </div>
  );
}
