import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { getUsageStatus } from "@/modules/usage/utils";

export const usageRouter = createTRPCRouter({
  status: protectedProcedure.query(() => getUsageStatus()),
});
