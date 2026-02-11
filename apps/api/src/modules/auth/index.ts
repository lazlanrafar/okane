import { Elysia } from "elysia";
import { createClient } from "@workspace/supabase/admin";

export const authPlugin = new Elysia({ name: "auth" })
  .derive(async ({ headers }) => {
    const authorization = headers["authorization"];
    if (!authorization) {
      return { user: null };
    }

    const token = authorization.split(" ")[1];
    if (!token) {
      return { user: null };
    }

    const supabase = createClient();

    // Check if we need to set the session manually or if getUser uses the token
    // For supabase-js, we usually pass the token to getUser(token) or setSession

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return { user: null };
    }

    return { user };
  })
  .macro(({ onBeforeHandle }) => ({
    isSignIn() {
      onBeforeHandle(({ user, error }: { user: any; error: any }) => {
        if (!user) return error(401, "Unauthorized");
      });
    },
  }));
