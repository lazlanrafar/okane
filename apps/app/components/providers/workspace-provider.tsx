"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getTransactionSettings } from "@workspace/modules/setting/setting.action";
import { getActiveWorkspace } from "@workspace/modules/workspace/workspace.action";
import { getMe } from "@workspace/modules/user/user.action";
import { useWorkspaceStore } from "@/stores/workspace-store";

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const setUser = useWorkspaceStore((state) => state.setUser);
  const setWorkspace = useWorkspaceStore((state) => state.setWorkspace);
  const setSettings = useWorkspaceStore((state) => state.setSettings);
  const setIsLoading = useWorkspaceStore((state) => state.setIsLoading);

  const { data: userData, isLoading: isUserLoading } = useQuery({
    queryKey: ["user", "me"],
    queryFn: async () => {
      const result = await getMe();
      if (result.success) return result.data;
      return null;
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  const { data: workspaceData, isLoading: isWorkspaceLoading } = useQuery({
    queryKey: ["workspace", "active"],
    queryFn: async () => {
      const result = await getActiveWorkspace();
      if (result.success) return result.data;
      return null;
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  const { data: settingsData, isLoading: isSettingsLoading } = useQuery({
    queryKey: ["settings", "transaction"],
    queryFn: async () => {
      const result = await getTransactionSettings();
      if (result.success) return result.data;
      return null;
    },
    staleTime: 1000 * 60 * 60, // 1 hour
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (userData) setUser(userData.user);
    if (workspaceData) setWorkspace(workspaceData);
    if (settingsData) setSettings(settingsData);
    
    setIsLoading(isUserLoading || isWorkspaceLoading || isSettingsLoading);
  }, [
    userData, 
    workspaceData, 
    settingsData, 
    isUserLoading, 
    isWorkspaceLoading, 
    isSettingsLoading, 
    setUser, 
    setWorkspace, 
    setSettings, 
    setIsLoading
  ]);

  return <>{children}</>;
}
