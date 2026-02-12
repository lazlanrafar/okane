---
trigger: always_on
---

---

## trigger: always_on

# AI AGENT ENFORCED ARCHITECTURE RULES

## Multi-Workspace SaaS - Turborepo - Encrypted REST

Single source of truth. No deviation allowed.

---

# System Overview

**Stack:** Turborepo - Bun - Next.js (apps/app) - ElysiaJS (apps/api) - PostgreSQL - Shared packages

**Flow:** `apps/app` -> Encrypted REST -> `apps/api` -> Database

---

# Monorepo Structure (NO `src/` ALLOWED)

```
apps/app/         -> app/ components/ modules/ lib/ middleware.ts
apps/api/modules/{feature}/ -> controller - service - repository - model - __tests__/
apps/api/         -> plugins/ config/ index.ts
packages/         -> utils/ email/ logger/ database/ types/ ui/
.env - .env.test - .mcp.json - turbo.json
```

`src/` is forbidden everywhere.

---

# Multi-Workspace Rules (CRITICAL)

Every workspace-scoped table MUST have `workspace_id` + `deleted_at`.

**Workspace context priority:** JWT `workspace_id` -> `x-workspace-id` header -> subdomain. JWT always wins on conflict.

All repository queries MUST filter by `workspace_id` and `deleted_at: null`. No cross-workspace joins. No global queries.

```ts
where: { workspace_id, deleted_at: null }
```

**Forbidden:** hardcoded workspace IDs - super-admin bypass without role check - returning data without workspace validation.

---

# User <-> Workspace Model (CRITICAL)

**users table:** `workspace_id FK -> workspaces.id` (active workspace, nullable until first join)

**user_workspaces table:** `{ user_id, workspace_id, role: "owner"|"admin"|"member", joined_at }`

- `workspaces` on user = resolved via `user_workspaces` join table. NEVER an array/JSON column.
- `workspace_id` auto-set on first join. Updated on switch. Null or reassigned on leave.

**JWT MUST include:** `{ user_id, workspace_id }`

**Forbidden:** array/JSON workspaces column - skipping `user_workspaces` membership check - JWT without `workspace_id` - access without a membership row.

---

# apps/app Rules

- UI only. REST consumer only. No DB access. No business logic.
- `apps/app` CANNOT import `packages/database`.
- Components -> `/components` only. No `_components` in routes. No API calls in client components.
- Modules -> REST wrappers only (`auth.action.ts`, `auth.types.ts`). No DB, no business logic.

**middleware.ts** - auth + workspace guard only:

- Verify JWT, redirect unauthed to `/login`, detect `workspace_id`, redirect no-workspace users to onboarding.
- CANNOT: contain business logic - call DB - call apps/api directly.

---

# apps/api Rules

Only layer allowed to: access DB - contain business logic - handle workspace validation.

**Layer flow:** `Controller -> Service -> Repository -> Database`

- **Controller:** route definition + TypeBox input validation + call service + encrypt response. No DB, no business logic.
- **Service:** business logic + workspace validation + plan enforcement + call repository. No HTTP logic.
- **Repository:** only layer importing `packages/database`. Enforce `workspace_id` filter + `deleted_at: null` on all reads. No business logic. Never hard delete.

---

# Encrypted API Response (MANDATORY)

Raw JSON responses are FORBIDDEN.

```ts
type ApiResponse<T> = {
  success: boolean;
  code: string;
  message: string;
  data: T | null;
  meta: {
    timestamp: number;
    request_id?: string;
    pagination?: {
      total: number;
      page: number;
      limit: number;
      total_pages: number;
    };
  };
};
```

**Pagination:** all list endpoints MUST return `meta.pagination`. Default limit=20, max=100. No unbounded queries.

**Errors:** `success: false` + machine-readable `code` from `packages/types` + correct HTTP status.

```
400 validation - 401 unauthed - 403 forbidden - 404 not found
409 conflict - 422 business logic - 429 rate limit - 500 server error
```

