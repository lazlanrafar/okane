"use server";

import { createClient } from "@workspace/supabase/next-server";
import { redirect } from "next/navigation";
import { headers, cookies } from "next/headers";
import { sync_user } from "../../../modules/users/services";
import { exchangeToken } from "../../../modules/workspaces/services";

export async function login(form_data: FormData) {
  const email = form_data.get("email") as string;
  const password = form_data.get("password") as string;

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  // Sync user and check workspace
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    try {
      const result = await sync_user({
        id: user.id,
        email: user.email ?? "",
        name: user.user_metadata?.full_name || user.user_metadata?.name,
        oauth_provider: "email",
        profile_picture:
          user.user_metadata?.avatar_url || user.user_metadata?.picture,
        providers: user.app_metadata?.providers,
      });

      if (result?.has_workspace === false) {
        redirect("/create-workspace");
      }

      // 3. Exchange for app JWT
      const { data: session_data } = await supabase.auth.getSession();
      if (session_data.session?.access_token) {
        const { token } = await exchangeToken(
          session_data.session.access_token,
        );
        (await cookies()).set("okane-session", token, {
          path: "/",
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 7, // 7 days
        });
      }
    } catch (_e) {
      console.error("Failed to sync user on login:", _e);
    }
  }

  redirect("/dashboard");
}

export async function signup(form_data: FormData) {
  const origin = (await headers()).get("origin");
  const email = form_data.get("email") as string;
  const password = form_data.get("password") as string;
  const name = form_data.get("name") as string | undefined;

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
      },
      emailRedirectTo: `${origin}/api/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  // Sync user to Drizzle database via API
  if (data.user) {
    try {
      const result = await sync_user({
        id: data.user.id,
        email: data.user.email ?? "",
        name: name,
        oauth_provider: "email",
      });

      if (result?.has_workspace === false) {
        redirect("/create-workspace");
      }

      // 3. Exchange for app JWT
      const { data: session_data } = await supabase.auth.getSession();
      if (session_data.session?.access_token) {
        const { token } = await exchangeToken(
          session_data.session.access_token,
        );
        (await cookies()).set("okane-session", token, {
          path: "/",
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 7, // 7 days
        });
      }
    } catch (api_error) {
      console.error("Failed to sync user to database via API:", api_error);
    }
  }

  redirect("/dashboard");
}

export async function loginWithOAuth(provider: "google" | "github") {
  const origin = (await headers()).get("origin");
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${origin}/api/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (data.url) {
    redirect(data.url);
  }
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
