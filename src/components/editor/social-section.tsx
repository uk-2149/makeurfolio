"use client";

import React from "react";
import { useEditor } from "./editor-context";
import { Link as LinkIcon, Globe } from "lucide-react";

export function SocialSection() {
  const { portfolio, updateField } = useEditor();

  if (!portfolio) return null;

  return (
    <div className="bg-input-bg border border-border/40 rounded-xl p-6">
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-background border border-border/40 rounded-lg text-secondary">
            <LinkIcon className="w-5 h-5" />
          </div>
          <div className="flex-1 space-y-1">
            <label className="text-xs font-medium text-foreground">GitHub URL</label>
            <input
              type="text"
              value={portfolio.githubUrl || ""}
              onChange={(e) => updateField("githubUrl", e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border/40 rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-foreground/50 transition-shadow"
              placeholder="https://github.com/username"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="p-2 bg-background border border-border/40 rounded-lg text-secondary">
            <LinkIcon className="w-5 h-5" />
          </div>
          <div className="flex-1 space-y-1">
            <label className="text-xs font-medium text-foreground">LinkedIn URL</label>
            <input
              type="text"
              value={portfolio.linkedinUrl || ""}
              onChange={(e) => updateField("linkedinUrl", e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border/40 rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-foreground/50 transition-shadow"
              placeholder="https://linkedin.com/in/username"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="p-2 bg-background border border-border/40 rounded-lg text-secondary">
            <LinkIcon className="w-5 h-5" />
          </div>
          <div className="flex-1 space-y-1">
            <label className="text-xs font-medium text-foreground">Twitter / X URL</label>
            <input
              type="text"
              value={portfolio.twitterUrl || ""}
              onChange={(e) => updateField("twitterUrl", e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border/40 rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-foreground/50 transition-shadow"
              placeholder="https://twitter.com/username"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="p-2 bg-background border border-border/40 rounded-lg text-secondary">
            <Globe className="w-5 h-5" />
          </div>
          <div className="flex-1 space-y-1">
            <label className="text-xs font-medium text-foreground">Personal Website</label>
            <input
              type="text"
              value={portfolio.websiteUrl || ""}
              onChange={(e) => updateField("websiteUrl", e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border/40 rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-foreground/50 transition-shadow"
              placeholder="https://mywebsite.com"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
