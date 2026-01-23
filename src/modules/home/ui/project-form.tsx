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
import { ArrowUpIcon, Loader2Icon, SparklesIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import { useForm } from "react-hook-form";
import TextAreaAutosize from "react-textarea-autosize";
import { toast } from "sonner";
import { z } from "zod";
import { PromptEnhancerDialog } from "./components/prompt-enhancer-dialog";
import { MAX_MESSAGE_LENGTH } from "@/utils/constants";

const formSchema = z.object({
  value: z
    .string()
    .min(1, { message: "Message is required" })
    .max(MAX_MESSAGE_LENGTH, { message: "Message is too long" }),
});

type FormType = z.infer<typeof formSchema>;

export const ProjectForm = () => {
  const router = useRouter();
  const clerk = useClerk();

  const [isFocused, setIsFocused] = React.useState(false);
  const [showEnhancer, setShowEnhancer] = React.useState(false);

  const queryClient = useQueryClient();

  const trpc = useTRPC();
  const { mutateAsync: createMessage, isPending } = useMutation(
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
    isPending || !message || message.length > MAX_MESSAGE_LENGTH;

  const onSubmit = async (data: FormType) => {
    await createMessage(
      { value: data.value },
      {
        onSuccess: (project) => {
          queryClient.invalidateQueries(trpc.projects.getMany.queryOptions());
          router.push(`/projects/${project.id}`);
        },
        onError: (error) => {
          if (error.data?.code === "UNAUTHORIZED") {
            clerk.openSignIn();
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

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn(
          "relative border p-4 pt-1 rounded-xl bg-sidebar dark:bg-sidebar transition-all",
          {
            "shadow-xs": isFocused,
          },
        )}
      >
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
                  className="pt-4 resize-none border-none w-full outline-none bg-transparent"
                  placeholder="What would you like to build?"
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
          <div className="text-[10px] text-muted-foreground font-mono">
            <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium leading-none text-muted-foreground">
              <span>&#8984;</span>Enter
            </kbd>
            &nbsp; to submit
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-8 gap-1.5"
              onClick={handleOpenEnhancer}
              disabled={isPending || !form.watch("value")}
            >
              <SparklesIcon className="size-3.5" />
              <span className="hidden sm:inline">Enhance</span>
            </Button>

            <Button
              type="submit"
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
                <ArrowUpIcon />
              )}
            </Button>
          </div>
        </div>
      </form>

      <div className="max-w-3xl mx-auto md:flex flex-wrap justify-center gap-2 hidden mt-8">
        {PROJECT_TEMPLATES.map((template) => (
          <Button
            key={template.title}
            variant={"outline"}
            size={"sm"}
            className="bg-white dark:bg-sidebar"
            onClick={() => form.setValue("value", template.prompt)}
          >
            {template.emoji} &nbsp; {template.title}
          </Button>
        ))}
      </div>

      <PromptEnhancerDialog
        open={showEnhancer}
        onOpenChange={setShowEnhancer}
        originalPrompt={form.watch("value")}
        onAccept={handleEnhancedPrompt}
      />
    </Form>
  );
};