NEVER return raw `Error` object, stack trace, or `200` for an error.

**Flow:** Build `ApiResponse<T>` -> AES encrypt -> return string. Frontend: receive -> decrypt in axios interceptor -> consume typed response.

---

# packages/ Rules

**packages/utils/** - `api-response.ts - formatting.ts - date.ts - string.ts - number.ts - pagination.ts - index.ts`
Pure TypeScript only. No DB, no framework code.

**packages/database/** - Drizzle ORM only.

```
schema/           -> one file per table e.g. users.ts, workspaces.ts
migrations/       -> generated migration SQL files (never edit manually)
drizzle.config.ts -> Drizzle Kit config
client.ts         -> db client singleton
seed.ts           -> dev/test seeding only
index.ts          -> re-exports client + schema + types
```

- Singleton client. Migrations generated via `drizzle-kit generate`, applied via `drizzle-kit migrate`.
- Schema changes require running `drizzle-kit generate` to produce migration files before applying.
- Only `apps/api` repositories may import this package.
- Every workspace-scoped table schema MUST define `workspace_id` and `deleted_at` columns.

**packages/types/** - shared contract for both apps.

```
api.ts - workspace.ts - user.ts - error-codes.ts - index.ts
```

- Types + constants only. No runtime logic. No DB imports.
- All error codes defined here as `const ErrorCode = { WORKSPACE_NOT_FOUND, FORBIDDEN, ... }`.
- Never duplicated across apps.

---

# Naming Conventions

- Variables -> `snake_case` - Functions -> `camelCase` - Components -> `PascalCase`
- Files/folders -> `kebab-case` - Props -> `camelCase`
- Test files -> `{name}.test.ts` in `__tests__/` - Error codes -> `SCREAMING_SNAKE_CASE`
- Drizzle schema files -> named after the table they define e.g. `users.ts`, `workspaces.ts`

---

# Security Rules

- No secrets in frontend except public key. No logging decrypted payloads.
- Passwords hashed with bcrypt (min cost 12). JWT includes `user_id` + `workspace_id`.
- Encryption key in root `.env`. Rate limiting per workspace + per IP.
- All input validated with TypeBox before service layer.

---

# Forbidden Actions (ZERO TOLERANCE)

- Create `src/` - access DB from `apps/app` - skip repository layer - return raw DB row or Error object
- Skip workspace validation - duplicate shared logic - mix business logic in controller
- Cross-workspace query - workspaces as array/JSON on users - skip `user_workspaces` check
- JWT without `workspace_id` - unbounded list query - hard delete workspace-scoped records
- Define error codes inline - return `200` for errors - skip MCP reads before writing code
- Run destructive DB commands via MCP without user confirmation
- Manually edit generated migration files - skip `drizzle-kit generate` before applying schema changes

---

# Clean Architecture

Each feature isolated in `modules/{feature}/`. No global feature dumping.

---

# SaaS Scalability

Unlimited workspaces - per-workspace isolation - per-workspace subscription - role-based access per workspace - horizontal scaling.

---

# Subscription & Plan Enforcement

Plan gates MUST live in **service layer** only. Controllers and repositories have no plan logic.

- Check plan limits before every write operation.
- `workspace_subscriptions` table tracks active plan per workspace.
- Plan names defined in `packages/types` only - never hardcoded.

---

# Audit Logging

Every mutation on workspace-scoped data MUST produce an audit log.

`audit_logs`: `{ id, workspace_id, user_id, action, entity, entity_id, before, after, created_at }`

- Written in **service layer** after successful repo calls. Append-only - never updated or deleted.
- `before`/`after` MUST NOT include passwords or secrets.
- `action` format: `"{entity}.{verb}"` e.g. `"invoice.deleted"`.

---

# API Versioning

All routes prefixed `/v1/{resource}`. Version prefix set at router level, never per-endpoint.

- Breaking changes -> new version (`/v2/`). Never mutate existing versioned routes.
- Deprecated routes stay functional for one full version cycle before removal.

---

# Rate Limiting

Applied globally as an ElysiaJS plugin.

- Authenticated: 300 req/min per workspace - Unauthenticated: 30 req/min per IP - Auth endpoints: 10 req/15min per IP.
- Redis-backed (in-memory for dev). Returns HTTP 429 + `ErrorCode.RATE_LIMIT_EXCEEDED`.
- Response headers required: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`.

---

# Environment Variables

Root `.env` (shared): `ENCRYPTION_KEY - DATABASE_URL - JWT_SECRET - JWT_EXPIRES_IN - REDIS_URL`
`apps/api` adds: `PORT - API_BASE_URL`
`apps/app` adds: `NEXT_PUBLIC_API_URL - NEXT_PUBLIC_APP_URL` (public vars only)

- Secrets in root `.env` only. `NEXT_PUBLIC_` for browser-safe vars only.
- All required vars validated at startup via `apps/api/config/`.
- `.env` and `.env.test` never committed. `.env.test` never contains production secrets.

---

# Unit Testing (Bun Test Runner)

Tests co-located in `modules/{feature}/__tests__/`. Mocks in `__tests__/mocks/`.

| Layer      | Type        | Cover                                     |
| ---------- | ----------- | ----------------------------------------- |
| Service    | Unit        | Logic, plan gates, error throwing         |
| Repository | Integration | Queries against test DB, workspace filter |
| Controller | Integration | Input validation, HTTP status codes       |
| Utils      | Unit        | Pure function correctness                 |

- Service tests MUST mock repository. Never hit real DB.
- Repository tests use `.env.test` DB, reset with `drizzle-kit migrate` against a clean test DB between runs.
- Every method: >=1 happy path test + >=1 error path test.
- Workspace isolation MUST be asserted: `workspace_id_A` queries cannot return `workspace_id_B` data.
- Test name format: `should {behaviour} when {condition}`.
- Coverage: service >=80% - utils >=90%. Zero coverage on service layer is forbidden.

---

# MCP Rules

Agent MUST use MCP to read real project context before writing any code. Guessing is forbidden.

**Required MCP servers:**

- `filesystem` - read/write project files. Read before every write. Read `packages/database/schema/` before any DB-related code. Check packages before creating types/utils.
- `postgres` - verify live table/column state before writing repository queries.
- `github` - check open branches/PRs before starting features. Branch per feature: `feature/{name}`. Never push to `main`/`dev`.
- `shell` - run `bun test`, `bun run typecheck`, `bun run lint`, `bun run build` after every change. Run `drizzle-kit generate` + `drizzle-kit migrate` after schema changes.

**Config:** `.mcp.json` at project root, committed to version control. Secrets via `.env` references only - never hardcoded.

**Mandatory agent order:**

```
1. filesystem -> read existing module + packages/database/schema/ + packages/types
2. postgres   -> confirm live table/column state
3. github     -> check open branches/PRs
4. write code
5. shell      -> bun test + typecheck + lint
6. shell      -> drizzle-kit generate + drizzle-kit migrate (if schema changed)
7. shell      -> bun run build
```

**MCP Security:**

- Filesystem scoped to project root only. No system-wide access.
- PostgreSQL uses limited DB user - never superuser.
- Shell MUST NOT run destructive commands (`DROP`, `rm -rf`) without explicit user confirmation.
- GitHub token: `repo` scope only. MCP servers for dev/CI only - never production.

---

# Final Principle

Enterprise SaaS - Multi-workspace - Encrypted REST - Strict-layered - MCP-connected - Monorepo

Agent must always align with: workspace isolation - layer separation - reusable packages - encryption-first API - paginated responses - typed error codes - soft deletes - audit logs - versioned routes - rate limiting - validated env vars - tested layers - MCP-verified context - no `src/` - no architectural violation.
