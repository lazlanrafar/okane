"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { sendChatMessage, type ChatMessage } from "@/actions/ai.actions";
import {
  cn,
  useSidebar,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@workspace/ui";
import { useAiChatStore } from "@/stores/ai-chat-store";
import {
  History,
  ArrowLeft,
  Plus,
  ArrowUp,
  Sparkles,
  Globe,
  Zap,
  Search,
} from "lucide-react";

export type ChatSession = {
  id: string;
  title: string;
  messages: ChatMessage[];
  updatedAt: Date;
};

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      <span
        className="h-2 w-2 rounded-full bg-muted-foreground/60 animate-bounce"
        style={{ animationDelay: "0ms" }}
      />
      <span
        className="h-2 w-2 rounded-full bg-muted-foreground/60 animate-bounce"
        style={{ animationDelay: "150ms" }}
      />
      <span
        className="h-2 w-2 rounded-full bg-muted-foreground/60 animate-bounce"
        style={{ animationDelay: "300ms" }}
      />
    </div>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  return (
    <div
      className={cn("flex w-full", isUser ? "justify-end" : "justify-start")}
    >
      {!isUser && (
        <div className="mr-2 mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Sparkles className="w-3 h-3" />
        </div>
      )}
      <div
        className={cn(
          "max-w-[85%] px-4 py-2.5 text-sm leading-relaxed shadow-sm",
          isUser
            ? "rounded-2xl rounded-tr-sm bg-primary text-primary-foreground"
            : "rounded-2xl rounded-tl-sm bg-muted text-foreground",
        )}
      >
        {message.content.split("\n").map((line, i) => (
          <span key={i}>
            {line}
            {i < message.content.split("\n").length - 1 && <br />}
          </span>
        ))}
      </div>
    </div>
  );
}

