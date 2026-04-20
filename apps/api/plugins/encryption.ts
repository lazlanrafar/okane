import { Env } from "@workspace/constants";
import { decrypt, encrypt } from "@workspace/encryption";
import type { Elysia } from "elysia";

import { ErrorCode } from "@workspace/types";
import { buildError } from "@workspace/utils";

import { appendFileSync } from "fs";

/**
 * Encryption plugin — symmetric encryption for production.
 * 1. Decrypts request bodies if 'x-encrypted' header is present.
 * 2. Encrypts all JSON responses with AES-256-GCM.
 */
export const encryptionPlugin = (app: Elysia) =>
  app
    .onParse(async ({ request, contentType }) => {
      if (
        contentType === "application/json" &&
        request.headers.get("x-encrypted") === "true"
      ) {
        const secret = Env.ENCRYPTION_KEY;
        if (!secret) {
          return;
        }

        try {
          const body = await request.json();
          if (body && typeof body === "object" && "data" in body) {
            const decrypted = decrypt(body.data, secret);
            const parsed = JSON.parse(decrypted);
            return parsed;
          }
        } catch (error: any) {
          console.error("[Encryption] Parse/Decrypt failed:", error);
          // Return undefined to let other parsers try or fail later
          return;
        }
      }
    })
    .onTransform(({ path, headers }) => {
      const isEncrypted = headers["x-encrypted"] === "true";
      console.log(
        `[Encryption] Request phase: onTransform, path: ${path}, isEncrypted: ${isEncrypted}`,
      );
    })
    .mapResponse(({ response, set: _set, path }) => {
      if (
        path &&
        (path.startsWith("/swagger") ||
          path.startsWith("/health") ||
          path.includes("/mayar/webhook"))
      )
        return;

      // Only encrypt JSON responses
      if (
        response &&
        typeof response === "object" &&
        !(response instanceof Blob) &&
        !(response instanceof ReadableStream) &&
        !(response instanceof Response)
      ) {
        const secret = Env.ENCRYPTION_KEY;

        if (!secret) {
          return;
        }

        try {
          const encrypted = encrypt(JSON.stringify(response), secret);
          return new Response(JSON.stringify({ data: encrypted }), {
            status: typeof _set.status === "number" ? _set.status : 200,
            headers: {
              ...(_set.headers as Record<string, string>),
              "Content-Type": "application/json",
              "x-encrypted": "true",
            },
          });
        } catch (error) {
          console.error("Encryption failed:", error);
          return;
        }
      }
    });
