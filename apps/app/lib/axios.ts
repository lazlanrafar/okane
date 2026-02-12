import axios from "axios";
import { decrypt } from "@workspace/encryption";
import type { ApiResponse } from "@workspace/types";

// Create a configured axios instance
export const axiosInstance = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"}/v1`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor — attaches the app JWT from cookies
axiosInstance.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const cookies = document.cookie.split(";");
    const session_cookie = cookies
      .find((c) => c.trim().startsWith("okane-session="))
      ?.split("=")[1];

    if (session_cookie) {
      config.headers.Authorization = `Bearer ${session_cookie}`;
    }
  }
  return config;
});

// Response interceptor — handles decryption of encrypted API responses
axiosInstance.interceptors.response.use(
  (response) => {
    // Check for encrypted response
    const is_encrypted = response.headers["x-encrypted"] === "true";
    if (is_encrypted && response.data?.data) {
      const secret = process.env.ENCRYPTION_KEY;
      if (secret) {
        try {
          const decrypted = decrypt(response.data.data, secret);
          const parsed: ApiResponse<unknown> = JSON.parse(decrypted);
          // Return the data field from ApiResponse for convenience
          response.data = parsed.data;
          // Attach full response metadata
          // biome-ignore lint/suspicious/noExplicitAny: Augmenting response object
          (response as any)._api_response = parsed;
        } catch (e) {
          console.error("Failed to decrypt response", e);
        }
      } else {
        console.warn("ENCRYPTION_KEY not set, cannot decrypt response");
      }
    }
    return response;
  },
  (error) => {
    // Handle encrypted error responses
    if (error.response) {
      const is_encrypted = error.response.headers["x-encrypted"] === "true";
      if (is_encrypted && error.response.data?.data) {
        const secret = process.env.ENCRYPTION_KEY;
        if (secret) {
          try {
            const decrypted = decrypt(error.response.data.data, secret);
            const parsed: ApiResponse<unknown> = JSON.parse(decrypted);
            error.response.data = parsed;
          } catch (e) {
            console.error("Failed to decrypt error response", e);
          }
        }
      }
    }
    return Promise.reject(error);
  },
);
