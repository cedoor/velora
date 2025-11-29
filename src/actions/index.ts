import { defineAction } from "astro:actions";
import { z } from "astro:schema";

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
};
