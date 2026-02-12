import { Elysia } from "elysia";
import { buildSuccess } from "@workspace/utils";

/**
 * Health check controller.
 */
export const healthController = new Elysia({ prefix: "/health" }).get(
  "/",
  () =>
    buildSuccess(
      {
        status: "ok",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      },
      "API is healthy",
    ),
  {
    detail: {
      summary: "Health Check",
      description: "Returns the current health status of the API",
      tags: ["System"],
    },
  },
);
