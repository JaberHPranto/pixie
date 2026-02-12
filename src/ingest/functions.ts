/* eslint-disable @typescript-eslint/no-explicit-any */
import { Sandbox } from "@e2b/code-interpreter";
import {
  createAgent,
  createNetwork,
  createTool,
  openai,
  type Tool,
} from "@inngest/agent-kit";
import { z } from "zod";
import { inngest } from "./client";
import { getSandbox, lastAssistantTextMessage } from "./utils";
import { SYSTEM_PROMPT } from "@/utils/prompt";
import { prisma } from "@/lib/db";
import { searchUnsplashPhoto } from "@/lib/unsplash";

interface AgentState {
  summary: string;
  files: {
    [path: string]: string;
  };
}

export const codeAgentFunction = inngest.createFunction(
  { id: "code-agent", retries: 3 },
  { event: "code-agent/run" },
  async ({ event, step }) => {
    const sandboxId = await step.run("get-sandbox-id", async () => {
      const sandbox = await Sandbox.create("pixie");
      return sandbox.sandboxId;
    });

    const codeAgent = createAgent<AgentState>({
      name: "code-agent",
      description: "An expert coding agent",
      system: SYSTEM_PROMPT,
      model: openai({
        // model: "gpt-5.2",
        model: "gpt-4o",
        // defaultParameters: { temperature: 0.1 },
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
                  `Command failed\n${error} \nstdout: ${buffers.stdout}\nstderr: ${buffers.stderr}`,
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
              }),
            ),
          }) as any,
          handler: async (
            { files },
            { step, network }: Tool.Options<AgentState>,
          ) => {
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
              },
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

        // unsplash tool
        createTool({
          name: "unsplashImage",
          description:
            "Search unsplash for an image and download an image into /public/assets/images folder in the sandbox. Return the local path and attribute the image.",
          parameters: z.object({
            query: z.string(),
            orientation: z
              .enum(["landscape", "portrait", "squarish"])
              .default("landscape"),
            purpose: z
              .enum(["hero", "feature", "background", "listing", "generic"])
              .default("generic"),
            filenameHint: z.string().default(""),
          }) as any,
          handler: async (
            { query, orientation, purpose, filenameHint },
            { step },
          ) => {
            const accessKey = process.env.UNSPLASH_ACCESS_KEY;
            if (!accessKey) {
              return "Unsplash access key is not configured.";
            }

            let searchResult;
            let photo;

            try {
              searchResult = await searchUnsplashPhoto(
                accessKey,
                query,
                orientation,
              );
              photo = searchResult.results[0];
            } catch (error) {
              return `Failed to search Unsplash: ${error instanceof Error ? error.message : String(error)}`;
            }

            if (searchResult.results.length === 0 || !photo) {
              return `No results found for query: ${query}`;
            }

            const imageUrl =
              purpose === "background" ? photo.urls.full : photo.urls.regular;
            if (!imageUrl) {
              return `No suitable image URL found for query: ${query}`;
            }

            const safeSlug = String(filenameHint ?? photo.id ?? query)
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-") // Replaces any non-alphanumeric characters with hyphens

              .replace(/(^-|-$)+/g, "") // Removes leading/trailing hyphens
              .slice(0, 60); // Limits the length to 60 characters

            const publicDir = "/home/user/public/assets/images";
            const localPath = `${publicDir}/${safeSlug}.jpg`;
            const publicPath = `/assets/images/${safeSlug}.jpg`;

            const sandbox = await getSandbox(sandboxId);
            await sandbox.commands.run(`mkdir -p "${publicDir}"`);

            // Use curl to download the image to the sandbox
            const cmd = `curl -L --fail --silent --show-error "${imageUrl}" -o "${localPath}"`;

            const result = await sandbox.commands.run(cmd);

            /**
             * Exit Code Convention:
             * 0 = Success (everything worked fine)
             * Non-zero (1, 2, 3, etc.) = Error/Failure (something went wrong)
             */
            if (result.exitCode !== 0) {
              return `Failed to download image. Command: ${cmd}, Error: ${result.stderr}`;
            }

            return JSON.stringify({
              publicPath,
              localFilePath: localPath,
              attributions: {
                photographerName: photo.user.name,
                photographerUsername: photo.user.username,
                photoLink: photo.links.html,
                attributionUrl: `https://unsplash.com/@${photo.user.username}?utm_source=pixie&utm_medium=referral`,
              },
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

    const network = createNetwork<AgentState>({
      name: "coding-agent-network",
      agents: [codeAgent],
      maxIter: 15,
      router: async ({ network }) => {
        const summary = network.state.data.summary;

        // break the loop
        if (summary) {
          return;
        }

        return codeAgent;
      },
    });

    const result = await network.run(event.data.value);

    const isError =
      !result.state.data.summary ||
      Object.keys(result.state.data.files || {}).length === 0;

    const sandboxUrl = await step.run("get-sandbox-url", async () => {
      const sandbox = await getSandbox(sandboxId);
      const host = sandbox.getHost(3000);
      return `http://${host}`;
    });

    await step.run("save-result", async () => {
      if (isError) {
        return await prisma.message.create({
          data: {
            content: "Something went wrong. Please try again.",
            role: "ASSISTANT",
            type: "ERROR",
            projectId: event.data.projectId,
          },
        });
      }

      return await prisma.message.create({
        data: {
          content: result.state.data.summary,
          role: "ASSISTANT",
          type: "RESULT",
          projectId: event.data.projectId,
          fragment: {
            create: {
              sandboxUrl,
              title: "Fragment",
              files: (result.state as any)?.data.files,
            },
          },
        },
      });
    });

    return {
      url: sandboxUrl,
      title: "Fragment",
      files: result.state.data.files,
      summary: result.state.data.summary,
    };
  },
);
