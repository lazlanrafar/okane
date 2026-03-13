"use client";

import { useChatInterface } from "@workspace/ui/hooks";
import { 
  Provider as ChatProvider, 
  createChatStore, 
  type StoreState 
} from "@ai-sdk-tools/store";
import { sendChatMessage } from "@workspace/modules/ai/ai.action";
import { useMemo, useEffect, type ReactNode } from "react";
import type { UIMessage } from "ai";

interface Props {
  children: ReactNode;
  initialMessages?: UIMessage[];
}

export function ChatProviderWrapper({ children, initialMessages }: Props) {
  const { chatId, setChatId } = useChatInterface();
  
  // Create a stable store instance
  const store = useMemo(() => createChatStore(initialMessages || []), [initialMessages]);

  useEffect(() => {
    // Inject our custom sendMessage into the store
    const state = store.getState() as any;
    if (state._syncState) {
      state._syncState({
        sendMessage: async (input: any, options?: { metadata?: any }) => {
          const messages = store.getState().messages;
          
          let userMessage: UIMessage;
          let attachments = options?.metadata?.attachments;

          if (typeof input === "string") {
            userMessage = {
              id: Date.now().toString(),
              role: "user",
              parts: [{ type: "text", text: input }],
            } as UIMessage;
          } else if (input && typeof input === "object" && "text" in input) {
            userMessage = {
              id: input.messageId || Date.now().toString(),
              role: "user",
              parts: [{ type: "text", text: input.text }],
              metadata: input.metadata,
            } as unknown as UIMessage;
            attachments = attachments || input.metadata?.attachments;
          } else {
            userMessage = input;
          }

          const updatedMessages = [...messages, userMessage];
          
          state.setMessages(updatedMessages);
          state.setStatus("streaming");

          try {
            const backendMessages = updatedMessages.map((m) => {
              const textContent = (m as any).parts
                ?.filter((p: any) => p.type === "text")
                .map((p: any) => p.text)
                .join("\n") || (m as any).content || "";
              
              return {
                role: m.role as "user" | "assistant",
                content: textContent,
              };
            });

            const response = await sendChatMessage(
              backendMessages,
              chatId || undefined,
              attachments
            );

            if (response.success && response.data) {
              const assistantMessage: UIMessage = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                parts: [{ type: "text", text: response.data.reply }],
                createdAt: new Date(),
              } as UIMessage;

              state.setMessages([...updatedMessages, assistantMessage]);
              state.setStatus("ready");

              if (!chatId && response.data.sessionId) {
                setChatId(response.data.sessionId);
              }
            } else {
              throw new Error(response.error || "Failed to get AI response");
            }
          } catch (error: any) {
            state.setError(error);
            state.setStatus("error");
          }
        }
      });
    }
  }, [store, chatId, setChatId]);

  return (
    <ChatProvider store={store as any}>
      {children}
    </ChatProvider>
  );
}
