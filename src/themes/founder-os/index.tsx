/**
 * Founder OS Theme
 *
 * A modern founder / indie hacker / startup operator portfolio focused on
 * products, impact, and credibility.
 *
 * Content Flow: Hero (w/ Stats) → Featured Projects → About → Experience →
 *               Skills → Education → Certifications → Achievements → Footer
 *
 * PURE PRESENTATION COMPONENT. No data fetching.
 */

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ExternalLink, MapPin, Mail, FileText, Code2 as GithubIcon, ChevronDown, ChevronUp, Briefcase, Code2, Medal, Layers } from "lucide-react";
import { EditableField } from "@/src/components/editor/editable-field";
import { useLiveSync } from "@/src/hooks/use-live-sync";
import type { PortfolioThemeProps } from "../shared/types";
import {
  groupSkillsByCategory,
  formatDateRange,
  splitProjects,
  getPrimarySocials,
} from "../shared/utils";

export default function FounderOSTheme({ portfolio: initialPortfolio, isEditMode = false }: PortfolioThemeProps) {
  const portfolio = useLiveSync(initialPortfolio, isEditMode);
  const { featured, regular } = splitProjects(portfolio.projects);
  const skillsByCategory = groupSkillsByCategory(portfolio.skills);
  
  // Primary socials for hero, rest for "More Links"
  const allSocials = portfolio.socialLinks.filter(link => link.visible);
  const primarySocials = getPrimarySocials(allSocials, 3);
  const remainingSocials = allSocials.slice(3);
  const [showMoreLinks, setShowMoreLinks] = useState(false);

  // Fallback for featured projects: if none are explicitly featured, use up to 3 regular projects
  const displayProjects = featured.length > 0 ? featured : regular.slice(0, 3);
  
  // Calculate stats
  const stats = [
    { label: "Projects", value: portfolio.projects.length, icon: <Code2 className="w-4 h-4" /> },
    { label: "Skills", value: portfolio.skills.length, icon: <Layers className="w-4 h-4" /> },
    { label: "Experience", value: portfolio.experiences.length, icon: <Briefcase className="w-4 h-4" /> },
    { label: "Certifications", value: portfolio.certifications.length, icon: <Medal className="w-4 h-4" /> },
  ].filter(stat => stat.value > 0);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-foreground selection:text-background pb-32">
      {/* Sleek top accent line */}
      <div className="h-1 w-full bg-gradient-to-r from-gray-200 via-gray-400 to-gray-200 dark:from-gray-800 dark:via-gray-600 dark:to-gray-800" />
      
      <main className="max-w-6xl mx-auto px-6 pt-20 space-y-32">
        
        {/* 1. HERO SECTION */}
        <section className="flex flex-col lg:flex-row gap-12 lg:gap-24 items-start">
          {/* Left: Intro */}
          <div className="flex-1 space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground leading-[1.1]">
                <EditableField fieldKey="fullName" value={portfolio.fullName || portfolio.name} isEditMode={isEditMode} />
              </h1>
              {portfolio.headline && (
                <div className="text-xl md:text-2xl text-secondary font-medium tracking-tight">
                  <EditableField fieldKey="headline" value={portfolio.headline} isEditMode={isEditMode} />
                </div>
              )}
            </div>

            {(portfolio.summary || portfolio.bio) && (
              <div className="text-base md:text-lg text-secondary leading-relaxed max-w-2xl">
                <EditableField fieldKey="summary" value={portfolio.summary || portfolio.bio || ""} isEditMode={isEditMode} />
              </div>
            )}

            {/* Socials & Contact */}
            <div className="flex flex-wrap items-center gap-4 pt-4">
              {portfolio.location && (
                <span className="flex items-center gap-2 text-sm font-medium text-secondary bg-input-bg px-3 py-1.5 rounded-full border border-border">
                  <MapPin className="w-4 h-4" /> <EditableField fieldKey="location" value={portfolio.location} isEditMode={isEditMode} />
                </span>
              )}
              {portfolio.email && (
                <a href={`mailto:${portfolio.email}`} className="flex items-center gap-2 text-sm font-medium text-secondary bg-input-bg px-3 py-1.5 rounded-full border border-border hover:border-foreground hover:text-foreground transition-colors">
                  <Mail className="w-4 h-4" /> <EditableField fieldKey="email" value={portfolio.email} isEditMode={isEditMode} />
                </a>
              )}
              {portfolio.showResume && portfolio.resumeUrl && (
                <a href={portfolio.resumeUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm font-medium text-background bg-foreground px-4 py-1.5 rounded-full hover:opacity-90 transition-opacity">
                  <FileText className="w-4 h-4" /> Resume
                </a>
              )}
            </div>

            {/* Primary Socials */}
            {allSocials.length > 0 && (
              <div className="flex flex-wrap items-center gap-4 pt-2">
                {primarySocials.map(link => (
                  <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-secondary hover:text-foreground transition-colors underline underline-offset-4 decoration-border hover:decoration-foreground">
                    {link.label}
                  </a>
                ))}
                {remainingSocials.length > 0 && (
                  <div className="relative">
                    <button 
                      onClick={() => setShowMoreLinks(!showMoreLinks)}
                      className="flex items-center gap-1 text-sm font-medium text-secondary hover:text-foreground transition-colors"
                    >
                      More Links {showMoreLinks ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                    {showMoreLinks && (
                      <div className="absolute top-full left-0 mt-2 bg-card-bg border border-border rounded-xl shadow-lg p-2 min-w-[150px] flex flex-col gap-1 z-50 animate-fade-in">
                        {remainingSocials.map(link => (
                          <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-secondary hover:text-foreground hover:bg-input-bg px-3 py-2 rounded-md transition-colors">
                            {link.label}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right: Quick Stats */}
          {stats.length > 0 && (
            <div className="w-full lg:w-72 shrink-0 grid grid-cols-2 gap-4">
              {stats.map((stat, idx) => (
                <div key={idx} className="bg-card-bg border border-border rounded-2xl p-5 flex flex-col items-start gap-3 hover:border-foreground/30 transition-colors">
                  <div className="p-2 bg-input-bg rounded-lg text-secondary">
                    {stat.icon}
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                    <div className="text-xs font-medium text-secondary uppercase tracking-wider mt-0.5">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 2. FEATURED PROJECTS */}
        {displayProjects.length > 0 && (
          <section className="space-y-10">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold tracking-tight text-foreground">Featured Work</h2>
              <div className="h-px flex-1 bg-border" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
              {displayProjects.map((project) => (
                <div key={project.id} className="group flex flex-col bg-card-bg border border-border rounded-3xl p-8 hover:shadow-xl hover:border-foreground/20 transition-all duration-300">
                  <div className="flex items-start justify-between mb-6">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-2xl font-bold tracking-tight text-foreground group-hover:text-foreground transition-colors">
                          <EditableField fieldKey={`projects.${project._originalIndex}.title`} value={project.title} isEditMode={isEditMode} />
                        </h3>
                        {project.featured && (
                          <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-background bg-foreground rounded-full">
                            Featured
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {project.githubUrl && (
                        <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="p-2.5 text-secondary hover:text-foreground bg-input-bg rounded-full hover:bg-border transition-colors">
                          <GithubIcon className="w-4 h-4" />
                        </a>
                      )}
                      {project.liveUrl && (
                        <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="p-2.5 text-background bg-foreground rounded-full hover:opacity-90 transition-colors">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-secondary leading-relaxed mb-8 flex-1">
                    <EditableField fieldKey={`projects.${project._originalIndex}.description`} value={project.description || project.aiSummary || ""} isEditMode={isEditMode} />
                  </div>
                  
                  {Array.isArray(project.techStack) && project.techStack.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-auto pt-6 border-t border-border">
                      {project.techStack.map((tech: unknown, i: number) => (
                        <span key={i} className="px-3 py-1.5 bg-input-bg border border-border/50 text-secondary text-xs font-medium rounded-lg">
                          {String(tech)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 3. ABOUT SECTION (Only if bio exists and is distinct from summary) */}
        {portfolio.bio && portfolio.bio !== portfolio.summary && (
          <section className="max-w-3xl space-y-6">
            <h2 className="text-xl font-bold tracking-tight text-foreground">Background</h2>
            <div className="prose prose-gray dark:prose-invert prose-p:leading-relaxed text-secondary">
              {portfolio.bio.split("\n").map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          </section>
        )}

        {/* 4. EXPERIENCE SECTION */}
        {portfolio.showExperience && portfolio.experiences.length > 0 && (
          <section className="space-y-10">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold tracking-tight text-foreground">Experience</h2>
              <div className="h-px flex-1 bg-border" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-12 md:gap-y-16">
              {portfolio.experiences.map((exp, idx) => (
                <div key={exp.id} className="relative flex flex-col gap-3">
                  <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 sm:gap-4 border-b border-border pb-3">
                    <h3 className="text-lg font-bold text-foreground">
                      <EditableField fieldKey={`experiences.${idx}.role`} value={exp.role} isEditMode={isEditMode} />
                    </h3>
                    <span className="text-sm font-medium text-secondary font-mono shrink-0">
                      {formatDateRange(exp.startDate, exp.endDate, exp.currentlyWorking)}
                    </span>
                  </div>
                  <div className="text-base font-semibold text-foreground/80">
                    <EditableField fieldKey={`experiences.${idx}.company`} value={exp.company} isEditMode={isEditMode} />
                  </div>
                  {exp.description && (
                    <div className="text-sm text-secondary leading-relaxed whitespace-pre-wrap mt-1">
                      <EditableField fieldKey={`experiences.${idx}.description`} value={exp.description} isEditMode={isEditMode} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 5. SKILLS SECTION */}
        {portfolio.skills.length > 0 && (
          <section className="space-y-10">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold tracking-tight text-foreground">Technical Arsenal</h2>
              <div className="h-px flex-1 bg-border" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(skillsByCategory).map(([category, skills]) => (
                <div key={category} className="bg-card-bg border border-border rounded-2xl p-6 space-y-5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">{category}</h3>
                    <span className="text-xs font-bold text-secondary bg-input-bg px-2 py-1 rounded-md">{skills.length}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill) => (
                      <span key={skill.id} className="text-[13px] font-medium text-secondary bg-background border border-border px-3 py-1.5 rounded-lg shadow-sm">
                        <EditableField fieldKey={`skills.${skill._originalIndex}.name`} value={skill.name} isEditMode={isEditMode} />
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 6. EDUCATION & OTHERS (Grid layout) */}
        {((portfolio.showEducation && portfolio.educations.length > 0) || 
          (portfolio.showCertifications && portfolio.certifications.length > 0) || 
          (portfolio.showAchievements && portfolio.achievements.length > 0)) && (
          
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-10">
            
            {portfolio.showEducation && portfolio.educations.length > 0 && (
              <div className="space-y-8">
                <h2 className="text-xl font-bold tracking-tight text-foreground">Education</h2>
                <div className="space-y-6">
                  {portfolio.educations.map((edu, idx) => (
                    <div key={edu.id} className="bg-card-bg border border-border rounded-2xl p-6">
                      <div className="flex justify-between items-start gap-4 mb-2">
                        <h3 className="font-bold text-foreground text-lg leading-snug">
                          <EditableField fieldKey={`educations.${idx}.institution`} value={edu.institution} isEditMode={isEditMode} />
                        </h3>
                        <span className="text-xs font-mono font-medium text-secondary bg-input-bg px-2 py-1 rounded-md shrink-0">
                          {formatDateRange(edu.startDate, edu.endDate)}
                        </span>
                      </div>
                      <div className="text-secondary font-medium">
                        <EditableField fieldKey={`educations.${idx}.degree`} value={edu.degree || ""} isEditMode={isEditMode} /> in <EditableField fieldKey={`educations.${idx}.fieldOfStudy`} value={edu.fieldOfStudy || ""} isEditMode={isEditMode} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-12">
              {portfolio.showCertifications && portfolio.certifications.length > 0 && (
                <div className="space-y-8">
                  <h2 className="text-xl font-bold tracking-tight text-foreground">Certifications</h2>
                  <div className="flex flex-col gap-4">
                    {portfolio.certifications.map((cert) => (
                      <div key={cert.id} className="flex items-center justify-between gap-4 bg-card-bg border border-border rounded-2xl p-5 group">
                        <div>
                          <h3 className="font-bold text-foreground">{cert.title}</h3>
                          <p className="text-sm text-secondary mt-1">{cert.issuer}</p>
                        </div>
                        {cert.credentialUrl && (
                          <a href={cert.credentialUrl} target="_blank" rel="noopener noreferrer" className="p-2 bg-input-bg rounded-full text-secondary group-hover:text-foreground group-hover:bg-border transition-colors">
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {portfolio.showAchievements && portfolio.achievements.length > 0 && (
                <div className="space-y-8">
                  <h2 className="text-xl font-bold tracking-tight text-foreground">Achievements</h2>
                  <div className="flex flex-col gap-4">
                    {portfolio.achievements.map((ach) => (
                      <div key={ach.id} className="bg-card-bg border border-border rounded-2xl p-6">
                        <h3 className="font-bold text-foreground mb-2">{ach.title}</h3>
                        {ach.description && <p className="text-sm text-secondary leading-relaxed">{ach.description}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </section>
        )}

        {/* FOOTER */}
        <footer className="pt-24 pb-12 mt-12 flex flex-col md:flex-row justify-between items-center gap-6 border-t border-border">
          <div className="text-sm font-medium text-secondary text-center md:text-left">
            © {new Date().getFullYear()} {portfolio.fullName || portfolio.name}. All rights reserved.
          </div>
          <div className="flex items-center gap-1 text-sm font-medium text-secondary">
            Powered by <Link href="/" className="text-foreground hover:underline underline-offset-4 font-bold">makeurfolio</Link>
          </div>
        </footer>

      </main>
    </div>
  );
}
