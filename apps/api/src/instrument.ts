import * as Sentry from "@sentry/bun";
import { createLogger } from "@workspace/logger";

const log = createLogger("sentry");

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
  enabled: !!process.env.SENTRY_DSN,
});

if (process.env.SENTRY_DSN) {
  log.info("Sentry initialized for API");
} else {
  log.warn("SENTRY_DSN not set — Sentry disabled");
}
