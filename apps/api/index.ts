// Sentry must be imported first to instrument everything
import "./instrument";

import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import * as Sentry from "@sentry/bun";
import { createLogger } from "@workspace/logger";
import { validateEnv } from "./config/env";
import { loadEnv } from "@workspace/constants/load-env";

// Load env vars from root .env if needed
loadEnv();

// Validate environment variables early
validateEnv();

import { authPlugin } from "./plugins/auth";
import { encryptionPlugin } from "./plugins/encryption";
import { rateLimitPlugin } from "./plugins/rate-limit";
import { healthController } from "./modules/health";
import { usersController } from "./modules/users";
import { workspacesController } from "./modules/workspaces";
import { authController } from "./modules/auth";

const log = createLogger("api");
const port = process.env.API_PORT ?? 3001;

const app = new Elysia()
  .use(cors())
  .use(encryptionPlugin)
  .use(authPlugin)
  .use(rateLimitPlugin)
  .use(
    swagger({
      documentation: {
        info: {
          title: "Okane API",
          version: "1.0.0",
          description: "REST API for Okane — powered by ElysiaJS & Bun",
        },
      },
    }),
  )
  // All routes grouped under /v1
  .group("/v1", (app) =>
    app
      .use(healthController)
      .use(usersController)
      .use(workspacesController)
      .use(authController),
  )
  .onError(({ error, code }) => {
    // Don't log or capture 404s — they're expected
    if (code === "NOT_FOUND") return;
    Sentry.captureException(error);
    log.error("Unhandled error", { err: error });
  })
  .listen(port);

log.info(`🦊 Okane API running at http://localhost:${port}`);
log.info(`📖 Swagger docs at http://localhost:${port}/swagger`);
log.info(`🔗 API v1 at http://localhost:${port}/v1`);

export { app };
export type App = typeof app;
