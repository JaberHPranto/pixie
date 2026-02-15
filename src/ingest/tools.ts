/* eslint-disable @typescript-eslint/no-explicit-any */
import { createTool, type Tool } from "@inngest/agent-kit";
import { z } from "zod";
import { getSandbox } from "./utils";
import { searchUnsplashPhoto } from "@/lib/unsplash";

interface AgentState {
  summary: string;
  files: {
    [path: string]: string;
  };
}

export function createTerminalTool(
  sandboxId: string,
  publish: any,
  projectId: string,
) {
  return createTool({
    name: "terminal",
    description: "Use the terminal to run commands",
    parameters: z.object({
      command: z.string(),
    }) as any,
    handler: async ({ command }, { step }) => {
      await publish({
        channel: `project-${projectId}`,
        topic: "code-update",
        data: {
          message: `Executing command: ${command}`,
        },
      });
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
  });
}

export function createOrUpdateFilesTool(
  sandboxId: string,
  publish: any,
  projectId: string,
) {
  return createTool({
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
    handler: async ({ files }, { step, network }: Tool.Options<AgentState>) => {
      const fileNames = files
        .map((f: { path: string; content: string }) => f.path.split("/").pop())
        .join(", ");
      await publish({
        channel: `project-${projectId}`,
        topic: "code-update",
        data: {
          message: `Creating/Updating files: ${fileNames}`,
        },
      });

      const newFiles = await step?.run("createOrUpdateFiles", async () => {
        try {
          const updatedFiles = network.state.data?.files || {};
          const sandbox = await getSandbox(sandboxId);
          for (const file of files) {
            await sandbox.files.write(file.path, file.content);
            updatedFiles[file.path] = file.content;
          }

          return updatedFiles;
        } catch (error) {
          return `Failed to create or update files: ${error}`;
        }
      });

      if (typeof newFiles === "object" && network.state.data) {
        network.state.data.files = newFiles;
      }
    },
  });
}

export function createReadFilesTool(
  sandboxId: string,
  publish: any,
  projectId: string,
) {
  return createTool({
    name: "readFiles",
    description: "Read files from the sandbox",
    parameters: z.object({
      files: z.array(z.string()),
    }) as any,
    handler: async ({ files }, { step }) => {
      await publish({
        channel: `project-${projectId}`,
        topic: "code-update",
        data: {
          message: `Reading files:\n${files.join("\n")}`,
        },
      });

      return await step?.run("readFiles", async () => {
        try {
          const sandbox = await getSandbox(sandboxId);

          const contentPromises = files.map((file: string) =>
            sandbox.files.read(file),
          );
          const contentResults = await Promise.all(contentPromises);

          const contents = files.map((file: string, index: number) => ({
            path: file,
            content: contentResults[index],
          }));

          return JSON.stringify(contents);
        } catch (error) {
          return `Failed to read files: ${error}`;
        }
      });
    },
  });
}

export function createUnsplashImageTool(
  sandboxId: string,
  publish: any,
  projectId: string,
) {
  return createTool({
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
      await publish({
        channel: `project-${projectId}`,
        topic: "code-update",
        data: {
          message: `Searching Unsplash for: ${query}`,
        },
      });

      const accessKey = process.env.UNSPLASH_ACCESS_KEY;
      if (!accessKey) {
        return "Unsplash access key is not configured.";
      }

      return await step?.run("download_unsplash_image", async () => {
        let searchResult;
        let photo;

        try {
          searchResult = await searchUnsplashPhoto(
            accessKey,
            query,
            orientation,
          );
        } catch (error) {
          return `Failed to search Unsplash: ${error instanceof Error ? error.message : String(error)}`;
        }

        if (!searchResult.results || searchResult.results.length === 0) {
          return `No results found for query: ${query}`;
        }

        photo = searchResult.results[0];
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
      });
    },
  });
}
