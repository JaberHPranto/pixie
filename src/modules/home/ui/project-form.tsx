"use client";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormMessage,
  FormItem,
  FormControl,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";
import { PROJECT_TEMPLATES } from "@/utils/data";
import { useClerk } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowUpIcon,
  BrushCleaning,
  Loader2Icon,
  SparklesIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import { useForm } from "react-hook-form";
import TextAreaAutosize from "react-textarea-autosize";
import { toast } from "sonner";
import { z } from "zod";
import { PromptEnhancerDialog } from "./components/prompt-enhancer-dialog";
import { PromptBuilderDialog } from "./components/prompt-builder-dialog";
import { MAX_MESSAGE_LENGTH } from "@/utils/constants";
import { LayoutTemplateIcon } from "lucide-react";

const formSchema = z.object({
  value: z
    .string()
    .min(1, { message: "Message is required" })
    .max(MAX_MESSAGE_LENGTH, { message: "Message is too long" }),
});

type FormType = z.infer<typeof formSchema>;

type Blueprint = {
  taste: string;
  layoutId: string | null;
  designSystem: {
    profile: {
      name: string;
      vibe: string;
      description: string;
    };
    colors: {
      primary: string[];
      secondary: string[];
    };
    visualRules: string[];
    typography: string[];
    motion: string[];
    effects: string[];
    styleHints: string[];
    avoids: string[];
  };
  layoutDetails: {
    name: string;
    description: string;
    structure: string[];
  } | null;
};

