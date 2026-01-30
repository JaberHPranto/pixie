"use client";

import { cn } from "@/lib/utils";
import {
  LAYOUT_ARCHETYPES,
  LayoutArchetype,
  LayoutArchetypeId,
  TasteProfileId,
  TASTE_PROFILES,
} from "@/utils/pixie-profiles";
import { CheckCircle2Icon, LayoutTemplateIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface LayoutSelectorProps {
  selectedLayout: LayoutArchetypeId | null;
  selectedProfileId: TasteProfileId | null;
  onSelect: (layout: LayoutArchetypeId) => void;
}

export const LayoutSelector = ({
  selectedLayout,
  selectedProfileId,
  onSelect,
}: LayoutSelectorProps) => {
  const selectedProfile = TASTE_PROFILES.find(
    (p) => p.id === selectedProfileId,
  );

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="space-y-1">
        <h3 className="text-lg font-semibold">Choose a Structure</h3>
        <p className="text-sm text-muted-foreground">
          Layout archetypes define the wireframe and components of the page.
        </p>
      </div>

      <ScrollArea className="flex-1 h-[400px] pr-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-4 p-1">
          {LAYOUT_ARCHETYPES.map((layout) => {
            const isRecommended =
              selectedProfile && layout.bestFor.includes(selectedProfile.id);
            return (
              <LayoutCard
                key={layout.id}
                layout={layout}
                isSelected={selectedLayout === layout.id}
                isRecommended={!!isRecommended}
                onSelect={() => onSelect(layout.id)}
              />
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};

function LayoutCard({
  layout,
  isSelected,
  isRecommended,
  onSelect,
}: {
  layout: LayoutArchetype;
  isSelected: boolean;
  isRecommended: boolean;
  onSelect: () => void;
}) {
  return (
    <div
      onClick={onSelect}
      className={cn(
        "relative flex flex-col gap-3 p-4 border rounded-xl cursor-pointer transition-all hover:border-primary/50 hover:bg-muted/50 text-left",
        isSelected
          ? "border-primary bg-primary/5 ring-1 ring-primary"
          : "bg-card border-border",
        isRecommended && !isSelected && "border-primary/40 bg-primary/5", // Highlight recommended
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <LayoutTemplateIcon className="size-4 text-muted-foreground" />
          {isRecommended && (
            <Badge
              variant="default"
              className="text-[10px] h-4 px-2 py-1 bg-green-600/90 hover:bg-green-600"
            >
              Recommended
            </Badge>
          )}
        </div>
        {isSelected && (
          <CheckCircle2Icon className="size-5 text-primary shrink-0" />
        )}
      </div>

      <div>
        <span className="font-semibold text-sm">{layout.name}</span>
        <p className="text-xs text-muted-foreground/75 dark:text-muted-foreground line-clamp-2 mt-1">
          {layout.description}
        </p>
      </div>

      <div className="flex flex-wrap gap-1 mt-auto pt-2">
        {layout.structure.slice(0, 3).map((item, i) => (
          <span
            key={i}
            className="text-[10px] text-secondary-foreground dark:text-secondary-foreground bg-secondary/90 px-1.5 py-0.5 rounded-sm dark:bg-secondary/75"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
