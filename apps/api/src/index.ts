// Sentry must be imported first to instrument everything
import "./instrument";

import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import * as Sentry from "@sentry/bun";
import { createLogger } from "@workspace/logger";

import { healthRoutes } from "./routes/health";
import { exampleRoutes } from "./routes/example";
import { databaseRoutes } from "./routes/database";
import { mcpPlugin } from "./plugins/mcp";
import { authPlugin } from "./plugins/auth";

const log = createLogger("api");
const port = process.env.API_PORT ?? 3001;

const app = new Elysia()
  .use(cors())
  .use(authPlugin)
  .use(
    swagger({
      documentation: {
        info: {
          title: "Okane API",
          version: "0.1.0",
          description: "REST API for Okane — powered by ElysiaJS & Bun",
        },
      },
    }),
  )
  .use(mcpPlugin)
  .use(healthRoutes)
  .use(exampleRoutes)
  .use(databaseRoutes)
  .onError(({ error, code }) => {
    // Don't log or capture 404s — they're expected
    if (code === "NOT_FOUND") return;
    Sentry.captureException(error);
    log.error("Unhandled error", { err: error });
  })
  .listen(port);

log.info(`🦊 Okane API running at http://localhost:${port}`);
log.info(`📖 Swagger docs at http://localhost:${port}/swagger`);
log.info(`🔌 MCP endpoint at http://localhost:${port}/mcp`);

export type App = typeof app;
