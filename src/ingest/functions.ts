/* eslint-disable @typescript-eslint/no-explicit-any */
import { Sandbox } from "@e2b/code-interpreter";
import {
  createAgent,
  createNetwork,
  createState,
  Message,
  openai,
  type NetworkRun,
} from "@inngest/agent-kit";
import { channel, staticSchema } from "inngest/realtime";
import { inngest } from "./client";
import { getSandbox, lastAssistantTextMessage, extractSummary } from "./utils";
import {
  FRAGMENT_TITLE_PROMPT,
  RESPONSE_PROMPT,
  SYSTEM_PROMPT,
} from "@/utils/prompt";
import { prisma } from "@/lib/db";
import { SANDBOX_TIMEOUT } from "@/utils/constants";
import { ELEMENT_PICKER_SCRIPT } from "@/utils/element-picker-script";
import {
  createTerminalTool,
  createOrUpdateFilesTool,
  createReadFilesTool,
  createUnsplashImageTool,
} from "./tools";

interface AgentState {
  summary: string;
  files: {
    [path: string]: string;
  };
}

type CodeUpdateData = Record<string, unknown> & {
  message?: string;
  error?: boolean;
  complete?: boolean;
};

const codeUpdateChannel = channel({
  name: (projectId: string) => `project-${projectId}`,
  topics: {
    "code-update": { schema: staticSchema<CodeUpdateData>() },
  },
});

