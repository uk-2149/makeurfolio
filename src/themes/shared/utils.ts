/**
 * Shared utility functions for themes.
 *
 * These helpers centralize common data transformations so that
 * individual themes only focus on presentation. No theme should
 * duplicate this logic.
 */

import type { FullPortfolio } from "./types";

type Skill = FullPortfolio["skills"][number];
type Project = FullPortfolio["projects"][number];
type SocialLink = FullPortfolio["socialLinks"][number];

/**
 * Group an array of skills by their category.
 */
export function groupSkillsByCategory(
  skills: Skill[]
): Record<string, (Skill & { _originalIndex: number })[]> {
  return skills.reduce(
    (acc, skill, idx) => {
      const key = skill.category;
      if (!acc[key]) acc[key] = [];
      acc[key].push({ ...skill, _originalIndex: idx });
      return acc;
    },
    {} as Record<string, (Skill & { _originalIndex: number })[]>
  );
}

/**
 * Format a date range into a human-readable string.
 * Examples: "2023 — Present", "2021 — 2024", "Past — 2023"
 */
export function formatDateRange(
  startDate: Date | string | null | undefined,
  endDate: Date | string | null | undefined,
  currentlyWorking?: boolean
): string {
  const start = startDate ? new Date(startDate).getFullYear() : "Past";
  const end = currentlyWorking
    ? "Present"
    : endDate
      ? new Date(endDate).getFullYear()
      : "";
  return `${start} — ${end}`;
}

/**
 * Split projects into featured and regular arrays.
 */
export function splitProjects(projects: Project[]): {
  featured: (Project & { _originalIndex: number })[];
  regular: (Project & { _originalIndex: number })[];
} {
  const withIndex = projects.map((p, idx) => ({ ...p, _originalIndex: idx }));
  return {
    featured: withIndex.filter((p) => p.featured),
    regular: withIndex.filter((p) => !p.featured),
  };
}

/**
 * Get the top N visible social links.
 */
export function getPrimarySocials(
  socialLinks: SocialLink[],
  count: number = 4
): (SocialLink & { _originalIndex: number })[] {
  return socialLinks
    .map((s, idx) => ({ ...s, _originalIndex: idx }))
    .slice(0, count);
}

/**
 * Get a comma-separated string of the top N skill names.
 */
export function getTopTechString(
  skills: Skill[],
  count: number = 3
): string {
  return skills
    .slice(0, count)
    .map((s) => s.name)
    .join(", ");
}
