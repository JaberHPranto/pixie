"use client";

import {
  LayoutArchetypeId,
  TASTE_PROFILES,
  LAYOUT_ARCHETYPES,
  TasteProfileId,
} from "@/utils/pixie-profiles";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ArrowRightIcon,
  BookMarked,
  LayoutTemplateIcon,
  PaintbrushIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface BuilderSummaryProps {
  selectedProfileId: TasteProfileId | null;
  selectedLayoutId: LayoutArchetypeId | null;
  customInstructions: string;
}

export const BuilderSummary = ({
  selectedProfileId,
  selectedLayoutId,
  customInstructions,
}: BuilderSummaryProps) => {
  const profile = TASTE_PROFILES.find((p) => p.id === selectedProfileId);
  const layout = LAYOUT_ARCHETYPES.find((l) => l.id === selectedLayoutId);

  return (
    <div className="flex flex-col h-full bbg-muted/75 dark:bg-muted/30 border-l ">
      <div className="p-6 border-b">
        <h3 className="text-lg font-semibold">Pixie Blueprint</h3>
        <p className="text-sm text-muted-foreground">
          Live preview of your generation settings.
        </p>
      </div>

      <div className="flex-1 min-h-0">
        <ScrollArea className="h-full">
          <div className="p-6 space-y-6">
            {/* Section 1: Taste Profile */}
            <Section
              icon={PaintbrushIcon}
              title="Design DNA"
              emptyText="Select a taste profile to define the vibe."
              isFilled={!!profile}
            >
              {profile && (
                <div className="space-y-3 animation-in bg-card p-4 rounded-lg border shadow-sm">
                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="font-semibold">{profile.name}</span>
                    <Badge
                      variant="secondary"
                      className="text-[10px] uppercase"
                    >
                      {profile.badge}
                    </Badge>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase font-semibold">
                      Vibe
                    </p>
                    <p className="text-sm">{profile.vibe}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground uppercase font-semibold">
                        Visuals
                      </p>
                      <ul className="text-xs list-disc pl-3 text-muted-foreground">
                        {profile.visualRules.slice(0, 3).map((r, i) => (
                          <li key={i}>{r}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </Section>

            {/* Section 2: Layout Structure */}
            <Section
              icon={LayoutTemplateIcon}
              title="Structural Blueprint"
              emptyText="Select a layout structure."
              isFilled={!!layout}
              className={!profile ? "opacity-50" : ""}
            >
              {layout && (
                <div className="space-y-3 animation-in bg-card p-4 rounded-lg border shadow-sm">
                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="font-semibold">{layout.name}</span>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground uppercase font-semibold">
                      Composition
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {layout.structure.map((item, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded"
                        >
                          <span>{item}</span>
                          {i < layout.structure.length - 1 && (
                            <ArrowRightIcon className="size-3 text-muted-foreground/50" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </Section>

            {/* Section 3: Custom Instructions */}
            {customInstructions && (
              <Section
                icon={BookMarked}
                title="Custom Context"
                emptyText=""
                isFilled={true}
              >
                <div className="bg-card p-4 rounded-lg border shadow-sm text-sm whitespace-pre-wrap">
                  {customInstructions}
                </div>
              </Section>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

function Section({
  icon: Icon,
  title,
  emptyText,
  isFilled,
  children,
  className,
}: {
  icon: React.ElementType;
  title: string;
  emptyText: string;
  isFilled: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center gap-2 text-primary/80">
        <Icon className="size-4" />
        <h4 className="text-xs font-bold uppercase tracking-wider">{title}</h4>
      </div>

      {!isFilled ? (
        <div className="p-4 border-2 border-dashed rounded-lg text-sm text-muted-foreground text-center bg-muted/20">
          {emptyText}
        </div>
      ) : (
        children
      )}
    </div>
  );
}
