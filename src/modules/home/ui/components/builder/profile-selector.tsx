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
        "relative flex flex-col gap-2 p-4 border rounded-xl cursor-pointer transition-all hover:border-primary/50 hover:bg-muted/50 text-left",
        isSelected
          ? "border-primary bg-primary/5 ring-1 ring-primary"
          : "bg-card border-border",
      )}
    >
      <div className="flex items-start justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold">{profile.name}</span>
          <Badge variant="outline" className="text-[10px] h-5 px-1.5 uppercase">
            {profile.badge}
          </Badge>
        </div>
        {isSelected && (
          <CheckCircle2Icon className="size-5 text-primary shrink-0" />
        )}
      </div>

      <p className="text-sm text-muted-foreground/75 dark:text-muted-foreground line-clamp-2 mb-2">
        {profile.description}
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5 text-xs font-medium text-foreground/90 bg-muted px-2 py-0.5 rounded-md border">
          <Icon className="size-3.5 text-primary" />
          <span>{profile.vibe.split(",")[0]}</span>
        </div>

        {profile.visualRules.slice(0, 3).map((rule, i) => (
          <Badge
            key={i}
            variant="secondary"
            className="text-[10px] font-normal bg-secondary/90 dark:bg-secondary/75 px-2 py-0.5"
          >
            {rule}
          </Badge>
        ))}
      </div>
    </div>
  );
}
