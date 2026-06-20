"use client";

import React from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { ExternalLink, MapPin, Mail, FileText, Code2 as Github } from "lucide-react";
import type { PortfolioThemeProps } from "../shared/types";
import { EditableField } from "@/src/components/editor/editable-field";
import { useLiveSync } from "@/src/hooks/use-live-sync";
import { FadeIn } from "./fade-in";
import {
  groupSkillsByCategory,
  formatDateRange,
  splitProjects,
  getPrimarySocials,
} from "../shared/utils";

// Using the default 'lime-forest' palette from the design spec
const C = {
  canvas: "#ffffff",
  canvasSoft: "#e8ebe6",
  ink: "#0e0f0c",
  inkSoft: "#454745",
  mute: "#868685",
  accent: "#9fe870",
  accentFg: "#054d28",
  border: "rgba(14, 15, 12, 0.05)",
};

export default function WiseTheme({ portfolio: initialPortfolio, isEditMode = false }: PortfolioThemeProps) {
  const portfolio = useLiveSync(initialPortfolio, isEditMode);
  const { featured, regular } = splitProjects(portfolio.projects);
  const primarySocials = getPrimarySocials(portfolio.socialLinks, 4);
  const allSocials = portfolio.socialLinks.filter(link => link.visible);
  const displayProjects = featured.length > 0 ? featured : regular.slice(0, 4);

  return (
    <div 
      className="min-h-screen selection:bg-[#9fe870] selection:text-[#054d28]"
      style={{ 
        fontFamily: 'ui-sans-serif, system-ui, -apple-system, sans-serif',
        background: C.canvasSoft,
        color: C.ink
      }}
    >
      {/* Inline styles for global classes specific to Wise theme */}
      <style dangerouslySetInnerHTML={{__html: `
        .wise-accent-bg { background-color: ${C.accent}; color: ${C.accentFg}; }
        .wise-accent-text { color: ${C.accent}; }
        .wise-accent-border { border-color: ${C.accent}; }
        .wise-accent-tint { background-color: color-mix(in srgb, ${C.accent} 10%, transparent); border-color: color-mix(in srgb, ${C.accent} 20%, transparent); }
        .wise-card-border { border: 1px solid ${C.border}; }
        
        @font-face {
          font-family: 'Tosh';
          font-weight: 900;
          src: local('Impact'), local('Arial Black');
        }
      `}} />

      {/* Floating Desktop Nav */}
      <div className="fixed top-6 left-0 right-0 z-50 flex justify-center pointer-events-none px-6">
        <nav className="pointer-events-auto hidden md:flex items-center justify-center gap-8 rounded-[24px] bg-white/70 px-8 py-3 backdrop-blur-md shadow-sm wise-card-border">
          <span className="text-[14px] font-bold text-[#0e0f0c]">
            <EditableField fieldKey="fullName" value={portfolio.fullName || portfolio.name} isEditMode={isEditMode} />
          </span>
          <div className="flex gap-8 items-center">
            {portfolio.projects.length > 0 && <a href="#projects" className="text-[14px] font-bold text-[#454745] hover:text-[#0e0f0c] transition-colors">Projects</a>}
            {portfolio.experiences.length > 0 && <a href="#experience" className="text-[14px] font-bold text-[#454745] hover:text-[#0e0f0c] transition-colors">Experience</a>}
            <a href="#contact" className="text-[14px] font-bold text-[#454745] hover:text-[#0e0f0c] transition-colors">Contact</a>
          </div>
        </nav>
      </div>

      {/* HERO SECTION */}
      <section className="min-h-[90vh] flex flex-col justify-center pt-32 pb-24 relative" style={{ background: C.canvasSoft }}>
        <div className="max-w-[1400px] w-full mx-auto px-6 lg:px-12 grid lg:grid-cols-[1.15fr_0.85fr] gap-12 items-center">
          
          <div className="max-w-3xl">
            <FadeIn delay={0.1}>
              <h1 className="text-6xl sm:text-7xl md:text-[100px] lg:text-[120px] font-black tracking-tight leading-[0.85] mb-8" style={{ color: C.ink }}>
                <EditableField fieldKey="fullName" value={portfolio.fullName || portfolio.name} isEditMode={isEditMode} />
              </h1>
            </FadeIn>
            
            {portfolio.headline && (
              <FadeIn delay={0.22}>
                <div className="text-xl sm:text-2xl font-medium mb-12" style={{ color: C.inkSoft }}>
                  <EditableField fieldKey="headline" value={portfolio.headline} isEditMode={isEditMode} />
                </div>
              </FadeIn>
            )}
            
            <FadeIn delay={0.32}>
              <div className="flex flex-wrap items-center gap-4">
                <a href="#contact" className="inline-flex h-14 items-center justify-center gap-2 rounded-[24px] wise-accent-bg px-8 text-[16px] font-bold transition-transform hover:scale-105 active:scale-95 shadow-lg">
                  Get in touch
                </a>
                {portfolio.showResume && portfolio.resumeUrl && (
                  <a href={portfolio.resumeUrl} target="_blank" rel="noopener noreferrer" className="inline-flex h-14 items-center justify-center gap-2 rounded-[24px] border-2 bg-transparent px-8 text-[16px] font-bold transition-transform hover:scale-105 active:scale-95" style={{ borderColor: C.ink, color: C.ink }}>
                    <FileText className="w-5 h-5" /> Résumé
                  </a>
                )}
              </div>
            </FadeIn>
            
            <FadeIn delay={0.4}>
              <div className="mt-12 flex flex-wrap gap-4">
                {portfolio.location && (
                  <span className="flex items-center gap-2 text-[14px] font-bold" style={{ color: C.inkSoft }}>
                    <MapPin className="w-4 h-4" /> {portfolio.location}
                  </span>
                )}
                {portfolio.email && (
                  <a href={`mailto:${portfolio.email}`} className="flex items-center gap-2 text-[14px] font-bold hover:text-[#0e0f0c] transition-colors" style={{ color: C.inkSoft }}>
                    <Mail className="w-4 h-4" /> {portfolio.email}
                  </a>
                )}
              </div>
            </FadeIn>
          </div>

          <FadeIn delay={0.28} className="hidden lg:block relative">
            {/* Playful abstract hero graphic */}
            <div className="aspect-square w-full max-w-[500px] ml-auto relative">
              <motion.div 
                className="absolute inset-0 rounded-[48px] wise-accent-bg shadow-2xl opacity-20"
                animate={{ rotate: 360 }}
                transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
              />
              <div className="absolute inset-4 rounded-[40px] bg-white shadow-xl wise-card-border p-10 flex flex-col justify-between hover:scale-[1.02] transition-transform duration-500">
                <div className="w-16 h-16 rounded-full wise-accent-bg mb-6 animate-pulse" />
                <div className="space-y-4">
                  <div className="h-6 w-3/4 rounded-full bg-[#e8ebe6]" />
                  <div className="h-6 w-1/2 rounded-full bg-[#e8ebe6]" />
                  <div className="h-6 w-5/6 rounded-full bg-[#e8ebe6]" />
                </div>
                <div className="mt-auto">
                  <div className="text-[11px] font-bold uppercase tracking-widest text-[#868685] mb-2">Metrics</div>
                  <div className="flex gap-4">
                     <div><div className="text-3xl font-black">{portfolio.projects.length}</div><div className="text-[13px] font-bold text-[#868685]">Projects</div></div>
                     <div><div className="text-3xl font-black">{portfolio.experiences.length}</div><div className="text-[13px] font-bold text-[#868685]">Roles</div></div>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ABOUT & SKILLS */}
      <section className="py-24 sm:py-32 border-t wise-card-border" style={{ background: C.canvas }}>
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 grid lg:grid-cols-12 gap-16">
          <div className="lg:col-span-7">
            <FadeIn>
              <h2 className="text-5xl sm:text-7xl font-black tracking-tight mb-10" style={{ color: C.ink }}>
                About Me
              </h2>
            </FadeIn>
            <FadeIn delay={0.1}>
              <div className="text-lg font-medium leading-relaxed whitespace-pre-wrap" style={{ color: C.inkSoft }}>
                <EditableField fieldKey="summary" value={portfolio.summary || portfolio.bio || ""} isEditMode={isEditMode} />
              </div>
            </FadeIn>
            
            {portfolio.skills.length > 0 && (
              <div className="mt-16">
                <FadeIn delay={0.2}>
                  <h3 className="text-4xl sm:text-5xl font-black tracking-tight mb-8" style={{ color: C.ink }}>Tech Stack</h3>
                </FadeIn>
                <div className="flex flex-wrap gap-3">
                  {portfolio.skills.map((skill, idx) => (
                    <FadeIn key={skill.id} delay={0.2 + (idx * 0.05)}>
                      <span className="px-4 py-1.5 rounded-[24px] bg-white/40 border-2 text-[14px] font-bold transition-all hover:scale-105" style={{ borderColor: C.border, color: C.inkSoft }}>
                        <EditableField fieldKey={`skills.${skill._originalIndex}.name`} value={skill.name} isEditMode={isEditMode} />
                      </span>
                    </FadeIn>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="lg:col-span-5 flex flex-col gap-6">
            <FadeIn delay={0.3}>
               <div className="p-8 sm:p-10 rounded-[24px] shadow-sm hover:shadow-xl transition-all wise-card-border group" style={{ background: C.canvasSoft }}>
                 <span className="text-[11px] font-bold uppercase tracking-widest wise-accent-text mb-5 block">
                   Socials
                 </span>
                 <h3 className="text-2xl font-black mb-6" style={{ color: C.ink }}>Connect with me</h3>
                 <div className="flex flex-col gap-3">
                   {allSocials.slice(0, 5).map(link => (
                     <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 rounded-[16px] bg-white hover:-translate-y-1 transition-transform wise-card-border shadow-sm">
                        <span className="font-bold text-[16px]" style={{ color: C.ink }}>{link.label}</span>
                        <ExternalLink className="w-4 h-4" style={{ color: C.mute }} />
                     </a>
                   ))}
                 </div>
               </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* PROJECTS */}
      {portfolio.projects.length > 0 && (
        <section id="projects" className="py-24 sm:py-32 border-t wise-card-border relative" style={{ background: C.canvasSoft }}>
          <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
            <FadeIn>
              <h2 className="text-5xl sm:text-7xl font-black tracking-tight mb-16" style={{ color: C.ink }}>
                Selected Work
              </h2>
            </FadeIn>
            
            <div className="space-y-12 sm:space-y-24">
              {displayProjects.map((project, idx) => (
                <div key={project.id} className="sticky" style={{ top: `${80 + idx * 40}px`, zIndex: 10 + idx }}>
                  <FadeIn delay={0.1}>
                    <div className="p-8 sm:p-10 rounded-[24px] shadow-xl hover:shadow-2xl transition-shadow wise-card-border grid md:grid-cols-2 gap-10 items-center bg-white">
                      <div>
                        <div className="flex items-center gap-3 mb-5">
                          <h3 className="text-3xl font-black" style={{ color: C.ink }}>
                            <EditableField fieldKey={`projects.${project._originalIndex}.title`} value={project.title} isEditMode={isEditMode} />
                          </h3>
                          {project.featured && (
                            <span className="px-3 py-1 rounded-[24px] text-[11px] font-bold uppercase tracking-widest wise-accent-bg">
                              Featured
                            </span>
                          )}
                        </div>
                        <div className="text-lg font-medium leading-relaxed mb-8" style={{ color: C.inkSoft }}>
                          <EditableField fieldKey={`projects.${project._originalIndex}.description`} value={project.description || project.aiSummary || ""} isEditMode={isEditMode} />
                        </div>
                        
                        {Array.isArray(project.techStack) && project.techStack.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-8">
                            {project.techStack.map((tech: unknown, i: number) => (
                              <span key={i} className="px-3.5 py-1.5 rounded-lg text-[13px] font-mono border" style={{ borderColor: C.border, background: "rgba(14, 15, 12, 0.03)", color: C.inkSoft }}>
                                {String(tech)}
                              </span>
                            ))}
                          </div>
                        )}
                        
                        <div className="flex items-center gap-4">
                          {project.liveUrl && (
                            <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="inline-flex h-12 items-center justify-center gap-2 rounded-[24px] wise-accent-bg px-6 text-[14px] font-bold shadow-lg hover:scale-105 active:scale-95 transition-transform">
                              Visit Site <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                          {project.githubUrl && (
                            <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="inline-flex h-12 items-center justify-center gap-2 rounded-[24px] border-2 bg-transparent px-6 text-[14px] font-bold hover:scale-105 active:scale-95 transition-transform" style={{ borderColor: C.border, color: C.ink }}>
                              <Github className="w-4 h-4" /> Code
                            </a>
                          )}
                        </div>
                      </div>
                      
                      <div className="hidden md:block aspect-video rounded-[16px] overflow-hidden relative border" style={{ background: C.canvasSoft, borderColor: C.border }}>
                         <div className="absolute inset-0 opacity-50" style={{ background: `radial-gradient(circle at top right, ${C.accent}, transparent 60%)` }} />
                         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2/3 h-3/4 bg-white rounded-t-xl shadow-2xl border-t border-x p-4" style={{ borderColor: C.border }}>
                            <div className="flex gap-1.5 mb-4">
                               <div className="w-2.5 h-2.5 rounded-full bg-[#d03238]" />
                               <div className="w-2.5 h-2.5 rounded-full bg-[#ffd11a]" />
                               <div className="w-2.5 h-2.5 rounded-full bg-[#2ead4b]" />
                            </div>
                            <div className="w-full h-4 rounded bg-gray-100 mb-2" />
                            <div className="w-3/4 h-4 rounded bg-gray-100 mb-2" />
                            <div className="w-5/6 h-4 rounded bg-gray-100" />
                         </div>
                      </div>
                    </div>
                  </FadeIn>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* EXPERIENCE TIMELINE */}
      {portfolio.showExperience && portfolio.experiences.length > 0 && (
        <section id="experience" className="py-24 sm:py-32 border-t wise-card-border" style={{ background: C.canvas }}>
          <div className="max-w-[896px] mx-auto px-6 lg:px-12">
            <FadeIn>
              <h2 className="text-5xl sm:text-7xl font-black tracking-tight mb-16" style={{ color: C.ink }}>
                Experience
              </h2>
            </FadeIn>
            
            <div className="space-y-12 relative border-l-2 ml-2 sm:ml-0" style={{ borderColor: C.border }}>
              {portfolio.experiences.map((exp, idx) => (
                <div key={exp.id} className="relative pl-8 sm:pl-12">
                  <div className="absolute -left-[11px] top-1.5 w-5 h-5 rounded-full border-4 wise-accent-bg" style={{ borderColor: C.canvas }} />
                  
                  <FadeIn delay={0.1 + (idx * 0.05)}>
                    <div className="p-8 rounded-[24px] shadow-sm hover:shadow-xl transition-shadow wise-card-border bg-white group hover:border-[#0e0f0c]/10">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
                        <h3 className="text-2xl font-black" style={{ color: C.ink }}>
                          <EditableField fieldKey={`experiences.${idx}.role`} value={exp.role} isEditMode={isEditMode} />
                        </h3>
                        <span className="text-[14px] font-bold px-3 py-1 rounded-[24px]" style={{ background: C.canvasSoft, color: C.inkSoft }}>
                          {formatDateRange(exp.startDate, exp.endDate, exp.currentlyWorking)}
                        </span>
                      </div>
                      <div className="text-xl font-medium mb-6 wise-accent-text">
                        <EditableField fieldKey={`experiences.${idx}.company`} value={exp.company} isEditMode={isEditMode} />
                      </div>
                      {exp.description && (
                        <div className="text-[16px] font-medium leading-relaxed whitespace-pre-wrap" style={{ color: C.inkSoft }}>
                          <EditableField fieldKey={`experiences.${idx}.description`} value={exp.description} isEditMode={isEditMode} />
                        </div>
                      )}
                    </div>
                  </FadeIn>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FOOTER & CONTACT */}
      <footer id="contact" className="border-t wise-card-border mt-12 bg-white" style={{ background: C.canvas }}>
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-24 sm:py-32 grid lg:grid-cols-12 gap-16">
          <div className="lg:col-span-7">
            <FadeIn>
              <h2 className="text-5xl sm:text-7xl font-black tracking-tight mb-8" style={{ color: C.ink }}>
                Let's Build Something.
              </h2>
            </FadeIn>
            <FadeIn delay={0.1}>
              <p className="text-xl font-medium mb-12 max-w-xl" style={{ color: C.inkSoft }}>
                I'm currently available for new opportunities. Whether you have a question or just want to say hi, I'll try my best to get back to you!
              </p>
              <a href={`mailto:${portfolio.email || "#"}`} className="inline-flex h-14 items-center justify-center gap-2 rounded-[24px] wise-accent-bg px-8 text-[16px] font-bold transition-transform hover:scale-105 active:scale-95 shadow-lg">
                Say Hello <ExternalLink className="w-5 h-5" />
              </a>
            </FadeIn>
          </div>
          
          <div className="lg:col-span-5 flex flex-col justify-end">
             <div className="flex flex-wrap gap-4 mb-16">
               {allSocials.map((link, idx) => (
                 <FadeIn key={link.id} delay={0.2 + (idx * 0.1)}>
                   <a href={link.url} target="_blank" rel="noopener noreferrer" className="inline-flex h-12 items-center justify-center rounded-[24px] px-6 text-[14px] font-bold transition-transform hover:-translate-y-1" style={{ background: "rgba(14,15,12,0.05)", color: C.ink }}>
                     {link.label}
                   </a>
                 </FadeIn>
               ))}
             </div>
             
             <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t" style={{ borderColor: C.border }}>
               <span className="text-[14px] font-bold" style={{ color: C.mute }}>
                 © {new Date().getFullYear()} {portfolio.fullName || portfolio.name}
               </span>
               <span className="text-[14px] font-bold flex items-center gap-1" style={{ color: C.mute }}>
                 Powered by <Link href="/" className="hover:text-[#0e0f0c] transition-colors" style={{ color: C.inkSoft }}>makeurfolio</Link>
               </span>
             </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
