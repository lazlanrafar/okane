import { createClient } from "@workspace/supabase/next-server";
import { NextResponse } from "next/server";
import { sync_user } from "@/modules/users/services";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        try {
          const sync_result = await sync_user({
            id: user.id,
            email: user.email!,
            name: user.user_metadata?.full_name || user.user_metadata?.name,
            oauth_provider: user.app_metadata?.provider,
            profile_picture:
              user.user_metadata?.avatar_url || user.user_metadata?.picture,
            providers: user.app_metadata?.providers,
          });

          // If user has no workspace, redirect to create-workspace
          if (sync_result?.has_workspace === false) {
            return NextResponse.redirect(`${origin}/create-workspace`);
          }
        } catch (e) {
          console.error("Failed to sync user on login callback:", e);
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=AuthCodeError`);
}
