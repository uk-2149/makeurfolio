"use client";

import React from "react";
import { useEditor } from "./editor-context";

export function ProfileSection() {
  const { portfolio, updateField } = useEditor();

  if (!portfolio) return null;

  return (
    <div className="space-y-6">
      <div className="bg-input-bg border border-border/40 rounded-xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Portfolio Name</label>
            <input
              type="text"
              value={portfolio.name || ""}
              onChange={(e) => updateField("name", e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border/40 rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-foreground/50 transition-shadow"
              placeholder="e.g. My Developer Space"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Full Name</label>
            <input
              type="text"
              value={portfolio.fullName || ""}
              onChange={(e) => updateField("fullName", e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border/40 rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-foreground/50 transition-shadow"
              placeholder="e.g. John Doe"
            />
          </div>
          
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-foreground">Headline</label>
            <input
              type="text"
              value={portfolio.headline || ""}
              onChange={(e) => updateField("headline", e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border/40 rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-foreground/50 transition-shadow"
              placeholder="e.g. Senior Full-Stack Engineer"
            />
          </div>
          
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-foreground">Bio / About Me</label>
            <textarea
              value={portfolio.bio || ""}
              onChange={(e) => updateField("bio", e.target.value)}
              rows={4}
              className="w-full px-3 py-2 bg-background border border-border/40 rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-foreground/50 transition-shadow resize-y"
              placeholder="A short description about yourself..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Email</label>
            <input
              type="email"
              value={portfolio.email || ""}
              onChange={(e) => updateField("email", e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border/40 rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-foreground/50 transition-shadow"
              placeholder="john@example.com"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Location</label>
            <input
              type="text"
              value={portfolio.location || ""}
              onChange={(e) => updateField("location", e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border/40 rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-foreground/50 transition-shadow"
              placeholder="San Francisco, CA"
            />
          </div>
          
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-foreground">Avatar URL</label>
            <input
              type="text"
              value={portfolio.avatarUrl || ""}
              onChange={(e) => updateField("avatarUrl", e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border/40 rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-foreground/50 transition-shadow"
              placeholder="https://github.com/username.png"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
