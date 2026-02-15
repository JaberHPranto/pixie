"use client";

import { cn } from "@/lib/utils";
import {
  TASTE_PROFILES,
  TasteProfile,
  TasteProfileId,
} from "@/utils/pixie-profiles";
import {
  CheckCircle2Icon,
  RocketIcon,
  CommandIcon,
  BookOpenIcon,
  SmileIcon,
  BoxSelectIcon,
  SparklesIcon,
  PaletteIcon,
  SmartphoneIcon,
  Gamepad2Icon,
  TerminalSquareIcon,
  LucideIcon,
  Target,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ProfileSelectorProps {
  selectedProfile: TasteProfileId | null;
  onSelect: (profile: TasteProfileId) => void;
}

export const ProfileSelector = ({
  selectedProfile,
  onSelect,
}: ProfileSelectorProps) => {
  const categories = ["All", "Core", "Expressive", "Fun"] as const;

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="space-y-1">
        <h3 className="text-lg font-semibold">Choose a Taste Profile</h3>
        <p className="text-sm text-muted-foreground">
          Profiles define the visual style, tone, and feel of your app.
        </p>
      </div>

      <Tabs defaultValue="All" className="flex-1 flex flex-col min-h-0">
        <TabsList className="w-full justify-start overflow-x-auto">
          {categories.map((cat) => (
            <TabsTrigger key={cat} value={cat}>
              {cat}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="mt-4 flex-1 min-h-0">
          <ScrollArea className="h-full pr-4">
            {categories.map((cat) => (
              <TabsContent key={cat} value={cat} className="mt-0 space-y-3">
                <div className="grid grid-cols-1 gap-3 p-1">
                  {TASTE_PROFILES.filter(
                    (p) => cat === "All" || p.badge === cat,
                  ).map((profile) => (
                    <ProfileCard
                      key={profile.id}
                      profile={profile}
                      isSelected={selectedProfile === profile.id}
                      onSelect={() => onSelect(profile.id)}
                    />
                  ))}
                </div>
              </TabsContent>
            ))}
          </ScrollArea>
        </div>
      </Tabs>
    </div>
  );
};

const getProfileIcon = (id: TasteProfileId): LucideIcon => {
  switch (id) {
    case "startup-saas":
      return RocketIcon;
    case "minimal-apple":
      return CommandIcon;
    case "developer-docs":
      return BookOpenIcon;
    case "playful-friendly":
      return SmileIcon;
    case "neubrutalism":
      return BoxSelectIcon;
    case "glass-futuristic":
      return SparklesIcon;
    case "gradient-heavy":
      return PaletteIcon;
    case "material-android":
      return SmartphoneIcon;
    case "retro-web":
      return Gamepad2Icon;
    case "terminal-hacker":
      return TerminalSquareIcon;
    default:
      return SparklesIcon;
  }
};

function ProfileCard({
  profile,
  isSelected,
  onSelect,
}: {
  profile: TasteProfile;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const Icon = getProfileIcon(profile.id);

  return (
    <div
      onClick={onSelect}
      className={cn(
        "relative flex flex-col gap-3 p-4 border rounded-xl cursor-pointer transition-all duration-300 text-left group overflow-hidden",
        isSelected
          ? "border-primary bg-primary/10 ring-1 ring-primary shadow-[inset_0_0_30px_hsl(var(--primary)/0.25)]"
          : "bg-card border-border/60 hover:border-primary/50 hover:bg-muted/30 hover:shadow-[inset_0_0_25px_hsl(var(--primary)/0.15)]",
      )}
    >
      {/* Selection Indicator */}
      {isSelected && (
        <div className="absolute top-3 right-3 text-primary animate-in fade-in zoom-in duration-300">
          <CheckCircle2Icon className="size-5 fill-primary/20" />
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-2 pr-8">
        <span className="font-semibold text-base text-foreground tracking-tight">
          {profile.name}
        </span>
        <Badge
          variant="secondary"
          className={cn(
            "text-[10px] h-5 px-1.5 uppercase tracking-wide opacity-90 shadow-sm",
            profile.badge === "Core" &&
              "bg-primary/10 text-primary hover:bg-primary/20",
            profile.badge === "Expressive" &&
              "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20",
            profile.badge === "Fun" &&
              "bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20",
          )}
        >
          {profile.badge}
        </Badge>
      </div>

      {/* Description */}
      <p className="text-sm text-foreground/80 line-clamp-2 leading-relaxed font-normal">
        {profile.description}
      </p>

      {/* Best For Section */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-muted-foreground mt-2">
        <div className="flex items-center gap-1.5 text-primary/90 font-medium whitespace-nowrap">
          <Target className="size-3.5" />
          <span>Best for:</span>
        </div>
        <div className="flex flex-wrap gap-1.5 text-foreground/70">
          {profile.bestFor.slice(0, 3).map((item, i) => (
            <span key={i} className="inline-flex items-center">
              {i > 0 && <span className="mr-1.5 opacity-30">•</span>}
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* Visual Rules & Vibe */}
      <div className="flex flex-wrap items-center gap-2 mt-auto pt-2 border-t border-border/40 w-full">
        <div className="flex items-center gap-1.5 text-xs font-medium text-foreground/80 bg-background/50 px-2 py-0.5 rounded-md border shadow-sm">
          <Icon className="size-3.5 text-primary/70" />
          <span>{profile.vibe.split(",")[0]}</span>
        </div>

        {profile.visualRules.slice(0, 2).map((rule, i) => (
          <Badge
            key={i}
            variant="outline"
            className="text-[10px] font-normal bg-muted/30 text-muted-foreground border-border/60 px-2 py-0.5"
          >
            {rule}
          </Badge>
        ))}

        {/* Color Swatches */}
        <div className="ml-auto flex -space-x-1.5">
          {profile.primaryColors.slice(0, 4).map((color, i) => (
            <div
              key={i}
              className="size-4 rounded-full border border-border/50 ring-1 ring-background shadow-sm"
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
