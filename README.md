# 🚀 Velora

<div align="center">

![Astro](https://astro.build/assets/press/astro-icon-light-gradient.svg)

[![Astro](https://img.shields.io/badge/Astro-0C1222?style=for-the-badge&logo=astro&logoColor=FDFDFE)](https://astro.build) [![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org) [![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org) [![TailwindCSS](https://img.shields.io/badge/TailwindCSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com) [![Mastra](https://img.shields.io/badge/Mastra-000000?style=for-the-badge)](https://mastra.ai)

</div>

## 🌟 Overview

Velora is a modern AI chatbot application built with Astro, React, and Mastra. It provides a beautiful, responsive chat interface powered by Mastra's agent and workflow system, enabling you to build sophisticated AI interactions with ease.

The application features a production-ready UI with real-time streaming, conversation history, and a modular architecture that makes it easy to extend with custom agents and workflows.

## 📋 TODO

- Create Astro actions for handling threads
- Update UI to use those actions
- Create custom agent with local Ollama model

## 🚀 Quick Start

1. **Install Dependencies**

   ```bash
   pnpm install
   ```

2. **Development**

   Start the Astro development server:

   ```bash
   pnpm dev
   ```

   Or start Mastra development mode:

   ```bash
   pnpm dev:mastra
   ```

3. **Build**

   Build for production:

   ```bash
   pnpm build
   ```

   Build Mastra workflows:

   ```bash
   pnpm build:mastra
   ```

   Preview the production build:

   ```bash
   pnpm preview
   ```

## ⭐ Features

- 🤖 **Mastra AI Framework** - Powerful agent and workflow system for building AI applications
- 💬 **Real-time Streaming** - Token-by-token response streaming
- 🧠 **AI Agents** - Customizable agents with memory and tool support
- 🔄 **Workflows** - Multi-step workflows for complex AI operations
- 💾 **Conversation History** - Persistent chat sessions with LibSQL storage
- 🌙 **Dark/Light Mode** - Built-in theme switching
- 📱 **Responsive Design** - Mobile-first approach
- 🎨 **Beautiful UI** - Modern design with Tailwind CSS
- ⚡ **Fast Performance** - Astro's static generation + React islands
- 🔧 **TypeScript** - Full type safety
- 🧩 **Modular Components** - Easy to customize and extend
- 📊 **Observability** - Built-in tracing and logging with Pino

## 📁 Project Structure

```plaintext
/
├── public/              # Static assets
├── src/
│   ├── components/
│   │   ├── Chatbot.tsx          # Main chat interface
│   │   ├── ThemeToggle.tsx      # Theme switcher
│   │   ├── prompt-kit/          # UI primitives
│   │   │   ├── chat-container.tsx
│   │   │   ├── message.tsx
│   │   │   ├── prompt-input.tsx
│   │   │   └── ...
│   │   └── ui/                  # Shared UI components
│   ├── lib/
│   │   └── utils.ts             # Utility functions
│   ├── mastra/                  # Mastra configuration
│   │   ├── index.ts             # Mastra instance setup
│   │   ├── agents/              # AI agents
│   │   │   └── weather-agent.ts
│   │   ├── workflows/           # Workflows
│   │   │   └── weather-workflow.ts
│   │   └── tools/               # Agent tools
│   │       └── weather-tool.ts
│   ├── pages/
│   │   └── index.astro          # Main page
│   └── styles/
│       └── global.css           # Global styles + Tailwind
├── astro.config.mjs     # Astro configuration
└── package.json
```

## 🛠️ Customization

### Adding New Agents

Create a new agent in `src/mastra/agents/`:

```typescript
import { Agent } from "@mastra/core/agent";
import { Memory } from "@mastra/memory";

export const myAgent = new Agent({
  name: "My Agent",
  instructions: "Your agent instructions here",
  model: "mistral/mistral-medium-2508",
  tools: {
    /* your tools */
  },
  memory: new Memory({
    /* memory config */
  }),
});
```

Then register it in `src/mastra/index.ts`.

### Creating Workflows

Define workflows in `src/mastra/workflows/`:

```typescript
import { createStep, createWorkflow } from "@mastra/core/workflows";
import { z } from "zod";

const myStep = createStep({
  id: "my-step",
  description: "Step description",
  inputSchema: z.object({
    /* input schema */
  }),
  outputSchema: z.object({
    /* output schema */
  }),
  execute: async ({ inputData }) => {
    // Your step logic
  },
});

export const myWorkflow = createWorkflow({
  id: "my-workflow",
  inputSchema: z.object({
    /* input schema */
  }),
  outputSchema: z.object({
    /* output schema */
  }),
}).then(myStep);

myWorkflow.commit();
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### Attribution

This project is based on the [Astro AI Chatbot Template](https://github.com/Marve10s/Astro-Vercel-SDK-AI-Chatbot) by Marve10s, which is also licensed under the MIT License.

---

<div align="center">

Made with ❤️ using [Astro](https://astro.build) and [Mastra](https://mastra.ai)

</div>
