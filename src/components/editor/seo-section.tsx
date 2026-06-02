"use client";

import React from "react";
import { useEditor } from "./editor-context";

export function SEOSection() {
  const { portfolio, updateField } = useEditor();

  if (!portfolio) return null;

  return (
    <div className="space-y-6">
      <div className="bg-input-bg border border-border/40 rounded-xl p-6">
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Meta Title</label>
            <input
              type="text"
              value={portfolio.metaTitle || ""}
              onChange={(e) => updateField("metaTitle", e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border/40 rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-foreground/50 transition-shadow"
              placeholder="Default: [Full Name] - Portfolio"
            />
            <p className="text-xs text-secondary/70">
              The title displayed on search engines and browser tabs.
            </p>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Meta Description</label>
            <textarea
              value={portfolio.metaDescription || ""}
              onChange={(e) => updateField("metaDescription", e.target.value)}
              rows={3}
              className="w-full px-3 py-2 bg-background border border-border/40 rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-foreground/50 transition-shadow resize-y"
              placeholder="A brief description of your portfolio for search engines..."
            />
            <p className="text-xs text-secondary/70">
              Recommended length: 150-160 characters.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
