"use client";

import React, { useEffect, useState, useRef } from "react";
import { Check, ChevronDown, ChevronUp, AlertCircle, ArrowRight, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { clearActiveGenerationId, getActiveGenerationMetadata, clearActiveGenerationMetadata } from "@/src/lib/storage";
import { getPortfolioUrl } from "@/src/lib/portfolio-url";
import { GeminiKeyFallback } from "./gemini-key-fallback";

interface GenerationOverlayProps {
  generationId: string | null;
  onClose: () => void;
  /** Callback to retry generation with a user-provided Gemini API key */
  onRetryWithUserKey?: (apiKey: string) => void;
}

type Status = "QUEUED" | "FETCHING_GITHUB" | "PARSING_RESUME" | "GENERATING_PROFILE" | "COMPLETED" | "FAILED";

interface LogEntry {
  timestamp: string;
  message: string;
}

export function GenerationOverlay({ generationId, onClose, onRetryWithUserKey }: GenerationOverlayProps) {
  const router = useRouter();
  const [status, setStatus] = useState<Status | null>(null);
  const [activityLogs, setActivityLogs] = useState<LogEntry[]>([]);
  
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showErrorDetails, setShowErrorDetails] = useState(false);
  const [portfolioSlug, setPortfolioSlug] = useState<string | null>(null);
  const [metadata, setMetadata] = useState({ hasGithub: true, hasResume: true });

  // Gemini key fallback state
  const [showGeminiFallback, setShowGeminiFallback] = useState(false);
  const [fallbackLoading, setFallbackLoading] = useState(false);
  const [fallbackError, setFallbackError] = useState<string | null>(null);

  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (generationId) {
      const frame = requestAnimationFrame(() => {
        setMetadata(getActiveGenerationMetadata());
      });

      return () => cancelAnimationFrame(frame);
    }
  }, [generationId]);

  // Auto-scroll the live feed
  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [activityLogs]);

  useEffect(() => {
    if (!generationId) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/portfolio/generation/${generationId}`);
        const json = await res.json();
        
        if (json.success) {
          setStatus(json.data.status);
          
          if (json.data.activityLogs && Array.isArray(json.data.activityLogs)) {
            setActivityLogs(json.data.activityLogs);
          }

          if (json.data.status === "COMPLETED") {
            setPortfolioSlug(json.data.portfolioSlug);
            clearActiveGenerationId();
            clearActiveGenerationMetadata();
            clearInterval(interval);
          } else if (json.data.status === "FAILED") {
            setErrorMessage(json.data.errorMessage || "An unknown error occurred.");

            // Check if this is a Gemini keys exhausted error
            if (json.data.errorCode === "ALL_GEMINI_KEYS_EXHAUSTED" || 
                json.data.errorMessage?.includes("API keys have been exhausted")) {
              setShowGeminiFallback(true);
            }

            clearActiveGenerationId();
            clearActiveGenerationMetadata();
            clearInterval(interval);
          }
        } else {
          setErrorMessage(json.error?.message || "Generation session not found.");

          // Check the response error code directly
          if (json.error?.code === "ALL_GEMINI_KEYS_EXHAUSTED") {
            setShowGeminiFallback(true);
          }

          setStatus("FAILED");
          clearActiveGenerationId();
          clearActiveGenerationMetadata();
          clearInterval(interval);
        }
      } catch (err) {
        console.error("Failed to poll status:", err);
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [generationId]);

  if (!generationId) return null;

  // ── Gemini Key Fallback ────────────────────────────────────────────
  if (showGeminiFallback) {
    const handleRetryWithKey = async (apiKey: string) => {
      setFallbackLoading(true);
      setFallbackError(null);

      if (onRetryWithUserKey) {
        // Let the parent component handle the retry
        onRetryWithUserKey(apiKey);
      } else {
        // Fallback: just dismiss — parent should wire onRetryWithUserKey
        setFallbackLoading(false);
        setShowGeminiFallback(false);
      }
    };

    const handleDismiss = () => {
      setShowGeminiFallback(false);
      clearActiveGenerationId();
      clearActiveGenerationMetadata();
      onClose();
    };

    return (
      <GeminiKeyFallback
        onRetryWithKey={handleRetryWithKey}
        onDismiss={handleDismiss}
        isLoading={fallbackLoading}
        error={fallbackError}
      />
    );
  }

  // Define High-Level Stages dynamically
  const stages = [
    ...(metadata.hasGithub ? [{ id: "FETCHING_GITHUB", title: "Analyzing GitHub" }] : []),
    ...(metadata.hasResume ? [{ id: "PARSING_RESUME", title: "Understanding Resume" }] : []),
    { id: "GENERATING_PROFILE", title: "Building Your Portfolio" },
    { id: "COMPLETED", title: "Finalizing Website" }
  ];

  // Calculate Progress and active stage
  const phaseOrder = ["QUEUED", "FETCHING_GITHUB", "PARSING_RESUME", "GENERATING_PROFILE", "COMPLETED"];
  const currentGlobalPhaseIndex = phaseOrder.indexOf(status || "QUEUED");
  
  let activeStageIndex = -1;
  stages.forEach((stage, idx) => {
    const stagePhaseIndex = phaseOrder.indexOf(stage.id);
    if (currentGlobalPhaseIndex >= stagePhaseIndex) {
      activeStageIndex = idx;
    }
  });

  // Calculate smooth progress percentage
  const totalStages = stages.length;
  let progress = 5; // Start at 5% just to show activity
  if (status === "COMPLETED") {
    progress = 100;
  } else if (activeStageIndex >= 0) {
    progress = Math.max(5, (activeStageIndex / (totalStages - 1)) * 100);
  }

  const handleTryAgain = () => {
    clearActiveGenerationId();
    clearActiveGenerationMetadata();
    onClose();
  };

  // Compact Activity Feed logic (show only last 5 logs)
  const visibleLogs = activityLogs.slice(-5);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-[500px] overflow-hidden bg-card-bg rounded-2xl border border-border shadow-2xl flex flex-col relative transition-all duration-500">
        
        {status === "FAILED" ? (
          <div className="p-10 text-center animate-in fade-in zoom-in-95 duration-300">
            <div className="w-14 h-14 mx-auto mb-6 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center">
              <AlertCircle size={28} />
            </div>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground mb-2">Something went wrong</h2>
            <p className="text-[14px] text-secondary mb-6 leading-relaxed">
              We couldn&apos;t complete portfolio generation.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
              <button
                onClick={handleTryAgain}
                className="py-2.5 px-6 bg-foreground text-background hover:bg-foreground/90 rounded-xl text-[14px] font-medium transition-all active:scale-[0.98]"
              >
                Try Again
              </button>
              <button
                onClick={handleTryAgain}
                className="py-2.5 px-6 bg-input-bg border border-border text-foreground hover:bg-border/60 rounded-xl text-[14px] font-medium transition-all active:scale-[0.98]"
              >
                Go Back
              </button>
            </div>

            <div className="text-left border border-border/60 rounded-lg overflow-hidden transition-all duration-300">
              <button 
                onClick={() => setShowErrorDetails(!showErrorDetails)}
                className="w-full px-4 py-3 bg-input-bg/50 flex items-center justify-between text-[13px] font-medium text-secondary hover:text-foreground transition-colors"
              >
                Show Details
                {showErrorDetails ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {showErrorDetails && (
                <div className="p-4 bg-input-bg/20 text-[12px] font-mono text-red-500/80 break-words border-t border-border/60">
                  {errorMessage}
                </div>
              )}
            </div>
          </div>
        ) : status === "COMPLETED" && portfolioSlug ? (
          <div className="p-10 text-center animate-in fade-in zoom-in-95 duration-500">
            <div className="w-16 h-16 mx-auto mb-6 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center animate-in zoom-in spin-in-12 duration-700">
              <Check size={32} strokeWidth={3} />
            </div>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground mb-2">Your portfolio is live</h2>
            <div className="mb-8">
              <p className="text-[15px] text-secondary leading-relaxed">
                Your website has been generated successfully and is ready to share.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => {
                  if (portfolioSlug) {
                    window.open(getPortfolioUrl(portfolioSlug), "_blank", "noopener,noreferrer");
                  }
                }}
                className="flex items-center justify-center gap-2 py-3 px-6 bg-foreground text-background hover:bg-foreground/90 rounded-xl text-[14px] font-medium transition-all active:scale-[0.98] shadow-sm"
              >
                View Portfolio
                <ArrowRight size={16} />
              </button>
              <button
                onClick={() => router.push(`/dashboard`)}
                className="py-3 px-6 bg-input-bg border border-border text-foreground hover:bg-border/60 rounded-xl text-[14px] font-medium transition-all active:scale-[0.98]"
              >
                Open Dashboard
              </button>
            </div>
            <p className="text-[13px] text-secondary/60 mt-5 mb-0">
                Note: You can easily edit all contents later.
              </p>
          </div>
        ) : (
          <div className="flex flex-col animate-in fade-in duration-500 p-8 sm:p-10">
            
            {/* Hero Area */}
            <div className="text-center mb-10">
              <h2 className="text-2xl font-semibold tracking-tight text-foreground mb-2">Creating your portfolio</h2>
              <p className="text-[14px] text-secondary leading-relaxed max-w-[340px] mx-auto">
                We&apos;re transforming your experience, projects, and resume into a recruiter-ready website.
              </p>
            </div>

            {/* Stages & Progress */}
            <div className="mb-10">
              <div className="flex justify-between mb-8 px-2 relative">
                {stages.map((stage, i) => {
                  const isCompleted = i < activeStageIndex || status === "COMPLETED";
                  const isActive = i === activeStageIndex && status !== "COMPLETED";
                  
                  return (
                    <div key={stage.id} className="flex flex-col items-center relative z-10">
                      <div 
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-medium transition-all duration-500
                          ${isCompleted ? 'bg-foreground text-background scale-95' 
                            : isActive ? 'bg-background border-2 border-foreground text-foreground shadow-[0_0_15px_rgba(0,0,0,0.1)] dark:shadow-[0_0_15px_rgba(255,255,255,0.1)]' 
                            : 'bg-input-bg text-secondary/50 border border-border/50 scale-95'}`}
                      >
                        {isCompleted ? <Check size={14} strokeWidth={3} /> : (i + 1)}
                      </div>
                      <span className={`absolute top-10 text-[11px] font-medium whitespace-nowrap transition-colors duration-500 ${isActive ? 'text-foreground' : 'text-secondary/50'}`}>
                        {stage.title}
                      </span>
                    </div>
                  );
                })}

                {/* Progress Bar Track */}
                <div className="absolute top-3.5 left-4 right-4 h-0.5 bg-input-bg -z-0 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-foreground transition-all duration-1000 ease-in-out rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Compact Activity Feed */}
            <div className="mt-8 pt-6 border-t border-border/60">
              <div className="flex items-center gap-2 mb-3">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-secondary/60" />
                <span className="text-[11px] font-semibold uppercase tracking-wider text-secondary/60">Live Activity</span>
              </div>
              <div className="h-[100px] flex flex-col justify-end overflow-hidden relative">
                {/* Fade gradient at the top of the feed */}
                <div className="absolute top-0 inset-x-0 h-6 bg-gradient-to-b from-card-bg to-transparent z-10" />
                
                <div className="flex flex-col gap-2">
                  {visibleLogs.length === 0 ? (
                    <div className="text-[13px] text-secondary/40 font-mono animate-pulse">Waiting for logs...</div>
                  ) : (
                    visibleLogs.map((log, i) => {
                      // Calculate opacity based on position (older = more faded)
                      // The last item is the newest, opacity 100%
                      // Items before it fade out: 80%, 60%, 40%, etc.
                      const opacityIndex = (visibleLogs.length - 1) - i;
                      const opacityMap = [1, 0.7, 0.4, 0.2, 0.1];
                      const opacity = opacityMap[opacityIndex] || 0.1;
                      
                      return (
                        <div 
                          key={log.timestamp + i} 
                          className="text-[13px] font-mono text-foreground flex items-center transition-all duration-300"
                          style={{ opacity }}
                        >
                          <span className="mr-2 text-secondary/30 text-[11px]">→</span>
                          {log.message}
                        </div>
                      );
                    })
                  )}
                  <div ref={logsEndRef} />
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
