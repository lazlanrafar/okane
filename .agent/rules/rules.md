---
trigger: always_on
---

# 🚨 AI AGENT ENFORCED ARCHITECTURE RULES

## Multi-Tenant SaaS – Turborepo – Encrypted REST

This document is the **single source of truth**.

The AI agent MUST follow this architecture strictly.

No deviation allowed.

---

# 1️⃣ System Overview

This project is a **Multi-Tenant SaaS Monorepo** using:

- Turborepo
- Bun
- Next.js (apps/app)
- ElysiaJS (apps/api)
- PostgreSQL
- Shared packages

Strict flow:

```
apps/app (UI)
        ↓ Encrypted REST
apps/api (Business + Multi-Tenant Logic)
        ↓
Database
```

---

# 2️⃣ Monorepo Structure (NO `src/` ALLOWED)

```
/
├── apps/
│   ├── app/
│   │   ├── app/
│   │   ├── components/
│   │   ├── modules/
│   │   ├── lib/
│   │   └── middleware.ts
│   │
│   └── api/
│       ├── modules/
│       │   └── {feature}/
│       │       ├── feature.controller.ts
│       │       ├── feature.service.ts
│       │       ├── feature.repository.ts
│       │       └── feature.model.ts
│       │
│       ├── plugins/
│       ├── config/
│       └── index.ts
│
├── packages/
│   ├── utils/
│   ├── email/
│   ├── logger/
│   ├── database/
│   ├── types/
│   └── ui/
│
├── .env
└── turbo.json
```

🚫 `src/` folder is NOT allowed anywhere.

---

# 3️⃣ Multi-Tenant SaaS Rules (CRITICAL)

This system is tenant-isolated.

## Every tenant-scoped table MUST contain:

```
tenant_id
```

## Backend MUST enforce tenant isolation:

- Tenant extracted from:
  - subdomain
  - header
  - JWT

- Repository queries MUST filter by `tenant_id`
- No global queries without tenant filter
- No cross-tenant joins

Example:

```ts
where: {
  tenant_id,
  user_id,
}
```

---

## Forbidden:

- Hardcoded tenant IDs
- Super-admin bypass without role check
- Returning data without tenant validation

---

# 4️⃣ apps/app Rules (Frontend)

## Responsibility

- UI only
- REST consumer only
- No database access
- No business logic duplication

Strict rule:

```
apps/app CANNOT access database
apps/app CANNOT import packages/database
```

---

## Structure

```
components/
modules/
lib/
```

---

## Components

- Must live inside `/components`
- No `_components` folder inside routes
- UI-only
- No API calls inside client components
- Data must come from server components or modules

Example:

```
components/auth/login-form.tsx
```

---

## Modules

Modules are REST wrappers ONLY.

Example:

```
modules/auth/auth.action.ts
modules/auth/auth.types.ts
```

Rules:

- Only HTTP calls
- No business logic
- No DB imports
- No Supabase queries

---

# 5️⃣ apps/api Rules (Backend)

apps/api is the ONLY layer allowed to:

- Access database
- Contain business logic
- Handle tenant validation

---

## Layered Architecture

```
Controller → Service → Repository → Database
```

---

## Controller

- Defines routes
- Validates input
- Calls service
- Encrypts response
- No DB logic

---

## Service

- Contains business logic
- Handles tenant validation
- Calls repository
- No HTTP logic

---

## Repository

- Only layer allowed to import database
- Must enforce tenant filter
- No business logic

---

# 6️⃣ 🔐 Encrypted API Response (MANDATORY)

All responses must be encrypted before leaving backend.

Raw JSON is NOT allowed.

---

## Standard API Response Format (Before Encryption)

```ts
type ApiResponse<T> = {
  success: boolean;
  code: string;
  message: string;
  data: T | null;
  meta: {
    timestamp: number;
    request_id?: string;
  };
};
```

---

## Backend Flow

```
1. Build ApiResponse<T>
2. Encrypt using AES
3. Return encrypted string
```

---

## Frontend Flow

```
1. Receive encrypted string
2. Decrypt in axios interceptor
3. Consume typed ApiResponse<T>
```

---

# 7️⃣ packages/utils (Mandatory Structure)

```
packages/utils/
├── api-response.ts
├── formatting.ts
├── date.ts
├── string.ts
├── number.ts
├── index.ts
```

---

## utils Rules

- No database logic
- No framework-specific code
- Pure TypeScript only
- Cross-platform compatible

---

# 8️⃣ Naming Conventions (STRICT)

## Variables → snake_case

## Functions → camelCase

## Components → PascalCase

## Files & folders → kebab-case

## Props → camelCase

---

# 9️⃣ Security Rules

- No secrets in frontend except public key
- No logging decrypted sensitive payload
- Password must be hashed
- JWT must include tenant_id
- Encryption key stored in root `.env`

---

# 🔟 Forbidden Actions (ZERO TOLERANCE)

The AI agent must NEVER:

- Create `src/`
- Access DB from apps/app
- Skip repository layer
- Return raw DB row
- Skip tenant validation
- Duplicate shared logic instead of using packages
- Mix business logic inside controller
- Create cross-tenant query

---

# 1️⃣1️⃣ Clean Architecture Principle

Each feature must be isolated:

```
modules/{feature}/
```

No global feature dumping.

---

# 1️⃣2️⃣ SaaS Scalability Standard

System must support:

- Unlimited tenants
- Per-tenant isolation
- Per-tenant subscription
- Role-based access per tenant
- Horizontal scaling

Design must assume production SaaS environment.

---

# ✅ Final Principle

This is an:

- Enterprise SaaS
- Multi-tenant
- Encrypted REST
- Strict-layered
- Monorepo architecture

The AI agent must always generate code aligned with:

- Tenant isolation
- Layer separation
- Reusable packages
- Encryption-first API
- No src folder
- No architectural violation
