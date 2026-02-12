import { describe, expect, it } from "bun:test";
import { app } from "../src/index";
import { decrypt } from "@workspace/encryption";

describe("Encryption Module", () => {
    it("encrypts response when ENCRYPTION_KEY is set", async () => {
        // Mock ENCRYPTION_KEY
        process.env.ENCRYPTION_KEY = "12345678901234567890123456789012";

        const response = await app.handle(new Request("http://localhost/health"));
        const data = await response.json();

        expect(response.headers.get("x-encrypted")).toBe("true");
        expect(data).toHaveProperty("data");
        expect(typeof data.data).toBe("string");

        // Verify decryption
        const decrypted = JSON.parse(decrypt(data.data, process.env.ENCRYPTION_KEY));
        expect(decrypted).toHaveProperty("status", "ok");
    });
});
