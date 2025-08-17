"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function Home() {
  const router = useRouter();

  const [value, setValue] = useState("");
  const trpc = useTRPC();

  const { mutate: creteProject, isPending } = useMutation(
    trpc.projects.create.mutationOptions({
      onSuccess: (project) => {
        router.push(`/projects/${project.id}`);
        toast.success("Message created");
      },
    })
  );

  const handleSubmit = async () => {
    // console.log("Clicked");
    creteProject({ value });
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
    </div>
  );
}
