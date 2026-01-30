export type TasteProfileId =
  | "startup-saas"
  | "minimal-apple"
  | "developer-docs"
  | "playful-friendly"
  | "neubrutalism"
  | "glass-futuristic"
  | "gradient-heavy"
  | "material-android"
  | "retro-web"
  | "terminal-hacker";

export type LayoutArchetypeId =
  | "hero-sections"
  | "bento-grid"
  | "docs-sidebar"
  | "dashboard-3col"
  | "wizard-flow"
  | "feed-stream"
  | "split-view"
  | "single-col"
  | "gallery-cards"
  | "comparison-grid";

export interface TasteProfile {
  id: TasteProfileId;
  name: string;
  badge: "Core" | "Expressive" | "Fun";
  vibe: string;
  visualRules: string[];
  typography: string[];
  motion: string[];
  bestFor: string[];
  avoids?: string[];
  description: string;
}

export interface LayoutArchetype {
  id: LayoutArchetypeId;
  name: string;
  description: string;
  structure: string[];
  bestFor: TasteProfileId[]; // Recommendations
}

export const TASTE_PROFILES: TasteProfile[] = [
  {
    id: "startup-saas",
    name: "Startup SaaS",
    badge: "Core",
    vibe: "Modern, trustworthy, conversion-focused",
    visualRules: [
      "Soft shadows",
      "Subtle gradients allowed",
      "Balanced spacing",
      "Rounded corners (medium)",
    ],
    typography: ["Confident, neutral tone", "Clear hierarchy"],
    motion: ["Subtle hover and transition effects"],
    bestFor: ["MVPs", "Marketing sites", "SaaS dashboards"],
    avoids: ["Heavy blur", "Excessive animation"],
    description: "Production-ready, broadly applicable default style.",
  },
  {
    id: "minimal-apple",
    name: "Minimal / Apple-like",
    badge: "Core",
    vibe: "Calm, premium, content-first",
    visualRules: [
      "Flat or outline UI",
      "Large whitespace",
      "Low color saturation",
      "Minimal shadows",
    ],
    typography: ["Neutral, elegant", "Conservative scale"],
    motion: ["Very subtle or none"],
    bestFor: ["Premium landing pages", "Documentation", "Content-heavy sites"],
    avoids: ["Gradients", "Decorative effects"],
    description: "Clean, whitespace-heavy design that puts content first.",
  },
  {
    id: "developer-docs",
    name: "Developer Docs",
    badge: "Core",
    vibe: "Functional, utilitarian, no-nonsense",
    visualRules: ["Compact spacing", "Flat UI", "Clear borders"],
    typography: ["Neutral, readability-first", "Optional monospace accents"],
    motion: ["None"],
    bestFor: ["Docs", "Admin panels", "Internal tools"],
    avoids: ["Animations", "Visual flair"],
    description: "High-density, information-rich layout for technical content.",
  },
  {
    id: "playful-friendly",
    name: "Playful / Friendly",
    badge: "Expressive",
    vibe: "Approachable, expressive, fun",
    visualRules: [
      "Rounded corners",
      "Bold accent colors",
      "Expressive components",
    ],
    typography: ["Friendly tone", "Slightly expressive scale"],
    motion: ["Playful transitions"],
    bestFor: ["Consumer apps", "Onboarding flows"],
    description: "Inviting and colorful design with bounce and character.",
  },
  {
    id: "neubrutalism",
    name: "Neubrutalism",
    badge: "Expressive",
    vibe: "Bold, raw, opinionated",
    visualRules: [
      "Hard borders",
      "High contrast colors",
      "Flat fills",
      "No shadows or blur",
    ],
    typography: ["Strong hierarchy"],
    motion: ["None"],
    bestFor: ["Portfolios", "Experimental products"],
    description: "High contrast, hard edges, and unapologetic boldness.",
  },
  {
    id: "glass-futuristic",
    name: "Glass / Futuristic",
    badge: "Expressive",
    vibe: "Polished, modern, AI-native",
    visualRules: [
      "Blur & translucency",
      "Restrained gradients",
      "Soft shadows",
    ],
    typography: ["Clean, modern"],
    motion: ["Subtle parallax or fades"],
    bestFor: ["AI tools", "Experimental landing pages"],
    avoids: ["Dense layouts"],
    description: "Sleek interface with transparency and depth effects.",
  },
  {
    id: "gradient-heavy",
    name: "Gradient Heavy",
    badge: "Expressive",
    vibe: "Bold, colorful, expressive",
    visualRules: ["Gradient backgrounds", "High saturation", "Soft shapes"],
    typography: ["Modern sans-serif"],
    motion: ["Fluid gradients"],
    bestFor: ["Marketing pages", "Brand-led sites"],
    description: "Immersive color washes and vibrant atmospheres.",
  },
  {
    id: "material-android",
    name: "Material / Android-like",
    badge: "Core",
    vibe: "Structured, layered, tactile",
    visualRules: [
      "Elevation via shadows",
      "Consistent spacing grid",
      "Material-like surfaces",
    ],
    typography: ["Roboto-like or neutral"],
    motion: ["Ripple effects", "Transformations"],
    bestFor: ["Business apps", "Dashboards"],
    description: "Familiar, google-like design pattern with elevation and ink.",
  },
  {
    id: "retro-web",
    name: "Retro Web",
    badge: "Fun",
    vibe: "Nostalgic, indie, fun",
    visualRules: ["Pixel or mono fonts", "Visible borders", "Simple colors"],
    typography: ["Pixel art or Monospace"],
    motion: ["Marquee", "Blink"],
    bestFor: ["Personal sites", "Creative portfolios"],
    description: "Old-school 90s/2000s web aesthetic.",
  },
  {
    id: "terminal-hacker",
    name: "Terminal / Hacker",
    badge: "Fun",
    vibe: "CLI-inspired, technical",
    visualRules: ["Dark background", "Monospace fonts", "Minimal UI chrome"],
    typography: ["Monospace green/amber"],
    motion: ["Cursor blink", "Typewriter"],
    bestFor: ["CLI tools", "Developer portfolios"],
    description: "Matrix-style, command-line interface aesthetic.",
  },
];

