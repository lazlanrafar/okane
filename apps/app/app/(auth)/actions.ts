"use server";

import { createClient } from "@workspace/supabase/next-server";
import { db, users } from "@workspace/database";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

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
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  // Sync user to Drizzle database
  if (data.user) {
    try {
      await db.insert(users).values({
        id: data.user.id, // Use Supabase Auth ID
        email: data.user.email!,
        name: name,
        oauth_provider: "email",
      });
    } catch (db_error) {
      console.error("Failed to sync user to database:", db_error);
      // Optional: rollback auth user creation or just log error?
      // For now, logging error. In production, consider a more robust sync or queue.
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
      redirectTo: `${origin}/auth/callback`,
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
