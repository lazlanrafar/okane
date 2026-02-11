import { Elysia } from "elysia";
import { mcp } from "elysia-mcp";

/**
 * MCP (Model Context Protocol) plugin for the Okane API.
 * Exposes tools and resources that LLMs can interact with.
 *
 * Add your own tools/resources below following the pattern.
 */
export const mcpPlugin = new Elysia().use(
  mcp({
    basePath: "/mcp",
    serverInfo: {
      name: "okane-mcp",
      version: "0.1.0",
    },
    capabilities: {
      tools: {},
      resources: {},
    },
    setupServer: (server) => {
      // Tool: Get server status
      server.tool(
        "get_server_status",
        "Get the current status and uptime of the Okane API server",
        {},
        async () => ({
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({
                status: "ok",
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                environment: process.env.NODE_ENV ?? "development",
              }),
            },
          ],
        }),
      );

      // Tool: List available endpoints
      server.tool(
        "list_available_endpoints",
        "List all available REST API endpoints",
        {},
        async () => ({
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({
                endpoints: [
                  {
                    method: "GET",
                    path: "/health",
                    description: "Health check",
                  },
                  {
                    method: "GET",
                    path: "/api/items",
                    description: "List all items",
                  },
                  {
                    method: "GET",
                    path: "/api/items/:id",
                    description: "Get item by ID",
                  },
                  {
                    method: "POST",
                    path: "/api/items",
                    description: "Create a new item",
                  },
                  {
                    method: "DELETE",
                    path: "/api/items/:id",
                    description: "Delete an item",
                  },
                  {
                    method: "GET",
                    path: "/swagger",
                    description: "Swagger API documentation",
                  },
                ],
              }),
            },
          ],
        }),
      );

      // Resource: API info
      server.resource(
        "api-info",
        "okane://api/info",
        {
          mimeType: "application/json",
          description: "General information about the Okane API",
        },
        async () => ({
          contents: [
            {
              uri: "okane://api/info",
              mimeType: "application/json",
              text: JSON.stringify({
                name: "Okane API",
                version: "0.1.0",
                runtime: "Bun",
                framework: "ElysiaJS",
              }),
            },
          ],
        }),
      );
    },
  }),
);
