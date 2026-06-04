/**
 * Raycast Theme — Inspired by Raycast's design language.
 * Near-black canvas (#07080a), white pill CTA, 4-step surface ladder,
 * Inter typography with ss03, red diagonal stripe on hero, hairline borders.
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
  canvas: "#07080a",
  surface: "#0d0d0d",
  surfaceElevated: "#101111",
  surfaceCard: "#121212",
  ink: "#f4f4f6",
  body: "#cdcdcd",
  mute: "#9c9c9d",
  ash: "#6a6b6c",
  hairline: "#242728",
  hairlineStrong: "rgba(255,255,255,0.16)",
};

export default function RaycastTheme({ portfolio: initialPortfolio, isEditMode = false }: PortfolioThemeProps) {
  const portfolio = useLiveSync(initialPortfolio, isEditMode);
  const { featured, regular } = splitProjects(portfolio.projects);
  const skillsByCategory = groupSkillsByCategory(portfolio.skills);
  const primarySocials = getPrimarySocials(portfolio.socialLinks, 4);
  const displayProjects = featured.length > 0 ? featured : regular.slice(0, 4);

  return (
    <div
      className="min-h-screen selection:bg-white selection:text-black"
      style={{ background: C.canvas, color: C.ink, fontFamily: "Inter, system-ui, -apple-system, sans-serif", fontFeatureSettings: '"calt", "kern", "liga", "ss03"' }}
    >
      {/* HERO with red diagonal stripe */}
      <section className="relative overflow-hidden" style={{ background: C.canvas }}>
        {/* Red stripe gradient */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div style={{
            position: "absolute", top: "-30%", left: "-10%", width: "130%", height: "80%",
            background: "linear-gradient(165deg, #ff5757 0%, #a1131a 60%, transparent 100%)",
            opacity: 0.12, transform: "skewY(-8deg)",
          }} />
          <div style={{
            position: "absolute", top: "-20%", left: "10%", width: "100%", height: "60%",
            background: "linear-gradient(165deg, #ff5757 0%, #a1131a 50%, transparent 100%)",
            opacity: 0.07, transform: "skewY(-8deg)",
          }} />
        </div>

        <div className="relative z-10 max-w-[1240px] mx-auto px-6 py-24 md:py-36">
          {/* Command-palette card motif in hero */}
          <div className="max-w-xl mb-12 rounded-xl overflow-hidden" style={{ background: C.surface, border: `1px solid ${C.hairline}` }}>
            <div className="flex items-center gap-1.5 px-4 py-3" style={{ borderBottom: `1px solid ${C.hairline}` }}>
              <span className="w-3 h-3 rounded-full bg-[#ff6161]" />
              <span className="w-3 h-3 rounded-full bg-[#ffc533]" />
              <span className="w-3 h-3 rounded-full bg-[#59d499]" />
              <div className="flex-1 ml-3 text-sm rounded-md px-3 py-1" style={{ background: C.surfaceElevated, color: C.mute }}>
                <EditableField fieldKey="fullName" value={portfolio.fullName || portfolio.name} isEditMode={isEditMode} />
              </div>
            </div>
            <div className="p-3 space-y-1">
              {["View Portfolio", "Open Projects", "Download Résumé", "Send Email"].map((cmd, i) => (
                <div key={cmd} className="flex items-center gap-3 px-3 py-2 rounded-md text-sm" style={{ background: i === 0 ? C.surfaceCard : "transparent", color: i === 0 ? C.ink : C.mute }}>
                  <span className="w-5 h-5 rounded flex-shrink-0 flex items-center justify-center text-xs" style={{ background: C.surfaceElevated, color: C.ash }}>
                    {i === 0 ? "↩" : ""}
                  </span>
                  {cmd}
                </div>
              ))}
            </div>
          </div>

          <h1 className="text-4xl md:text-6xl font-semibold leading-[1.1] mb-6 max-w-2xl" style={{ color: C.ink, letterSpacing: "0" }}>
            <EditableField fieldKey="fullName" value={portfolio.fullName || portfolio.name} isEditMode={isEditMode} />
          </h1>
          {portfolio.headline && (
            <div className="text-lg md:text-xl mb-10 max-w-xl leading-relaxed" style={{ color: C.body }}>
              <EditableField fieldKey="headline" value={portfolio.headline} isEditMode={isEditMode} />
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3">
            {portfolio.location && (
              <span className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg" style={{ color: C.mute, background: C.surfaceElevated, border: `1px solid ${C.hairline}` }}>
                <MapPin className="w-3.5 h-3.5" />{portfolio.location}
              </span>
            )}
            {portfolio.email && (
              <a href={`mailto:${portfolio.email}`} className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg" style={{ color: C.mute, background: C.surfaceElevated, border: `1px solid ${C.hairline}` }}>
                <Mail className="w-3.5 h-3.5" />{portfolio.email}
              </a>
            )}
            {primarySocials.map((link) => (
              <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="text-sm px-3 py-1.5 rounded-lg" style={{ color: C.mute, background: C.surfaceElevated, border: `1px solid ${C.hairline}` }}>
                {link.label}
              </a>
            ))}
            {portfolio.showResume && portfolio.resumeUrl && (
              <a href={portfolio.resumeUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm font-medium px-4 py-1.5 rounded-lg" style={{ background: "#fff", color: "#000" }}>
                <FileText className="w-3.5 h-3.5" />Résumé
              </a>
            )}
          </div>
        </div>
      </section>

      <main className="max-w-[1240px] mx-auto px-6 pb-32 space-y-24 pt-16">

        {/* ABOUT */}
        {(portfolio.bio || portfolio.summary) && (
          <section>
            <h2 className="text-2xl font-medium mb-8" style={{ color: C.ink }}>About</h2>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
              <div className="md:col-span-4 space-y-3">
                {[
                  { label: "Roles", val: portfolio.experiences.length > 0 ? `${portfolio.experiences.length}` : "0" },
                  { label: "Projects", val: `${portfolio.projects.length}` },
                  { label: "Skills", val: `${portfolio.skills.length}` },
                ].map((stat) => (
                  <div key={stat.label} className="flex items-center justify-between p-4 rounded-lg" style={{ background: C.surface, border: `1px solid ${C.hairline}` }}>
                    <span className="text-sm" style={{ color: C.mute }}>{stat.label}</span>
                    <span className="text-xl font-medium" style={{ color: C.ink }}>{stat.val}</span>
                  </div>
                ))}
              </div>
              <div className="md:col-span-8 space-y-4 text-base leading-relaxed" style={{ color: C.body }}>
                <EditableField fieldKey="summary" value={portfolio.summary || portfolio.bio || ""} isEditMode={isEditMode} />
              </div>
            </div>
          </section>
        )}

        {/* PROJECTS */}
        {portfolio.projects.length > 0 && (
          <section>
            <div className="flex items-center gap-4 mb-8">
              <h2 className="text-2xl font-medium" style={{ color: C.ink }}>Projects</h2>
              <div className="h-px flex-1" style={{ background: C.hairline }} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {displayProjects.map((project) => (
                <div key={project.id} className="flex flex-col p-6 rounded-xl" style={{ background: C.surface, border: `1px solid ${C.hairline}` }}>
                  <div className="flex items-start justify-between mb-5">
                    <h3 className="text-lg font-medium" style={{ color: C.ink }}>
                      <EditableField fieldKey={`projects.${project._originalIndex}.title`} value={project.title} isEditMode={isEditMode} />
                    </h3>
                    <div className="flex items-center gap-2 shrink-0 ml-4">
                      {project.githubUrl && <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg" style={{ color: C.mute, background: C.surfaceElevated, border: `1px solid ${C.hairline}` }}><Github className="w-4 h-4" /></a>}
                      {project.liveUrl && <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg font-medium text-sm" style={{ background: "#fff", color: "#000" }}><ExternalLink className="w-4 h-4" /></a>}
                    </div>
                  </div>
                  <div className="text-sm leading-relaxed flex-1 mb-5" style={{ color: C.body }}>
                    <EditableField fieldKey={`projects.${project._originalIndex}.description`} value={project.description || project.aiSummary || ""} isEditMode={isEditMode} />
                  </div>
                  {Array.isArray(project.techStack) && project.techStack.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-auto pt-4" style={{ borderTop: `1px solid ${C.hairline}` }}>
                      {project.techStack.map((tech: unknown, idx: number) => (
                        <span key={idx} className="px-2.5 py-1 text-xs rounded-md" style={{ background: C.surfaceElevated, color: C.mute, border: `1px solid ${C.hairline}` }}>{String(tech)}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
            {featured.length > 0 && regular.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
                {regular.map((project) => (
                  <div key={project.id} className="p-4 rounded-lg flex flex-col" style={{ background: C.surface, border: `1px solid ${C.hairline}` }}>
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-[14px] font-medium" style={{ color: C.ink }}>
                        <EditableField fieldKey={`projects.${project._originalIndex}.title`} value={project.title} isEditMode={isEditMode} />
                      </h3>
                      <div className="flex gap-1.5 shrink-0 ml-2">
                        {project.githubUrl && <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" style={{ color: C.ash }}><Github className="w-3.5 h-3.5" /></a>}
                        {project.liveUrl && <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" style={{ color: C.ash }}><ExternalLink className="w-3.5 h-3.5" /></a>}
                      </div>
                    </div>
                    <div className="text-xs leading-relaxed" style={{ color: C.ash }}>
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
          <section>
            <div className="flex items-center gap-4 mb-8">
              <h2 className="text-2xl font-medium" style={{ color: C.ink }}>Skills</h2>
              <div className="h-px flex-1" style={{ background: C.hairline }} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {Object.entries(skillsByCategory).map(([category, skills]) => (
                <div key={category} className="p-5 rounded-xl space-y-4" style={{ background: C.surface, border: `1px solid ${C.hairline}` }}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium uppercase tracking-widest" style={{ color: C.mute }}>{category}</span>
                    <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: C.surfaceElevated, color: C.ash }}>{skills.length}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill) => (
                      <span key={skill.id} className="px-2.5 py-1 text-xs rounded-md inline-block" style={{ background: C.surfaceElevated, color: C.body, border: `1px solid ${C.hairline}` }}>
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
          <section>
            <div className="flex items-center gap-4 mb-8">
              <h2 className="text-2xl font-medium" style={{ color: C.ink }}>Experience</h2>
              <div className="h-px flex-1" style={{ background: C.hairline }} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
              {portfolio.experiences.map((exp, idx) => (
                <div key={exp.id} className="space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2 pb-3" style={{ borderBottom: `1px solid ${C.hairline}` }}>
                    <h3 className="text-base font-medium" style={{ color: C.ink }}>
                      <EditableField fieldKey={`experiences.${idx}.role`} value={exp.role} isEditMode={isEditMode} />
                    </h3>
                    <span className="text-xs font-mono shrink-0" style={{ color: C.ash }}>{formatDateRange(exp.startDate, exp.endDate, exp.currentlyWorking)}</span>
                  </div>
                  <div className="text-sm font-medium" style={{ color: C.body }}>
                    <EditableField fieldKey={`experiences.${idx}.company`} value={exp.company} isEditMode={isEditMode} />
                  </div>
                  {exp.description && (
                    <div className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: C.ash }}>
                      <EditableField fieldKey={`experiences.${idx}.description`} value={exp.description} isEditMode={isEditMode} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* EDUCATION + CERTS + ACHIEVEMENTS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {portfolio.showEducation && portfolio.educations.length > 0 && (
            <section>
              <h2 className="text-xl font-medium mb-6" style={{ color: C.ink }}>Education</h2>
              <div className="space-y-3">
                {portfolio.educations.map((edu, idx) => (
                  <div key={edu.id} className="p-5 rounded-xl" style={{ background: C.surface, border: `1px solid ${C.hairline}` }}>
                    <div className="flex items-start justify-between gap-4 mb-1">
                      <h3 className="text-[15px] font-medium" style={{ color: C.ink }}>
                        <EditableField fieldKey={`educations.${idx}.institution`} value={edu.institution} isEditMode={isEditMode} />
                      </h3>
                      <span className="text-xs font-mono shrink-0" style={{ color: C.ash }}>{formatDateRange(edu.startDate, edu.endDate)}</span>
                    </div>
                    <div className="text-sm" style={{ color: C.mute }}>
                      <EditableField fieldKey={`educations.${idx}.degree`} value={edu.degree || ""} isEditMode={isEditMode} /> in <EditableField fieldKey={`educations.${idx}.fieldOfStudy`} value={edu.fieldOfStudy || ""} isEditMode={isEditMode} />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
          <div className="space-y-10">
            {portfolio.showCertifications && portfolio.certifications.length > 0 && (
              <section>
                <h2 className="text-xl font-medium mb-6" style={{ color: C.ink }}>Certifications</h2>
                <div className="space-y-2">
                  {portfolio.certifications.map((cert) => (
                    <div key={cert.id} className="flex items-center justify-between gap-4 p-4 rounded-lg group" style={{ background: C.surface, border: `1px solid ${C.hairline}` }}>
                      <div>
                        <h3 className="text-[14px] font-medium" style={{ color: C.ink }}>{cert.title}</h3>
                        <p className="text-xs mt-0.5" style={{ color: C.ash }}>{cert.issuer}</p>
                      </div>
                      {cert.credentialUrl && <a href={cert.credentialUrl} target="_blank" rel="noopener noreferrer" className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-md" style={{ color: C.mute, background: C.surfaceElevated }}><ExternalLink className="w-3.5 h-3.5" /></a>}
                    </div>
                  ))}
                </div>
              </section>
            )}
            {portfolio.showAchievements && portfolio.achievements.length > 0 && (
              <section>
                <h2 className="text-xl font-medium mb-6" style={{ color: C.ink }}>Achievements</h2>
                <div className="space-y-2">
                  {portfolio.achievements.map((ach) => (
                    <div key={ach.id} className="p-4 rounded-lg" style={{ background: C.surface, border: `1px solid ${C.hairline}` }}>
                      <h3 className="text-[14px] font-medium" style={{ color: C.ink }}>{ach.title}</h3>
                      {ach.description && <p className="text-xs mt-1 leading-relaxed" style={{ color: C.ash }}>{ach.description}</p>}
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
        <div className="max-w-[1240px] mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm" style={{ color: C.ash }}>© {new Date().getFullYear()} {portfolio.fullName || portfolio.name}</div>
          <div className="flex items-center gap-1 text-sm" style={{ color: C.ash }}>
            Powered by <Link href="/" className="ml-1 font-medium hover:underline underline-offset-4" style={{ color: C.ink }}>makeurfolio</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
