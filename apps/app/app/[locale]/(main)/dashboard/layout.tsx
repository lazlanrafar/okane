import type { ReactNode } from "react";

import { cookies } from "next/headers";

import { AppSidebar } from "@/app/[locale]/(main)/dashboard/_components/sidebar/app-sidebar";
import { Separator } from "@workspace/ui";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@workspace/ui";
import {
  SIDEBAR_COLLAPSIBLE_VALUES,
  SIDEBAR_VARIANT_VALUES,
} from "@/lib/preferences/layout";
import { cn } from "@workspace/ui";
import { getPreference } from "@/server/server-actions";
import { createClient } from "@workspace/supabase/server";
import { get_me } from "@/modules/workspaces/services";

import { AccountSwitcher } from "./_components/sidebar/account-switcher";
import { LayoutControls } from "./_components/sidebar/layout-controls";
import { SearchDialog } from "./_components/sidebar/search-dialog";
import { ThemeSwitcher } from "./_components/sidebar/theme-switcher";

async function get_user_and_workspaces() {
  try {
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      return null;
    }

    return await get_me(session.access_token);
  } catch {
    return null;
  }
}

export default async function Layout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const cookie_store = await cookies();
  const default_open = cookie_store.get("sidebar_state")?.value !== "false";
  const [variant, collapsible, me_data] = await Promise.all([
    getPreference("sidebar_variant", SIDEBAR_VARIANT_VALUES, "inset"),
    getPreference("sidebar_collapsible", SIDEBAR_COLLAPSIBLE_VALUES, "icon"),
    get_user_and_workspaces(),
  ]);

  const current_user = me_data?.user ?? null;
  const user_workspaces = me_data?.workspaces ?? [];

  return (
    <SidebarProvider defaultOpen={default_open}>
      <AppSidebar
        variant={variant}
        collapsible={collapsible}
        currentUser={current_user}
        workspaces={user_workspaces}
      />
      <SidebarInset
        className={cn(
          "[html[data-content-layout=centered]_&]:mx-auto! [html[data-content-layout=centered]_&]:max-w-screen-2xl!",
          "max-[113rem]:peer-data-[variant=inset]:mr-2! min-[101rem]:peer-data-[variant=inset]:peer-data-[state=collapsed]:mr-auto!",
        )}
      >
        <header
          className={cn(
            "flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12",
            "sticky top-0 z-50 overflow-hidden rounded-t-[inherit] bg-background/50 backdrop-blur-md",
          )}
        >
          <div className="flex w-full items-center justify-between px-4 lg:px-6">
            <div className="flex items-center gap-1 lg:gap-2">
              <SidebarTrigger className="-ml-1" />
              <Separator
                orientation="vertical"
                className="mx-2 data-[orientation=vertical]:h-4"
              />
              <SearchDialog />
            </div>
            <div className="flex items-center gap-2">
              <LayoutControls />
              <ThemeSwitcher />
              {current_user && (
                <AccountSwitcher
                  user={{
                    id: current_user.id,
                    name: current_user.name || current_user.email,
                    email: current_user.email,
                    avatar: current_user.profile_picture || "",
                  }}
                />
              )}
            </div>
          </div>
        </header>
        <div className="h-full p-4 md:p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
