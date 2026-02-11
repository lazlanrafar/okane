# Coding Standards & Project Structure

> [!TIP]
> **AI Assistant Reference**: Read this file at the start of every session to ensure compliance with project standards.

This document serves as the single source of truth for the project's coding standards, structure, and best practices. **It must be reviewed before starting any new task.**

## 1. Project Structure

This is a Turborepo-managed monorepo using **Bun** as the package manager.

```
/
├── apps/
│   ├── app/              # Next.js 16 (Turbopack) - Main application
│   └── api/              # ElysiaJS (Bun) - REST API & MCP Server
├── packages/
│   ├── ui/               # Shared React UI components (Shadcn/Tailwind v4)
│   ├── utils/            # Shared utility functions
│   ├── logger/           # Shared Pino logger (JSON/Pretty)
│   ├── database/         # Drizzle ORM + PostgreSQL client
│   ├── supabase/         # Shared Supabase clients (Server/Client/Middleware)
│   ├── typescript-config/# Shared TSConfigs
│   └── eslint-config/    # Shared ESLint/Biome configs
├── .env.example          # Template for root-level environment variables
└── turbo.json            # Turborepo configuration (globalEnv)
```

## 2. Naming Conventions

Strict adherence to these naming conventions is required.

### Variables & Data

**Rule:** Use `snake_case` for all local variables, data objects, and database fields.
**Exception:** Props and Component Interfaces must use `camelCase` to follow React ecosystem standards.

```typescript
// ✅ CORRECT
const user_data = await db.select().from(users);
const is_valid = validate(user_data);
const api_result = { status_code: 200, data: user_data };

// ❌ INCORRECT (for data)
const userData = ...
const isValid = ...
```

### React Props & Interfaces

**Rule:** Use `camelCase` for props and interface keys to maintain compatibility with React libraries.

```typescript
interface ButtonProps {
  isLoading: boolean; // ✅ camelCase
  onClick: () => void; // ✅ camelCase
}

function UserCard({ userId, isActive }: { userId: string; isActive: boolean }) {
  // ...
}
```

### Files & Directories

**Rule:** Use `kebab-case` for all file and directory names.

- `user-profile.tsx`
- `auth-provider.ts`
- `components/ui/data-table/`

### Components

**Rule:** Use `PascalCase` for component names.

- `UserProfile`
- `DataTable`

## 3. Tech Stack & Tools

- **Runtime**: Bun
- **Frameworks**: Next.js 16 (App), ElysiaJS (API)
- **Language**: TypeScript (Strict mode)
- **Database**: PostgreSQL (Supabase Transaction Pooler) via Drizzle ORM
- **Styling**: Tailwind CSS v4 (in `packages/ui`)
- **Linting/Formatting**: Biome
- **Logging**: Pino (via `@workspace/logger`)

## 4. Typing Rules

1. **Prefer `type` over `interface`** for data models and state.
2. **Explicit Return Types**: Always define return types for exported functions and API handlers.
3. **No `any`**: Use `unknown` or specific types. Zod schemas should be used for validation boundaries.

## 5. Environment Variables

All environment variables are managed at the **root level** in `.env`.

- They are passed to workspaces via `turbo.json` -> `globalEnv`.
- Do not create `.env` files inside `apps/*` or `packages/*`.

## 6. Logging

Always use the shared logger from `@workspace/logger`.

- **Dev**: `LOG_PRETTY=true` (readable output)
- **Prod**: JSON structured logs (NDJSON)
- **Logs Directory**: `logs/app.log.txt` (gitignored)

```typescript
import { createLogger } from "@workspace/logger";
const log = createLogger("my-module");

log.info("Processing data", { user_id: 123 });
```
