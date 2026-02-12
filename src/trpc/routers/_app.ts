import { createTRPCRouter } from "../init";
import { projectsRouter } from "@/modules/projects/server/procedures";
import { messagesRouter } from "@/modules/messages/server/procedures";
import { aiRouter } from "@/modules/ai/server/procedures";
import { usageRouter } from "@/modules/usage/server/procedures";

export const appRouter = createTRPCRouter({
  messages: messagesRouter,
  projects: projectsRouter,
  ai: aiRouter,
  usage: usageRouter,
});

export type AppRouter = typeof appRouter;
