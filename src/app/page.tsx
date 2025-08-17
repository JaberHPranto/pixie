"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

export default function Home() {
  const [value, setValue] = useState("");
  const trpc = useTRPC();

  const { data: messages } = useQuery(trpc.messages.getMany.queryOptions());

  const { mutate: createMessage, isPending } = useMutation(
    trpc.messages.create.mutationOptions({
      onSuccess: () => {
        toast.success("Message created");
      },
    })
  );

  const handleSubmit = async () => {
    createMessage({ value });
  };

  return (
    <div className="mx-auto max-w-3xl flex flex-col p-20">
      <Textarea
        placeholder="What you want to summarize today?"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <Button
        onClick={handleSubmit}
        className="mt-4 w-fit self-end"
        disabled={isPending}
      >
        Summarize
      </Button>

      {JSON.stringify(messages, null, 2)}
    </div>
  );
}
