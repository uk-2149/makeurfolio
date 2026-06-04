/**
 * Designer Canvas Template — Full-bleed hero, floating name overlay,
 * masonry project grid. Minimal chrome, maximum visual impact.
 * Best for: Designers & Creative Professionals
 */
"use client";
import React from "react";
import Link from "next/link";
import { ExternalLink, MapPin, Mail, FileText } from "lucide-react";
import type { PortfolioThemeProps } from "@/src/themes/shared/types";
import { groupSkillsByCategory, formatDateRange, getPrimarySocials } from "@/src/themes/shared/utils";
import { EditableField } from "@/src/components/editor/editable-field";
import { useLiveSync } from "@/src/hooks/use-live-sync";

export default function DesignerCanvasTemplate({ portfolio: initialPortfolio, theme, isEditMode = false }: PortfolioThemeProps) {
  const portfolio = useLiveSync(initialPortfolio, isEditMode);
  const skillsByCategory = groupSkillsByCategory(portfolio.skills);
  const socials = getPrimarySocials(portfolio.socialLinks, 5);

  const C = theme.colors;
  const F = theme.typography.fontFamily;
  const ACCENT = C.primary;

  // For the masonry project grid, we use pastel tints that loosely map to the accent
  const TINTS = ["#ffe8d4","#d9f3e1","#dcecfa","#fde0ec","#e6e0f5","#fef7d6"];

  return (
    <div className="min-h-screen" style={{ background: C.canvas, color: C.ink, fontFamily: F }}>

      {/* ── FULL-BLEED HERO ── */}
      <section className="relative min-h-[85vh] flex flex-col justify-end overflow-hidden" style={{ background: C.ink }}>
        {/* Gradient mesh */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: `radial-gradient(ellipse 60% 60% at 20% 30%, ${ACCENT}33 0%, transparent 60%), ` +
                      `radial-gradient(ellipse 50% 50% at 80% 20%, #a855f733 0%, transparent 55%), ` +
                      `radial-gradient(ellipse 70% 60% at 50% 80%, #06b6d433 0%, transparent 60%)`,
        }} />
        {portfolio.avatarUrl && (
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `url(${portfolio.avatarUrl})`, backgroundSize: "cover", backgroundPosition: "center top" }} />
        )}
        <div className="relative z-10 px-8 md:px-16 pb-16">
          <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium mb-6 border" style={{ color: C.canvas, borderColor: `${C.canvas}33`, background: `${C.canvas}1A` }}>
            Creative Portfolio
          </div>
          <h1 className="text-6xl md:text-8xl font-bold text-white leading-none mb-4" style={{ letterSpacing: "-3px", color: C.canvas }}>
             <EditableField fieldKey="fullName" value={portfolio.fullName || portfolio.name} isEditMode={isEditMode} />
          </h1>
          {portfolio.headline && (
            <div className="text-xl md:text-2xl mb-8 max-w-2xl" style={{ color: `${C.canvas}A6`, letterSpacing: "-0.3px" }}>
              <EditableField fieldKey="headline" value={portfolio.headline} isEditMode={isEditMode} />
            </div>
          )}
          <div className="flex flex-wrap gap-3">
            {portfolio.location && <span className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-full border" style={{ color: `${C.canvas}B3`, borderColor: `${C.canvas}33` }}><MapPin className="w-3.5 h-3.5" />{portfolio.location}</span>}
            {portfolio.email && <a href={`mailto:${portfolio.email}`} className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-full border" style={{ color: `${C.canvas}B3`, borderColor: `${C.canvas}33` }}><Mail className="w-3.5 h-3.5" />{portfolio.email}</a>}
            {socials.map(s => <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer" className="text-sm px-3 py-1.5 rounded-full border" style={{ color: `${C.canvas}B3`, borderColor: `${C.canvas}33` }}>{s.label}</a>)}
            {portfolio.showResume && portfolio.resumeUrl && (
              <a href={portfolio.resumeUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm font-semibold px-5 py-1.5 rounded-full" style={{ background: ACCENT, color: C.canvas }}>
                <FileText className="w-3.5 h-3.5" />Résumé
              </a>
            )}
          </div>
        </div>
      </section>

      <main className="max-w-6xl mx-auto px-6 md:px-12 py-20 space-y-24">

        {/* ABOUT */}
        {(portfolio.bio || portfolio.summary) && (
          <section className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block text-xs font-semibold uppercase tracking-widest mb-5 pb-1 border-b-2" style={{ color: ACCENT, borderColor: ACCENT }}>About</div>
              <div className="text-2xl md:text-3xl font-medium leading-snug" style={{ letterSpacing: "-0.5px" }}>
                 <EditableField fieldKey="summary" value={portfolio.summary || portfolio.bio || "No bio provided."} isEditMode={isEditMode} />
              </div>
            </div>
            <div className="space-y-6">
              {[{l:"Projects",v:portfolio.projects.length},{l:"Skills",v:portfolio.skills.length},{l:"Roles",v:portfolio.experiences.length}].map(({l,v}) => (
                <div key={l} className="flex items-center gap-6 p-5 rounded-2xl border" style={{ borderColor: C.border }}>
                  <span className="text-5xl font-bold" style={{ color: ACCENT }}>{v}</span>
                  <span className="text-xl font-medium" style={{ color: C.mute }}>{l}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* PROJECTS — magazine grid */}
        {portfolio.projects.length > 0 && (
          <section>
            <div className="inline-block text-xs font-semibold uppercase tracking-widest mb-8 pb-1 border-b-2" style={{ color: ACCENT, borderColor: ACCENT }}>Work</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {portfolio.projects.map((p, i) => (
                <div key={p.id} className={`rounded-2xl p-7 flex flex-col ${i === 0 ? "md:col-span-2 md:row-span-2" : ""}`} style={{ background: TINTS[i % TINTS.length], minHeight: i === 0 ? 360 : 220 }}>
                  <div className="flex items-start justify-between mb-4">
                    <h3 className={`font-bold leading-tight ${i === 0 ? "text-2xl" : "text-lg"}`} style={{ color: "#1a1a1a" }}>
                      <EditableField fieldKey={`projects.${p._originalIndex}.title`} value={p.title} isEditMode={isEditMode} />
                    </h3>
                    <div className="flex gap-2 shrink-0 ml-3">
                      {p.githubUrl && <a href={p.githubUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-full" style={{ background: "rgba(0,0,0,0.1)" }}><ExternalLink className="w-3.5 h-3.5" style={{ color: "#1a1a1a" }} /></a>}
                      {p.liveUrl && <a href={p.liveUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-full" style={{ background: "rgba(0,0,0,0.1)" }}><ExternalLink className="w-3.5 h-3.5" style={{ color: "#1a1a1a" }} /></a>}
                    </div>
                  </div>
                  <div className="text-sm leading-relaxed flex-1 mb-5" style={{ color: "rgba(26,26,26,0.7)" }}>
                    <EditableField fieldKey={`projects.${p._originalIndex}.description`} value={p.description || p.aiSummary || ""} isEditMode={isEditMode} />
                  </div>
                  {Array.isArray(p.techStack) && p.techStack.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-auto">
                      {p.techStack.slice(0, 4).map((t: unknown, ti: number) => <span key={ti} className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: "rgba(0,0,0,0.08)", color: "#1a1a1a" }}>{String(t)}</span>)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* SKILLS — horizontal scroll strips */}
        {portfolio.skills.length > 0 && (
          <section>
            <div className="inline-block text-xs font-semibold uppercase tracking-widest mb-8 pb-1 border-b-2" style={{ color: ACCENT, borderColor: ACCENT }}>Capabilities</div>
            <div className="space-y-5">
              {Object.entries(skillsByCategory).map(([cat, skills]) => (
                <div key={cat} className="flex items-center gap-6">
                  <div className="text-xs font-semibold uppercase tracking-widest w-28 shrink-0" style={{ color: C.mute }}>{cat}</div>
                  <div className="flex flex-wrap gap-2">
                    {skills.map(s => (
                      <span key={s.id} className="text-sm px-4 py-2 rounded-full border font-medium" style={{ borderColor: C.border, color: C.ink }}>
                        <EditableField fieldKey={`skills.${s._originalIndex}.name`} value={s.name} isEditMode={isEditMode} />
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
          <section>
            <div className="inline-block text-xs font-semibold uppercase tracking-widest mb-8 pb-1 border-b-2" style={{ color: ACCENT, borderColor: ACCENT }}>Experience</div>
            <div className="space-y-10">
              {portfolio.experiences.map((exp, idx) => (
                <div key={exp.id} className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-10" style={{ borderBottom: `1px solid ${C.border}` }}>
                  <div>
                    <p className="text-sm" style={{ color: C.mute }}>{formatDateRange(exp.startDate, exp.endDate, exp.currentlyWorking)}</p>
                    <div className="font-semibold mt-1" style={{ color: ACCENT }}>
                      <EditableField fieldKey={`experiences.${idx}.company`} value={exp.company} isEditMode={isEditMode} />
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <h3 className="text-xl font-bold mb-2">
                      <EditableField fieldKey={`experiences.${idx}.role`} value={exp.role} isEditMode={isEditMode} />
                    </h3>
                    {exp.description && (
                      <div className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: C.mute }}>
                        <EditableField fieldKey={`experiences.${idx}.description`} value={exp.description} isEditMode={isEditMode} />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      <footer className="border-t py-8 text-center text-sm" style={{ borderColor: C.border, color: C.mute }}>
        © {new Date().getFullYear()} {portfolio.fullName || portfolio.name} · Powered by <Link href="/" className="hover:underline" style={{ color: ACCENT }}>makeurfolio</Link>
      </footer>
    </div>
  );
}