export const ProjectForm = () => {
  const router = useRouter();
  const clerk = useClerk();

  const [isFocused, setIsFocused] = React.useState(false);
  const [showEnhancer, setShowEnhancer] = React.useState(false);
  const [showBuilder, setShowBuilder] = React.useState(false);
  const [activeBlueprint, setActiveBlueprint] =
    React.useState<Blueprint | null>(null);

  const queryClient = useQueryClient();

  const trpc = useTRPC();
  const { mutateAsync: createProject, isPending } = useMutation(
    trpc.projects.create.mutationOptions({}),
  );

  const form = useForm<FormType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      value: "",
    },
  });

  const message = form.watch("value");
  const isButtonDisabled =
    isPending ||
    (!message && !activeBlueprint) ||
    (message?.length || 0) > MAX_MESSAGE_LENGTH;

  const onSubmit = async (data: FormType) => {
    let finalPrompt = data.value;

    if (activeBlueprint) {
      const payload = {
        ...activeBlueprint,
        prompt: data.value,
      };
      finalPrompt = JSON.stringify(payload, null, 2);
    }

    await createProject(
      { value: finalPrompt },
      {
        onSuccess: (project) => {
          queryClient.invalidateQueries(trpc.projects.getMany.queryOptions());
          queryClient.invalidateQueries(trpc.usage.status.queryOptions());
          router.push(`/projects/${project.id}`);
        },
        onError: (error) => {
          if (error.data?.code === "UNAUTHORIZED") {
            clerk.openSignIn();
          } else if (error.data?.code === "TOO_MANY_REQUESTS") {
            toast.error(error.message);
            router.push("/pricing");
          } else toast.error(error.message);
        },
      },
    );
  };

  const handleEnhancedPrompt = (enhancedPrompt: string) => {
    form.setValue("value", enhancedPrompt);
    toast.success("Prompt enhanced successfully!");
  };

  const handleOpenEnhancer = () => {
    const currentValue = form.getValues("value");
    if (!currentValue.trim()) {
      toast.error("Please enter a prompt first");
      return;
    }
    setShowEnhancer(true);
  };

  const handleBlueprintAccept = (data: {
    config: Blueprint;
    prompt: string;
  }) => {
    setActiveBlueprint(data.config);
    form.setValue("value", data.prompt);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn(
          "relative z-10 p-6 rounded-2xl backdrop-blur-2xl transition-all duration-300 border",
          "bg-white/80 border-indigo-100/50 shadow-xl ring-1 ring-indigo-50", // Light mode
          "dark:bg-slate-900/40 dark:border-white/10 dark:shadow-[0_0_40px_-10px_rgba(0,0,0,0.3)] dark:ring-0", // Dark mode
          {
            "ring-2 ring-primary/50 dark:ring-primary/40": isFocused,
          },
        )}
      >
        {/* Blueprint Badge / Indicator */}
        {activeBlueprint && (
          <div className=" mt-4 mb-2 p-3 bg-primary/10 border border-primary/20 rounded-md flex items-center justify-between animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2">
              <div className="bg-primary/20 p-1.5 rounded-full">
                <LayoutTemplateIcon className="size-3.5 text-primary" />
              </div>
              <div className="text-xs">
                <span className="font-semibold text-primary">
                  Blueprint Active:
                </span>
                <span className="ml-1 text-muted-foreground">
                  {activeBlueprint.taste}
                  {activeBlueprint.layoutId && ` + ${activeBlueprint.layoutId}`}
                </span>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive"
              onClick={() => setActiveBlueprint(null)}
            >
              <span className="sr-only">Remove</span>
              <span aria-hidden="true">&times;</span>
            </Button>
          </div>
        )}

        <FormField
          control={form.control}
          name="value"
          render={({ field }) => (
            <FormItem className="space-y-0">
              <FormControl>
                <TextAreaAutosize
                  {...field}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  disabled={isPending}
                  minRows={2}
                  maxRows={5}
                  className="pt-2 resize-none border-none w-full outline-none bg-transparent"
                  placeholder={
                    activeBlueprint
                      ? "Add any extra details..."
                      : "What would you like to build?"
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                      e.preventDefault();
                      form.handleSubmit(onSubmit)();
                    }
                  }}
                />
              </FormControl>
              <div
                className={cn(
                  "absolute -bottom-5 right-5 text-[10px] font-mono transition-colors font-medium",
                  field.value.length > MAX_MESSAGE_LENGTH
                    ? "text-destructive font-bold"
                    : "text-gray-400",
                )}
              >
                {field.value.length} / {MAX_MESSAGE_LENGTH}
              </div>
              <FormMessage className="text-[10px] absolute bottom-12 left-4" />
            </FormItem>
          )}
        />

        <div className="flex gap-x-2 items-end justify-between pt-2">
          <div className="flex items-center gap-x-2">
            <div className="text-[10px] text-muted-foreground font-mono">
              <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium leading-none text-muted-foreground">
                <span>&#8984;</span>Enter
              </kbd>
              &nbsp; to submit
            </div>
            <Button
              type="button"
              variant={"outline"}
              size={"sm"}
              className="bg-muted/50 text-xs hover:bg-muted/80 border-dashed border-primary/20 hover:border-primary/50 transition-colors"
              onClick={() => setShowBuilder(true)}
            >
              <LayoutTemplateIcon className="size-3" />
              Prompt Builder
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-8 gap-1.5 dark:text-white/80 hover:text-foreground hover:bg-primary/10 transition-colors"
              onClick={handleOpenEnhancer}
              disabled={isPending || !form.watch("value")}
            >
              <BrushCleaning className="size-3 rotate-45" />
              <span className="hidden sm:inline text-xs">Enhance</span>
            </Button>

            <Button
              type="submit"
              size={"icon"}
              className={cn(
                "size-8 rounded-full flex items-center justify-center",
                isButtonDisabled && "bg-muted-foreground border",
              )}
              disabled={isButtonDisabled}
              onClick={(e) => {
                e.preventDefault();
                form.handleSubmit(onSubmit)();
              }}
            >
              {isPending ? (
                <Loader2Icon className="size-4 animate-spin" />
              ) : (
                <ArrowUpIcon className="size-3.5" />
              )}
            </Button>
          </div>
        </div>
      </form>

      <div className="relative mt-8 hidden md:block">
        <div className="template-marquee-edge-left pointer-events-none absolute inset-y-0 left-0 z-10 w-20" />
        <div className="template-marquee-edge-right pointer-events-none absolute inset-y-0 right-0 z-10 w-20" />

        <div className="overflow-hidden rounded-full">
          <div className="template-marquee-track flex w-max items-center gap-2 pr-2">
            {[...PROJECT_TEMPLATES, ...PROJECT_TEMPLATES].map(
              (template, index) => (
                <Button
                  key={`${template.title}-${index}`}
                  variant={"outline"}
                  size={"sm"}
                  className="shrink-0 bg-background/50 hover:bg-background/80 border-transparent shadow-sm backdrop-blur-md !text-xs transition-colors"
                  onClick={() => form.setValue("value", template.prompt)}
                >
                  {template.emoji} &nbsp; {template.title}
                </Button>
              ),
            )}
          </div>
        </div>
      </div>

      <PromptEnhancerDialog
        open={showEnhancer}
        onOpenChange={setShowEnhancer}
        originalPrompt={form.watch("value")}
        onAccept={handleEnhancedPrompt}
      />

      <PromptBuilderDialog
        open={showBuilder}
        onOpenChange={setShowBuilder}
        onAccept={handleBlueprintAccept}
        initialPrompt={form.watch("value")}
      />
    </Form>
  );
};
