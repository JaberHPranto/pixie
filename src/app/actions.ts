"use server";

import { inngest } from "@/ingest/client";
import { getSubscriptionToken } from "@inngest/realtime";

export async function generateInngestToken(projectId: string) {
  const token = await getSubscriptionToken(inngest as any, {
    channel: `project-${projectId}`,
    topics: ["code-update"],
  });

  return token;
}
