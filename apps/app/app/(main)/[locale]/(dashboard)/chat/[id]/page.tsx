import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { geolocation } from "@vercel/functions";
import { getChatSession, getChatSessionMessages } from "@workspace/modules/ai/ai.action";
import type { Metadata } from "next";

import { getDictionary } from "@/get-dictionary";
import ChatInterface from "@/components/organisms/chat/chat-interface";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const response = await getChatSession(id);

  if (!response.success || !response.data) {
    return {
      title: "Chat",
    };
  }

  return {
    title: response.data.title,
  };
}

import { ChatProviderWrapper } from "@/components/organisms/chat/chat-provider-wrapper";

export default async function ChatPage(props: Props) {
  const { id } = await props.params;

  const headersList = await headers();
  const geo = geolocation({
    headers: headersList,
  });

  const [response, dictionary] = await Promise.all([
    getChatSessionMessages(id),
    getDictionary(locale as any),
  ]);

  if (!response.success || !response.data) {
    notFound();
  }

  // Map backend ChatMessage to frontend Message format if needed,
  // but initialMessages usually expects AI SDK Message type.
  // The backend ChatMessage is { role: "user" | "assistant", content: string }
  // We'll add IDs to them for the store.
  const initialMessages = response.data.map((m, i) => {
    const parts: any[] = [{ type: "text", text: m.content }];
    const attachment = m.attachments;
    const artifact = Array.isArray(attachment) ? attachment[0]?.artifact : attachment?.artifact;

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

    return {
      id: `${id}-${i}`,
      role: m.role,
      content: m.content,
      parts,
      createdAt: new Date(),
    };
  }) as any;

  return (
    <ChatProviderWrapper initialMessages={initialMessages}>
      <ChatInterface geo={geo} dictionary={dictionary} />
    </ChatProviderWrapper>
  );
}
