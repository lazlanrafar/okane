import { Elysia } from "elysia";
import { createClient } from "@workspace/supabase/admin";
import { db, eq } from "@workspace/database";
import { users, user_workspaces } from "@workspace/database";
import * as jose from "jose";
import { Env } from "@workspace/constants";

const JWT_SECRET_KEY = () => new TextEncoder().encode(Env.JWT_SECRET!);

/**
 * Generate an app JWT with { user_id, workspace_id }.
 */
export type AuthContext = {
  auth: {
    user_id: string;
    workspace_id: string;
    email: string;
    system_role: import("@workspace/constants").SystemRole;
  } | null;
};

async function generateJwt(
  user_id: string,
  workspace_id: string,
  email: string,
  system_role: import("@workspace/constants").SystemRole = "user",
): Promise<string> {
  const expires_in = Env.JWT_EXPIRES_IN ?? "7d";
  const jwt = await new jose.SignJWT({
    user_id,
    workspace_id,
    email,
    system_role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expires_in)
    .sign(JWT_SECRET_KEY());

  return jwt;
}

/**
 * Verify and decode an app JWT.
 */
async function verifyJwt(token: string): Promise<{
  user_id: string;
  workspace_id: string;
  email?: string;
  system_role?: import("@workspace/constants").SystemRole;
} | null> {
  try {
    const { payload } = await jose.jwtVerify(token, JWT_SECRET_KEY());
    const user_id = payload.user_id as string;
    const workspace_id = payload.workspace_id as string;
    const email = payload.email as string;
    const system_role = payload.system_role as
      | import("@workspace/constants").SystemRole
      | undefined;

    if (!user_id) return null; // workspace_id can be empty string
    return { user_id, workspace_id, email, system_role };
  } catch {
    return null;
  }
}

/**
 * Auth plugin — provides derive context and guard macro.
 *
 * Hybrid approach:
 * 1. Try to verify as app JWT first (has user_id + workspace_id)
 * 2. If that fails, try Supabase token exchange (for initial login flow)
 */
export async function getAuth(token: string) {
  // Try app JWT first
  const jwt_payload = await verifyJwt(token);
  if (jwt_payload) {
    return jwt_payload;
  }

  // Fallback: try Supabase token
  try {
    const supabase = createClient();

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return null;
    }

    // Look up workspace membership
    const [membership] = await db
      .select()
      .from(user_workspaces)
      .where(eq(user_workspaces.user_id, user.id))
      .limit(1);

    // Look up user record for workspace_id and is_super_admin
    const [db_user] = await db
      .select({
        workspace_id: users.workspace_id,
        system_role: users.system_role,
      })
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1);

    const workspace_id = db_user?.workspace_id ?? membership?.workspace_id ?? null;

    return {
      user_id: user.id,
      workspace_id: workspace_id ?? "",
      email: user.email!,
      system_role: db_user?.system_role || user.app_metadata?.system_role || "user",
    } as const;
  } catch (e) {
    return null;
  }
}

export const authPlugin = new Elysia({ name: "auth" })
  .derive(async ({ headers, cookie }) => {
    // 1. Check Authorization header
    const authorization = headers.authorization;
    if (authorization) {
      const token = authorization.split(" ")[1];
      if (token) {
        const auth = await getAuth(token);
        if (auth) return { auth };
      }
    }

    // 2. Check explicitly provided cookie from Elysia
    if (cookie && cookie["oewang-session"]?.value) {
      const auth = await getAuth(cookie["oewang-session"].value as string);
      if (auth) return { auth };
    }

    // 3. Manually parse cookie header if needed (fallback)
    const cookieHeader = headers.cookie;
    if (cookieHeader) {
      const match = cookieHeader.match(/(?:^|;\s*)oewang-session=([^;]*)/);
      if (match && match[1]) {
        const auth = await getAuth(match[1]);
        if (auth) return { auth };
      }
    }

    return { auth: null };
  })
  .as("scoped");

export { generateJwt, verifyJwt };
