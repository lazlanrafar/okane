import { describe, expect, it } from "bun:test";
import { healthRoutes } from "../src/modules/health";

describe("Health Module", () => {
    it("returns status ok", async () => {
        const response = await healthRoutes.handle(new Request("http://localhost/health")).then(res => res.json());
        expect(response).toMatchObject({
            status: "ok"
        });
        expect(response).toHaveProperty("timestamp");
        expect(response).toHaveProperty("uptime");
    });
});
