import { Env } from "@workspace/constants";
import { db } from "@workspace/database";
import { redis } from "@workspace/redis";
import { buildSuccess } from "@workspace/utils";
import { sql } from "drizzle-orm";
import { Elysia } from "elysia";

export interface HealthStatus {
  status: "ok" | "degraded" | "unhealthy";
  checks: {
    database: { status: "ok" | "error"; latency_ms?: number; error?: string };
    redis: { status: "ok" | "error"; latency_ms?: number; error?: string };
  };
  timestamp: string;
  uptime: number;
}

export const healthController = new Elysia({ prefix: "/health" })
  .get(
    "/",
    async (): Promise<Response> => {
      const checks: HealthStatus["checks"] = {
        database: { status: "ok" },
        redis: { status: "ok" },
      };

      let overallStatus: HealthStatus["status"] = "ok";

      const dbStart = Date.now();
      try {
        await db.execute(sql`SELECT 1`);
        checks.database.latency_ms = Date.now() - dbStart;
      } catch (error) {
        checks.database.status = "error";
        checks.database.error =
          error instanceof Error ? error.message : "Unknown error";
        overallStatus = "degraded";
      }

      if (Env.UPSTASH_REDIS_REST_URL && Env.UPSTASH_REDIS_REST_TOKEN) {
        const redisStart = Date.now();
        try {
          await redis.ping();
          checks.redis.latency_ms = Date.now() - redisStart;
        } catch (error) {
          checks.redis.status = "error";
          checks.redis.error =
            error instanceof Error ? error.message : "Unknown error";
          overallStatus = "degraded";
        }
      } else {
        checks.redis = { status: "ok", latency_ms: 0 };
      }

      if (checks.database.status === "error") {
        overallStatus = "unhealthy";
      }

      return new Response(
        JSON.stringify({
          status: overallStatus,
          checks,
          timestamp: new Date().toISOString(),
          uptime: process.uptime(),
        }),
        {
          headers: { "Content-Type": "application/json" },
        },
      );
    },
    {
      detail: {
        summary: "Health Check",
        description:
          "Returns the current health status of the API including database and Redis connectivity",
        tags: ["System"],
      },
    },
  )
  .get(
    "/live",
    () =>
      new Response(JSON.stringify({ status: "ok" }), {
        headers: { "Content-Type": "application/json" },
      }),
    {
      detail: {
        summary: "Liveness Probe",
        description:
          "Simple liveness check - returns 200 if the server is running",
        tags: ["System"],
      },
    },
  )
  .get(
    "/ready",
    async () => {
      try {
        await db.execute(sql`SELECT 1`);
        return new Response(JSON.stringify({ status: "ready" }), {
          headers: { "Content-Type": "application/json" },
        });
      } catch {
        return new Response(JSON.stringify({ status: "not_ready" }), {
          status: 503,
          headers: { "Content-Type": "application/json" },
        });
      }
    },
    {
      detail: {
        summary: "Readiness Probe",
        description:
          "Returns 200 if the server is ready to accept traffic (database connected)",
        tags: ["System"],
      },
    },
  );
