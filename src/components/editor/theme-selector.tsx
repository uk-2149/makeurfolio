"use client";
import React, { useState, useRef, useEffect } from "react";
import { useEditor } from "./editor-context";
import { CheckCircle2, ChevronDown, Palette } from "lucide-react";
import { themes } from "@/src/themes/theme-manifest";

/** A small colored accent dot for quick visual identification per theme. */
const THEME_ACCENTS: Record<string, string> = {
  "minimal-editorial": "#111111",
  "founder-os":        "#6366f1",
  "vercel":            "#007cf0",
  "linear":            "#5e6ad2",
  "stripe":            "#533afd",
  "raycast":           "#ff5757",
  "notion":            "#5645d4",
  "wise":              "#9fe870",
};

export function ThemeSelector() {
  const { portfolio, updateField } = useEditor();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  if (!portfolio) return null;
  const currentThemeId = portfolio.themeId || "minimal-editorial";
  const currentTheme = themes.find((t) => t.id === currentThemeId) ?? themes[0];

  // Close when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const standardThemes = themes.filter((t) => t.group === "standard" || !t.group);
  const exclusiveThemes = themes.filter((t) => t.group === "exclusive");

  const renderThemeGroup = (groupThemes: typeof themes, title: string) => {
    if (groupThemes.length === 0) return null;
    return (
      <div className="mb-2 last:mb-0">
        <div className="px-3 py-1.5 text-[10px] font-bold text-secondary uppercase tracking-widest bg-card-bg sticky top-0 z-10">
          {title}
        </div>
        {groupThemes.map((theme) => {
          const isSelected = currentThemeId === theme.id;
          return (
            <button
              key={theme.id}
              role="option"
              aria-selected={isSelected}
              onClick={() => {
                updateField("themeId", theme.id);
                setOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 transition-colors text-left group ${
                isSelected
                  ? "bg-input-bg"
                  : "hover:bg-input-bg/60"
              }`}
            >
              {/* Accent dot */}
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0 ring-1 ring-white/10"
                style={{ background: THEME_ACCENTS[theme.id] ?? "#888" }}
              />

              {/* Labels */}
              <span className="flex-1 min-w-0">
                <span className={`block text-sm font-medium truncate ${isSelected ? "text-foreground" : "text-secondary"}`}>
                  {theme.name}
                </span>
                <span className="block text-[10px] text-secondary/40 truncate leading-tight mt-0.5">
                  {theme.description}
                </span>
              </span>

              {/* Checkmark */}
              {isSelected && (
                <CheckCircle2 className="w-4 h-4 text-foreground shrink-0" />
              )}
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div ref={containerRef} className="relative w-full">

      {/* ── Trigger button ── */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all text-left bg-card-bg border-border hover:border-foreground/30 hover:bg-input-bg"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {/* Accent dot */}
        <span
          className="w-3 h-3 rounded-full shrink-0 ring-1 ring-white/10"
          style={{ background: THEME_ACCENTS[currentThemeId] ?? "#888" }}
        />

        <span className="flex-1 min-w-0">
          <span className="block text-sm font-semibold text-foreground truncate">
            {currentTheme.name}
          </span>
          <span className="block text-[10px] text-secondary/50 truncate leading-tight mt-0.5">
            {currentTheme.description}
          </span>
        </span>

        <ChevronDown
          className={`w-4 h-4 text-secondary shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* ── Floating dropdown ── */}
      {open && (
        <div
          role="listbox"
          className="absolute z-50 top-full left-0 right-0 mt-2 rounded-xl border border-border bg-card-bg shadow-2xl overflow-hidden"
          style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.35), 0 2px 8px rgba(0,0,0,0.2)" }}
        >
          {/* Header */}
          <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border/60">
            <Palette className="w-3.5 h-3.5 text-secondary" />
            <span className="text-[11px] font-semibold text-secondary uppercase tracking-widest">
              Choose Theme
            </span>
            <span className="ml-auto text-[10px] text-secondary/40 font-medium">
              {themes.length} available
            </span>
          </div>

          {/* Theme rows */}
          <div className="py-1 max-h-72 overflow-y-auto relative">
            {renderThemeGroup(standardThemes, "Standard Themes")}
            {renderThemeGroup(exclusiveThemes, "Exclusive Themes")}
          </div>
        </div>
      )}
    </div>
  );
}