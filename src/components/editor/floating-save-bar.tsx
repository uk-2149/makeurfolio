"use client";
import React from "react";
import { Save, RotateCcw, Loader2 } from "lucide-react";
import { useEditor } from "./editor-context";

/**
 * FloatingSaveBar — Slides up from the bottom when there are unsaved changes.
 * Provides a highly visible Save + Discard action accessible from anywhere on
 * the editor page without scrolling back to the top header.
 */
export function FloatingSaveBar() {
  const { hasUnsavedChanges, isSaving, saveChanges, discardChanges } = useEditor();

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 flex justify-center px-4 pb-6 pointer-events-none"
      aria-live="polite"
    >
      <div
        className={`pointer-events-auto flex items-center gap-3 px-5 py-3 rounded-2xl border shadow-2xl backdrop-blur-md transition-all duration-300 ${
          hasUnsavedChanges
            ? "translate-y-0 opacity-100"
            : "translate-y-16 opacity-0"
        }`}
        style={{
          background: "rgba(10, 10, 12, 0.88)",
          border: "1px solid rgba(255,255,255,0.12)",
          boxShadow: "0 8px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05)",
        }}
      >
        {/* Unsaved dot indicator */}
        <span className="flex items-center gap-2 text-sm font-medium text-white/80 mr-1">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          Unsaved changes
        </span>

        <div className="w-px h-4 bg-white/15" />

        {/* Discard */}
        <button
          onClick={discardChanges}
          disabled={isSaving}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium text-white/60 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-40"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Discard
        </button>

        {/* Save */}
        <button
          onClick={saveChanges}
          disabled={isSaving}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-60"
          style={{
            background: isSaving ? "rgba(255,255,255,0.15)" : "#ffffff",
            color: isSaving ? "rgba(255,255,255,0.5)" : "#09090b",
          }}
        >
          {isSaving ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Save className="w-3.5 h-3.5" />
          )}
          {isSaving ? "Saving…" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
