"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, RotateCcw, Loader2, ExternalLink, Trash2, AlertTriangle, MonitorPlay, FileText } from "lucide-react";
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
import { ThemeSelector } from "@/src/components/editor/theme-selector";
import { TemplateSelector } from "@/src/components/editor/template-selector";
import { LivePreviewIframe } from "@/src/components/editor/live-preview-iframe";
import { getPortfolioUrl } from "@/src/lib/portfolio-url";

export function EditorContent() {
  const { 
    portfolio, 
    isLoading, 
    isSaving, 
    hasUnsavedChanges, 
    saveChanges, 
    discardChanges 
  } = useEditor();
  
  const router = useRouter();
  const [activeSection, setActiveSection] = useState("profile");
  const [rightTab, setRightTab] = useState<"theme" | "template">("theme");
  const [viewMode, setViewMode] = useState<"form" | "visual">("form");
  
  // Deletion States
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const executeDelete = async () => {
    if (!portfolio?.id) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/editor/portfolio/${portfolio.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setDeleteModalOpen(false);
        router.push("/dashboard");
      } else {
        alert(data.error?.message || "Failed to delete portfolio");
      }
    } catch (err) {
      console.error(err);
      alert("Network error deleting portfolio");
    } finally {
      setIsDeleting(false);
    }
  };

  // Intersection Observer for scroll spy logic can be added here
  useEffect(() => {
    if (viewMode === "visual") return;
    
    const handleScroll = () => {
      const sections = [
        "profile", "social", "experience", "education", 
        "skills", "projects", "certifications", "achievements", "seo"
      ];
      
      const container = document.getElementById("editor-scroll-container");
      if (!container) return;

      let currentSection = sections[0];
      const containerRect = container.getBoundingClientRect();
      
      for (const section of sections) {
        const element = document.getElementById(`section-${section}`);
        if (element) {
          const rect = element.getBoundingClientRect();
          // Adjust offset as needed based on container position
          if (rect.top >= 0 && rect.top <= 300) {
            setActiveSection(section);
            break;
          }
          // Calculate distance from the top of the scrollable container
          const relativeTop = rect.top - containerRect.top;
          
          // If the section is near or above the top of the container
          if (relativeTop <= 150) {
            currentSection = section;
          }
        }
      }
      setActiveSection(currentSection);
    };
    const container = document.getElementById("editor-scroll-container");
    if (container) {
      container.addEventListener("scroll", handleScroll, { passive: true });
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, [viewMode, isLoading]);

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
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      {/* Sticky Header */}
      <header className="shrink-0 z-40 bg-background border-b border-border/40 p-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto w-full">
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
          
          <div className="flex items-center gap-2">
            
            <button
              onClick={() => setViewMode(viewMode === "form" ? "visual" : "form")}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-secondary hover:text-foreground hover:bg-border/40 rounded-md transition-colors"
            >
              {viewMode === "form" ? (
                <><MonitorPlay className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Visual Editor</span></>
              ) : (
                <><FileText className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Form Editor</span></>
              )}
            </button>
            
            <Link 
              href={getPortfolioUrl(portfolio.slug)}
              target="_blank"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-secondary hover:text-foreground hover:bg-border/40 rounded-md transition-colors"
              title="Open Live Site"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            <div className="w-px h-5 bg-border mx-1" />

            <button
              onClick={() => setDeleteModalOpen(true)}
              className="p-2 text-secondary hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors"
              title="Delete Portfolio"
            >
              <Trash2 className="w-4 h-4" />
            </button>

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
              {isSaving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </header>

      {/* Main Area: Conditional Rendering based on viewMode */}
      {viewMode === "form" ? (
        <div id="editor-scroll-container" className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="max-w-7xl mx-auto p-4 sm:p-8 flex flex-col lg:flex-row gap-12 lg:gap-16 xl:gap-20 justify-between">
            
            {/* Sidebar Navigation */}
            <div className="w-full lg:w-64 shrink-0 order-2 lg:order-1">
              <div className="sticky top-8">
                <EditorSidebar activeSection={activeSection} setActiveSection={setActiveSection} />
              </div>
            </div>

            {/* Main Form Content */}
            <main className="flex-1 space-y-12 order-3 lg:order-2 max-w-3xl">
              <div id="section-profile" className="scroll-mt-8">
                  <ProfileSection />
              </div>
              
              <div id="section-social" className="scroll-mt-8">
                  <SocialSection />
              </div>
              
              <div id="section-experience" className="scroll-mt-8">
                  <ExperienceSection />
              </div>

              <div id="section-education" className="scroll-mt-8">
                  <EducationSection />
              </div>
              
              <div id="section-skills" className="scroll-mt-8">
                  <SkillsSection />
              </div>

              <div id="section-projects" className="scroll-mt-8">
                  <ProjectsSection />
              </div>
              
              <div id="section-certifications" className="scroll-mt-8">
                  <CertificationsSection />
              </div>

              <div id="section-achievements" className="scroll-mt-8">
                  <AchievementsSection />
              </div>
              
              <div id="section-seo" className="scroll-mt-8">
                  <SEOSection />
              </div>
            </main>

            {/* Appearance Panel */}
            <div className="w-full lg:w-64 shrink-0 order-1 lg:order-3 mb-8 lg:mb-0">
              <div className="sticky top-8">
                <div className="flex gap-1 p-1 rounded-xl mb-6 w-full bg-border/40 border border-border/50 shadow-sm">
                    <button
                        onClick={() => setRightTab("theme")}
                        className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                        rightTab === "theme"
                            ? "bg-foreground text-background shadow-sm"
                            : "text-secondary hover:text-foreground"
                        }`}
                    >
                        Theme
                    </button>
                    <button
                        onClick={() => setRightTab("template")}
                        className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                        rightTab === "template"
                            ? "bg-foreground text-background shadow-sm"
                            : "text-secondary hover:text-foreground"
                        }`}
                    >
                        Template
                    </button>
                </div>

                {rightTab === "theme" ? <ThemeSelector /> : <TemplateSelector />}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 w-full bg-card-bg relative z-10">
          <LivePreviewIframe slug={portfolio.slug} />
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && portfolio && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-sm bg-card-bg rounded-xl border border-border shadow-xl p-6">
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Delete Portfolio</h3>
            <p className="text-sm text-secondary mb-6 leading-relaxed">
              Are you sure you want to delete <span className="font-semibold text-foreground">{portfolio.name}</span>? This action cannot be undone and will permanently remove this portfolio from the internet.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button 
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-secondary hover:text-foreground hover:bg-input-bg transition-colors"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button 
                onClick={executeDelete}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition-colors flex items-center gap-2"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <><div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> Deleting...</>
                ) : (
                  <>Delete</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
