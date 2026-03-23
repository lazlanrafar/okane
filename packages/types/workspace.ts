import type { Pricing } from "./pricing";

export type WorkspaceRole = "owner" | "admin" | "member";

export type Workspace = {
  id: string;
  name: string;
  slug: string;
  country?: string | null;
  plan_id?: string | null;
  plan_status: string;
  stripe_customer_id?: string | null;
  stripe_subscription_id?: string | null;
  stripe_current_period_end?: string | null;
  ai_tokens_used: number;
  vault_size_used_bytes: number;
  plan?: Pricing | null;
  created_at: string;
  updated_at: string;
};

export type WorkspaceMembership = {
  id: string;
  workspace_id: string;
  user_id: string;
  role: WorkspaceRole;
  joined_at: string;
};

export type WorkspaceWithRole = Workspace & {
  role: WorkspaceRole;
  plan_name?: string | null;
  max_workspaces?: number | null;
};

