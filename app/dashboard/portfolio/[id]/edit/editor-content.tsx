"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Save, RotateCcw, Loader2, ExternalLink } from "lucide-react";
import { useEditor } from "@/src/components/editor/editor-context";
import { EditorSidebar } from "@/src/components/editor/sidebar";
import { ProfileSection } from "@/src/components/editor/profile-section";
import { SocialSection } from "@/src/components/editor/social-section";
import { SEOSection } from "@/src/components/editor/seo-section";
import { SkillsSection } from "@/src/components/editor/skills-section";
import { ExperienceSection } from "@/src/components/editor/experience-section";
import { EducationSection } from "@/src/components/editor/education-section";
import { ProjectsSection } from "@/src/components/editor/projects-section";
import { CertificationsSection } from "@/src/components/editor/certifications-section";
import { AchievementsSection } from "@/src/components/editor/achievements-section";

export function EditorContent() {
  const { 
    portfolio, 
    isLoading, 
    isSaving, 
    hasUnsavedChanges, 
    saveChanges, 
    discardChanges 
  } = useEditor();
  
  const [activeSection, setActiveSection] = useState("profile");

  // Intersection Observer for scroll spy logic can be added here
  useEffect(() => {
    const handleScroll = () => {
      const sections = ["profile", "social", "experience", "education", "skills", "projects", "certifications", "achievements", "seo"];
      for (const section of sections) {
        const el = document.getElementById(`section-${section}`);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top >= 0 && rect.top <= 300) {
            setActiveSection(section);
            break;
          }
        }
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-secondary" />
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-secondary">Portfolio not found or unauthorized.</p>
        <Link href="/dashboard" className="text-foreground underline">Back to Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
      {/* Sticky Header */}
      <header className="sticky top-0 z-40 bg-background/85 backdrop-blur-md border-b border-border/40 py-4 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              href="/dashboard"
              className="p-2 hover:bg-border/40 rounded-md transition-colors text-secondary hover:text-foreground"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-lg font-semibold text-foreground truncate max-w-[200px] sm:max-w-md">
                {portfolio.name}
              </h1>
              <p className="text-xs text-secondary flex items-center gap-2">
                {hasUnsavedChanges ? (
                  <span className="text-amber-500 font-medium">Unsaved changes</span>
                ) : (
                  <span className="text-emerald-500">Saved</span>
                )}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Link 
              href={`/portfolio/${portfolio.slug}`}
              target="_blank"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-secondary hover:text-foreground hover:bg-border/40 rounded-md transition-colors"
            >
              Preview <ExternalLink className="w-3.5 h-3.5" />
            </Link>
            
            <button
              onClick={discardChanges}
              disabled={!hasUnsavedChanges || isSaving}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                hasUnsavedChanges && !isSaving
                  ? "text-foreground bg-input-bg hover:bg-border/60"
                  : "text-secondary/40 cursor-not-allowed"
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Discard
            </button>
            
            <button
              onClick={saveChanges}
              disabled={!hasUnsavedChanges || isSaving}
              className={`flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium rounded-md shadow-sm transition-colors ${
                hasUnsavedChanges && !isSaving
                  ? "bg-foreground text-background hover:bg-foreground/90"
                  : "bg-foreground/50 text-background/50 cursor-not-allowed"
              }`}
            >
              {isSaving ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </header>

      <div className="flex gap-12">
        <EditorSidebar activeSection={activeSection} setActiveSection={setActiveSection} />
        
        <main className="flex-1 space-y-24">
          <div id="section-profile" className="scroll-mt-28 min-h-[50vh]">
            <h2 className="text-xl font-semibold mb-6">Profile</h2>
            <ProfileSection />
          </div>
          
          <div id="section-social" className="scroll-mt-28 min-h-[50vh]">
            <h2 className="text-xl font-semibold mb-6">Social Links</h2>
            <SocialSection />
          </div>
          
          <div id="section-experience" className="scroll-mt-28 min-h-[50vh]">
            <h2 className="text-xl font-semibold mb-6">Experience</h2>
            <ExperienceSection />
          </div>

          <div id="section-education" className="scroll-mt-28 min-h-[50vh]">
            <h2 className="text-xl font-semibold mb-6">Education</h2>
            <EducationSection />
          </div>
          
          <div id="section-skills" className="scroll-mt-28 min-h-[50vh]">
            <h2 className="text-xl font-semibold mb-6">Skills</h2>
            <SkillsSection />
          </div>

          <div id="section-projects" className="scroll-mt-28 min-h-[50vh]">
            <h2 className="text-xl font-semibold mb-6">Projects</h2>
            <ProjectsSection />
          </div>
          
          <div id="section-certifications" className="scroll-mt-28 min-h-[50vh]">
            <h2 className="text-xl font-semibold mb-6">Certifications</h2>
            <CertificationsSection />
          </div>

          <div id="section-achievements" className="scroll-mt-28 min-h-[50vh]">
            <h2 className="text-xl font-semibold mb-6">Achievements</h2>
            <AchievementsSection />
          </div>
          
          <div id="section-seo" className="scroll-mt-28 min-h-[50vh]">
            <h2 className="text-xl font-semibold mb-6">SEO & Meta</h2>
            <SEOSection />
          </div>
        </main>
      </div>
    </div>
  );
}
