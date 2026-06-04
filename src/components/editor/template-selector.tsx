"use client";
import React, { useState, useRef, useEffect } from "react";
import { useEditor } from "./editor-context";
import { CheckCircle2, ChevronDown, LayoutTemplate } from "lucide-react";
import { templates, CATEGORY_LABELS, CATEGORY_COLORS, type TemplateCategory } from "@/src/templates/template-manifest";


// Group templates by category
const grouped = templates.reduce<Record<TemplateCategory, typeof templates>>((acc, t) => {
  if (!acc[t.category]) acc[t.category] = [];
  acc[t.category].push(t);
  return acc;
}, {} as Record<TemplateCategory, typeof templates>);

export function TemplateSelector() {
  const { portfolio, updateField } = useEditor();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  if (!portfolio) return null;

  const currentTemplateId = portfolio.templateId || null;
  const currentTemplate = currentTemplateId ? templates.find(t => t.id === currentTemplateId) : null;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const selectTemplate = (id: string | null) => {
    updateField("templateId", id);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* ── Trigger ── */}
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all text-left bg-card-bg border-border hover:border-foreground/30 hover:bg-input-bg"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <LayoutTemplate className="w-4 h-4 shrink-0 text-secondary" />
        <span className="flex-1 min-w-0">
          {currentTemplate ? (
            <>
              <span className="block text-sm font-semibold text-foreground truncate">{currentTemplate.name}</span>
              <span className="block text-[10px] truncate mt-0.5" style={{ color: CATEGORY_COLORS[currentTemplate.category] }}>
                {CATEGORY_LABELS[currentTemplate.category]}
              </span>
            </>
          ) : (
            <>
              <span className="block text-sm font-semibold text-secondary truncate">No template</span>
              <span className="block text-[10px] text-secondary/40 mt-0.5">Using theme layout</span>
            </>
          )}
        </span>
        <ChevronDown className={`w-4 h-4 text-secondary shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {/* ── Dropdown ── */}
      {open && (
        <div
          role="listbox"
          className="absolute z-50 top-full left-0 right-0 mt-2 rounded-xl border border-border bg-card-bg overflow-hidden"
          style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.35), 0 2px 8px rgba(0,0,0,0.2)" }}
        >
          {/* Header */}
          <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border/60">
            <LayoutTemplate className="w-3.5 h-3.5 text-secondary" />
            <span className="text-[11px] font-semibold text-secondary uppercase tracking-widest">Templates</span>
            <span className="ml-auto text-[10px] text-secondary/40 font-medium">{templates.length} layouts</span>
          </div>

          {/* No template option */}
          <button
            role="option"
            aria-selected={!currentTemplateId}
            onClick={() => selectTemplate(null)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 text-left border-b border-border/30 transition-colors ${!currentTemplateId ? "bg-input-bg" : "hover:bg-input-bg/60"}`}
          >
            <span className="w-2.5 h-2.5 rounded-full shrink-0 bg-secondary/30" />
            <span className="flex-1 min-w-0">
              <span className={`block text-sm font-medium truncate ${!currentTemplateId ? "text-foreground" : "text-secondary"}`}>None</span>
              <span className="block text-[10px] text-secondary/40 truncate mt-0.5">Fall back to selected theme</span>
            </span>
            {!currentTemplateId && <CheckCircle2 className="w-4 h-4 text-foreground shrink-0" />}
          </button>

          {/* Grouped template rows */}
          <div className="max-h-80 overflow-y-auto py-1">
            {(Object.keys(grouped) as TemplateCategory[]).map(cat => (
              <div key={cat}>
                {/* Category divider */}
                <div className="px-3 py-2 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: CATEGORY_COLORS[cat] }} />
                  <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: CATEGORY_COLORS[cat] }}>
                    {CATEGORY_LABELS[cat]}
                  </span>
                </div>
                {grouped[cat].map(template => {
                  const isSelected = currentTemplateId === template.id;
                  return (
                    <button
                      key={template.id}
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => selectTemplate(template.id)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${isSelected ? "bg-input-bg" : "hover:bg-input-bg/60"}`}
                    >
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: isSelected ? CATEGORY_COLORS[cat] : "rgba(255,255,255,0.12)" }} />
                      <span className="flex-1 min-w-0">
                        <span className={`block text-sm font-medium truncate ${isSelected ? "text-foreground" : "text-secondary"}`}>{template.name}</span>
                        <span className="block text-[10px] text-secondary/40 truncate mt-0.5">{template.tagline}</span>
                      </span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-foreground shrink-0" />}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
