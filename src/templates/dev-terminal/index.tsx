/**
 * Dev Terminal Template — Two-pane: fixed left TOC sidebar + right scrollable content.
 * Monospace everywhere. Consumes theme colors.
 * Best for: Developers
 */
"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ExternalLink, Mail, MapPin, Code2, FileText } from "lucide-react";
import type { PortfolioThemeProps } from "@/src/themes/shared/types";
import { groupSkillsByCategory, formatDateRange, splitProjects, getPrimarySocials } from "@/src/themes/shared/utils";
import { EditableField } from "@/src/components/editor/editable-field";
import { useLiveSync } from "@/src/hooks/use-live-sync";

const SECTIONS = ["about", "projects", "skills", "experience", "education", "certifications"] as const;

export default function DevTerminalTemplate({ portfolio: initialPortfolio, theme, isEditMode = false }: PortfolioThemeProps) {
  const portfolio = useLiveSync(initialPortfolio, isEditMode);
  const { featured, regular } = splitProjects(portfolio.projects);
  const skillsByCategory = groupSkillsByCategory(portfolio.skills);
  const socials = getPrimarySocials(portfolio.socialLinks, 6);
  const allProjects = featured.length ? featured : regular;
  const [active, setActive] = useState<string>("about");

  const C = theme.colors;
  const F = theme.typography.fontFamily;
  const GREEN = C.primary;
  const DIM = `${C.primary}33`; // 20% opacity primary

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => { const vis = entries.find(e => e.isIntersecting); if (vis) setActive(vis.target.id.replace("tmpl-", "")); },
      { rootMargin: "-30% 0px -60% 0px" }
    );
    SECTIONS.forEach(s => { const el = document.getElementById(`tmpl-${s}`); if (el) obs.observe(el); });
    return () => obs.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(`tmpl-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setActive(id);
  };

  return (
    <div className="min-h-screen flex" style={{ background: C.canvas, color: C.ink, fontFamily: F }}>
      {/* ── Fixed left sidebar ── */}
      <aside className="hidden lg:flex flex-col fixed top-0 left-0 h-screen w-64 border-r z-20" style={{ background: C.surface, borderColor: C.border }}>
        {/* Identity */}
        <div className="p-6 border-b" style={{ borderColor: C.border }}>
          <div className="text-xs mb-1" style={{ color: GREEN }}>$ whoami</div>
          <div className="text-lg font-bold leading-tight" style={{ color: C.ink }}>
             <EditableField fieldKey="fullName" value={portfolio.fullName || portfolio.name} isEditMode={isEditMode} />
          </div>
          {portfolio.headline && (
             <div className="text-xs mt-1 leading-relaxed" style={{ color: C.mute }}>
               <EditableField fieldKey="headline" value={portfolio.headline} isEditMode={isEditMode} />
             </div>
          )}
        </div>
        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {SECTIONS.map(s => (
            <button key={s} onClick={() => scrollTo(s)}
              className="w-full flex items-center gap-2 px-3 py-2 rounded text-xs text-left transition-all"
              style={{ background: active === s ? DIM : "transparent", color: active === s ? GREEN : C.mute }}>
              <span style={{ color: GREEN }}>›</span> {s}
            </button>
          ))}
        </nav>
        {/* Contact */}
        <div className="p-4 border-t space-y-2" style={{ borderColor: C.border }}>
          {portfolio.email && <a href={`mailto:${portfolio.email}`} className="flex items-center gap-2 text-xs" style={{ color: C.mute }}><Mail className="w-3 h-3" />{portfolio.email}</a>}
          {portfolio.location && <div className="flex items-center gap-2 text-xs" style={{ color: C.mute }}><MapPin className="w-3 h-3" />{portfolio.location}</div>}
          <div className="flex gap-2 pt-1 flex-wrap">
            {socials.map(l => <a key={l.id} href={l.url} target="_blank" rel="noopener noreferrer" className="text-[10px] px-2 py-1 rounded border" style={{ color: GREEN, borderColor: DIM }}>{l.label}</a>)}
          </div>
          {portfolio.showResume && portfolio.resumeUrl && (
            <a href={portfolio.resumeUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded border w-full justify-center mt-2" style={{ color: C.surface, background: GREEN, borderColor: GREEN, fontWeight: 700 }}>
              <FileText className="w-3 h-3" />résumé
            </a>
          )}
        </div>
      </aside>

      {/* ── Main scroll content ── */}
      <main className="flex-1 lg:ml-64 max-w-3xl px-6 lg:px-12 py-12 space-y-20">

        {/* Mobile header */}
        <div className="lg:hidden mb-8">
          <div className="text-xs mb-1" style={{ color: GREEN }}>$ whoami</div>
          <h1 className="text-2xl font-bold" style={{ color: C.ink }}>
            <EditableField fieldKey="fullName" value={portfolio.fullName || portfolio.name} isEditMode={isEditMode} />
          </h1>
          {portfolio.headline && (
            <p className="text-sm mt-1" style={{ color: C.mute }}>
              <EditableField fieldKey="headline" value={portfolio.headline} isEditMode={isEditMode} />
            </p>
          )}
        </div>

        {/* ABOUT */}
        <section id="tmpl-about">
          <div className="text-xs mb-4" style={{ color: GREEN }}>$ cat about.md</div>
          <div className="p-5 rounded-lg border text-sm leading-relaxed whitespace-pre-wrap" style={{ background: C.surface, borderColor: C.border, color: C.ink }}>
            <EditableField fieldKey="summary" value={portfolio.summary || portfolio.bio || "No bio provided yet."} isEditMode={isEditMode} />
          </div>
          <div className="grid grid-cols-3 gap-3 mt-4">
            {[{k:"projects", v: portfolio.projects.length},{k:"skills", v: portfolio.skills.length},{k:"roles", v: portfolio.experiences.length}].map(({k,v}) => (
              <div key={k} className="text-center p-3 rounded border" style={{ background: C.surface, borderColor: C.border }}>
                <div className="text-xl font-bold" style={{ color: GREEN }}>{v}</div>
                <div className="text-[10px] mt-0.5" style={{ color: C.mute }}>{k}</div>
              </div>
            ))}
          </div>
        </section>

        {/* PROJECTS */}
        {portfolio.projects.length > 0 && (
          <section id="tmpl-projects">
            <div className="text-xs mb-4" style={{ color: GREEN }}>$ ls ./projects</div>
            <div className="space-y-3">
              {allProjects.map((p, i) => (
                <div key={p.id} className="p-5 rounded-lg border group" style={{ background: C.surface, borderColor: C.border }}>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <span className="text-xs mr-2" style={{ color: DIM }}>[{String(i+1).padStart(2,"0")}]</span>
                      <span className="font-bold text-sm" style={{ color: C.ink }}>
                        <EditableField fieldKey={`projects.${p._originalIndex}.title`} value={p.title} isEditMode={isEditMode} />
                      </span>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      {p.githubUrl && <a href={p.githubUrl} target="_blank" rel="noopener noreferrer"><Code2 className="w-4 h-4" style={{ color: C.mute }} /></a>}
                      {p.liveUrl && <a href={p.liveUrl} target="_blank" rel="noopener noreferrer"><ExternalLink className="w-4 h-4" style={{ color: C.mute }} /></a>}
                    </div>
                  </div>
                  <div className="text-xs leading-relaxed mb-3" style={{ color: C.mute }}>
                    <EditableField fieldKey={`projects.${p._originalIndex}.description`} value={p.description || p.aiSummary || ""} isEditMode={isEditMode} />
                  </div>
                  {Array.isArray(p.techStack) && p.techStack.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {p.techStack.map((t: unknown, ti: number) => <span key={ti} className="text-[10px] px-2 py-0.5 rounded" style={{ background: C.surfaceElevated, color: GREEN, border: `1px solid ${DIM}` }}>{String(t)}</span>)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* SKILLS */}
        {portfolio.skills.length > 0 && (
          <section id="tmpl-skills">
            <div className="text-xs mb-4" style={{ color: GREEN }}>$ cat skills.json</div>
            <div className="space-y-4">
              {Object.entries(skillsByCategory).map(([cat, skills]) => (
                <div key={cat}>
                  <div className="text-[10px] mb-2" style={{ color: C.mute }}>// {cat}</div>
                  <div className="flex flex-wrap gap-2">
                    {skills.map(s => (
                      <span key={s.id} className="text-xs px-3 py-1 rounded border inline-block" style={{ color: C.ink, borderColor: C.border, background: C.surface }}>
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
          <section id="tmpl-experience">
            <div className="text-xs mb-4" style={{ color: GREEN }}>$ git log --oneline --career</div>
            <div className="space-y-5">
              {portfolio.experiences.map((exp, idx) => (
                <div key={exp.id} className="pl-4 border-l-2" style={{ borderColor: GREEN }}>
                  <div className="flex items-baseline justify-between gap-4 mb-1">
                    <span className="font-bold text-sm" style={{ color: C.ink }}>
                      <EditableField fieldKey={`experiences.${idx}.role`} value={exp.role} isEditMode={isEditMode} /> @ <EditableField fieldKey={`experiences.${idx}.company`} value={exp.company} isEditMode={isEditMode} />
                    </span>
                    <span className="text-[10px] shrink-0" style={{ color: C.mute }}>{formatDateRange(exp.startDate, exp.endDate, exp.currentlyWorking)}</span>
                  </div>
                  {exp.description && (
                    <div className="text-xs leading-relaxed whitespace-pre-wrap" style={{ color: C.mute }}>
                      <EditableField fieldKey={`experiences.${idx}.description`} value={exp.description} isEditMode={isEditMode} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* EDUCATION */}
        {portfolio.showEducation && portfolio.educations.length > 0 && (
          <section id="tmpl-education">
            <div className="text-xs mb-4" style={{ color: GREEN }}>$ cat education.txt</div>
            <div className="space-y-3">
              {portfolio.educations.map((edu, idx) => (
                <div key={edu.id} className="p-4 rounded border text-xs" style={{ background: C.surface, borderColor: C.border }}>
                  <div className="font-bold mb-1" style={{ color: C.ink }}>
                    <EditableField fieldKey={`educations.${idx}.institution`} value={edu.institution} isEditMode={isEditMode} />
                  </div>
                  <div style={{ color: C.mute }}>
                    <EditableField fieldKey={`educations.${idx}.degree`} value={edu.degree || ""} isEditMode={isEditMode} /> · <EditableField fieldKey={`educations.${idx}.fieldOfStudy`} value={edu.fieldOfStudy || ""} isEditMode={isEditMode} /> · {formatDateRange(edu.startDate, edu.endDate)}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* CERTIFICATIONS */}
        {portfolio.showCertifications && portfolio.certifications.length > 0 && (
          <section id="tmpl-certifications">
            <div className="text-xs mb-4" style={{ color: GREEN }}>$ ls ./certs/</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {portfolio.certifications.map(c => (
                <div key={c.id} className="p-4 rounded border flex items-center justify-between group" style={{ background: C.surface, borderColor: C.border }}>
                  <div>
                    <div className="text-xs font-bold" style={{ color: C.ink }}>{c.title}</div>
                    <div className="text-[10px]" style={{ color: C.mute }}>{c.issuer}</div>
                  </div>
                  {c.credentialUrl && <a href={c.credentialUrl} target="_blank" rel="noopener noreferrer"><ExternalLink className="w-3.5 h-3.5" style={{ color: GREEN }} /></a>}
                </div>
              ))}
            </div>
          </section>
        )}

        <footer className="text-xs text-center pb-8" style={{ color: C.mute }}>
          <span>Built with </span><Link href="/" className="hover:underline" style={{ color: GREEN }}>makeurfolio</Link>
        </footer>
      </main>
    </div>
  );
}
