"use client";

import React, { useEffect, useState } from "react";
import { GenerationOverlay } from "./generation-overlay";
import { GeminiKeyFallback } from "./gemini-key-fallback";
import {
  restoreStashedState,
  clearStashedState,
  setActiveGenerationId,
  getActiveGenerationId,
  clearActiveGenerationId,
} from "@/src/lib/storage";

export function DashboardGenerationHandler() {
  const [generationId, setGenerationId] = useState<string | null>(null);

  // Gemini key fallback state
  const [showGeminiFallback, setShowGeminiFallback] = useState(false);
  const [fallbackLoading, setFallbackLoading] = useState(false);
  const [fallbackError, setFallbackError] = useState<string | null>(null);

  // Store pending generation params for retry with user key
  const [pendingParams, setPendingParams] = useState<{
    githubUsername?: string;
    resumeFile?: File;
    portfolioName: string;
  } | null>(null);

  useEffect(() => {
    // 1. Check if there is already an active generation running
    const activeGenId = getActiveGenerationId();
    if (activeGenId) {
      setGenerationId(activeGenId);
      return;
    }

    // 2. Otherwise, check if there is a stashed state ready to generate
    restoreStashedState().then(async (stashed) => {
      if (stashed && stashed.portfolioName) {
        // Save params for potential retry
        setPendingParams({
          githubUsername: stashed.githubUsername,
          resumeFile: stashed.resumeFile,
          portfolioName: stashed.portfolioName,
        });

        // Pre-allocate a client-side generation ID
        const clientGenId = "gen-" + Date.now() + "-" + Math.random().toString(36).substring(2, 9);
        
        // Save and activate immediately
        setGenerationId(clientGenId);
        setActiveGenerationId(clientGenId);

        const formData = new FormData();
        if (stashed.githubUsername) formData.append("githubUsername", stashed.githubUsername);
        if (stashed.resumeFile) formData.append("resume", stashed.resumeFile);
        formData.append("portfolioName", stashed.portfolioName);
        formData.append("generationId", clientGenId);

        // Clear stashed state early so we don't trigger duplicate calls on refresh
        await clearStashedState();

        try {
          const res = await fetch("/api/portfolio/generate", {
            method: "POST",
            body: formData,
          });
          const data = await res.json();

          if (!data.success) {
            // Check if this is a Gemini keys exhausted error
            if (data.error?.code === "ALL_GEMINI_KEYS_EXHAUSTED") {
              setGenerationId(null);
              clearActiveGenerationId();
              setShowGeminiFallback(true);
            } else {
              alert(data.error?.message || "Failed to generate portfolio");
              setGenerationId(null);
              clearActiveGenerationId();
            }
          }
        } catch (err) {
          console.error("Failed to generate portfolio:", err);
          alert("Network error starting generation");
          setGenerationId(null);
          clearActiveGenerationId();
        }
      }
    });
  }, []);

  const handleRetryWithUserKey = async (apiKey: string) => {
    if (!pendingParams) return;

    setFallbackLoading(true);
    setFallbackError(null);

    const clientGenId = "gen-" + Date.now() + "-" + Math.random().toString(36).substring(2, 9);

    const formData = new FormData();
    if (pendingParams.githubUsername) formData.append("githubUsername", pendingParams.githubUsername);
    if (pendingParams.resumeFile) formData.append("resume", pendingParams.resumeFile);
    formData.append("portfolioName", pendingParams.portfolioName);
    formData.append("generationId", clientGenId);
    formData.append("geminiApiKey", apiKey);

    try {
      const res = await fetch("/api/portfolio/generate", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.success) {
        // Switch from fallback to generation overlay
        setShowGeminiFallback(false);
        setFallbackLoading(false);
        setGenerationId(clientGenId);
        setActiveGenerationId(clientGenId);
      } else {
        setFallbackLoading(false);
        // Show specific error based on the response
        if (data.error?.reason === "invalid_key") {
          setFallbackError("Invalid API key. Please check and try again.");
        } else if (data.error?.reason === "quota_exceeded") {
          setFallbackError("Your API key has exceeded its quota.");
        } else if (data.error?.reason === "service_unavailable") {
          setFallbackError("Gemini is temporarily unavailable. Please try again later.");
        } else {
          setFallbackError(data.error?.message || "Failed to generate portfolio.");
        }
      }
    } catch (err) {
      console.error("Failed to retry with user key:", err);
      setFallbackLoading(false);
      setFallbackError("Network error. Please check your connection and try again.");
    }
  };

  const handleClose = () => {
    setGenerationId(null);
    clearActiveGenerationId();
    // Refresh the page so the newly generated portfolio is rendered in the server-side list
    window.location.reload();
  };

  const handleFallbackDismiss = () => {
    setShowGeminiFallback(false);
    setFallbackLoading(false);
    setFallbackError(null);
    setPendingParams(null);
    clearActiveGenerationId();
  };

  // Show Gemini key fallback
  if (showGeminiFallback) {
    return (
      <GeminiKeyFallback
        onRetryWithKey={handleRetryWithUserKey}
        onDismiss={handleFallbackDismiss}
        isLoading={fallbackLoading}
        error={fallbackError}
      />
    );
  }

  if (!generationId) return null;

  return (
    <GenerationOverlay 
      generationId={generationId} 
      onClose={handleClose}
      onRetryWithUserKey={handleRetryWithUserKey}
    />
  );
}
