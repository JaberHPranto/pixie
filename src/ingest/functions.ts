import { inngest } from "./client";
import { createAgent, openai } from "@inngest/agent-kit";
import { Sandbox } from "@e2b/code-interpreter";
import { getSandbox } from "./utils";

export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event, step }) => {
    const sandboxId = await step.run("get-sandbox-id", async () => {
      const sandbox = await Sandbox.create("pixie");
      return sandbox.sandboxId;
    });

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

    const sandboxUrl = await step.run("get-sandbox-url", async () => {
      const sandbox = await getSandbox(sandboxId);
      const host = sandbox.getHost(3000);
      return `http://${host}`;
    });

    return { output, sandboxUrl };
  }
);
