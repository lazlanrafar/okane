# ElysiaJS Best Practices

Based on [ElysiaJS Documentation](https://elysiajs.com/essential/best-practice.html).

## 1. Feature-Based Directory Structure

Organize code by feature rather than by technical layer (controllers, models, services).

```
src/
  modules/
    auth/
      index.ts       # Controller (Elysia instance)
      service.ts     # Business logic
      model.ts       # Data structure & validation
      test/          # Unit tests for this module
    user/
      index.ts
      service.ts
      model.ts
```

## 2. Controllers

- **1 Elysia Instance = 1 Controller**.
- Treat an Elysia instance as a controller.
- Define routes directly on the instance.
- **DO NOT** pass the entire `Context` to a controller class.
- **DO NOT** couple strictly with `Context` types if possible; let Elysia infer them.

## 3. Services

Separate business logic from the controller (HTTP layer).

### Non-Request Dependent

Use **Abstract Classes** with **Static Methods**. This avoids class instantiation overhead.

```typescript
// service.ts
export abstract class AuthService {
  static async signIn(payload: SignInDTO) {
    // database logic
  }
}
```

### Request Dependent

If the service needs access to `Context` (cookies, headers, etc.), implement it as an **Elysia Plugin**.

```typescript
// service.ts
export const authService = new Elysia({ name: 'Service.Auth' })
  .derive(...)
  .macro(...)
```

## 4. Models (Validation & Types)

- Use **Elysia's `t`** system for a single source of truth.
- **DO NOT** create separate TypeScript interfaces. Infer types from the schema.
- **DO NOT** use class instances as models.

```typescript
// model.ts
import { t } from "elysia";

export const SignInBody = t.Object({
  username: t.String(),
  password: t.String(),
});

export type SignInBody = typeof SignInBody.static;
```

## 5. Testing

- Use **`bun:test`** or **Jest**.
- Use **`app.handle(request)`** to simulated HTTP requests.
- Use **Eden Treaty** for End-to-End type-safe testing.

```typescript
// test/index.test.ts
import { describe, expect, it } from "bun:test";
import { app } from "../src";

describe("Elysia", () => {
  it("returns a response", async () => {
    const response = await app
      .handle(new Request("http://localhost/"))
      .then((res) => res.text());
    expect(response).toBe("hi");
  });
});
```
