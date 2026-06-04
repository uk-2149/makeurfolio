"use client";

import React from "react";
import { useLiveSync } from "@/src/hooks/use-live-sync";
import { themeRegistry, DEFAULT_THEME_ID } from "@/src/themes/registry";
import { templateRegistry } from "@/src/templates/registry";
import { themeConfigs, DEFAULT_THEME_CONFIG } from "@/src/themes/configs";
import type { FullPortfolio } from "@/src/themes/shared/types";

interface LivePortfolioRendererProps {
  initialPortfolio: FullPortfolio;
  isEditMode: boolean;
}

export function LivePortfolioRenderer({ initialPortfolio, isEditMode }: LivePortfolioRendererProps) {
  const portfolio = useLiveSync(initialPortfolio, isEditMode);
  
  const themeId = portfolio.themeId || DEFAULT_THEME_ID;
  const theme = themeConfigs[themeId] || DEFAULT_THEME_CONFIG;

  if (portfolio.templateId) {
    const TemplateComponent = templateRegistry[portfolio.templateId];
    if (TemplateComponent) {
      return <TemplateComponent portfolio={portfolio} theme={theme} isEditMode={isEditMode} />;
    }
  }

  const ThemeComponent = themeRegistry[themeId] || themeRegistry[DEFAULT_THEME_ID];
  return <ThemeComponent portfolio={portfolio} theme={theme} isEditMode={isEditMode} />;
}
