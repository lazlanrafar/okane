"use client";

import { useChatStore } from "@/stores/chat";
import { cn, Conversation, ConversationContent, Portal } from "@workspace/ui";
import { ChatInput } from "./chat-input";
import { ChatHistoryProvider } from "./chat-history";
import { useChatInterface, useChatStatus } from "@workspace/ui/hooks";
import { useEffect, useMemo, useRef } from "react";
import {
  useChatActions,
  useChatMessages,
  useChatStatus as useSDKChatStatus,
  useDataPart,
} from "@ai-sdk-tools/store";
import type { Geo } from "@vercel/functions";
import { generateId } from "ai";
import { ChatHeader } from "./chat-header";
import { ChatMessages } from "./chat-messages";
import { ChatStatusIndicators } from "./chat-status-indicators";

type Props = {
  geo?: Geo;
};

export default function ChatInterface({ geo }: Props) {
  const { chatId: routeChatId } = useChatInterface();
  const { reset } = useChatActions();
  const { setScrollY, setIsHome } = useChatStore();
  const containerRef = useRef<HTMLDivElement>(null);

  const chatId = useMemo(() => routeChatId ?? generateId(), [routeChatId]);
  const prevChatIdRef = useRef<string | null>(routeChatId);

  const messages = useChatMessages();
  const status = useSDKChatStatus();

  const [, clearSuggestions] = useDataPart<{ prompts: string[] }>(
    "suggestions",
  );

  // Reset chat state when navigating away from a chat (sidebar, browser back, etc.)
  useEffect(() => {
    const prevChatId = prevChatIdRef.current;
    const currentChatId = routeChatId;

    // If we had a chatId before and now we don't (navigated away), reset
    // Or if we're switching to a different chatId, reset
    if (prevChatId && prevChatId !== currentChatId) {
      reset();
      clearSuggestions();
      setScrollY(0);
    }

    // Update the ref for next comparison
    prevChatIdRef.current = currentChatId;
  }, [routeChatId, reset, clearSuggestions, setScrollY]);

  const hasMessages = messages.length > 0;
  const showCanvas = false;

  // Unified isHome logic: true only if no chatId in route AND no messages
  const effectiveIsHome = !routeChatId && !hasMessages;

  // Track robust scroll (searching for nearest scrollable container)
  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const getScrollParent = (
      node: HTMLElement | null,
    ): HTMLElement | Window => {
      if (!node) return window;
      const overflowY = window.getComputedStyle(node).overflowY;
      const isScrollable =
        overflowY !== "visible" &&
        overflowY !== "hidden" &&
        overflowY !== "clip";
      if (isScrollable) {
        return node;
      }
      return getScrollParent(node.parentElement);
    };

    const scrollParent = getScrollParent(element);

    const handleScroll = () => {
      const scrollTop =
        scrollParent === window
          ? window.scrollY
          : (scrollParent as HTMLElement).scrollTop;
      setScrollY(scrollTop);
    };

    scrollParent.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => scrollParent.removeEventListener("scroll", handleScroll);
  }, [setScrollY, effectiveIsHome, hasMessages]);

  const {
    agentStatus,
    currentToolCall,
    artifactStage,
    artifactType,
    currentSection,
    bankAccountRequired,
    hasTextContent,
    hasInsightData,
  } = useChatStatus(messages, status);

  // Sync isHome to store so ChatInput and other components stay in sync
  useEffect(() => {
    setIsHome(effectiveIsHome);
  }, [effectiveIsHome, setIsHome]);

  return (
    <ChatHistoryProvider>
      <div
        ref={containerRef}
        className={cn(
          "relative flex flex-col size-full scroll-smooth",
          !effectiveIsHome
            ? "h-[calc(100vh-88px)] overflow-hidden"
            : "h-auto min-h-[100px] pb-24",
        )}
      >
        {hasMessages && (
          <div className="flex-1 min-h-0 flex flex-col relative w-full overflow-hidden">
            <div
              className={cn(
                "sticky top-0 left-0 z-20 shrink-0",
                hasMessages && "transition-all duration-300 ease-in-out",
                showCanvas ? "right-0 md:right-[600px]" : "right-0",
              )}
            >
              <div className="bg-background/80 dark:bg-background/50 backdrop-blur-sm pt-6 px-4 md:px-6">
                <ChatHeader />
              </div>
            </div>
            <Conversation
              className="flex-1 w-full max-w-full focus:outline-none"
              onScroll={(e) => {
                const target = e.currentTarget as HTMLElement;
                setScrollY(target.scrollTop);
              }}
            >
              <ConversationContent className="pb-32 pt-10">
                <div className="max-w-2xl mx-auto w-full px-4 md:px-0">
                  <ChatMessages
                    messages={messages}
                    isStreaming={
                      status === "streaming" || status === "submitted"
                    }
                  />
                  <ChatStatusIndicators
                    agentStatus={agentStatus}
                    currentToolCall={currentToolCall}
                    status={status}
                    artifactStage={artifactStage}
                    artifactType={artifactType}
                    currentSection={currentSection}
                    bankAccountRequired={bankAccountRequired}
                    hasTextContent={hasTextContent}
                    hasInsightData={hasInsightData}
                  />
                </div>
              </ConversationContent>
            </Conversation>
          </div>
        )}

        <div
          className={cn(
            "fixed bottom-0 z-30 inset-x-0 transition-all duration-200",
            "left-0 md:left-(--sidebar-width) group-data-[state=collapsed]/sidebar-wrapper:left-(--sidebar-width-icon) right-0",
            "flex justify-center items-end pointer-events-none pb-4",
            showCanvas && "mr-0 md:mr-[600px]",
          )}
        >
          <div className="w-full max-w-5xl pointer-events-auto px-4">
            <ChatInput />
          </div>
        </div>
      </div>
    </ChatHistoryProvider>
  );
}
