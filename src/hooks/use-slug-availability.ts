/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useRef } from "react";
import { validateSlug, type SlugStatus } from "@/src/lib/slug";
import type { CheckSlugResponse, CheckSlugStatus } from "@/app/api/portfolio/check-slug/route";

export type SlugAvailabilityStatus = "idle" | "checking" | CheckSlugStatus;

interface SlugCacheEntry {
  status: CheckSlugStatus;
  message?: string;
  suggestions?: string[];
  timestamp: number;
}

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const slugCache = new Map<string, SlugCacheEntry>();

export function useSlugAvailability(currentSlug: string, initialSlug?: string) {
  const [status, setStatus] = useState<SlugAvailabilityStatus>("idle");
  const [message, setMessage] = useState<string | undefined>();
  const [suggestions, setSuggestions] = useState<string[] | undefined>();
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // Keep track of the latest normalized slug to avoid stale closures
  const latestSlugRef = useRef(currentSlug);
  
  useEffect(() => {
    latestSlugRef.current = currentSlug;
  }, [currentSlug]);
  // External trigger for parent to force status (e.g. on 409 Conflict)
  const forceStatus = (newStatus: SlugAvailabilityStatus, newMessage?: string) => {
    setStatus(newStatus);
    setMessage(newMessage);
  };

  useEffect(() => {
    if (!currentSlug) {
      setStatus("idle");
      setMessage(undefined);
      setSuggestions(undefined);
      return;
    }

    if (initialSlug && currentSlug === initialSlug) {
      setStatus("available");
      setMessage(undefined);
      setSuggestions(undefined);
      return;
    }

    // 2. Client-Side Validation
    const validation = validateSlug(currentSlug);
    if (validation.status !== "valid") {
      setStatus(validation.status); // "invalid" or "reserved"
      setMessage(validation.message);
      setSuggestions(undefined);
      return;
    }

    // It's valid, but we wait for debounce before checking
    setStatus("idle");
    setMessage(undefined);
    setSuggestions(undefined);

    // 3. Debounce & Abort previous
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const timeoutId = setTimeout(async () => {
      // 4. Cache Check
      const cached = slugCache.get(currentSlug);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
        setStatus(cached.status);
        setMessage(cached.message);
        setSuggestions(cached.suggestions);
        return;
      }

      // 5. Network Request
      setStatus("checking");
      
      try {
        const response = await fetch(
          `/api/portfolio/check-slug?slug=${encodeURIComponent(currentSlug)}`,
          { signal: abortController.signal }
        );
        
        const data = (await response.json()) as CheckSlugResponse;

        // Ensure we only update state if this request's slug is still the current one
        if (latestSlugRef.current === currentSlug) {
          setStatus(data.status);
          setMessage(data.message);
          setSuggestions(data.suggestions);

          // Update Cache
          slugCache.set(currentSlug, {
            status: data.status,
            message: data.message,
            suggestions: data.suggestions,
            timestamp: Date.now(),
          });
        }
      } catch (error: unknown) {
        if (error instanceof Error && error.name === "AbortError") {
          // Ignore aborted requests
          return;
        }
        if (latestSlugRef.current === currentSlug) {
          setStatus("error");
          setMessage("Unable to verify availability. Please try again.");
        }
      }
    }, 350);

    return () => {
      clearTimeout(timeoutId);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [currentSlug, initialSlug]);

  return { status, message, suggestions, forceStatus };
}