export function AiChat() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [activePopover, setActivePopover] = useState<
    "none" | "history" | "suggestions"
  >("none");
  const [isLoaded, setIsLoaded] = useState(false);

  const { state, isMobile } = useSidebar();
  const setSendMessageFn = useAiChatStore((state) => state.setSendMessageFn);

  const [input, setInput] = useState("");
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const activeSession = sessions.find((s) => s.id === currentSessionId);
  const messages = activeSession ? activeSession.messages : [];
  const hasMessages = currentSessionId !== null && messages.length > 0;

  const sidebarOffset = isMobile ? 0 : state === "expanded" ? 256 : 48;

  useEffect(() => {
    const saved = localStorage.getItem("okane:chat-sessions");
    if (saved) {
      try {
        setSessions(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse chat sessions", e);
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("okane:chat-sessions", JSON.stringify(sessions));
    }
  }, [sessions, isLoaded]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        chatContainerRef.current &&
        !chatContainerRef.current.contains(event.target as Node)
      ) {
        setActivePopover("none");
      }
    };

    if (activePopover !== "none") {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [activePopover]);

  // Define sendMessage here so it's available for the ref and effects
  const sendMessage = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    let sessionId = currentSessionId;
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      setCurrentSessionId(sessionId);
      setSessions((prev) => [
        {
          id: sessionId!,
          title: trimmed.slice(0, 30) + (trimmed.length > 30 ? "..." : ""),
          messages: [],
          updatedAt: new Date(),
        },
        ...prev,
      ]);
    }

    const userMessage: ChatMessage = { role: "user", content: trimmed };

    setSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId
          ? {
              ...s,
              messages: [...s.messages, userMessage],
              updatedAt: new Date(),
            }
          : s,
      ),
    );

    setInput("");
    setIsLoading(true);
    setActivePopover("none");

    startTransition(async () => {
      try {
        const currentMessages = activeSession ? activeSession.messages : [];
        const result = await sendChatMessage([...currentMessages, userMessage]);

        if (result.success && result.data) {
          setSessions((prev) =>
            prev.map((s) =>
              s.id === sessionId
                ? {
                    ...s,
                    messages: [
                      ...s.messages,
                      { role: "assistant", content: result.data!.reply },
                    ],
                    updatedAt: new Date(),
                  }
                : s,
            ),
          );
        } else {
          setSessions((prev) =>
            prev.map((s) =>
              s.id === sessionId
                ? {
                    ...s,
                    messages: [
                      ...s.messages,
                      {
                        role: "assistant",
                        content:
                          result.error ??
                          "Something went wrong. Please try again.",
                      },
                    ],
                    updatedAt: new Date(),
                  }
                : s,
            ),
          );
        }
      } catch {
        setSessions((prev) =>
          prev.map((s) =>
            s.id === sessionId
              ? {
                  ...s,
                  messages: [
                    ...s.messages,
                    {
                      role: "assistant",
                      content:
                        "Failed to connect. Please check your connection and try again.",
                    },
                  ],
                  updatedAt: new Date(),
                }
              : s,
          ),
        );
      } finally {
        setIsLoading(false);
      }
    });
  };

  const sendMessageRef = useRef(sendMessage);
  useEffect(() => {
    sendMessageRef.current = sendMessage;
  }, [sendMessage]);

  useEffect(() => {
    setSendMessageFn((msg) => {
      sendMessageRef.current(msg);
    });
  }, [setSendMessageFn]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <>
      {hasMessages && (
        <style>{`
          .dashboard-content-tabs { display: none !important; }
          .dashboard-greeting { display: none !important; }
        `}</style>
      )}

      {/* Inline Chat History Area */}
      {hasMessages && (
        <div className="flex-1 w-full flex flex-col animate-in fade-in duration-300 relative">
          {/* Top Header matching the screenshot */}
          <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-2 bg-background/80 backdrop-blur">
            <button
              onClick={() => setCurrentSessionId(null)}
              className="w-10 h-10 border border-border/80 bg-background flex items-center justify-center rounded-lg hover:bg-muted transition-colors shadow-sm"
              title="Back"
            >
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            <div className="text-sm font-medium">
              {activeSession?.title || "Greeting and Introduction"}
            </div>
            <button
              onClick={() => setCurrentSessionId(null)}
              className="w-10 h-10 border border-border/80 bg-background flex items-center justify-center rounded-lg hover:bg-muted transition-colors shadow-sm"
              title="New Chat"
            >
              <Plus className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          <div className="w-full max-w-3xl mx-auto flex-1 flex flex-col pt-16 pb-[140px]">
            <div className="flex flex-col gap-6 px-4 w-full h-full">
              <div className="flex items-center justify-center my-4">
                <div className="bg-muted px-3 py-1 rounded-full text-xs text-muted-foreground">
                  Today
                </div>
              </div>

              {messages.map((msg, i) => (
                <MessageBubble key={i} message={msg} />
              ))}

              {isLoading && (
                <div className="flex items-start gap-2">
                  <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Sparkles className="w-3 h-3" />
                  </div>
                  <div className="rounded-2xl rounded-tl-sm bg-muted shadow-sm">
                    <TypingIndicator />
                  </div>
                </div>
              )}
              <div ref={bottomRef} className="h-4" />
            </div>
          </div>
        </div>
      )}

      {/* Floating Input Container */}
      <TooltipProvider delayDuration={300}>
        <div
          ref={chatContainerRef}
          className="fixed bottom-10 z-50 flex flex-col items-center w-full max-[768px]:px-4 md:w-full md:max-w-3xl transition-all duration-200 ease-linear"
          style={{
            left: `calc(50% + ${sidebarOffset / 2}px)`,
            transform: "translateX(-50%)",
          }}
        >
          {/* Chat History Popover */}
          {activePopover === "history" && (
            <div className="absolute bottom-full left-0 mb-4 w-full bg-background border border-border/80 shadow p-0 max-h-[400px] overflow-hidden flex flex-col z-50 animate-in slide-in-from-bottom-2">
              <div className="sticky top-0 p-2 backdrop-blur-md border-b border-border/50">
                <div className="flex items-center bg-background border border-border/50 rounded-md px-3 py-2">
                  <Search className="w-4 h-4 text-muted-foreground mr-2 shrink-0" />
                  <input
                    type="text"
                    placeholder="Search history"
                    className="bg-transparent border-none outline-none text-sm w-full placeholder:text-muted-foreground"
                  />
                </div>
              </div>
              <div className="p-2 flex flex-col overflow-y-auto">
                {sessions.length === 0 ? (
                  <div className="text-sm text-muted-foreground px-4 py-8 text-center">
                    No recent chats
                  </div>
                ) : (
                  sessions.map((session) => (
                    <button
                      key={session.id}
                      onClick={() => {
                        setCurrentSessionId(session.id);
                        setActivePopover("none");
                      }}
                      className="w-full flex items-center justify-between px-3 py-3 text-sm rounded-lg hover:bg-muted transition-colors text-left cursor-pointer"
                    >
                      <span className="truncate pr-4 font-medium text-foreground">
                        {session.title}
                      </span>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {new Date(session.updatedAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Suggested Prompts Popover */}
          {activePopover === "suggestions" && (
            <div className="absolute bottom-full left-0 mb-4 w-full bg-background border border-border/80 shadow p-0 max-h-[400px] overflow-hidden flex flex-col z-50 animate-in slide-in-from-bottom-2">
              <div className="p-2 flex flex-col overflow-y-auto">
                {[
                  "Show balance sheet",
                  "Show growth rate analysis",
                  "Analyze revenue growth trends",
                  "Show invoice payment analysis",
                  "Analyze customer payment patterns",
                  "Show tax summary",
                  "Show tax breakdown by category",
                  "Show business health score",
                  "Analyze business health metrics",
                  "Show revenue forecast",
                ].map((promptText, idx) => (
                  <button
                    key={idx}
                    onClick={() => sendMessage(promptText)}
                    className="w-full text-left px-3 py-3 text-sm rounded-lg hover:bg-muted transition-colors cursor-pointer text-muted-foreground hover:text-foreground"
                  >
                    {promptText}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Auto-sizing Input Bar */}
          <div className="w-full bg-[#F7F7F7] dark:bg-[#131313] shadow-sm border border-border/50 flex flex-col overflow-hidden transition-all">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height =
                  Math.min(e.target.scrollHeight, 200) + "px";
              }}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything"
              disabled={isLoading}
              rows={1}
              className={cn(
                "w-full resize-none bg-transparent outline-none p-4 placeholder:text-muted-foreground text-sm",
                "disabled:cursor-not-allowed",
              )}
              style={{ minHeight: "60px", maxHeight: "200px" }}
            />

            <div className="flex items-center justify-between px-3 pb-3">
              <div className="flex items-center gap-1.5">
                {/* <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      className="p-2 text-muted-foreground cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 rounded-md transition-colors"
                      aria-label="Add attachment"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Add attachment</TooltipContent>
                </Tooltip> */}

                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() =>
                        setActivePopover(
                          activePopover === "suggestions"
                            ? "none"
                            : "suggestions",
                        )
                      }
                      className={cn(
                        "p-2 text-muted-foreground cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 rounded-md transition-colors",
                        activePopover === "suggestions" &&
                          "bg-black/5 dark:bg-white/5 text-foreground",
                      )}
                      aria-label="Suggested actions"
                    >
                      <Zap className="w-4 h-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Suggested actions</TooltipContent>
                </Tooltip>

                {/* <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      className="p-2 text-muted-foreground cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 rounded-md transition-colors"
                      aria-label="Web search"
                    >
                      <Globe className="w-4 h-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Web search</TooltipContent>
                </Tooltip> */}

                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() =>
                        setActivePopover(
                          activePopover === "history" ? "none" : "history",
                        )
                      }
                      className={cn(
                        "p-2 text-muted-foreground cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 rounded-md transition-colors",
                        activePopover === "history" &&
                          "bg-black/5 dark:bg-white/5 text-foreground",
                      )}
                      aria-label="Chat History"
                    >
                      <History className="w-4 h-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Chat History</TooltipContent>
                </Tooltip>
              </div>

              <div className="flex items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => sendMessage(input)}
                      disabled={isLoading || !input.trim()}
                      className={cn(
                        "w-8 h-8 flex items-center justify-center rounded transition-all",
                        input.trim() && !isLoading
                          ? "bg-[#1A1A1A] text-white hover:bg-black dark:bg-white dark:text-black dark:hover:bg-gray-200"
                          : "bg-muted text-muted-foreground cursor-not-allowed opacity-50",
                        "cursor-pointer",
                      )}
                      aria-label="Send message"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Send message</TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>
        </div>
      </TooltipProvider>
    </>
  );
}