export const codeAgentFunction = inngest.createFunction(
  {
    id: "code-agent",
    triggers: [{ event: "code-agent/run" }],
    retries: 3,
    onFailure: async ({ error, event }) => {
      console.error("Code Agent failed", { error, event });

      try {
        const projectId = (event as any)?.data?.projectId;
        if (projectId) {
          await prisma.message.create({
            data: {
              content: `Generation failed: ${error.message || "An unexpected error occurred. Please try again."}`,
              role: "ASSISTANT",
              type: "ERROR",
              projectId: projectId,
            },
          });
        }
      } catch (dbError) {
        console.error("Failed to save error message:", dbError);
      }
    },
  },
  async ({ event, step }: any) => {
    const publish = async ({
      channel,
      topic,
      data,
    }: {
      channel: string;
      topic: string;
      data: Record<string, unknown>;
    }) => {
      return inngest.realtime.publish(
        {
          channel,
          topic,
          config:
            codeUpdateChannel.topics[
              topic as keyof typeof codeUpdateChannel.topics
            ],
        } as any,
        data,
      );
    };

    const sandboxId = await step.run("get-sandbox-id", async () => {
      await publish({
        channel: `project-${event.data.projectId}`,
        topic: "code-update",
        data: {
          message: "Initializing sandbox environment...",
        },
      });
      const sandbox = await Sandbox.create("pixie");
      await sandbox.setTimeout(SANDBOX_TIMEOUT);
      return sandbox.sandboxId;
    });

    const { previousMessages, lastFragmentFiles } = await step.run(
      "get-previous-context",
      async () => {
        await publish({
          channel: `project-${event.data.projectId}`,
          topic: "code-update",
          data: {
            message: "Analyzing previous context...",
          },
        });
        const formattedMessages: Message[] = [];
        const messages = await prisma.message.findMany({
          where: { projectId: event.data.projectId },
          orderBy: { createdAt: "desc" },
          include: { fragment: true },
          take: 15,
        });

        let lastFiles = {};

        for (const message of messages) {
          formattedMessages.push({
            type: "text",
            role: message.role === "USER" ? "user" : "assistant",
            content: message.content,
          });

          if (message.fragment && message.fragment.files) {
            lastFiles = message.fragment.files as Record<string, string>;
          }
        }

        return {
          previousMessages: formattedMessages.reverse(),
          lastFragmentFiles: lastFiles,
        };
      },
    );

    const isFollowUp =
      Object.keys(lastFragmentFiles as Record<string, string>).length > 0;

    // Restore previous files into the fresh sandbox to update the project state before making any changes.
    if (isFollowUp) {
      await step.run("restore-previous-files", async () => {
        await publish({
          channel: `project-${event.data.projectId}`,
          topic: "code-update",
          data: {
            message: "Restoring previous project files...",
          },
        });
        const sandbox = await getSandbox(sandboxId);
        const files = lastFragmentFiles as Record<string, string>;

        const dirs = new Set<string>();

        for (const p of Object.keys(files)) {
          const dir = p.substring(0, p.lastIndexOf("/"));
          if (dir) dirs.add(dir);
        }

        await Promise.all(
          Array.from(dirs).map((dir) =>
            sandbox.commands.run(`mkdir -p "/home/user/${dir}"`),
          ),
        );

        const writePromises: Promise<any>[] = Object.entries(files).map(
          ([path, content]) =>
            sandbox.files.write(`/home/user/${path}`, content),
        );

        await Promise.all(writePromises);
      });
    }

    // Build a file manifest for follow-up context — exclude Shadcn UI components and lib/utils
    const EXCLUDED_PREFIXES = ["components/ui/", "lib/utils"];
    const existingFilesList = Object.keys(
      lastFragmentFiles as Record<string, string>,
    ).filter((f) => !EXCLUDED_PREFIXES.some((prefix) => f.startsWith(prefix)));
    const followUpContext = isFollowUp
      ? `\n\nIMPORTANT — FOLLOW-UP CONTEXT:\nThis is a follow-up message in an ongoing conversation. The user already has a working project with the following files:\n${existingFilesList.map((f) => `  - ${f}`).join("\n")}\n\nAll of these files have been restored into the sandbox and are live. You MUST:\n1. Read ONLY the specific files relevant to the user's request using readFiles — do NOT read all files. Shadcn UI components (components/ui/*) and lib/utils are pre-installed and unchanged; never read or modify them.\n2. Only modify the files that need to change — do NOT rewrite or recreate files that are unaffected.\n3. Preserve all existing functionality, structure, and styling unless the user explicitly asks for changes.\n4. Make surgical, minimal edits — if the user says "bold the headline", change ONLY that heading's classes, nothing else.\n5. Always include ALL previously existing files (unchanged) plus your modifications in createOrUpdateFiles calls to ensure nothing is lost.\n`
      : "";

    const state = createState<AgentState>(
      {
        summary: "",
        files: lastFragmentFiles,
      },
      {
        messages: previousMessages,
      },
    );

    const codeAgent = createAgent<AgentState>({
      name: "code-agent",
      description: "An expert coding agent",
      system: SYSTEM_PROMPT + followUpContext,
      model: openai({
        // model: "gpt-5.2",
        model: "gpt-4.1",
        // defaultParameters: { temperature: 0.1 },
      }),
      tools: [
        createTerminalTool(sandboxId, publish, event.data.projectId),
        createOrUpdateFilesTool(sandboxId, publish, event.data.projectId),
        createReadFilesTool(sandboxId, publish, event.data.projectId),
        createUnsplashImageTool(sandboxId, publish, event.data.projectId),
      ],

      lifecycle: {
        onResponse: async ({ result, network }) => {
          const lastAssistantText = lastAssistantTextMessage(result);

          if (lastAssistantText && network) {
            if (lastAssistantText.includes("<task_summary>")) {
              network.state.data.summary = extractSummary(lastAssistantText);
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
      defaultState: state,
      router: async ({ network }) => {
        const summary = network.state.data.summary;

        // break the loop
        if (summary) {
          return;
        }

        return codeAgent;
      },
    });

    const result: NetworkRun<AgentState> | undefined = await network.run(
      event.data.value,
      { state },
    );

    const fragmentTitleGenerator = createAgent({
      name: "fragment-title-generator",
      description:
        "Generate a concise title for a code fragment based on the summary of the code.",
      system: FRAGMENT_TITLE_PROMPT,
      model: openai({
        model: "gpt-4o-mini",
        defaultParameters: { temperature: 0.1 },
      }),
    });

    const responseGenerator = createAgent({
      name: "response-generator",
      description:
        "Generate a user-friendly response message based on the summary of the code execution result. If the summary indicates an error, generate a helpful error message instead.",
      system: RESPONSE_PROMPT,
      model: openai({
        model: "gpt-4o-mini",
        defaultParameters: { temperature: 0.1 },
      }),
    });

    const summary =
      result?.state?.data?.summary?.trim() ||
      "Created your application successfully.";

    await publish({
      channel: `project-${event.data.projectId}`,
      topic: "code-update",
      data: {
        message: "Generating summary and title...",
      },
    });

    const { output: fragmentTitleOutput } =
      await fragmentTitleGenerator.run(summary);

    const { output: responseContentOutput } =
      await responseGenerator.run(summary);

    const generateFragmentTitle = () => {
      const title = fragmentTitleOutput[0];

      if (title.type !== "text") {
        return "Fragment";
      } else if (Array.isArray(title.content)) {
        return title.content.map((chunk) => chunk).join("");
      } else return title.content;
    };

    const generateResponseContent = () => {
      const response = responseContentOutput[0];

      if (response.type !== "text") {
        return "Here is the summary of the code execution:\n\n" + summary;
      } else if (Array.isArray(response.content)) {
        return response.content.map((chunk) => chunk).join("");
      } else return response.content;
    };

    await step.run("inject-element-picker", async () => {
      try {
        const sandbox = await getSandbox(sandboxId);
        await sandbox.files.write(
          "/home/user/public/_pixie-picker.js",
          ELEMENT_PICKER_SCRIPT,
        );
        const layoutContent = await sandbox.files.read(
          "/home/user/app/layout.tsx",
        );
        if (
          layoutContent &&
          !layoutContent.includes("_pixie-picker.js") &&
          layoutContent.includes("</body>")
        ) {
          const modifiedLayout = layoutContent.replace(
            "</body>",
            '<script src="/_pixie-picker.js" defer></script>\n</body>',
          );
          await sandbox.files.write(
            "/home/user/app/layout.tsx",
            modifiedLayout,
          );
        }
      } catch (err) {
        console.error("Failed to inject element picker:", err);
      }
    });

    const sandboxUrl = await step.run("get-sandbox-url", async () => {
      const sandbox = await getSandbox(sandboxId);
      const host = sandbox.getHost(3000);
      return `http://${host}`;
    });

    // Simple check: if we have files and a URL, it's a success
    const hasFiles = result?.state?.data?.files
      ? Object.keys(result.state.data.files).length > 0
      : false;

    await step.run("save-result", async () => {
      if (!hasFiles) {
        await publish({
          channel: `project-${event.data.projectId}`,
          topic: "code-update",
          data: {
            message: "Error: Failed to generate files. Please try again.",
            error: true,
          },
        });

        return await prisma.message.create({
          data: {
            content: "Something went wrong. Please try again.",
            role: "ASSISTANT",
            type: "ERROR",
            projectId: event.data.projectId,
          },
        });
      }

      const message = await prisma.message.create({
        data: {
          content: generateResponseContent(),
          role: "ASSISTANT",
          type: "RESULT",
          projectId: event.data.projectId,
          fragment: {
            create: {
              sandboxUrl,
              title: generateFragmentTitle(),
              files: result.state.data.files,
            },
          },
        },
      });

      await publish({
        channel: `project-${event.data.projectId}`,
        topic: "code-update",
        data: {
          message: "Generation completed successfully!",
          complete: true,
        },
      });

      return message;
    });

    return {
      url: sandboxUrl,
      title: generateFragmentTitle(),
      files: result.state.data.files,
      summary: generateResponseContent(),
    };
  },
);
