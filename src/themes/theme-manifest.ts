/**
 * Theme Manifest — Single source of truth for theme metadata.
 *
 * The editor's theme selector consumes this manifest to display
 * theme cards. Adding a new theme requires adding an entry here.
 */

export interface ThemeMetadata {
  id: string;
  name: string;
  description: string;
  previewImage: string;
  group?: "standard" | "exclusive";
}

export const themes: ThemeMetadata[] = [
  {
    id: "minimal-editorial",
    name: "Minimal Editorial",
    description: "Clean recruiter-first design focused on readability",
    previewImage: "/themes/minimal-editorial.png",
    group: "standard",
  },
  {
    id: "founder-os",
    name: "Founder OS",
    description: "Modern founder / startup operator portfolio focused on products and impact",
    previewImage: "/themes/founder-os.png",
    group: "standard",
  },
  {
    id: "vercel",
    name: "Vercel",
    description: "Stark black-and-white system with a multi-color mesh gradient hero and monospaced technical labels",
    previewImage: "/themes/vercel.png",
    group: "standard",
  },
  {
    id: "linear",
    name: "Linear",
    description: "Deep dark canvas with a lavender-blue accent, surface ladder hierarchy and software-craft density",
    previewImage: "/themes/linear.png",
    group: "standard",
  },
  {
    id: "stripe",
    name: "Stripe",
    description: "Financial-infrastructure aesthetic with gradient mesh hero, indigo CTA and cream-navy card tints",
    previewImage: "/themes/stripe.png",
    group: "standard",
  },
  {
    id: "raycast",
    name: "Raycast",
    description: "Near-black command-palette aesthetic with white pill CTAs and a red diagonal stripe hero",
    previewImage: "/themes/raycast.png",
    group: "standard",
  },
  {
    id: "notion",
    name: "Notion",
    description: "Deep navy hero band with purple CTA, centered layout and vibrant pastel card tints",
    previewImage: "/themes/notion.png",
    group: "standard",
  },
  {
    id: "wise",
    name: "Wise",
    description: "Premium Scandinavian fintech aesthetic with dynamic accent colors and pill geometries",
    previewImage: "/themes/wise.png",
    group: "exclusive",
  },
];
