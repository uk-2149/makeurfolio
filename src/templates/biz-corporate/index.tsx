/**
 * Biz Corporate Template — Traditional resume-like structure, very clean.
 * High information density, conservative typography, print-friendly layout.
 * Best for: Corporate Professionals, Managers, Executives
 */
"use client";
import React from "react";
import Link from "next/link";
import { ExternalLink, Mail, MapPin, FileText, Briefcase, GraduationCap, Award } from "lucide-react";
import type { PortfolioThemeProps } from "@/src/themes/shared/types";
import { groupSkillsByCategory, formatDateRange, getPrimarySocials } from "@/src/themes/shared/utils";
import { EditableField } from "@/src/components/editor/editable-field";
import { useLiveSync } from "@/src/hooks/use-live-sync";

export default function BizCorporateTemplate({ portfolio: initialPortfolio, theme, isEditMode = false }: PortfolioThemeProps) {
  const portfolio = useLiveSync(initialPortfolio, isEditMode);
  const skillsByCategory = groupSkillsByCategory(portfolio.skills);
  const socials = getPrimarySocials(portfolio.socialLinks, 3);

  const C = theme.colors;
  const F = theme.typography.fontFamily;
  const PRIMARY = C.primary;

  return (
    <div className="min-h-screen py-10 px-4 sm:px-8" style={{ background: C.surface, color: C.ink, fontFamily: F }}>
      <div className="max-w-4xl mx-auto border shadow-sm" style={{ background: C.canvas, borderColor: C.border }}>
        
        {/* HEADER */}
        <header className="p-8 md:p-12 border-b" style={{ borderColor: C.border, background: C.surfaceElevated || C.surface }}>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-4xl font-serif font-bold text-gray-900 mb-2">
                 <EditableField fieldKey="fullName" value={portfolio.fullName || portfolio.name} isEditMode={isEditMode} />
              </h1>
              {portfolio.headline && <h2 className="text-xl font-medium" style={{ color: PRIMARY }}>
                <EditableField fieldKey="headline" value={portfolio.headline} isEditMode={isEditMode} />
              </h2>}
            </div>
            <div className="flex flex-col gap-1.5 text-sm" style={{ color: C.mute }}>
              {portfolio.location && <div className="flex items-center gap-2"><MapPin className="w-4 h-4" />{portfolio.location}</div>}
              {portfolio.email && <a href={`mailto:${portfolio.email}`} className="flex items-center gap-2 hover:underline"><Mail className="w-4 h-4" />{portfolio.email}</a>}
              {socials.find(s => s.label.toLowerCase() === 'linkedin') && (
                <a href={socials.find(s => s.label.toLowerCase() === 'linkedin')?.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:underline">
                  <ExternalLink className="w-4 h-4" />LinkedIn Profile
                </a>
              )}
            </div>
          </div>
          {(portfolio.summary || portfolio.bio) && (
            <div className="mt-8 pt-6 border-t leading-relaxed" style={{ borderColor: C.border, color: C.ink }}>
              <EditableField fieldKey="summary" value={portfolio.summary || portfolio.bio || "No summary provided."} isEditMode={isEditMode} />
            </div>
          )}
        </header>

        <div className="p-8 md:p-12 space-y-12">
          
          {/* EXPERIENCE */}
          {portfolio.showExperience && portfolio.experiences.length > 0 && (
            <section>
              <h3 className="text-lg font-bold uppercase tracking-wider mb-6 flex items-center gap-2 border-b pb-2" style={{ color: PRIMARY, borderColor: C.border }}>
                <Briefcase className="w-5 h-5" /> Professional Experience
              </h3>
              <div className="space-y-8">
                {portfolio.experiences.map((exp, idx) => (
                  <div key={exp.id}>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline mb-2">
                      <h4 className="text-lg font-bold" style={{ color: C.ink }}>
                        <EditableField fieldKey={`experiences.${idx}.role`} value={exp.role} isEditMode={isEditMode} />
                      </h4>
                      <span className="text-sm font-medium whitespace-nowrap" style={{ color: C.mute }}>{formatDateRange(exp.startDate, exp.endDate, exp.currentlyWorking)}</span>
                    </div>
                    <div className="text-md font-medium mb-3" style={{ color: PRIMARY }}>
                      <EditableField fieldKey={`experiences.${idx}.company`} value={exp.company} isEditMode={isEditMode} />
                    </div>
                    {exp.description && (
                      <div className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: C.ink }}>
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
            <section>
              <h3 className="text-lg font-bold uppercase tracking-wider mb-6 flex items-center gap-2 border-b pb-2" style={{ color: PRIMARY, borderColor: C.border }}>
                <GraduationCap className="w-5 h-5" /> Education
              </h3>
              <div className="space-y-6">
                {portfolio.educations.map((edu, idx) => (
                  <div key={edu.id}>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline mb-1">
                      <h4 className="text-md font-bold" style={{ color: C.ink }}>
                        <EditableField fieldKey={`educations.${idx}.institution`} value={edu.institution} isEditMode={isEditMode} />
                      </h4>
                      <span className="text-sm" style={{ color: C.mute }}>{formatDateRange(edu.startDate, edu.endDate)}</span>
                    </div>
                    <div className="text-sm" style={{ color: C.ink }}>
                      <EditableField fieldKey={`educations.${idx}.degree`} value={edu.degree || ""} isEditMode={isEditMode} /> in <EditableField fieldKey={`educations.${idx}.fieldOfStudy`} value={edu.fieldOfStudy || ""} isEditMode={isEditMode} />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* SKILLS */}
          {portfolio.skills.length > 0 && (
            <section>
              <h3 className="text-lg font-bold uppercase tracking-wider mb-6 flex items-center gap-2 border-b pb-2" style={{ color: PRIMARY, borderColor: C.border }}>
                <Award className="w-5 h-5" /> Core Competencies
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                {Object.entries(skillsByCategory).map(([cat, skills]) => (
                  <div key={cat}>
                    <h4 className="font-semibold text-sm mb-2" style={{ color: C.ink }}>{cat}</h4>
                    <div className="text-sm leading-relaxed flex flex-wrap gap-x-1" style={{ color: C.mute }}>
                      {skills.map((s, idx) => (
                        <span key={s.id}>
                          <EditableField fieldKey={`skills.${s._originalIndex}.name`} value={s.name} isEditMode={isEditMode} />
                          {idx < skills.length - 1 && ", "}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* PROJECTS / INITIATIVES */}
          {portfolio.projects.length > 0 && (
            <section>
              <h3 className="text-lg font-bold uppercase tracking-wider mb-6 flex items-center gap-2 border-b pb-2" style={{ color: PRIMARY, borderColor: C.border }}>
                <FileText className="w-5 h-5" /> Key Initiatives & Projects
              </h3>
              <div className="space-y-6">
                {portfolio.projects.map((p) => (
                  <div key={p.id}>
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="text-md font-bold" style={{ color: C.ink }}>
                        <EditableField fieldKey={`projects.${p._originalIndex}.title`} value={p.title} isEditMode={isEditMode} />
                      </h4>
                      {p.liveUrl && <a href={p.liveUrl} target="_blank" rel="noopener noreferrer" style={{ color: PRIMARY }}><ExternalLink className="w-3.5 h-3.5" /></a>}
                    </div>
                    <div className="text-sm leading-relaxed mb-2" style={{ color: C.ink }}>
                      <EditableField fieldKey={`projects.${p._originalIndex}.description`} value={p.description || p.aiSummary || ""} isEditMode={isEditMode} />
                    </div>
                    {Array.isArray(p.techStack) && p.techStack.length > 0 && (
                      <p className="text-xs italic" style={{ color: C.mute }}>Technologies: {p.techStack.join(", ")}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

        </div>
        
        <footer className="p-6 border-t text-center text-xs" style={{ borderColor: C.border, color: C.mute, background: C.surfaceElevated || C.surface }}>
          Generated via <Link href="/" className="hover:underline" style={{ color: PRIMARY }}>makeurfolio</Link>
        </footer>
      </div>
    </div>
  );
}
