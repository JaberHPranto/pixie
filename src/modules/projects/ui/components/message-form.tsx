"use client";
import { Button } from "@/components/ui/button";
import { Form, FormField } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { SelectedElement } from "@/types/element-picker";
import { useTRPC } from "@/trpc/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeftIcon,
  ArrowUpIcon,
  Loader2Icon,
  MousePointerClickIcon,
  XIcon,
} from "lucide-react";
import React from "react";
import { useForm } from "react-hook-form";
import TextAreaAutosize from "react-textarea-autosize";
import { toast } from "sonner";
import { z } from "zod";
import { UsageTracker } from "./usage-tracker";
import { useRouter } from "next/navigation";

interface Props {
  projectId: string;
  selectedElement: SelectedElement | null;
  onClearElement: () => void;
  onExitEditMode: () => void;
  isEditMode: boolean;
}

const formSchema = z.object({
  value: z
    .string()
    .min(1, { message: "Message is required" })
    .max(1000, { message: "Message is too long" }),
});

type FormType = z.infer<typeof formSchema>;

export const MessageForm = ({
  projectId,
  selectedElement,
  onClearElement,
  onExitEditMode,
  isEditMode,
}: Props) => {
  const router = useRouter();
  const [isFocused, setIsFocused] = React.useState(false);

  const queryClient = useQueryClient();

  const trpc = useTRPC();
  const { data: usage } = useQuery(trpc.usage.status.queryOptions());

  const { mutateAsync: createMessage, isPending } = useMutation(
    trpc.messages.create.mutationOptions({}),
  );

  const form = useForm<FormType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      value: "",
    },
  });

  const showUsage = !!usage;
  const isButtonDisabled = !form.formState.isValid || isPending;

  const buildMessageValue = (rawValue: string): string => {
    if (!selectedElement) return rawValue;

    const tag = selectedElement.tagName;
    const text = selectedElement.textContent
      ? ` with text "${selectedElement.textContent.substring(0, 80)}"`
      : "";
    const selector = selectedElement.selector
      ? ` (selector: ${selectedElement.selector})`
      : "";

    return `[Visual Edit — Selected <${tag}>${text}${selector}]\n${rawValue}`;
  };

  const truncatedText = selectedElement?.textContent
    ? selectedElement.textContent.length > 40
      ? selectedElement.textContent.substring(0, 40) + "…"
      : selectedElement.textContent
    : "";

  const onSubmit = async (data: FormType) => {
    const messageValue = buildMessageValue(data.value);

    await createMessage(
      { value: messageValue, projectId },
      {
        onSuccess: () => {
          form.reset();
          onExitEditMode();
          queryClient.invalidateQueries(
            trpc.messages.getMany.queryOptions({ projectId }),
          );
          queryClient.invalidateQueries(trpc.usage.status.queryOptions());
        },
        onError: (error) => {
          if (error.data?.code == "TOO_MANY_REQUESTS") {
            router.push("/pricing");
          }
          toast.error(error.message);
        },
      },
    );
  };

  return (
    <Form {...form}>
      {showUsage && (
        <UsageTracker
          points={usage?.remainingPoints ?? 0}
          msBeforeNext={usage?.msBeforeNext ?? 0}
        />
      )}

      {isEditMode && !selectedElement && (
        <div className="flex items-center gap-2 px-3 py-2 mb-1 border rounded-lg bg-blue-500/10 border-blue-500/30 text-blue-400">
          <MousePointerClickIcon className="size-3.5 shrink-0" />
          <span className="text-xs">
            Click on an element in the preview to select it for editing
          </span>
          <button
            type="button"
            onClick={onExitEditMode}
            aria-label="Exit edit mode"
            className="ml-auto text-blue-400/70 hover:text-blue-400 transition-colors"
          >
            <XIcon className="size-3.5" />
          </button>
        </div>
      )}

      {selectedElement && (
        <div className="flex items-center gap-2 px-3 py-2 mb-1 border rounded-lg bg-emerald-500/10 border-emerald-500/30">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="bg-emerald-600 text-white text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded shrink-0">
              {selectedElement.tagName}
            </span>
            {truncatedText && (
              <span className="text-xs text-muted-foreground truncate">
                {truncatedText}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={onExitEditMode}
              aria-label="Back to chat"
              className="text-muted-foreground/60 hover:text-foreground transition-colors p-0.5"
              title="Back to chat"
            >
              <ArrowLeftIcon className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={onClearElement}
              className="text-muted-foreground/60 hover:text-foreground transition-colors p-0.5"
              title="Remove selection"
            >
              <XIcon className="size-3.5" />
            </button>
          </div>
        </div>
      )}

      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn(
          "relative border p-4 pt-1 rounded-xl bg-sidebar dark:bg-sidebar transition-all",
          {
            "shadow-xs": isFocused,
            "rounded-t-none": showUsage,
          },
        )}
      >
        <FormField
          control={form.control}
          name="value"
          render={({ field }) => (
            <TextAreaAutosize
              {...field}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              disabled={isPending}
              minRows={2}
              maxRows={5}
              className="pt-4 resize-none border-none w-full outline-none bg-transparent"
              placeholder={
                selectedElement
                  ? `Ask to modify the selected <${selectedElement.tagName}> element...`
                  : "What would you like to build?"
              }
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                  e.preventDefault();
                  form.handleSubmit(onSubmit)();
                }
              }}
            />
          )}
        />

        <div className="flex gap-x-2 items-end justify-between pt-2">
          <div className="text-[10px] text-muted-foreground font-mono">
            <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium leading-none text-muted-foreground">
              <span>&#8984;</span>Enter
            </kbd>
            &nbsp; to submit
          </div>

          <Button
            className={cn(
              "size-8 rounded-full flex items-center justify-center",
              isButtonDisabled && "bg-muted-foreground border",
            )}
            disabled={isButtonDisabled}
          >
            {isPending ? (
              <Loader2Icon className="size-4 animate-spin" />
            ) : (
              <ArrowUpIcon />
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};
