"use client";

import { useEffect, useMemo, useState } from "react";

import ThemeToggle from "@/components/ThemeToggle";
import {
  ChatContainerContent,
  ChatContainerRoot,
  ChatContainerScrollAnchor,
} from "@/components/prompt-kit/chat-container";
import {
  Message,
  MessageAction,
  MessageActions,
  MessageContent,
} from "@/components/prompt-kit/message";
import {
  PromptInput,
  PromptInputAction,
  PromptInputActions,
  PromptInputTextarea,
} from "@/components/prompt-kit/prompt-input";
import { ScrollButton } from "@/components/prompt-kit/scroll-button";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ArrowUp,
  Check,
  Copy,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Boxes,
  Plus,
  X,
} from "lucide-react";
import { actions } from "astro:actions";
import type { Agent } from "@/models/agent";

type Role = "user" | "assistant";

type ConversationMessage = {
  id: string;
  role: Role;
  name: string;
  avatarFallback: string;
  avatarUrl?: string;
  content: string;
  markdown?: boolean;
};

type MessageTemplate = Omit<ConversationMessage, "id">;

type HistoryConversation = {
  id: string;
  title: string;
  preview: string;
  timestamp: string;
};

type HistoryGroup = {
  label: string;
  conversations: HistoryConversation[];
};

const historySeed: HistoryGroup[] = [
  {
    label: "Today",
    conversations: [
      {
        id: "today-1",
        title: "Product launch prep",
        preview: "Drafted announcement copy and QA checklist for beta release.",
        timestamp: "2h ago",
      },
      {
        id: "today-2",
        title: "Onboarding survey",
        preview:
          "Outlined questions that capture first-week friction and success signals.",
        timestamp: "4h ago",
      },
      {
        id: "today-3",
        title: "Design critique notes",
        preview: "Summarised feedback threads and grouped by priority / owner.",
        timestamp: "6h ago",
      },
    ],
  },
  {
    label: "Earlier this week",
    conversations: [
      {
        id: "week-1",
        title: "Support triage ideas",
        preview:
          "Generated macros for the top friction requests from this week.",
        timestamp: "3 days ago",
      },
      {
        id: "week-2",
        title: "Growth experiment doc",
        preview:
          "Mapped out hypotheses, guardrail metrics, and rollout cadence.",
        timestamp: "5 days ago",
      },
    ],
  },
];

function createId() {
  return Math.random().toString(36).slice(2, 10);
}

const messageTemplates: MessageTemplate[] = [
  {
    role: "assistant",
    name: "Nova",
    avatarFallback: "NO",
    content:
      "Hey there! I'm Nova, a prompt-kit powered assistant. Ask me anything about your product ideas, technical questions, or research tasks and I'll sketch out a plan you can wire up to your favourite model.",
  },
  {
    role: "user",
    name: "You",
    avatarFallback: "YO",
    content:
      "Let's create a user interview outline that digs into motivation and workflow pains.",
  },
  {
    role: "assistant",
    name: "Nova",
    avatarFallback: "NO",
    markdown: true,
    content: [
      "Absolutely — here's a structured outline you can use:",
      "",
      "### Interview Outline",
      '1. **Warm up** — "Can you tell me about your role and day-to-day responsibilities?"',
      '2. **Motivation** — "What made you start using [product/workflow]?"',
      '3. **Current process** — "Walk me through your last attempt step-by-step."',
      '4. **Pain points** — "Where does it feel slow, confusing, or fragile?"',
      '5. **Desired outcomes** — "If this was effortless, what would that unlock for you?"',
      "",
      "Happy to tailor this if you share the audience or use case!",
    ].join("\n"),
  },
];

function createInitialMessages(): ConversationMessage[] {
  return messageTemplates.map((template) => ({
    ...template,
    id: createId(),
  }));
}

function updateConversationInGroups(
  groups: HistoryGroup[],
  conversationId: string,
  updater: (existing: HistoryConversation) => HistoryConversation
): HistoryGroup[] {
  const next = cloneHistoryGroups(groups);
  for (const section of next) {
    const index = section.conversations.findIndex(
      (c) => c.id === conversationId
    );
    if (index !== -1) {
      const existing = section.conversations[index];
      section.conversations[index] = updater(existing);
      break;
    }
  }
  return next;
}

function createPlaceholderConversation(
  title: string,
  preview: string
): ConversationMessage[] {
  return [
    {
      id: createId(),
      role: "assistant",
      name: "Nova",
      avatarFallback: "NO",
      markdown: true,
      content: [
        `This is a placeholder view for **${title}**.`,
        "",
        preview,
        "",
        "Load real messages here by persisting conversations and hydrating them when the user opens the thread.",
      ].join("\n"),
    },
  ];
}

