"use client";

import { useState, useEffect } from "react";
import type { FullPortfolio } from "@/src/themes/shared/types";

/**
 * Hook to synchronize the portfolio data with messages from the parent window (Editor).
 * Only active when `isEditMode=true`.
 */
export function useLiveSync(initialData: FullPortfolio, isEditMode: boolean) {
  const [data, setData] = useState<FullPortfolio>(initialData);

  useEffect(() => {
    setData(initialData); // Re-sync if initialData changes externally
  }, [initialData]);

  useEffect(() => {
    if (!isEditMode) return;

    const handleMessage = (event: MessageEvent) => {
      // Security: ensure it's from the same origin, or just accept if same window
      if (event.data?.type === "UPDATE_PORTFOLIO") {
        setData(event.data.data);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [isEditMode]);

  return data;
}
