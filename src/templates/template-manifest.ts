/**
 * Template Manifest
 *
 * Templates are structurally distinct portfolio layouts targeted at specific
 * professional personas. Unlike themes (which vary only in colour / typography),
 * templates vary in section ordering, grid style, information density, and
 * hero treatment.
 *
 * Templates are stored in the database as `themeId` values prefixed with
 * "template:" — e.g. "template:dev-terminal". The portfolio page resolver
 * strips the prefix and looks up the component in templateRegistry.
 */

export type TemplateCategory =
  | "developer"
  | "designer"
  | "freelancer"
  | "startup"
  | "small-business";

export interface Template {
  id: string;
  name: string;
  tagline: string;
  description: string;
  category: TemplateCategory;
  previewImage: string;
}

export const CATEGORY_LABELS: Record<TemplateCategory, string> = {
  developer:       "Best for Developers",
  designer:        "Best for Designers",
  freelancer:      "Best for Freelancers",
  startup:         "Best for Startups",
  "small-business":"Best for Small Business",
};

export const CATEGORY_COLORS: Record<TemplateCategory, string> = {
  developer:       "#3b82f6",
  designer:        "#ec4899",
  freelancer:      "#f59e0b",
  startup:         "#8b5cf6",
  "small-business":"#10b981",
};

export const templates: Template[] = [
  {
    id: "dev-terminal",
    name: "Terminal",
    tagline: "Code-first dark layout",
    description: "Two-pane: fixed TOC sidebar + scrollable content. Monospace everywhere. Dark canvas with green accent.",
    category: "developer",
    previewImage: "/templates/dev-terminal.png",
  },
  {
    id: "dev-bento",
    name: "Bento Grid",
    tagline: "Modern card grid layout",
    description: "Asymmetric bento card grid. Hero spans full width, skills and projects tile into dynamic grid cells.",
    category: "developer",
    previewImage: "/templates/dev-bento.png",
  },
  {
    id: "designer-canvas",
    name: "Canvas",
    tagline: "Visual-first creative portfolio",
    description: "Full-bleed hero image, floating name overlay, masonry project grid. Minimal chrome, maximum impact.",
    category: "designer",
    previewImage: "/templates/designer-canvas.png",
  },
  {
    id: "freelance-clean",
    name: "Clean Pro",
    tagline: "Conversion-focused single column",
    description: "Single-column layout with sticky contact CTA. Every section drives toward hiring action.",
    category: "freelancer",
    previewImage: "/templates/freelance-clean.png",
  },
  {
    id: "startup-pitch",
    name: "Pitch Deck",
    tagline: "Big numbers, big vision",
    description: "Slide-style sections with oversized metrics, bold headlines, and a team-focused story arc.",
    category: "startup",
    previewImage: "/templates/startup-pitch.png",
  },
  {
    id: "biz-corporate",
    name: "Corporate Pro",
    tagline: "Trust-building professional layout",
    description: "Two-column layout: rich content left, sticky contact and credentials sidebar right. Built for credibility.",
    category: "small-business",
    previewImage: "/templates/biz-corporate.png",
  },
];
