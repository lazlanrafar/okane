import { Env } from "@workspace/constants";
import { decrypt, encrypt } from "@workspace/encryption";
import type { Elysia } from "elysia";

import { ErrorCode } from "@workspace/types";
import { buildError } from "@workspace/utils";

/**
 * Encryption plugin — symmetric encryption for production.
 * 1. Decrypts request bodies if 'x-encrypted' header is present.
 * 2. Encrypts all JSON responses with AES-256-GCM.
 */
export const encryptionPlugin = (app: Elysia) =>
  app
    .onBeforeHandle(({ body, headers, set }) => {
      const isEncrypted = headers["x-encrypted"] === "true";

      if (isEncrypted && body && typeof body === "object" && "data" in body) {
        const secret = Env.ENCRYPTION_KEY;

        if (!secret) {
          console.error("Encryption key missing, cannot decrypt request");
          set.status = 500;
          return buildError(
            ErrorCode.INTERNAL_ERROR,
            "Server configuration error",
          );
        }

        try {
          const decrypted = decrypt((body as any).data, secret);
          // Replace the body with the decrypted content
          // We need to mutate the body object so subsequent hooks/controllers see the decrypted version
          const parsed = JSON.parse(decrypted);
          Object.keys(body).forEach((key) => delete (body as any)[key]);
          Object.assign(body as any, parsed);
        } catch (error) {
          console.error("Decryption failed:", error);
          set.status = 400;
          return buildError(ErrorCode.INVALID_INPUT, "Invalid encrypted data");
        }
      }
    })
    .mapResponse(({ response, set: _set, path }) => {
      if (path && (path.startsWith("/swagger") || path.startsWith("/health")))
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
            headers: {
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
