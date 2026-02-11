import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";

import { healthRoutes } from "./routes/health";
import { exampleRoutes } from "./routes/example";
import { mcpPlugin } from "./plugins/mcp";

const port = process.env.API_PORT ?? 3001;

const app = new Elysia()
  .use(cors())
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
  .listen(port);

console.log(`🦊 Okane API running at http://localhost:${port}`);
console.log(`📖 Swagger docs at http://localhost:${port}/swagger`);
console.log(`🔌 MCP endpoint at http://localhost:${port}/mcp`);

export type App = typeof app;
