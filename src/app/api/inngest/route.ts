import { inngest } from "@/ingest/client";
import { codeAgentFunction } from "@/ingest/functions";
import { serve } from "inngest/next";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [codeAgentFunction],
});
