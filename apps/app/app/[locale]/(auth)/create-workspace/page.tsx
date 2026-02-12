"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2 } from "lucide-react";
import { createBrowserClient } from "@workspace/supabase";
import { create_workspace } from "@/modules/workspaces/services";

export default function CreateWorkspacePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [is_loading, set_is_loading] = useState(false);
  const [error, set_error] = useState<string | null>(null);

  const handle_submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    set_is_loading(true);
    set_error(null);

    try {
      const supabase = createBrowserClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        set_error("You must be logged in.");
        set_is_loading(false);
        return;
      }

      await create_workspace({ name: name.trim() }, session.access_token);
      router.push("/dashboard");
    } catch (_err) {
      set_error("Something went wrong. Please try again.");
      set_is_loading(false);
    }
  };

  return (
    <div className="mx-auto flex w-full flex-col justify-center space-y-8 sm:w-[400px]">
      <div className="space-y-2 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-primary/10">
          <Building2 className="size-6 text-primary" />
        </div>
        <h1 className="font-medium text-3xl">Create your workspace</h1>
        <p className="text-muted-foreground text-sm">
          Set up your workspace to get started. You can invite team members
          later.
        </p>
      </div>

      <form onSubmit={handle_submit} className="space-y-4">
        <div className="space-y-2">
          <label
            htmlFor="workspace-name"
            className="font-medium text-sm leading-none"
          >
            Workspace name
          </label>
          <input
            id="workspace-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. My Company"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:font-medium file:text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            required
            autoFocus
            disabled={is_loading}
          />
        </div>

        {error && (
          <div className="rounded-md bg-destructive/10 px-3 py-2 text-destructive text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={is_loading || !name.trim()}
          className="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground text-sm ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
        >
          {is_loading ? "Creating..." : "Create Workspace"}
        </button>
      </form>
    </div>
  );
}
