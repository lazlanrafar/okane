import { Elysia } from "elysia";
import { createLogger } from "@workspace/logger";

const log = createLogger("http");

export const loggerPlugin = (app: Elysia) =>
  app
    .derive(() => ({
      startTime: Date.now(),
    }))
    .onAfterHandle(({ request, set, startTime }) => {
      const duration = Date.now() - startTime;
      const { method, url } = request;
      const path = new URL(url).pathname;

      const statusCode = typeof set.status === "number" ? set.status : 200;
      const logMethod = statusCode >= 400 ? "warn" : "info";

      log[logMethod](`${method} ${path} ${statusCode} - ${duration}ms`, {
        method,
        path,
        status: statusCode,
        duration,
      });
    })
    .onError(({ request, error, code, set, startTime }) => {
      const duration = startTime ? Date.now() - startTime : 0;
      const { method, url } = request;
      const path = new URL(url).pathname;
      const statusCode = typeof set.status === "number" ? set.status : 500;

      const errorMessage =
        error instanceof Error ? error.message : String(error);

      log.error(`ERROR ${method} ${path} ${statusCode} - ${duration}ms`, {
        method,
        path,
        status: statusCode,
        duration,
        error: errorMessage,
        code,
        stack: error instanceof Error ? error.stack : undefined,
      });
    });
