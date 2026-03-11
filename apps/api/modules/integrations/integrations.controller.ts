import { Elysia } from "elysia";
import { authPlugin } from "../../plugins/auth";
import { encryptionPlugin } from "../../plugins/encryption";
import { IntegrationsService } from "./integrations.service";
import { IntegrationsRepository } from "./integrations.repository";
import { ConnectWhatsAppDto, TwilioWebhookDto } from "./integrations.dto";

export const integrationsController = new Elysia({ prefix: "/integrations" })
  .use(encryptionPlugin)
  // Public webhook route for Twilio
  .post(
    "/whatsapp/webhook",
    async ({ body }) => {
      // Background process the webhook so we can return OK instantly to Twilio
      IntegrationsService.handleWhatsAppWebhook(body).catch(console.error);
      // return "OK";
    },
    {
      body: TwilioWebhookDto,
      detail: { summary: "WhatsApp Webhook", tags: ["Integrations"] },
    },
  )
  // Authenticated route for connecting phone number
  .use(authPlugin)
  .get(
    "/",
    async ({ auth }) => {
      if (!auth?.workspace_id) throw Error("Unauthorized");
      return await IntegrationsService.getAll(
        auth.workspace_id,
      );
    },
    { detail: { summary: "List Integrations", tags: ["Integrations"] } },
  )
  .post(
    "/whatsapp/connect",
    async ({ body, auth }) => {
      if (!auth?.workspace_id || !auth?.user_id) throw Error("Unauthorized");
      return await IntegrationsService.connectWhatsApp(
        auth.workspace_id,
        auth.user_id,
        body.phoneNumber,
      );
    },
    {
      body: ConnectWhatsAppDto,
      detail: { summary: "Connect WhatsApp", tags: ["Integrations"] },
    },
  );
