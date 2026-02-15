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
  primaryColors: string[];
  secondaryColors: string[];
  effects: string[];
  styleHints: string[]; // Conceptual design hints (not literal CSS)
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
    primaryColors: [
      "#0B69FF", // trust/cta blue
      "#0F1724", // near-black for text / strong contrast
      "#FFFFFF", // clean background / neutral
    ],
    secondaryColors: [
      "#F5F7FA", // light neutral background
      "#6B7280", // muted gray for text/labels
      "#10B981", // supportive success/cta green
      "#E6EDF8", // soft blue tint for surfaces
    ],
    effects: [
      "Subtle hover (200-250ms)",
      "Smooth transitions",
      "Sharp shadows",
      "Clear type hierarchy",
    ],
    styleHints: [
      "display: grid",
      "gap: 2rem",
      "font-family: sans-serif",
      "max-width: 1200px",
      "clean borders",
    ],
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
    primaryColors: [
      "#000000", // content-first text
      "#FFFFFF", // abundant whitespace
    ],
    secondaryColors: [
      "#F7F7F7", // extra generous white
      "#EDEDED", // subtle surface
      "#D1D5DB", // cool neutral gray for muted text
    ],
    effects: [
      "Minimal transitions",
      "Subtle fades",
      "No shadows or flat shadows",
    ],
    styleHints: [
      "white-space: generous",
      "font-family: system-ui",
      "border-radius: 0-4px",
      "color: monochromatic",
    ],
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
    primaryColors: [
      "#0B3D91", // strong doc blue for links/headers
      "#111827", // dark text / code backgrounds
      "#FFFFFF", // base background
      "#F59E0B", // highlight / warning / inline emphasis
    ],
    secondaryColors: [
      "#6B7280", // neutral secondary text
      "#9CA3AF", // muted UI borders / meta
      "#F3F4F6", // alternate surface
      "#10B981", // success / code accents
    ],
    effects: [
      "No transitions",
      "Instant state changes",
      "Clean borders (2-4px)",
    ],
    styleHints: [
      "box-shadow: none",
      "border-radius: 0-4px",
      "font: bold sans-serif",
      "stroke: 1-2px",
    ],
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
    primaryColors: [
      "#FF7A90", // warm coral
      "#6EC6FF", // friendly sky blue
      "#A4F3B8", // soft mint
      "#FFD66B", // cheerful yellow
    ],
    secondaryColors: [
      "#FFE4E1", // soft coral tint for backgrounds
      "#E8F8FF", // light blue surface
      "#FFF7E6", // pale warm surface
      "#F3E8FF", // lilac for playful accents
    ],
    effects: [
      "Inner+outer shadows",
      "Soft press (200ms)",
      "Bounce animations",
      "Smooth transitions",
    ],
    styleHints: [
      "border-radius: 16-24px",
      "border: 3-4px solid",
      "box-shadow: inset + outer",
      "animation: bounce",
    ],
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
    primaryColors: [
      "#000000", // absolute black
      "#FFFFFF", // absolute white
      "#FF3B30", // aggressive red
      "#007AFF", // vivid blue
      "#FFD300", // punchy yellow
    ],
    secondaryColors: [
      "#F2F2F2", // stark light surface
      "#8B8B8B", // mid gray for borders
      "#00FF00", // optional neon/splash accent
    ],
    effects: [
      "No smooth transitions (instant)",
      "Sharp corners (0px)",
      "Bold typography (700+)",
      "Visible grid",
    ],
    styleHints: [
      "border-radius: 0px",
      "transition: none",
      "font-weight: 700-900",
      "border: visible 2-4px",
    ],
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
    primaryColors: [
      "rgba(255,255,255,0.12)", // translucent glass surface
      "rgba(255,255,255,0.24)", // layered translucency
      "#0B1226", // deep backdrop/nav
      "#6D28D9", // futuristic purple accent
      "#00C2FF", // cyan accent / glow
    ],
    secondaryColors: [
      "#E6F7FF", // subtle cyan surface
      "#F4E8FF", // pale iridescent tint
      "#8B00FF", // rich accent variant
      "#00BFA6", // teal support color
    ],
    effects: [
      "Backdrop blur (10-20px)",
      "Subtle border (1px rgba)",
      "Morphing shapes (400-600ms)",
      "Iridescent gradients",
    ],
    styleHints: [
      "backdrop-filter: blur(15px)",
      "background: rgba(255,255,255,0.15)",
      "border: 1px solid rgba",
      "z-index layering",
    ],
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
    primaryColors: [
      "#FF0080", // magenta for rich gradients
      "#00C2FF", // bright cyan for contrast
      "#7C4DFF", // deep violet for depth
    ],
    secondaryColors: [
      "#FF8A00", // warm orange accent
      "#FFD700", // gold highlight
      "#00FFB3", // neon aqua for pop
      "#FF2D95", // hot pink support
    ],
    effects: [
      "Large flowing gradients",
      "8-12s animations",
      "Mesh gradients",
      "Iridescent effects",
      "Blend modes",
    ],
    styleHints: [
      "background: conic-gradient",
      "animation: 8-12s",
      "background-size: 200%",
      "filter: saturate(1.2)",
      "blend-mode: screen",
    ],
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
    primaryColors: [
      "#DD2C00", // deep orange (material-ish)
      "#0B69FF", // primary blue
      "#00C853", // material green
      "#FFD600", // material yellow accent
    ],
    secondaryColors: [
      "#9CA3AF", // neutral gray for surfaces
      "#E5E7EB", // light surface
      "#FFA500", // tertiary warm accent
    ],
    effects: [
      "Elevation shadows (dp)",
      "Ripple effects",
      "State layers",
      "Simple hover (150-200ms)",
    ],
    styleHints: [
      "box-shadow: elevation",
      "border-radius: 4px",
      "font: Roboto",
      "display: grid",
      "gap: 8px/16px",
    ],
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
    primaryColors: [
      "#00B7FF", // vivid cyan
      "#FF006E", // hot magenta
      "#FFD700", // neon-y yellow
      "#1A1A2E", // deep indigo/navy backdrop
      "#7D3CFF", // vintage purple
    ],
    secondaryColors: [
      "#C0C0C0", // chrome / UI chrome feel
      "#00FFFF", // bright aqua accent
      "#FF10F0", // neon pink support
      "#FF8C00", // retro orange
    ],
    effects: [
      "CRT scanlines",
      "Neon glow (text-shadow+box-shadow)",
      "Glitch effects (skew/offset)",
    ],
    styleHints: [
      "text-shadow: 0 0 10px neon",
      "font-family: monospace",
      "animation: glitch",
      "filter: hue-rotate",
      "background: #000",
    ],
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
    primaryColors: [
      "#000000", // dark background
      "#0A0E27", // deep bluish black
      "#39FF14", // neon green (matrix)
      "#FFB86C", // amber / warning accent
    ],
    secondaryColors: [
      "#0080FF", // electric blue for links/accents
      "#FFD700", // gold/amber highlight
      "#BF00FF", // purple neon for emphasis
      "#1F2937", // muted slate for UI surfaces
    ],
    effects: [
      "Minimal glow (text-shadow)",
      "Dark-to-light transitions",
      "Cursor blink",
      "Typewriter animations",
    ],
    styleHints: [
      "background: #000000",
      "color: #39FF14",
      "font-family: monospace",
      "text-shadow: 0 0 10px",
      "animation: blink",
    ],
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
