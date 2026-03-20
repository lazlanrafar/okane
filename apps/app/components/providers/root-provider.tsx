"use client";

import type { ReactNode } from "react";
import { useState } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { WorkspaceProvider } from "./workspace-provider";

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <WorkspaceProvider>{children}</WorkspaceProvider>
    </QueryClientProvider>
  );
}
