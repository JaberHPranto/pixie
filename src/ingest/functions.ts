import { inngest } from "./client";
import { createAgent, openai } from "@inngest/agent-kit";

export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event }) => {
    const summarizer = createAgent({
      name: "summarizer",
      description: "summarizer agent",
      system:
        "You are a helpful assistant that summarizes text. You are given a text and you have to summarize within 2 sentences.",
      model: openai({ model: "gpt-4o-mini" }),
    });

    const { output } = await summarizer.run(
      `Summarize the following text: ${event.data.value}`
    );

    return { output };
  }
);
