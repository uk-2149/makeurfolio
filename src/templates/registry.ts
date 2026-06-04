/**
 * Template Registry — Maps templateId strings to React component implementations.
 * Import pattern mirrors src/themes/registry.ts.
 */

import { ComponentType } from "react";
import type { PortfolioThemeProps } from "@/src/themes/shared/types";

import DevTerminalTemplate from "./dev-terminal";
import DevBentoTemplate from "./dev-bento";
import DesignerCanvasTemplate from "./designer-canvas";
import FreelanceCleanTemplate from "./freelance-clean";
import StartupPitchTemplate from "./startup-pitch";
import BizCorporateTemplate from "./biz-corporate";

export const templateRegistry: Record<string, ComponentType<PortfolioThemeProps>> = {
  "dev-terminal":    DevTerminalTemplate,
  "dev-bento":       DevBentoTemplate,
  "designer-canvas": DesignerCanvasTemplate,
  "freelance-clean": FreelanceCleanTemplate,
  "startup-pitch":   StartupPitchTemplate,
  "biz-corporate":   BizCorporateTemplate,
};
