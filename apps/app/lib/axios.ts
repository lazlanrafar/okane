import axios from "axios";

// Create a configured axios instance
export const axiosInstance = axios.create({
  baseURL: process.env.API_URL ?? "http://localhost:3001",
  headers: {
    "Content-Type": "application/json",
  },
});

import { decrypt } from "@workspace/encryption";

// Add a response interceptor to handle errors globally if needed
axiosInstance.interceptors.response.use(
  (response) => {
    // Check for encrypted response
    const isEncrypted = response.headers["x-encrypted"] === "true";
    if (isEncrypted && response.data?.data) {
        const secret = process.env.ENCRYPTION_KEY;
        if (secret) {
            try {
                const decrypted = decrypt(response.data.data, secret);
                response.data = JSON.parse(decrypted);
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
    // You can handle global errors here, e.g., logging or redirecting on 401
    // For now, just reject the promise to let the caller handle it
    return Promise.reject(error);
  }
);
