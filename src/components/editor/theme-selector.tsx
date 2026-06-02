"use client";
import React from "react";
import { useEditor } from "./editor-context";
import { CheckCircle2 } from "lucide-react";
const THEMES = [
  {
    id: "minimal-editorial",
    name: "Minimal Editorial",
    description: "Clean, elegant, and highly readable typography.",
    thumbnail: "bg-input-bg border border-border/60" // we'll just style a fake thumbnail for now
  }
];
export function ThemeSelector() {
  const { portfolio, updateField } = useEditor();
  if (!portfolio) return null;
  const currentThemeId = portfolio.themeId || "minimal-editorial";
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-4">
      {THEMES.map((theme) => {
        const isSelected = currentThemeId === theme.id;
        
        return (
          <button
            key={theme.id}
            onClick={() => updateField("themeId", theme.id)}
            className={`w-full group flex flex-col items-start gap-3 p-3 rounded-xl border transition-all text-left ${
              isSelected 
                ? "bg-input-bg border-foreground shadow-sm ring-1 ring-foreground" 
                : "bg-card-bg border-border/40 hover:border-border hover:bg-input-bg/50"
            }`}
          >
            {/* Thumbnail Mockup */}
            <div className={`w-full aspect-video rounded-lg ${theme.thumbnail} relative overflow-hidden flex flex-col p-3 gap-2 opacity-80 group-hover:opacity-100 transition-opacity`}>
              {/* Fake UI lines */}
              <div className="w-1/2 h-2 bg-foreground/20 rounded-full" />
              <div className="w-3/4 h-6 bg-foreground/10 rounded-sm mt-2" />
              <div className="flex gap-2 mt-auto">
                <div className="w-8 h-8 bg-foreground/10 rounded-sm" />
                <div className="w-8 h-8 bg-foreground/10 rounded-sm" />
              </div>
            </div>
            
            <div className="w-full flex items-center justify-between">
              <div className="flex flex-col">
                <span className={`text-sm font-semibold tracking-tight ${isSelected ? "text-foreground" : "text-secondary"}`}>
                  {theme.name}
                </span>
                <span className="text-[10px] text-secondary/60 line-clamp-1">{theme.description}</span>
              </div>
              {isSelected && <CheckCircle2 className="w-4 h-4 text-foreground shrink-0" />}
            </div>
          </button>
        );
      })}
      <div className="pt-4 text-center col-span-full">
        <span className="text-xs text-secondary/40 font-medium">More themes coming soon...</span>
      </div>
    </div>
  );
}