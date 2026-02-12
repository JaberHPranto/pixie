"use client";
import { Button } from "@/components/ui/button";
import { Form, FormField } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowUpIcon, Loader2Icon } from "lucide-react";
import React from "react";
import { useForm } from "react-hook-form";
import TextAreaAutosize from "react-textarea-autosize";
import { toast } from "sonner";
import { z } from "zod";
import { UsageTracker } from "./usage-tracker";
import { useRouter } from "next/navigation";

interface Props {
  projectId: string;
}

const formSchema = z.object({
  value: z
    .string()
    .min(1, { message: "Message is required" })
    .max(1000, { message: "Message is too long" }),
});

type FormType = z.infer<typeof formSchema>;

export const MessageForm = ({ projectId }: Props) => {
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

  const onSubmit = async (data: FormType) => {
    await createMessage(
      { value: data.value, projectId },
      {
        onSuccess: () => {
          form.reset();
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
              placeholder="What would you like to build?"
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
