import { protectedProcedure, createTRPCRouter } from "@/trpc/init";
import { z } from "zod";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const ENHANCEMENT_STYLES = {
  balanced: {
    name: "Balanced",
    icon: "⚖️",
    description: "Comprehensive, all-around",
    systemPrompt: `You are an expert product builder. Transform the user's prompt into a balanced, comprehensive specification.
IMPORTANT: Your entire response MUST NOT exceed 2000 characters to ensure it fits within platform limits.

Cover:
- **Overview**: Purpose and goals
- **Features**: Core functionality (bullet points)
- **User Experience**: Key interactions

Be extremely concise but detailed. Focus only on essential requirements. Use markdown.`,
  },
  developer: {
    name: "Developer",
    icon: "💻",
    description: "Technical, implementation-focused",
    systemPrompt: `You are a senior software engineer. Transform the prompt into a technical specification.
IMPORTANT: Your entire response MUST NOT exceed 2000 characters to ensure it fits within platform limits.

Cover:
- **Architecture & Tech Stack**: Recommended frameworks and patterns
- **Implementation Details**: Key components and data structures
- **Developer Experience**: Setup and best practices

Be extremely concise. Be specific about technical choices. Use markdown.`,
  },
  productManager: {
    name: "Product Manager",
    icon: "📊",
    description: "User-focused, feature-oriented",
    systemPrompt: `You are a Product Manager. Transform the prompt into a concise PRD.
IMPORTANT: Your entire response MUST NOT exceed 2000 characters to ensure it fits within platform limits.

Cover:
- **User Stories**: Who it's for and their goals
- **Core Features**: Prioritized list with value
- **UX & Success**: Flows and metrics

Be extremely concise. Use markdown.`,
  },
  designer: {
    name: "Designer",
    icon: "🎨",
    description: "Visual, UX-focused",
    systemPrompt: `You are a UX/UI Designer. Transform the prompt into a design brief.
IMPORTANT: Your entire response MUST NOT exceed 2000 characters to ensure it fits within platform limits.

Cover:
- **Visual Design**: Color, types, and hierarchy
- **UX**: Flows, accessibility, and responsiveness
- **Design System**: Core components and patterns

Be extremely concise. Focus on delightful experience. Use markdown.`,
  },
};

export const aiRouter = createTRPCRouter({
  enhancePrompt: protectedProcedure
    .input(
      z.object({
        prompt: z
          .string()
          .min(1, { message: "Prompt is required" })
          .max(1000, { message: "Prompt is too long" }),
        style: z
          .enum(["developer", "productManager", "designer", "balanced"])
          .default("balanced"),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        const styleConfig = ENHANCEMENT_STYLES[input.style];

        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: styleConfig.systemPrompt,
            },
            {
              role: "user",
              content: input.prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 800,
        });

        const enhancedPrompt = completion.choices[0]?.message?.content;

        if (!enhancedPrompt) {
          throw new Error("Failed to enhance prompt");
        }

        return {
          original: input.prompt,
          enhanced: enhancedPrompt.trim(),
          style: input.style,
        };
      } catch (error) {
        console.error("Prompt enhancement error:", error);
        throw new Error(
          "Failed to enhance prompt. Please try again or use your original prompt.",
        );
      }
    }),
});
