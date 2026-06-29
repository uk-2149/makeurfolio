"use client";

import React from "react";
import { useEditor } from "./editor-context";

export function UrlSection() {
  const { portfolio, updateField } = useEditor();

  if (!portfolio) return null;

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-foreground mb-1">URL</h2>
        <p className="text-sm text-secondary">Manage your portfolio's web address.</p>
      </div>
      <div className="bg-input-bg border border-border/40 rounded-xl p-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Custom URL</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={portfolio.slug || ""}
              onChange={(e) => updateField("slug", e.target.value)}
              className="flex-1 px-3 py-2 bg-background border border-border/40 rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-foreground/50 transition-shadow text-right"
              placeholder="e.g. john-doe"
            />
            <span className="text-sm text-secondary whitespace-nowrap bg-background border border-border/40 px-3 py-2 rounded-lg font-mono">
              .makeurfolio.com
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
