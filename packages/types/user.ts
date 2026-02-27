export type User = {
  id: string;
  email: string;
  name: string | null;
  profile_picture: string | null;
  workspace_id: string | null;
};

export type UserWithWorkspaces = User & {
  workspaces: import("./workspace").WorkspaceWithRole[];
};

export type JwtPayload = {
  user_id: string;
  workspace_id: string;
};

export type SystemAdminUser = {
  id: string;
  email: string;
  name: string | null;
  profile_picture: string | null;
  created_at: Date | string;
  is_super_admin: boolean;
};
