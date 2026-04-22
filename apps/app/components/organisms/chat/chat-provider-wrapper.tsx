"use client";

import { type ReactNode, useEffect, useMemo } from "react";

import { Provider as ChatProvider, createChatStore } from "@ai-sdk-tools/store";
import { sendChatMessage } from "@workspace/modules/ai/ai.action";
import { useChatInterface } from "@workspace/ui/hooks";
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
    if (chatId) {
      const state = store.getState() as Record<string, unknown>;
      if (state.setId) {
        state.setId(chatId);
      }
    }
  }, [store, chatId]);

  useEffect(() => {
    // Inject our custom sendMessage into the store
    const state = store.getState() as Record<string, unknown>;
    if (state._syncState) {
      state._syncState({
        sendMessage: async (
          input: string | UIMessage | Record<string, unknown>,
          options?: { metadata?: Record<string, unknown> },
        ) => {
          const messages = store.getState().messages;

          let userMessage: UIMessage;
          let attachments = options?.metadata?.attachments as Record<string, unknown>[];

          if (typeof input === "string") {
            userMessage = {
              id: Date.now().toString(),
              role: "user",
              parts: [{ type: "text", text: input }],
            } as UIMessage;
          } else if (input && typeof input === "object" && "text" in input) {
            const inputObj = input as Record<string, unknown>;
            userMessage = {
              id: (inputObj.messageId as string) || Date.now().toString(),
              role: "user",
              parts: [{ type: "text", text: input.text as string }],
              metadata: inputObj.metadata as Record<string, unknown>,
            } as unknown as UIMessage;

            const metadata = inputObj.metadata as Record<string, unknown>;
            attachments = attachments || (metadata?.attachments as Record<string, unknown>[]);
          } else {
            userMessage = input as UIMessage;
          }

          const updatedMessages = [...messages, userMessage];

          state.setMessages(updatedMessages);
          state.setStatus("streaming");

          try {
            const backendMessages = updatedMessages.map((m) => {
              const textContent =
                (m as Record<string, unknown>).parts && Array.isArray((m as Record<string, unknown>).parts)
                  ? ((m as Record<string, unknown>).parts as Record<string, unknown>[])
                      .filter((p: Record<string, unknown>) => p.type === "text")
                      .map((p: Record<string, unknown>) => p.text as string)
                      .join("\n")
                  : ((m as Record<string, unknown>).content as string) || "";

              return {
                role: m.role as "user" | "assistant",
                content: textContent,
              };
            });

            const response = await sendChatMessage(backendMessages, chatId || undefined, attachments);

            if (response.success && response.data) {
              const parts: Record<string, unknown>[] = [{ type: "text", text: response.data.reply }];

              // If backend returned an artifact, add it as a message part
              // This format is required by @ai-sdk-tools/artifacts/client
              const artifact = (response.data as Record<string, unknown>).artifact as Record<string, unknown>;
              if (artifact) {
                parts.push({
                  type: `data-artifact-${artifact.type}`,
                  id: artifact.type,
                  artifactType: artifact.type,
                  data: {
                    id: artifact.type,
                    type: artifact.type,
                    status: "complete",
                    version: 1,
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                    payload: artifact.payload,
                    progress: 1,
                  },
                  artifact: {
                    id: artifact.type,
                    type: artifact.type,
                    payload: artifact.payload,
                  },
                });
              }

              const assistantMessage: UIMessage = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                parts,
                createdAt: new Date(),
              } as UIMessage;

              state.setMessages([...updatedMessages, assistantMessage]);
              state.setStatus("ready");

              if (!chatId && response.data.sessionId) {
                state.setId(response.data.sessionId);
                setChatId(response.data.sessionId);
              }
            } else {
              interface AIError extends Error {
                code?: string;
                meta?: Record<string, unknown>;
              }
              const errorObj: AIError = new Error(response.error || "Failed to get AI response");
              errorObj.code = response.code;
              errorObj.meta = response.meta as Record<string, unknown>;
              throw errorObj;
            }
          } catch (error: unknown) {
            state.setError(error as Error);
            state.setStatus("error");
          }
        },
      });
    }
  }, [store, chatId, setChatId]);

  return <ChatProvider store={store as Record<string, unknown>}>{children}</ChatProvider>;
}
