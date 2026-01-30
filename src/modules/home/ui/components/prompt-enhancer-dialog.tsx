"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import {
  Loader2Icon,
  SparklesIcon,
  CheckIcon,
  CodeIcon,
  LayoutDashboardIcon,
  PaletteIcon,
  ScaleIcon,
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { MarkdownRenderer } from "@/components/markdown-renderer";

interface PromptEnhancerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  originalPrompt: string;
  onAccept: (enhancedPrompt: string) => void;
}

type EnhancementStyle =
  | "developer"
  | "productManager"
  | "designer"
  | "balanced";

const STYLES = [
  {
    id: "balanced" as const,
    name: "Balanced",
    icon: ScaleIcon,
    description: "Comprehensive & all-around",
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/20",
  },
  {
    id: "developer" as const,
    name: "Developer",
    icon: CodeIcon,
    description: "Technical & implementation-focused",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
  },
  {
    id: "productManager" as const,
    name: "Product Manager",
    icon: LayoutDashboardIcon,
    description: "User-focused & feature-oriented",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/20",
  },
  {
    id: "designer" as const,
    name: "Designer",
    icon: PaletteIcon,
    description: "Visual & UX-focused design",
    color: "text-pink-500",
    bgColor: "bg-pink-500/10",
    borderColor: "border-pink-500/20",
  },
];

export const PromptEnhancerDialog = ({
  open,
  onOpenChange,
  originalPrompt,
  onAccept,
}: PromptEnhancerDialogProps) => {
  const trpc = useTRPC();
  const [selectedStyle, setSelectedStyle] =
    useState<EnhancementStyle>("balanced");
  const [enhancedPrompt, setEnhancedPrompt] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"original" | "enhanced">(
    "enhanced",
  );
  const [cache, setCache] = useState<Partial<Record<EnhancementStyle, string>>>(
    {},
  );

  const { mutate: enhance, isPending } = useMutation({
    ...trpc.ai.enhancePrompt.mutationOptions({}),
    onSuccess: (data) => {
      setEnhancedPrompt(data.enhanced);
      setCache((prev) => ({
        ...prev,
        [data.style as EnhancementStyle]: data.enhanced,
      }));
      setActiveTab("enhanced");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to enhance prompt");
    },
  });

  const handleEnhance = (style?: EnhancementStyle) => {
    if (!originalPrompt.trim()) {
      toast.error("Please enter a prompt first");
      return;
    }
    const styleToUse = style || selectedStyle;
    setSelectedStyle(styleToUse);

    const cached = cache[styleToUse];
    if (cached) {
      setEnhancedPrompt(cached);
      setActiveTab("enhanced");
      return;
    }

    setEnhancedPrompt("");
    enhance({ prompt: originalPrompt, style: styleToUse });
  };

  const handleAccept = () => {
    if (enhancedPrompt) {
      onAccept(enhancedPrompt);
      onOpenChange(false);
      setEnhancedPrompt("");
      setCache({});
      setActiveTab("enhanced");
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setEnhancedPrompt("");
    setActiveTab("enhanced");
  };

  // Auto-enhance when dialog opens
  useEffect(() => {
    if (open && !enhancedPrompt && !isPending && originalPrompt.trim()) {
      handleEnhance();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const selectedStyleConfig = STYLES.find((s) => s.id === selectedStyle);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="sm:max-w-4xl h-[90vh] flex flex-col p-0 gap-0"
        onPointerDownOutside={(e) => {
          if (isPending) {
            e.preventDefault();
          }
        }}
        onEscapeKeyDown={(e) => {
          if (isPending) {
            e.preventDefault();
          }
        }}
      >
        <DialogHeader className="px-6 pt-6 pb-4 border-b shrink-0">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <SparklesIcon className="size-5 text-primary" />
            AI Prompt Enhancer
          </DialogTitle>
          <DialogDescription className="text-base">
            Choose an enhancement style to transform your prompt into a detailed
            specification
          </DialogDescription>
        </DialogHeader>

        {/* Enhancement Style Selector */}
        <div className="px-6 py-4 border-b bg-muted/30 shrink-0">
          <h3 className="text-sm font-semibold mb-3">Enhancement Style</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {STYLES.map((style) => {
              const Icon = style.icon;
              const isSelected = selectedStyle === style.id;
              return (
                <button
                  key={style.id}
                  onClick={() => handleEnhance(style.id)}
                  disabled={isPending}
                  className={cn(
                    "relative p-4 rounded-lg border-2 transition-all text-left",
                    "hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed",
                    isSelected
                      ? `${style.borderColor} ${style.bgColor} shadow-sm`
                      : "border-border bg-background hover:border-primary/30",
                  )}
                >
                  <div className="flex items-start gap-3">
                    <Icon
                      className={cn(
                        "size-5 shrink-0",
                        isSelected ? style.color : "text-muted-foreground",
                      )}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm mb-1">
                        {style.name}
                      </div>
                      <div className="text-xs text-muted-foreground line-clamp-2">
                        {style.description}
                      </div>
                    </div>
                  </div>
                  {isSelected && (
                    <div
                      className={cn(
                        "absolute top-2 right-2 size-2 rounded-full",
                        style.color.replace("text-", "bg-"),
                      )}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Area with Tabs */}
        <div className="flex-1 min-h-0">
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as "original" | "enhanced")}
            className="h-full flex flex-col"
          >
            <div className="px-6 py-2 border-b shrink-0">
              <TabsList className="h-9">
                <TabsTrigger value="original" className="text-sm">
                  Original Prompt
                </TabsTrigger>
                <TabsTrigger value="enhanced" className="text-sm">
                  Enhanced Specification
                  {enhancedPrompt && (
                    <span
                      className={cn(
                        "ml-2 size-2 rounded-full",
                        selectedStyleConfig?.color.replace("text-", "bg-"),
                      )}
                    />
                  )}
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 min-h-0">
              <TabsContent value="original" className="h-full m-0 p-0">
                <ScrollArea className="h-full">
                  <div className="px-6 py-6">
                    <p className="text-base leading-relaxed whitespace-pre-wrap">
                      {originalPrompt}
                    </p>
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="enhanced" className="h-full m-0 p-0">
                <ScrollArea className="h-full">
                  <div className="px-6 py-6">
                    {isPending ? (
                      <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <Loader2Icon className="size-12 animate-spin text-primary" />
                        <div className="text-center space-y-2">
                          <p className="text-lg font-medium">
                            Enhancing your prompt...
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Creating a {selectedStyleConfig?.name.toLowerCase()}{" "}
                            specification
                          </p>
                        </div>
                      </div>
                    ) : enhancedPrompt ? (
                      <MarkdownRenderer content={enhancedPrompt} />
                    ) : (
                      <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <SparklesIcon className="size-16 text-muted-foreground/30" />
                        <div className="text-center space-y-2">
                          <p className="text-base font-medium text-muted-foreground">
                            Select an enhancement style above
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Your enhanced specification will appear here
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-muted/30 shrink-0">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={handleClose}
              disabled={isPending}
              className="text-muted-foreground"
            >
              Cancel
            </Button>

            <div className="flex items-center gap-2">
              <Button
                onClick={handleAccept}
                disabled={!enhancedPrompt || isPending}
                size="lg"
              >
                <CheckIcon className="size-4" />
                Use Enhanced Prompt
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
