import * as Sentry from "@sentry/nextjs";

export async function register() {
  // Validate environment variables on server startup
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { loadEnv } = await import("@workspace/utils/load-env");
    loadEnv();
  }

  const { getAdminEnv } = await import("./env");
  getAdminEnv();

  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }
}

export const onRequestError = Sentry.captureRequestError;