export const LAYOUT_ARCHETYPES: LayoutArchetype[] = [
  {
    id: "hero-sections",
    name: "Hero → Sections",
    description: "Classic marketing structure",
    structure: ["Hero", "Features", "Testimonials", "Pricing"],
    bestFor: ["startup-saas", "minimal-apple", "gradient-heavy"],
  },
  {
    id: "bento-grid",
    name: "Bento Grid",
    description: "Modern modular grid with asymmetric cards",
    structure: ["Asymmetric cards", "Flexible content blocks"],
    bestFor: ["startup-saas", "glass-futuristic", "minimal-apple"],
  },
  {
    id: "docs-sidebar",
    name: "Docs / Sidebar",
    description: "Standard documentation layout",
    structure: ["Left sidebar", "Content pane", "Optional TOC"],
    bestFor: ["developer-docs", "minimal-apple"],
  },
  {
    id: "dashboard-3col",
    name: "Dashboard (3-Column)",
    description: "Productivity-focused application layout",
    structure: ["Left navigation", "Main content", "Right panel / inspector"],
    bestFor: ["startup-saas", "material-android"],
  },
  {
    id: "wizard-flow",
    name: "Wizard / Step Flow",
    description: "Linear step-by-step process",
    structure: ["Linear steps", "Progress indicator"],
    bestFor: ["playful-friendly", "startup-saas"],
  },
  {
    id: "feed-stream",
    name: "Feed / Stream",
    description: "Vertical list of items or cards",
    structure: ["Vertical list", "Cards or items"],
    bestFor: ["playful-friendly"],
  },
  {
    id: "split-view",
    name: "Split View",
    description: "Two-pane layout for side-by-side comparison",
    structure: ["Editor + Preview", "Form + Result"],
    bestFor: ["developer-docs", "glass-futuristic"],
  },
  {
    id: "single-col",
    name: "Single Column Focus",
    description: "Narrow centered content for reading",
    structure: ["Narrow reading width"],
    bestFor: ["minimal-apple", "retro-web"],
  },
  {
    id: "gallery-cards",
    name: "Gallery / Cards",
    description: "Visual grid of items",
    structure: ["Grid of cards"],
    bestFor: ["neubrutalism", "playful-friendly"],
  },
  {
    id: "comparison-grid",
    name: "Comparison / Pricing Grid",
    description: "Side-by-side plans or features",
    structure: ["Side-by-side plans", "Feature list"],
    bestFor: ["startup-saas", "neubrutalism"],
  },
];

export interface PromptConstructionData {
  profile: TasteProfileId;
  layout: LayoutArchetypeId;
  customInstructions: string;
}

export function constructPromptJson(data: PromptConstructionData): string {
  const profile = TASTE_PROFILES.find((p) => p.id === data.profile);
  const layout = LAYOUT_ARCHETYPES.find((l) => l.id === data.layout);

  if (!profile || !layout) {
    throw new Error("Invalid profile or layout selected");
  }

  const result = {
    taste: data.profile,
    layout: data.layout,
    prompt: data.customInstructions,
    constraints: {
      vibe: profile.vibe,
      visualRules: profile.visualRules,
      typography: profile.typography,
      motion: profile.motion,
      avoids: profile.avoids || [],
    },
    structure: layout.structure,
  };

  return JSON.stringify(result, null, 2);
}
