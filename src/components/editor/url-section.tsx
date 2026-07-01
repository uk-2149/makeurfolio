"use client";

import React, { useEffect } from "react";
import { useEditor } from "./editor-context";
import { getPortfolioUrl } from "@/src/lib/portfolio-url";
import { normalizeSlug } from "@/src/lib/slug";
import { useSlugAvailability } from "@/src/hooks/use-slug-availability";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, AlertTriangle, Loader2 } from "lucide-react";

export function UrlSection() {
  const { portfolio, initialPortfolio, updateField, setSaveBlocker } = useEditor();
  const slug = portfolio?.slug || "";
  const initialSlug = initialPortfolio?.slug;
  const { status, message, suggestions, forceStatus } = useSlugAvailability(slug, initialSlug);

  // Sync blocker to context
  useEffect(() => {
    if (status === "checking") {
      setSaveBlocker("slug", "Checking URL availability...");
    } else if (status === "invalid") {
      setSaveBlocker("slug", "Invalid URL");
    } else if (status === "reserved") {
      setSaveBlocker("slug", "URL is reserved");
    } else if (status === "taken") {
      setSaveBlocker("slug", "URL Already Taken");
    } else if (status === "error") {
      setSaveBlocker("slug", "Failed to verify URL");
    } else {
      setSaveBlocker("slug", null);
    }
  }, [status, setSaveBlocker]);

  if (!portfolio) return null;

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    updateField("slug", normalizeSlug(raw));
  };

  const applySuggestion = (suggestion: string) => {
    updateField("slug", suggestion);
    forceStatus("checking", undefined);
  };

  // Character counter logic
  const charCount = slug.length;
  const maxChars = 40;
  let counterColor = "text-secondary/60";
  if (charCount >= maxChars) counterColor = "text-red-500";
  else if (charCount >= maxChars - 2) counterColor = "text-amber-500";

  return (
    <div className="space-y-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-1">URL</h2>
          <p className="text-sm text-secondary">Manage your portfolio&apos;s web address.</p>
        </div>
        <div className={`text-xs font-mono font-medium ${counterColor}`}>
          {charCount} / {maxChars}
        </div>
      </div>
      
      <div className="bg-input-bg border border-border/40 rounded-xl p-6">
        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground">Custom URL</label>
          
          <div className="relative">
            <input
              type="text"
              value={slug}
              onChange={handleSlugChange}
              aria-invalid={status === "invalid" || status === "reserved" || status === "taken"}
              className={`w-full px-4 py-3 bg-background border rounded-lg text-base text-foreground focus:outline-none transition-shadow pr-12
                ${(status === "invalid" || status === "reserved" || status === "taken")
                  ? "border-red-500/50 focus:ring-1 focus:ring-red-500/50" 
                  : "border-border/40 focus:ring-1 focus:ring-foreground/50"
                }
              `}
              placeholder="e.g. john-doe"
            />

            {/* Status Icon Animation */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center">
              <AnimatePresence mode="wait">
                {status === "checking" && (
                  <motion.div
                    key="checking"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Loader2 className="w-5 h-5 text-secondary animate-spin" />
                  </motion.div>
                )}
                {status === "available" && (
                  <motion.div
                    key="available"
                    initial={{ opacity: 0, scale: 0.8, y: 2 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Check className="w-5 h-5 text-green-500" strokeWidth={3} />
                  </motion.div>
                )}
                {status === "taken" && (
                  <motion.div
                    key="taken"
                    initial={{ opacity: 0, scale: 0.8, y: 2 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="w-5 h-5 text-red-500" strokeWidth={3} />
                  </motion.div>
                )}
                {(status === "invalid" || status === "reserved") && (
                  <motion.div
                    key="invalid"
                    initial={{ opacity: 0, scale: 0.8, y: 2 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <AlertTriangle className="w-5 h-5 text-amber-500" strokeWidth={2.5} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Status Message */}
          <div aria-live="polite" className="h-5">
            <AnimatePresence mode="wait">
              {message && (
                <motion.p
                  key="message"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className={`text-sm font-medium ${status === "invalid" || status === "reserved" || status === "taken" ? "text-red-500" : "text-green-500"}`}
                >
                  {message}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Suggestions */}
          <AnimatePresence>
            {status === "taken" && suggestions && suggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-2">
                  <p className="text-xs font-medium text-secondary/80 mb-2">Available alternatives:</p>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.map((s) => (
                      <button
                        key={s}
                        onClick={() => applySuggestion(s)}
                        className="px-3 py-1.5 rounded-lg bg-background border border-border/40 text-sm text-foreground hover:bg-foreground hover:text-background transition-colors"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      {/* Live Preview Box */}
      <div className="mt-4 pt-4 border-t border-border/40">
        <label className="text-xs font-medium text-secondary uppercase tracking-wider mb-2 block">
          Preview URL
        </label>
        {status === "invalid" || status === "reserved" ? (
          <div className="px-4 py-3 bg-secondary/10 border border-secondary/20 rounded-lg text-sm text-secondary italic">
            Preview URL unavailable
          </div>
        ) : (
          <a
            href={getPortfolioUrl(slug)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-3 bg-foreground/[0.03] hover:bg-foreground/[0.06] border border-border/40 rounded-lg transition-colors group"
          >
            <span className="text-sm font-mono text-foreground break-all truncate">
              {getPortfolioUrl(slug)}
            </span>
            <svg 
              className="w-3.5 h-3.5 text-secondary opacity-0 group-hover:opacity-100 transition-opacity ml-auto shrink-0" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        )}
      </div>
    </div>
  );
}
