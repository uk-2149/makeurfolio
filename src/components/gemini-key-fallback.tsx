"use client";

import React, { useState } from "react";
import { Eye, EyeOff, Key, Loader2, AlertCircle, ArrowRight, X } from "lucide-react";

interface GeminiKeyFallbackProps {
  onRetryWithKey: (apiKey: string) => void;
  onDismiss: () => void;
  isLoading?: boolean;
  error?: string | null;
}

export function GeminiKeyFallback({
  onRetryWithKey,
  onDismiss,
  isLoading = false,
  error = null,
}: GeminiKeyFallbackProps) {
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);

  const trimmedKey = apiKey.trim();
  const canSubmit = trimmedKey.length > 0 && !isLoading;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (canSubmit) {
      onRetryWithKey(trimmedKey);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-[460px] overflow-hidden bg-card-bg rounded-2xl border border-border shadow-2xl relative animate-in fade-in zoom-in-95 duration-500">

        {/* Close button */}
        <button
          type="button"
          onClick={onDismiss}
          disabled={isLoading}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-input-bg text-secondary hover:text-foreground transition-colors disabled:opacity-50"
        >
          <X size={18} />
        </button>

        <div className="p-8 sm:p-10">

          {/* Icon */}
          <div className="w-14 h-14 mx-auto mb-6 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center">
            <Key size={26} />
          </div>

          {/* Headline */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground mb-3">
              Gemini isn&apos;t cooking right now 👨‍🍳
            </h2>
            <p className="text-[14px] text-secondary leading-relaxed max-w-[360px] mx-auto">
              Our AI service is temporarily unavailable due to API quota limits.
            </p>
            <p className="text-[14px] text-secondary leading-relaxed max-w-[360px] mx-auto mt-2">
              You can either try again in a little while, or use your own Gemini API key to continue instantly.
            </p>
          </div>

          {/* API Key Input */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <div
                className={`bg-input-bg rounded-xl border transition-all duration-200 ${
                  error
                    ? "border-red-500/50 focus-within:border-red-500"
                    : "border-transparent focus-within:border-border"
                }`}
              >
                <label className="block px-4 pt-3 text-[9px] uppercase tracking-wider font-semibold text-secondary">
                  Gemini API Key
                </label>
                <div className="flex items-center px-4 pb-3">
                  <input
                    type={showKey ? "text" : "password"}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="AIza..."
                    disabled={isLoading}
                    autoComplete="off"
                    autoFocus
                    className="flex-1 bg-transparent text-[14px] text-foreground border-none outline-none p-0 focus:ring-0 placeholder:text-secondary/40 disabled:opacity-50 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="ml-2 p-1 text-secondary hover:text-foreground transition-colors flex-shrink-0"
                    tabIndex={-1}
                  >
                    {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Security note */}
              <p className="text-[11px] text-secondary/60 px-1 leading-relaxed">
                Your API key is used only for this request and is never stored.
              </p>

              {/* Inline error */}
              {error && (
                <div className="flex items-start gap-2 px-1 animate-in fade-in slide-in-from-top-1 duration-200">
                  <AlertCircle size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-[12px] text-red-500 leading-relaxed">{error}</p>
                </div>
              )}
            </div>

            {/* Loading state */}
            {isLoading && (
              <div className="flex items-center justify-center gap-2 py-2 animate-in fade-in duration-200">
                <Loader2 className="w-4 h-4 animate-spin text-secondary" />
                <span className="text-[13px] text-secondary font-medium">
                  Generating portfolio...
                </span>
              </div>
            )}

            {/* Buttons */}
            <div className="flex flex-col gap-2.5 pt-2">
              <button
                type="submit"
                disabled={!canSubmit}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-foreground text-background hover:bg-foreground/90 rounded-xl text-[14px] font-medium transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Continue with My API Key
                <ArrowRight size={16} />
              </button>

              <button
                type="button"
                onClick={onDismiss}
                disabled={isLoading}
                className="w-full py-2.5 bg-input-bg border border-border text-foreground hover:bg-border/60 rounded-xl text-[14px] font-medium transition-all active:scale-[0.98] disabled:opacity-50"
              >
                Try Again Later
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
