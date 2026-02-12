import { SANDBOX_TIMEOUT } from "@/utils/constants";
import { Sandbox } from "@e2b/code-interpreter";
import { AgentResult, TextMessage } from "@inngest/agent-kit";

export async function getSandbox(sandboxId: string) {
  const sandbox = await Sandbox.connect(sandboxId);
  await sandbox.setTimeout(SANDBOX_TIMEOUT);
  return sandbox;
}

export function lastAssistantTextMessage(result: AgentResult) {
  const lastAssistantTextMessageIndex = result.output.findLastIndex(
    (message) => message.role === "assistant",
  );

  const message = result.output[lastAssistantTextMessageIndex] as
    | TextMessage
    | undefined;

  return message?.content
    ? typeof message.content === "string"
      ? message.content
      : message.content.map((chunk) => chunk.text).join("")
    : undefined;
}

export function extractSummary(text: string | undefined): string {
  if (!text) return "";

  // Extract content between <task_summary> tags
  const match = text.match(/<task_summary>\s*([\s\S]*?)\s*<\/task_summary>/i);
  if (match && match[1]) {
    return match[1].trim();
  }

  // Fallback: if no tags found, return the text as-is
  return text.trim();
}
