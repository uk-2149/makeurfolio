/**
 * Startup Pitch Template — High contrast, bold typography, gradient text.
 * Drives toward a "Pitch" or "Contact" action.
 * Best for: Founders & Entrepreneurs
 */
"use client";
import React from "react";
import Link from "next/link";
import { ExternalLink, Mail, MapPin, Code2, Rocket, ArrowRight } from "lucide-react";
import type { PortfolioThemeProps } from "@/src/themes/shared/types";
import { groupSkillsByCategory, formatDateRange, getPrimarySocials } from "@/src/themes/shared/utils";
import { EditableField } from "@/src/components/editor/editable-field";
import { useLiveSync } from "@/src/hooks/use-live-sync";

export default function StartupPitchTemplate({ portfolio: initialPortfolio, theme, isEditMode = false }: PortfolioThemeProps) {
  const portfolio = useLiveSync(initialPortfolio, isEditMode);
  const skillsByCategory = groupSkillsByCategory(portfolio.skills);
  const socials = getPrimarySocials(portfolio.socialLinks, 4);

  const C = theme.colors;
  const F = theme.typography.fontFamily;
  const ACCENT = C.primary;

  return (
    <div className="min-h-screen" style={{ background: C.canvas, color: C.ink, fontFamily: F }}>
      
      {/* ── TOP NAV ── */}
      <nav className="border-b" style={{ borderColor: C.border, background: C.surface }}>
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="font-bold text-xl tracking-tight flex items-center gap-2">
            <Rocket className="w-5 h-5" style={{ color: ACCENT }} />
            {portfolio.fullName || portfolio.name}
          </div>
          <div className="flex gap-4">
            {socials.map(s => <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium hover:opacity-80" style={{ color: C.ink }}>{s.label}</a>)}
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="py-24 md:py-32 px-6 text-center" style={{ background: `linear-gradient(to bottom, ${C.surface}, ${C.canvas})` }}>
        <div className="max-w-4xl mx-auto space-y-8">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight">
            <EditableField fieldKey="fullName" value={portfolio.fullName || portfolio.name} isEditMode={isEditMode} />
          </h1>
          {portfolio.headline && (
            <p className="text-2xl md:text-3xl font-medium max-w-3xl mx-auto leading-snug" style={{ color: C.mute }}>
               <EditableField fieldKey="headline" value={portfolio.headline} isEditMode={isEditMode} />
            </p>
          )}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            {portfolio.email && (
              <a href={`mailto:${portfolio.email}`} className="flex items-center gap-2 px-8 py-4 rounded-full text-lg font-bold transition-transform hover:scale-105" style={{ background: ACCENT, color: C.canvas }}>
                Get in Touch <ArrowRight className="w-5 h-5" />
              </a>
            )}
            {portfolio.location && (
              <span className="flex items-center gap-2 px-6 py-4 rounded-full text-sm font-semibold border-2" style={{ borderColor: C.border, color: C.mute }}>
                <MapPin className="w-4 h-4" /> {portfolio.location}
              </span>
            )}
          </div>
        </div>
      </section>

      <main className="max-w-5xl mx-auto px-6 py-16 space-y-32">

        {/* THE MISSION (About) */}
        {(portfolio.summary || portfolio.bio) && (
          <section className="text-center max-w-3xl mx-auto">
            <h2 className="text-sm font-bold uppercase tracking-widest mb-6" style={{ color: ACCENT }}>The Mission</h2>
            <p className="text-xl md:text-2xl leading-relaxed font-medium" style={{ color: C.ink }}>
               <EditableField fieldKey="summary" value={portfolio.summary || portfolio.bio || "No bio provided."} isEditMode={isEditMode} />
            </p>
          </section>
        )}

        {/* THE STATS */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { l: "Products Shipped", v: portfolio.projects.length },
            { l: "Core Skills", v: portfolio.skills.length },
            { l: "Key Roles", v: portfolio.experiences.length },
            { l: "Certifications", v: portfolio.certifications.length }
          ].map(({l,v}) => (
            <div key={l} className="text-center p-8 rounded-3xl border" style={{ background: C.surface, borderColor: C.border }}>
              <div className="text-4xl md:text-5xl font-extrabold mb-2" style={{ color: ACCENT }}>{v}</div>
              <div className="text-sm font-semibold uppercase tracking-wider" style={{ color: C.mute }}>{l}</div>
            </div>
          ))}
        </section>

        {/* PRODUCTS (Projects) */}
        {portfolio.projects.length > 0 && (
          <section>
            <h2 className="text-3xl md:text-4xl font-bold mb-10 text-center">Featured Products</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {portfolio.projects.map((p) => (
                <div key={p.id} className="group rounded-3xl border p-8 transition-shadow hover:shadow-2xl" style={{ background: C.canvas, borderColor: C.border }}>
                  <div className="flex justify-between items-start mb-6">
                    <h3 className="text-2xl font-bold">
                      <EditableField fieldKey={`projects.${p._originalIndex}.title`} value={p.title} isEditMode={isEditMode} />
                    </h3>
                    <div className="flex gap-2">
                      {p.githubUrl && <a href={p.githubUrl} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full border" style={{ borderColor: C.border }}><Code2 className="w-4 h-4" /></a>}
                      {p.liveUrl && <a href={p.liveUrl} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full border" style={{ borderColor: C.border, background: ACCENT, color: C.canvas }}><ExternalLink className="w-4 h-4" /></a>}
                    </div>
                  </div>
                  <div className="text-lg mb-6 leading-relaxed" style={{ color: C.mute }}>
                    <EditableField fieldKey={`projects.${p._originalIndex}.description`} value={p.description || p.aiSummary || ""} isEditMode={isEditMode} />
                  </div>
                  {Array.isArray(p.techStack) && p.techStack.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {p.techStack.map((t: unknown, ti: number) => <span key={ti} className="text-xs font-bold px-3 py-1.5 rounded-full" style={{ background: C.surfaceElevated || C.surface, color: C.ink }}>{String(t)}</span>)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* CAPABILITIES */}
        {portfolio.skills.length > 0 && (
          <section>
            <h2 className="text-3xl md:text-4xl font-bold mb-10 text-center">Core Capabilities</h2>
            <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
              {portfolio.skills.map(s => (
                <span key={s.id} className="px-5 py-2.5 rounded-full text-sm font-bold border-2 inline-block" style={{ borderColor: C.border, background: C.surface }}>
                  <EditableField fieldKey={`skills.${s._originalIndex}.name`} value={s.name} isEditMode={isEditMode} />
                </span>
              ))}
            </div>
          </section>
        )}

        {/* JOURNEY */}
        {portfolio.showExperience && portfolio.experiences.length > 0 && (
          <section className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-10 text-center">The Journey</h2>
            <div className="space-y-12">
              {portfolio.experiences.map((exp, idx) => (
                <div key={exp.id} className="relative pl-8 md:pl-0">
                  <div className="md:grid md:grid-cols-4 md:gap-8 items-start">
                    <div className="md:col-span-1 mb-2 md:mb-0 md:text-right pt-1">
                      <div className="text-sm font-bold uppercase tracking-wider" style={{ color: ACCENT }}>{formatDateRange(exp.startDate, exp.endDate, exp.currentlyWorking)}</div>
                    </div>
                    <div className="md:col-span-3 border-l-4 pl-6 pb-2" style={{ borderColor: C.surface }}>
                      <h3 className="text-xl font-bold">
                        <EditableField fieldKey={`experiences.${idx}.role`} value={exp.role} isEditMode={isEditMode} />
                      </h3>
                      <div className="text-lg font-medium mb-3" style={{ color: C.mute }}>
                        <EditableField fieldKey={`experiences.${idx}.company`} value={exp.company} isEditMode={isEditMode} />
                      </div>
                      {exp.description && (
                        <div className="text-base leading-relaxed" style={{ color: C.mute }}>
                          <EditableField fieldKey={`experiences.${idx}.description`} value={exp.description} isEditMode={isEditMode} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      <footer className="py-12 text-center text-sm font-medium border-t mt-20" style={{ borderColor: C.border, color: C.mute, background: C.surface }}>
        © {new Date().getFullYear()} {portfolio.fullName || portfolio.name} · Built with <Link href="/" className="hover:underline" style={{ color: ACCENT }}>makeurfolio</Link>
      </footer>
    </div>
  );
}
