/* eslint-disable @typescript-eslint/no-explicit-any */
import { Sandbox } from "@e2b/code-interpreter";
import {
  createAgent,
  createNetwork,
  createTool,
  openai,
} from "@inngest/agent-kit";
import { z } from "zod";
import { inngest } from "./client";
import { getSandbox, lastAssistantTextMessage } from "./utils";
import { SYSTEM_PROMPT } from "@/utils/prompt";

export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event, step }) => {
    const sandboxId = await step.run("get-sandbox-id", async () => {
      const sandbox = await Sandbox.create("pixie");
      return sandbox.sandboxId;
    });

    const codeAgent = createAgent({
      name: "code-agent",
      description: "An expert coding agent",
      system: SYSTEM_PROMPT,
      model: openai({
        model: "gpt-4.1",
        defaultParameters: { temperature: 0.1 },
      }),
      tools: [
        // Terminal Tool
        createTool({
          name: "terminal",
          description: "Use the terminal to run commands",
          parameters: z.object({
            command: z.string(),
          }) as any,
          handler: async ({ command }, { step }) => {
            return await step?.run("terminal", async () => {
              const buffers = { stdout: "", stderr: "" };

              try {
                const sandbox = await getSandbox(sandboxId);
                const { stdout } = await sandbox.commands.run(command, {
                  onStdout(chunk) {
                    buffers.stdout += chunk;
                  },
                  onStderr(chunk) {
                    buffers.stderr += chunk;
                  },
                });

                return stdout;
              } catch (error) {
                console.error(
                  `Command failed\n${error} \nstdout: ${buffers.stdout}\nstderr: ${buffers.stderr}`
                );

                return `Command failed\n${error} \nstdout: ${buffers.stdout}\nstderr: ${buffers.stderr}`;
              }
            });
          },
        }),

        // Create or Update Files Tool
        createTool({
          name: "createOrUpdateFiles",
          description: "Create or update files in the sandbox",
          parameters: z.object({
            files: z.array(
              z.object({
                path: z.string(),
                content: z.string(),
              })
            ),
          }) as any,
          handler: async ({ files }, { step, network }) => {
            const newFiles = await step?.run(
              "createOrUpdateFiles",
              async () => {
                try {
                  const updatedFiles = network.state.data.files || {};
                  const sandbox = await getSandbox(sandboxId);
                  for (const file of files) {
                    await sandbox.files.write(file.path, file.content);
                    updatedFiles[file.path] = file.content;
                  }

                  return updatedFiles;
                } catch (error) {
                  return `Failed to create or update files: ${error}`;
                }
              }
            );

            if (typeof newFiles === "object")
              network.state.data.files = newFiles;
          },
        }),

        // Read Files Tool
        createTool({
          name: "readFiles",
          description: "Read files from the sandbox",
          parameters: z.object({
            files: z.array(z.string()),
          }) as any,
          handler: async ({ files }, { step }) => {
            return await step?.run("readFiles", async () => {
              try {
                const sandbox = await getSandbox(sandboxId);
                const contents = [];

                for (const file of files) {
                  const content = await sandbox.files.read(file);
                  contents.push({ path: file, content });
                }
                return JSON.stringify(contents);
              } catch (error) {
                return `Failed to read files: ${error}`;
              }
            });
          },
        }),
      ],

      lifecycle: {
        onResponse: async ({ result, network }) => {
          const lastAssistantText = lastAssistantTextMessage(result);

          if (lastAssistantText && network) {
            if (lastAssistantText.includes("<task_summary>")) {
              network.state.data.summary = lastAssistantText;
            }
          }

          return result;
        },
      },
    });

    const network = createNetwork({
      name: "coding-agent-network",
      agents: [codeAgent],
      maxIter: 15,
      router: async ({ network }) => {
        const summary = network.state.data.summary;

        // break the loop
        if (summary) {
          return summary;
        }

        return codeAgent;
      },
    });

    const result = await network.run(event.data.value);

    const sandboxUrl = await step.run("get-sandbox-url", async () => {
      const sandbox = await getSandbox(sandboxId);
      const host = sandbox.getHost(3000);
      return `http://${host}`;
    });

    return {
      url: sandboxUrl,
      title: "Fragment",
      files: (result.state as any)?.data.files,
      summary: (result.state as any)?.data?.summary,
    };
  }
);
