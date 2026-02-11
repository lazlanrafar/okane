import { Elysia } from "elysia";

export const healthRoutes = new Elysia({ prefix: "/health" }).get(
  "/",
  () => ({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  }),
  {
    detail: {
      summary: "Health Check",
      description: "Returns the current health status of the API",
      tags: ["System"],
    },
  },
);
