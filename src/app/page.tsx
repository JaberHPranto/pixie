"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";

export default function Home() {
  const [value, setValue] = useState("");
  const trpc = useTRPC();
  const invoke = useMutation(trpc.invoke.mutationOptions({}));

  const handleSubmit = async () => {
    await invoke.mutateAsync({ value });
  };

  return (
    <div className="text-3xl max-w-3xl flex flex-col p-20">
      <Textarea
        placeholder="What you want to summarize today?"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <Button
        disabled={!value || invoke.isPending}
        onClick={handleSubmit}
        className="mt-4 w-fit self-end"
      >
        Summarize
      </Button>
    </div>
  );
}
