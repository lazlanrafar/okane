// Sentry must be imported first to instrument everything
import "./instrument";

import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import * as Sentry from "@sentry/bun";
import { getEnv } from "@workspace/constants";
import { createLogger } from "@workspace/logger";
import { sql } from "drizzle-orm";
import { Elysia } from "elysia";

// Validate environment variables early
getEnv();

import { staticPlugin } from "@elysiajs/static";
import { Env } from "@workspace/constants";
import { db } from "@workspace/database";
import { aiController } from "./modules/ai/ai.controller";
import { authController } from "./modules/auth/auth.controller";
import { categoriesController } from "./modules/categories/categories.controller";
import { contactsController } from "./modules/contacts/contacts.controller";
import { debtsController } from "./modules/debts/debts.controller";
import { healthController } from "./modules/health/health.controller";
import { integrationsController } from "./modules/integrations/integrations.controller";
import { invoicesController } from "./modules/invoices/invoices.controller";
import { publicInvoicesController } from "./modules/invoices/public-invoices.controller";
import { metricsController } from "./modules/metrics/metrics.controller";
import { ordersController } from "./modules/orders/orders.controller";
import { pricingController } from "./modules/pricing/pricing.controller";
import { publicPricingController } from "./modules/pricing/public-pricing.controller";
import { settingsController } from "./modules/settings/settings.controller";
import { stripeController } from "./modules/stripe/stripe.controller";
import { systemAdminsController } from "./modules/system-admins/system-admins.controller";
import { systemMetricsController } from "./modules/system-metrics/system-metrics.controller";
import { transactions } from "./modules/transactions/transactions.controller";
import { usersController } from "./modules/users/users.controller";
import { vaultController } from "./modules/vault/vault.controller";
import { walletsController } from "./modules/wallets/wallets.controller";
import { workspacesController } from "./modules/workspaces/workspaces.controller";
import { authPlugin } from "./plugins/auth";
import { encryptionPlugin } from "./plugins/encryption";
import { loggerPlugin } from "./plugins/logger";
import { rateLimitPlugin } from "./plugins/rate-limit";

const log = createLogger("api");
const port = Env.API_PORT ?? 3001;

let isShuttingDown = false;

async function gracefulShutdown(signal: string) {
  if (isShuttingDown) return;
  isShuttingDown = true;

  log.info(`[API] Received ${signal}, starting graceful shutdown...`);

  try {
    await app.stop();
    log.info("[API] HTTP server stopped");

    await db.execute(sql`SELECT 1`);
    const client = (db as any).$client;
    if (client?.end) {
      await client.end();
      log.info("[API] Database connection closed");
    }

    log.info("[API] Graceful shutdown completed");
    process.exit(0);
  } catch (error) {
    log.error("[API] Error during shutdown", { error });
    process.exit(1);
  }
}

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

const app = new Elysia()
  .use(cors())
  .use(staticPlugin({ assets: "public", prefix: "" }))
  .get("/", () => Bun.file("public/index.html"))
  .use(loggerPlugin)
  .use(encryptionPlugin)
  .use(authPlugin)
  .use(rateLimitPlugin)
  .use(
    swagger({
      documentation: {
        info: {
          title: "oewang API",
          version: "1.0.0",
          description: "REST API for oewang — powered by ElysiaJS & Bun",
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
      .use(authController)
      .use(settingsController)
      .use(categoriesController)
      .use(walletsController)
      .use(vaultController)
      .use(transactions)
      .use(aiController)
      .use(metricsController)
      .use(integrationsController)
      .use(systemAdminsController)
      .use(pricingController)
      .use(stripeController)
      .use(ordersController)
      .use(systemMetricsController)
      .use(invoicesController)
      .use(publicInvoicesController)
      .use(contactsController)
      .use(debtsController),
  )
  // Public routes (no auth required)
  .use(publicPricingController)
  .onError(({ error, code }) => {
    if (code === "NOT_FOUND") return;
    Sentry.captureException(error);
  })
  .listen(port);

log.info(`🚀 oewang API running at http://localhost:${port}`);
log.info(`📖 Swagger docs at http://localhost:${port}/swagger`);
log.info(`🔗 API v1 at http://localhost:${port}/v1`);

export { app };
export type App = typeof app;