function cloneHistoryGroups(groups: HistoryGroup[]): HistoryGroup[] {
  return groups.map((section) => ({
    label: section.label,
    conversations: section.conversations.map((conversation) => ({
      ...conversation,
    })),
  }));
}

function buildInitialConversationMap(
  groups: HistoryGroup[]
): Record<string, ConversationMessage[]> {
  const map: Record<string, ConversationMessage[]> = {};
  const primaryId = groups[0]?.conversations[0]?.id;

  groups.forEach((section) => {
    section.conversations.forEach((conversation) => {
      if (conversation.id === primaryId) {
        map[conversation.id] = createInitialMessages();
      } else {
        map[conversation.id] = createPlaceholderConversation(
          conversation.title,
          conversation.preview
        );
      }
    });
  });

  return map;
}

function findConversationTitle(
  groups: HistoryGroup[],
  conversationId: string
): string {
  for (const section of groups) {
    const conversation = section.conversations.find(
      (entry) => entry.id === conversationId
    );
    if (conversation) {
      return conversation.title;
    }
  }
  return "Untitled chat";
}

function truncateText(text: string, limit = 80): string {
  if (text.length <= limit) return text;
  return `${text.slice(0, limit)}…`;
}

const seedActiveConversationId =
  historySeed[0]?.conversations[0]?.id ?? createId();
const seedActiveConversationTitle = findConversationTitle(
  historySeed,
  seedActiveConversationId
);

