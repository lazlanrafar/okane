import { Elysia } from "elysia";
import { encrypt } from "@workspace/encryption";

export const encryptionPlugin = (app: Elysia) =>
  app.mapResponse(({ response, set }) => {
    // Only encrypt JSON responses
    if (
      response &&
      typeof response === "object" &&
      !(response instanceof Blob) &&
      !(response instanceof ReadableStream)
    ) {
      const secret = process.env.ENCRYPTION_KEY;
      
      if (!secret) {
        return;
      }

      try {
        const encrypted = encrypt(JSON.stringify(response), secret);
        return new Response(JSON.stringify({ data: encrypted }), {
            headers: { 
                "Content-Type": "application/json",
                "x-encrypted": "true"
            }
        });
      } catch (error) {
        console.error("Encryption failed:", error);
        return;
      }
    }
  });
