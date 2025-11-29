import { defineAction } from "astro:actions";
import { z } from "astro:schema";
import type { Agent } from "@/models/agent";
import { mastra } from "../mastra";
import type { StorageThreadType } from "@mastra/core";

const resourceId = import.meta.env.RESOURCE_ID;

if (!resourceId) {
  throw new Error("RESOURCE_ID is not defined in environment variables");
}

export const server = {
  getWeatherInfo: defineAction({
    input: z.object({
      message: z.string(),
      threadId: z.string(),
    }),
    handler: async (input) => {
      const agent = mastra.getAgent("weatherAgent");

      const result = await agent.generate(input.message, {
        memory: {
          thread: input.threadId,
          resource: resourceId,
        },
      });

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
        resourceId,
        orderBy: input.orderBy,
        sortDirection: input.sortDirection,
      });

      return threads;
    },
  }),
  createThread: defineAction({
    input: z.object({
      title: z.string(),
    }),
    handler: async (input): Promise<StorageThreadType & { title: string }> => {
      const agent = mastra.getAgent("weatherAgent");
      const memory = await agent.getMemory();

      if (!memory) {
        throw new Error("Memory not configured for weather agent");
      }

      const thread = await memory.createThread({
        resourceId,
        title: input.title,
      });

      return thread as StorageThreadType & { title: string };
    },
  }),
  getThreadMessages: defineAction({
    input: z.object({
      threadId: z.string(),
    }),
    handler: async (input) => {
      const agent = mastra.getAgent("weatherAgent");
      const memory = await agent.getMemory();

      if (!memory) {
        throw new Error("Memory not configured for weather agent");
      }

      const result = await memory.query({
        threadId: input.threadId,
        resourceId,
      });

      return result.uiMessages;
    },
  }),
};
