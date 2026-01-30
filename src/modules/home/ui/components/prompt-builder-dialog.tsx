"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  LAYOUT_ARCHETYPES,
  LayoutArchetypeId,
  TASTE_PROFILES,
  TasteProfileId,
} from "@/utils/pixie-profiles";
import { DialogDescription } from "@radix-ui/react-dialog";
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import { BuilderSummary } from "./builder/builder-summary";
import { LayoutSelector } from "./builder/layout-selector";
import { ProfileSelector } from "./builder/profile-selector";

interface BlueprintConfig {
  taste: string;
  layout: string;
  constraints: unknown;
  structure: unknown;
}

interface PromptBuilderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAccept: (data: { config: BlueprintConfig; prompt: string }) => void;
  initialPrompt?: string;
}

type Step = "profile" | "layout" | "refine";

export const PromptBuilderDialog = ({
  open,
  onOpenChange,
  onAccept,
  initialPrompt = "",
}: PromptBuilderDialogProps) => {
  const [currentStep, setCurrentStep] = useState<Step>("profile");

  const [selectedProfile, setSelectedProfile] = useState<TasteProfileId | null>(
    null,
  );
  const [selectedLayout, setSelectedLayout] =
    useState<LayoutArchetypeId | null>(null);
  const [customInstructions, setCustomInstructions] = useState(initialPrompt);

  const handleNext = () => {
    if (currentStep === "profile" && selectedProfile) setCurrentStep("layout");
    else if (currentStep === "layout" && selectedLayout)
      setCurrentStep("refine");
  };

  const handleBack = () => {
    if (currentStep === "layout") setCurrentStep("profile");
    else if (currentStep === "refine") setCurrentStep("layout");
  };

  const handleFinish = () => {
    if (!selectedProfile || !selectedLayout) return;

    try {
      const profile = TASTE_PROFILES.find((p) => p.id === selectedProfile);
      const layout = LAYOUT_ARCHETYPES.find((l) => l.id === selectedLayout);

      if (!profile || !layout) throw new Error("Invalid selection");

      const config = {
        taste: selectedProfile,
        layout: selectedLayout,
        constraints: {
          vibe: profile.vibe,
          visualRules: profile.visualRules,
          typography: profile.typography,
          motion: profile.motion,
        },
        structure: layout.structure,
      };

      onAccept({ config, prompt: customInstructions });
      onOpenChange(false);
      toast.success("Blueprint ready!");

      // Reset state after slight delay
      setTimeout(() => {
        setCurrentStep("profile");
        setSelectedProfile(null);
        setSelectedLayout(null);
      }, 500);
    } catch (e) {
      toast.error("Failed to build prompt");
      console.error(e);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-6xl h-[85vh] p-0 gap-0 overflow-hidden flex flex-col sm:flex-row">
        <div className="flex-1 flex flex-col min-w-0 bg-background relative z-10">
          <DialogHeader className="px-6 py-4.5 border-b shrink-0">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Image
                src="/pixie-icon-logo.png"
                alt="Pixie Logo"
                width={28}
                height={28}
                className="mt-1"
              />
              Start a New Project
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm ml-8.5 -mt-1">
              Choose a profile and layout to get started.
            </DialogDescription>
          </DialogHeader>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {currentStep === "profile" && (
              <div className="animation-in slide-in-from-left-4 fade-in duration-300 h-full">
                <ProfileSelector
                  selectedProfile={selectedProfile}
                  onSelect={(id) => {
                    setSelectedProfile(id);
                  }}
                />
              </div>
            )}

            {currentStep === "layout" && (
              <div className="animation-in slide-in-from-right-4 fade-in duration-300 h-full">
                <LayoutSelector
                  selectedLayout={selectedLayout}
                  selectedProfileId={selectedProfile}
                  onSelect={(id) => setSelectedLayout(id)}
                />
              </div>
            )}

            {currentStep === "refine" && (
              <div className="space-y-4 animation-in slide-in-from-right-4 fade-in duration-300">
                <div>
                  <h3 className="text-lg font-semibold">Final Touches</h3>
                  <p className="text-sm text-muted-foreground">
                    Add specific details about your project.
                  </p>
                </div>

                <Textarea
                  placeholder="e.g. A marketplace for vintage cameras with a dark theme..."
                  className="min-h-[200px] text-base p-4 resize-none bg-muted/40 focus-visible:border-none focus-visible:ring-offset-0 focus-visible:ring-2"
                  value={customInstructions}
                  onChange={(e) => setCustomInstructions(e.target.value)}
                  autoFocus
                />
              </div>
            )}
          </div>

          {/* Footer Navigation */}
          <div className="p-4 border-t flex items-center justify-between bg-muted/10">
            <div className="flex gap-2">
              {currentStep !== "profile" && (
                <Button variant="ghost" onClick={handleBack}>
                  <ArrowLeftIcon className="size-4 mr-2" />
                  Back
                </Button>
              )}
            </div>

            <div className="flex gap-2">
              {currentStep !== "refine" ? (
                <Button
                  onClick={handleNext}
                  disabled={
                    (currentStep === "profile" && !selectedProfile) ||
                    (currentStep === "layout" && !selectedLayout)
                  }
                >
                  Next
                  <ArrowRightIcon className="size-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleFinish}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <CheckIcon className="size-4 mr-2" />
                  Create Blueprint
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="w-[350px] lg:w-[400px] hidden sm:block h-full border-l shrink-0">
          <BuilderSummary
            selectedProfileId={selectedProfile}
            selectedLayoutId={selectedLayout}
            customInstructions={customInstructions}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
