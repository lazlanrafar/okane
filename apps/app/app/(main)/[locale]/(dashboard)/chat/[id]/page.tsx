import ChatInterface from "@/components/organisms/chat/chat-interface";
import { Metadata } from "next";
import { headers } from "next/headers";
import { geolocation } from "@vercel/functions";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Chat | Okane",
};

import { getChatSessionMessages } from "@workspace/modules/ai/ai.action";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ id: string }>;
};

import { ChatProviderWrapper } from "@/components/organisms/chat/chat-provider-wrapper";

export default async function ChatPage(props: Props) {
  const { id } = await props.params;

  const headersList = await headers();
  const geo = geolocation({
    headers: headersList,
  });

  const response = await getChatSessionMessages(id);

  if (!response.success || !response.data) {
    notFound();
  }

  // Map backend ChatMessage to frontend Message format if needed,
  // but initialMessages usually expects AI SDK Message type.
  // The backend ChatMessage is { role: "user" | "assistant", content: string }
  // We'll add IDs to them for the store.
  const initialMessages = response.data.map((m, i) => ({
    id: `${id}-${i}`,
    role: m.role,
    content: m.content,
    parts: [{ type: "text", text: m.content } as any],
    createdAt: new Date(),
  })) as any;

  return (
    <ChatProviderWrapper initialMessages={initialMessages}>
      <ChatInterface geo={geo} />
    </ChatProviderWrapper>
  );
}