function Chatbot() {
  const [historyGroups, setHistoryGroups] = useState<HistoryGroup[]>(() =>
    cloneHistoryGroups(historySeed)
  );
  const [conversations, setConversations] = useState<
    Record<string, ConversationMessage[]>
  >(() => buildInitialConversationMap(historySeed));
  const [activeConversationId, setActiveConversationId] = useState(
    seedActiveConversationId
  );
  const [activeConversationTitle, setActiveConversationTitle] = useState(
    seedActiveConversationTitle
  );
  const [chatCounter, setChatCounter] = useState(
    () =>
      historySeed.reduce(
        (total, section) => total + section.conversations.length,
        0
      ) + 1
  );
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const [agents, setAgents] = useState<Agent[]>([]);

  const [selectedAgent, setSelectedAgent] = useState<Agent>();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const [isAgentMenuOpen, setIsAgentMenuOpen] = useState(false);

  const messages = useMemo(
    () => conversations[activeConversationId] ?? [],
    [conversations, activeConversationId]
  );

  const hasPendingInput = input.trim().length > 0;

  useEffect(() => {
    (async () => {
      const { data, error } = await actions.getAgents();

      if (error) {
        console.error(error);
        return;
      }

      setAgents(data);
      setSelectedAgent(data[0]);
    })();
  }, []);

  const updateConversationMessages = (
    conversationId: string,
    updater: (current: ConversationMessage[]) => ConversationMessage[]
  ) => {
    setConversations((previous) => {
      const current = previous[conversationId] ?? [];
      const updated = updater(current);
      return { ...previous, [conversationId]: updated };
    });
  };

  const refreshHistoryPreview = (
    conversationId: string,
    preview: string,
    title?: string
  ) => {
    setHistoryGroups((previous) =>
      updateConversationInGroups(previous, conversationId, (existing) => ({
        id: existing.id,
        title: title ?? existing.title,
        preview: truncateText(preview),
        timestamp: "Just now",
      }))
    );
  };

  const handleCopy = async (message: ConversationMessage) => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopiedMessageId(message.id);
      window.setTimeout(() => {
        setCopiedMessageId((current) =>
          current === message.id ? null : current
        );
      }, 2000);
    } catch {
      setCopiedMessageId(null);
    }
  };

  const handleSubmit = async () => {
    if (!hasPendingInput || isGenerating) return;

    const conversationId = activeConversationId;
    const conversationTitle = activeConversationTitle;
    const prompt = input.trim();

    if (!prompt) {
      return;
    }

    const userMessage: ConversationMessage = {
      id: createId(),
      role: "user",
      name: "You",
      avatarFallback: "YO",
      content: prompt,
    };

    const { data, error } = await actions.getWeatherInfo({ city: prompt });

    if (error) {
      console.error(error);
      return;
    }

    const agentSummary = `${selectedAgent?.name}`;
    const assistantMessage: ConversationMessage = {
      id: createId(),
      role: "assistant",
      name: "Nova",
      avatarFallback: "NO",
      markdown: true,
      content: data,
    };

    updateConversationMessages(conversationId, (current) => [
      ...current,
      userMessage,
    ]);
    refreshHistoryPreview(
      conversationId,
      prompt || "Sent a message",
      conversationTitle
    );

    setInput("");
    setCopiedMessageId(null);
    setIsGenerating(true);

    window.setTimeout(() => {
      updateConversationMessages(conversationId, (current) => [
        ...current,
        assistantMessage,
      ]);
      setIsGenerating(false);
    }, 600);
  };

  const handleNewChat = () => {
    const conversationId = createId();
    const conversationTitle = `Untitled chat ${chatCounter}`;

    setChatCounter((count) => count + 1);
    setConversations((previous) => ({
      ...previous,
      [conversationId]: [],
    }));
    setActiveConversationId(conversationId);
    setActiveConversationTitle(conversationTitle);
    setInput("");
    setCopiedMessageId(null);
    setIsGenerating(false);
    setIsSidebarOpen(false);

    setHistoryGroups((previous) => {
      const next = cloneHistoryGroups(previous);
      if (next.length === 0) {
        next.push({ label: "Today", conversations: [] });
      }
      next[0].conversations = [
        {
          id: conversationId,
          title: conversationTitle,
          preview: "Say hello to Nova to get started.",
          timestamp: "Just now",
        },
        ...next[0].conversations,
      ];
      return next;
    });
  };

  const handleSelectConversation = (conversation: HistoryConversation) => {
    setActiveConversationId(conversation.id);
    setActiveConversationTitle(conversation.title);
    setIsSidebarOpen(false);
    setInput("");
    setCopiedMessageId(null);
    setIsGenerating(false);

    setConversations((previous) => {
      if (previous[conversation.id]) {
        return previous;
      }

      return {
        ...previous,
        [conversation.id]: createPlaceholderConversation(
          conversation.title,
          conversation.preview
        ),
      };
    });

    setHistoryGroups((previous) =>
      updateConversationInGroups(
        previous,
        conversation.id,
        (existing) => existing ?? { ...conversation }
      )
    );
  };

  const activeHistoryGroups = historyGroups;

  return (
    <div className="relative flex h-full overflow-hidden bg-background text-foreground">
      <div
        className={cn(
          "fixed inset-0 z-20 bg-black/40 backdrop-blur-sm lg:hidden transition-opacity duration-300",
          isSidebarOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsSidebarOpen(false)}
        aria-hidden="true"
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 flex w-72 flex-col border-r border-border bg-card shadow-xl transition-transform duration-300 ease-in-out",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full",
          "lg:static lg:h-full lg:shadow-none",
          isSidebarCollapsed ? "lg:hidden" : "lg:flex lg:translate-x-0"
        )}
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
              History
            </p>
            <p className="text-sm font-medium text-foreground">Recent chats</p>
          </div>
          <div className="flex items-center gap-1">
            <ThemeToggle className="lg:hidden" />
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
              aria-label="Close chat history"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="border-b border-border px-4 pb-4 pt-3">
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={handleNewChat}
          >
            <Plus className="h-4 w-4" />
            <span className="ml-2">New chat</span>
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto pb-6">
          {activeHistoryGroups.map((section) => (
            <div key={section.label} className="px-4 pt-6">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                {section.label}
              </p>
              <div className="mt-3 space-y-2">
                {section.conversations.map((conversation) => {
                  const isActive = conversation.id === activeConversationId;
                  return (
                    <button
                      key={conversation.id}
                      type="button"
                      className={cn(
                        "w-full rounded-xl border border-transparent bg-transparent px-3 py-2 text-left transition hover:border-border hover:bg-accent/40",
                        isActive && "border-border bg-accent/40"
                      )}
                      onClick={() => handleSelectConversation(conversation)}
                    >
                      <div className="flex items-center justify-between text-sm font-medium text-foreground">
                        <span className="truncate">{conversation.title}</span>
                        <span className="ml-2 shrink-0 text-xs text-muted-foreground">
                          {conversation.timestamp}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {conversation.preview}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </aside>

      <main className="flex h-full flex-1 flex-col overflow-hidden">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-4 sm:px-8">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setIsSidebarOpen(true)}
                aria-label="Open chat history"
              >
                <Menu className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="hidden lg:inline-flex"
                onClick={() => setIsSidebarCollapsed((v) => !v)}
                aria-label={
                  isSidebarCollapsed ? "Show sidebar" : "Hide sidebar"
                }
              >
                {isSidebarCollapsed ? (
                  <PanelLeftOpen className="h-4 w-4" />
                ) : (
                  <PanelLeftClose className="h-4 w-4" />
                )}
              </Button>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                Nova
              </p>
              <h1 className="truncate text-lg font-semibold text-foreground sm:text-xl">
                {activeConversationTitle}
              </h1>
              <p className="text-xs text-muted-foreground">
                {selectedAgent?.name}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <ThemeToggle className="hidden lg:inline-flex" />
          </div>
        </header>

        <div className="flex flex-1 flex-col overflow-hidden px-4 pb-6 pt-4 sm:px-8">
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <ChatContainerRoot className="relative flex min-h-0 flex-1 flex-col rounded-2xl border border-border bg-card/80 p-4 shadow-sm backdrop-blur-sm sm:p-6">
              <ChatContainerContent className="flex w-full flex-col gap-6">
                {messages.map((message, index) => {
                  const isUser = message.role === "user";
                  const isLatestAssistant =
                    !isUser && index === messages.length - 1;

                  return (
                    <Message
                      key={message.id}
                      className={cn(isUser ? "justify-end" : "justify-start")}
                      aria-live="polite"
                    >
                      <div
                        className={cn(
                          "flex max-w-[38rem] flex-col gap-2",
                          isUser ? "items-end" : "items-start"
                        )}
                      >
                        <span className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                          {message.name}
                        </span>
                        <div className="group flex w-full flex-col gap-2">
                          <MessageContent
                            markdown={message.markdown}
                            className={cn(
                              "rounded-3xl px-5 py-3 text-sm leading-6 shadow-sm transition-colors text-left",
                              isUser
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-foreground prose-headings:mt-0 prose-headings:font-semibold prose-p:mt-2"
                            )}
                          >
                            {message.content}
                          </MessageContent>

                          {!isUser ? (
                            <MessageActions
                              className={cn(
                                "-ml-1.5 flex gap-1 opacity-0 transition-opacity duration-150 group-hover:opacity-100",
                                isLatestAssistant && "opacity-100"
                              )}
                            >
                              <MessageAction
                                tooltip={
                                  copiedMessageId === message.id
                                    ? "Copied"
                                    : "Copy message"
                                }
                                delayDuration={100}
                              >
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className={cn(
                                    "rounded-full",
                                    copiedMessageId === message.id &&
                                      "bg-emerald-500/10 text-emerald-400"
                                  )}
                                  onClick={(event) => {
                                    event.preventDefault();
                                    event.stopPropagation();
                                    handleCopy(message);
                                  }}
                                  aria-label={
                                    copiedMessageId === message.id
                                      ? "Message copied"
                                      : "Copy message"
                                  }
                                >
                                  {copiedMessageId === message.id ? (
                                    <Check className="h-4 w-4" />
                                  ) : (
                                    <Copy className="h-4 w-4" />
                                  )}
                                </Button>
                              </MessageAction>
                            </MessageActions>
                          ) : null}
                        </div>
                      </div>
                    </Message>
                  );
                })}
                <ChatContainerScrollAnchor />
              </ChatContainerContent>

              <div className="pointer-events-none absolute bottom-4 right-4">
                <ScrollButton className="pointer-events-auto shadow-md" />
              </div>
            </ChatContainerRoot>
          </div>

          <PromptInput
            value={input}
            onValueChange={setInput}
            onSubmit={handleSubmit}
            isLoading={isGenerating}
            className="mt-6 mb-4 border-border/90 bg-card/80 backdrop-blur"
            disabled={isGenerating}
          >
            <div className="flex flex-col gap-3">
              <PromptInputTextarea aria-label="Message" placeholder="Message" />

              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <PromptInputAction tooltip="Select agent" side="top">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="rounded-full"
                        aria-haspopup="listbox"
                        aria-expanded={isAgentMenuOpen}
                        onClick={() => {
                          setIsAgentMenuOpen((v) => !v);
                        }}
                      >
                        <Boxes className="h-5 w-5" />
                      </Button>
                    </PromptInputAction>
                    {isAgentMenuOpen ? (
                      <div className="absolute bottom-10 left-0 z-10 w-44 rounded-lg border border-border bg-card p-1 shadow-md">
                        {agents.map((agent) => (
                          <button
                            key={agent.name}
                            type="button"
                            className={cn(
                              "flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-accent/60",
                              selectedAgent?.id === agent.id && "bg-accent/40"
                            )}
                            role="option"
                            aria-selected={selectedAgent?.id === agent.id}
                            onClick={() => {
                              setSelectedAgent(agent);
                            }}
                          >
                            <span className="truncate">{agent.name}</span>
                            {selectedAgent?.id === agent.id ? (
                              <Check className="h-4 w-4" />
                            ) : null}
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
                <PromptInputActions>
                  <PromptInputAction tooltip="Send message" delayDuration={100}>
                    <Button
                      type="button"
                      size="icon"
                      className="rounded-full"
                      onClick={handleSubmit}
                      disabled={!hasPendingInput || isGenerating}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                  </PromptInputAction>
                </PromptInputActions>
              </div>
            </div>
          </PromptInput>
        </div>
      </main>
    </div>
  );
}

export default Chatbot;
