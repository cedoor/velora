import { defineAction } from "astro:actions";
import { z } from "astro:schema";
import type { Agent } from "@/models/agent";
import { mastra } from "../mastra";

export const server = {
  getWeatherInfo: defineAction({
    input: z.object({
      city: z.string(),
    }),
    handler: async (input) => {
      const city = input.city;
      const agent = mastra.getAgent("weatherAgent");

      const result = await agent.generate(
        `What's the weather like in ${city}?`
      );

      return result.text;
    },
  }),
  getAgents: defineAction({
    handler: async (): Promise<Agent[]> => {
      const agents = mastra.getAgents();

      return Object.values(agents).map((agent) => ({
        id: agent.id,
        name: agent.name,
      }));
    },
  }),
  getThreads: defineAction({
    input: z.object({
      resourceId: z.string(),
      orderBy: z
        .enum(["createdAt", "updatedAt"])
        .optional()
        .default("updatedAt"),
      sortDirection: z.enum(["ASC", "DESC"]).optional().default("DESC"),
    }),
    handler: async (input) => {
      const agent = mastra.getAgent("weatherAgent");
      const memory = await agent.getMemory();

      if (!memory) {
        throw new Error("Memory not configured for weather agent");
      }

      const threads = await memory.getThreadsByResourceId({
        resourceId: input.resourceId,
        orderBy: input.orderBy,
        sortDirection: input.sortDirection,
      });

      return threads;
    },
  }),
};
