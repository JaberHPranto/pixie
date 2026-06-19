"use server";

import { inngest } from "@/ingest/client";
import { getClientSubscriptionToken } from "inngest/react";

export async function generateInngestToken(projectId: string) {
  const token = await getClientSubscriptionToken(inngest, {
    channel: `project-${projectId}`,
    topics: ["code-update"],
  });

  return token;
}
