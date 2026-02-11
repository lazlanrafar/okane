import * as Sentry from "@sentry/nextjs";

import { validateEnv } from "@workspace/constants";

export async function register() {
  // Validate environment variables on server startup
  validateEnv();

  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }
}

export const onRequestError = Sentry.captureRequestError;
