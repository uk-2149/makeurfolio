/**
 * Shared types for the theme system.
 *
 * Themes are pure presentation components. They must NEVER import Prisma,
 * call fetch(), or access any data source directly. They receive a
 * fully-hydrated `portfolio` object through props and render it.
 *
 * Data flow: Route → Fetch Portfolio → Resolve Theme → Render Theme
 */

import type { Prisma } from "@/app/generated/prisma/client";

/**
 * The complete portfolio payload with all relations included.
 * Inferred directly from Prisma so it stays in sync with the schema automatically.
 */
export type FullPortfolio = Omit<Prisma.PortfolioGetPayload<{
  include: {
    experiences: true;
    educations: true;
    projects: true;
    skills: true;
    socialLinks: true;
    certifications: true;
    achievements: true;
  };
}>, "projects" | "skills"> & {
  projects: (Prisma.ProjectGetPayload<{}> & { _originalIndex?: number })[];
  skills: (Prisma.SkillGetPayload<{}> & { _originalIndex?: number })[];
};

/**
 * The props contract every theme component must accept.
 *
 * All themes receive an identical, fully-hydrated portfolio object.
 * No theme should ever need to fetch additional data.
 */
export interface ThemeConfig {
  id: string;
  colors: {
    canvas: string;
    surface: string;
    surfaceElevated: string;
    border: string;
    ink: string;
    mute: string;
    primary: string;
  };
  typography: {
    fontFamily: string;
  };
}

export interface PortfolioThemeProps {
  portfolio: FullPortfolio;
  theme: ThemeConfig;
  isEditMode?: boolean;
}
