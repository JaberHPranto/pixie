import { inngest } from "@/ingest/client";
import { prisma } from "@/lib/db";
import { consumeCredits } from "@/modules/usage/utils";
import { protectedProcedure, createTRPCRouter } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const messagesRouter = createTRPCRouter({
  getMany: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ input, ctx }) => {
      return await prisma.message.findMany({
        orderBy: {
          createdAt: "asc",
        },
        where: {
          projectId: input.projectId,
          project: {
            userId: ctx.auth.userId,
          },
        },
        include: {
          fragment: true,
        },
      });
    }),

  create: protectedProcedure
    .input(
      z.object({
        value: z
          .string()
          .min(1, { message: "Message is required" })
          .max(1000, { message: "Prompt is too long" }),
        projectId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const existingProject = await prisma.project.findUnique({
        where: {
          id: input.projectId,
          userId: ctx.auth.userId,
        },
      });

      if (!existingProject) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }

      try {
        await consumeCredits();
      } catch (err) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message:
            err instanceof Error
              ? err.message
              : "You have reached your free usage limit. Please upgrade to continue using the service.",
        });
      }

      const createdMessage = await prisma.message.create({
        data: {
          projectId: existingProject.id,
          content: input.value,
          role: "USER",
          type: "RESULT",
        },
      });

      await inngest.send({
        name: "code-agent/run",
        data: {
          value: input.value,
          projectId: input.projectId,
        },
      });

      return createdMessage;
    }),
});
