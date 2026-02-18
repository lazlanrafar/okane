import { Elysia } from "elysia";
import { createClient } from "@workspace/supabase/admin";
import { db, eq } from "@workspace/database";
import { users, user_workspaces } from "@workspace/database";
import * as jose from "jose";

const JWT_SECRET_KEY = () => new TextEncoder().encode(process.env.JWT_SECRET!);

/**
 * Generate an app JWT with { user_id, workspace_id }.
 */
export type AuthContext = {
  auth: { user_id: string; workspace_id: string; email: string } | null;
};

async function generateJwt(
  user_id: string,
  workspace_id: string,
  email: string,
): Promise<string> {
  const expires_in = process.env.JWT_EXPIRES_IN ?? "7d";
  const jwt = await new jose.SignJWT({ user_id, workspace_id, email })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expires_in)
    .sign(JWT_SECRET_KEY());

  return jwt;
}

/**
 * Verify and decode an app JWT.
 */
async function verifyJwt(
  token: string,
): Promise<{ user_id: string; workspace_id: string; email?: string } | null> {
  try {
    const { payload } = await jose.jwtVerify(token, JWT_SECRET_KEY());
    const user_id = payload.user_id as string;
    const workspace_id = payload.workspace_id as string;
    const email = payload.email as string;

    if (!user_id) return null; // workspace_id can be empty string
    return { user_id, workspace_id, email };
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
export const authPlugin = new Elysia({ name: "auth" })
  .derive(async ({ headers }) => {
    const authorization = headers.authorization;
    if (!authorization) {
      return { auth: null };
    }

    const token = authorization.split(" ")[1];
    if (!token) {
      return { auth: null };
    }

    // Try app JWT first
    const jwt_payload = await verifyJwt(token);
    if (jwt_payload) {
      return { auth: jwt_payload };
    }

    // Fallback: try Supabase token
    try {
      const supabase = createClient();

      const {
        data: { user },
        error,
      } = await supabase.auth.getUser(token);

      if (error) {
        return { auth: null };
      }

      if (!user) {
        return { auth: null };
      }

      // Look up workspace membership
      const [membership] = await db
        .select()
        .from(user_workspaces)
        .where(eq(user_workspaces.user_id, user.id))
        .limit(1);

      // Look up user record for workspace_id
      const [db_user] = await db
        .select({ workspace_id: users.workspace_id })
        .from(users)
        .where(eq(users.id, user.id))
        .limit(1);

      const workspace_id =
        db_user?.workspace_id ?? membership?.workspace_id ?? null;

      return {
        auth: {
          user_id: user.id,
          workspace_id: workspace_id ?? "",
          email: user.email!,
        },
      };
    } catch (e) {
      return { auth: null };
    }
  })
  .as("scoped");

export { generateJwt, verifyJwt };
