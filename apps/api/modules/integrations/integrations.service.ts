import { IntegrationsRepository } from "./integrations.repository";
import { AiService } from "../ai/ai.service";
import { TransactionsService } from "../transactions/transactions.service";
import { walletsRepository } from "../wallets/wallets.repository";
import { vaultService } from "../vault/vault.service";
import { buildSuccess } from "@workspace/utils";
import { Env } from "@workspace/constants";

export abstract class IntegrationsService {
  static async connectWhatsApp(
    workspaceId: string,
    userId: string,
    phoneNumber: string,
  ) {
    // Basic phone number sanitization
    const cleaned = phoneNumber.replace(/[^0-9+]/g, "");

    const integration = await IntegrationsRepository.upsert({
      workspaceId,
      provider: "whatsapp",
      settings: { phoneNumber: cleaned, connectedByUserId: userId },
      isActive: true,
    });

    return buildSuccess(integration, "WhatsApp connected successfully");
  }

  static async getAll(workspace_id: string) {
    const integrations = await IntegrationsRepository.findAll(workspace_id);
    return buildSuccess(integrations, "Integrations retrieved successfully");
  }

  static getVerifyToken() {
    return Env.WHATSAPP_VERIFY_TOKEN;
  }

  static async handleMetaWhatsAppWebhook(payload: Record<string, any>) {
    // Meta payload: entry[] > changes[] > value > messages[]
    const entry = payload.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const message = value?.messages?.[0];

    if (!message) return "OK";

    const fromUserNumber = message.from; // Phone number
    const wamid = message.id;
    const text = message.text?.body?.trim();
    const type = message.type;

    if (!fromUserNumber) return "OK";

    // Check for linking command
    if (type === "text" && text) {
      const match = text.match(/^Connect Okane\s+([a-f0-9-]{36})$/i);
      if (match) {
        const targetWorkspaceId = match[1];
        await IntegrationsService.connectWhatsApp(
          targetWorkspaceId,
          "00000000-0000-0000-0000-000000000000",
          fromUserNumber,
        );

        await IntegrationsService.sendWhatsAppMessage(
          fromUserNumber,
          "✅ Your WhatsApp is now connected to Okane! You can now send me your expenses or upload receipts anytime.",
        );
        return "OK";
      }
    }

    const integration =
      await IntegrationsRepository.findByWhatsAppNumber(fromUserNumber);

    if (!integration) return "Unauthorized / unknown number";

    const { workspaceId, settings } = integration;
    const userId = (settings as any)?.connectedByUserId;

    if (!userId) return "Need a valid user to create transaction";

    try {
      if (type === "image" || type === "document") {
        const media = message.image || message.document;
        const mediaId = media?.id;
        const mimeType = media?.mime_type;

        if (mediaId && mimeType) {
          // 1. Get media URL from Meta
          const mediaResponse = await fetch(
            `https://graph.facebook.com/v21.0/${mediaId}`,
            {
              headers: {
                Authorization: `Bearer ${Env.WHATSAPP_ACCESS_TOKEN}`,
              },
            },
          );

          if (!mediaResponse.ok) throw new Error("Failed to get media URL from Meta");
          const mediaData = await mediaResponse.json();
          const downloadUrl = mediaData.url;

          // 2. Download media
          const response = await fetch(downloadUrl, {
            headers: {
              Authorization: `Bearer ${Env.WHATSAPP_ACCESS_TOKEN}`,
            },
          });

          if (!response.ok) throw new Error("Failed to download media from Meta");

          const arrayBuffer = await response.arrayBuffer();
          const base64Image = Buffer.from(arrayBuffer).toString("base64");

          // 3. Upload to Vault
          const vaultFile = await vaultService.uploadFile(workspaceId, {
            name: `receipt-${Date.now()}.${mimeType === "application/pdf" ? "pdf" : "jpg"}`,
            type: mimeType,
            size: Buffer.byteLength(base64Image, "base64"),
            buffer: Buffer.from(base64Image, "base64"),
          });

          // 4. Parse with AI
          const parsedReceipt = await AiService.parseReceipt(
            workspaceId,
            base64Image,
            mimeType,
          );

          if (parsedReceipt && parsedReceipt.amount) {
            const wallets = await walletsRepository.findMany(workspaceId);
            if (wallets.length > 0) {
              const defaultWallet = wallets[0];
              if (!defaultWallet) return "OK";

              await TransactionsService.create(workspaceId, userId, {
                walletId: defaultWallet.id,
                amount: parsedReceipt.amount,
                date: parsedReceipt.date || new Date().toISOString(),
                type: "expense",
                name: parsedReceipt.name || "Expense",
                description: "Parsed automatically from WhatsApp Receipt",
                categoryId: parsedReceipt.categoryId,
                attachmentIds: vaultFile ? [vaultFile.id] : undefined,
              });

              const amountStr = Number(parsedReceipt.amount).toLocaleString();
              const replyBody = `✅ Added expense: ${parsedReceipt.name || "Receipt"} for ${amountStr}. Includes attached receipt file!`;
              await IntegrationsService.sendWhatsAppMessage(fromUserNumber, replyBody);
            }
          } else {
            await IntegrationsService.sendWhatsAppMessage(
              fromUserNumber,
              "❌ Sorry, I couldn't extract receipt data from that file.",
            );
          }
        }
      } else if (type === "text" && text) {
        try {
          const chatResponse = await AiService.chat(
            [{ role: "user", content: text }],
            workspaceId,
            userId,
          );

          if (chatResponse && chatResponse.reply) {
            await IntegrationsService.sendWhatsAppMessage(
              fromUserNumber,
              chatResponse.reply,
            );
          }
        } catch (chatErr) {
          console.error("[WhatsApp AI Chat Error]", chatErr);
          await IntegrationsService.sendWhatsAppMessage(
            fromUserNumber,
            "❌ Sorry, I encountered an error processing your request.",
          );
        }
      }
    } catch (error) {
      console.error("[WhatsApp Webhook] Error processing message:", error);
    }

    return "OK";
  }

  static async sendWhatsAppMessage(to: string, body: string) {
    const accessToken = Env.WHATSAPP_ACCESS_TOKEN;
    const phoneNumberId = Env.WHATSAPP_PHONE_NUMBER_ID;

    if (!accessToken || !phoneNumberId) {
      console.warn("[WhatsApp] Meta credentials missing, cannot send reply.");
      return;
    }

    const response = await fetch(
      `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to,
          type: "text",
          text: { body },
        }),
      },
    );

    if (!response.ok) {
      console.error("[WhatsApp] Failed to send reply:", await response.text());
    }
  }
}
