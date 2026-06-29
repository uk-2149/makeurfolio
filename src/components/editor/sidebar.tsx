"use client";

import React from "react";
import { 
  User, 
  Link as LinkIcon, 
  Briefcase, 
  GraduationCap, 
  Code2, 
  FolderGit2, 
  Award, 
  Trophy,
  Search,
  Globe
} from "lucide-react";

interface SidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

export function EditorSidebar({ activeSection, setActiveSection }: SidebarProps) {
  const sections = [
    { id: "url", label: "URL", icon: <Globe className="w-4 h-4" /> },
    { id: "profile", label: "Profile", icon: <User className="w-4 h-4" /> },
    { id: "social", label: "Social Links", icon: <LinkIcon className="w-4 h-4" /> },
    { id: "experience", label: "Experience", icon: <Briefcase className="w-4 h-4" /> },
    { id: "education", label: "Education", icon: <GraduationCap className="w-4 h-4" /> },
    { id: "skills", label: "Skills", icon: <Code2 className="w-4 h-4" /> },
    { id: "projects", label: "Projects", icon: <FolderGit2 className="w-4 h-4" /> },
    { id: "certifications", label: "Certifications", icon: <Award className="w-4 h-4" /> },
    { id: "achievements", label: "Achievements", icon: <Trophy className="w-4 h-4" /> },
    { id: "seo", label: "SEO & Meta", icon: <Search className="w-4 h-4" /> },
  ];

  return (
    <aside className="w-full">
      <div className="space-y-1">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => {
              setActiveSection(section.id);
              // Smooth scroll to element
              document.getElementById(`section-${section.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeSection === section.id
                ? "bg-foreground text-background shadow-sm"
                : "text-secondary hover:bg-border/40 hover:text-foreground"
            }`}
          >
            {section.icon}
            {section.label}
          </button>
        ))}
      </div>
    </aside>
  );
}
