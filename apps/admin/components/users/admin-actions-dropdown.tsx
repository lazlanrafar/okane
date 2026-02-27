"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Button,
} from "@workspace/ui";
import { MoreHorizontal, ShieldPlus, ShieldMinus } from "lucide-react";

import { revokeAdminAccess, promoteUserToAdmin } from "@workspace/modules";
import type { SystemAdminUser } from "@workspace/types";

export function AdminActionsDropdown({ user }: { user: SystemAdminUser }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handlePromote = () => {
    startTransition(async () => {
      const result = await promoteUserToAdmin(user.id);
      if (result.success) {
        toast.success(`${user.name || user.email} is now an Admin`);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  const handleRevoke = () => {
    startTransition(async () => {
      const result = await revokeAdminAccess(user.id);
      if (result.success) {
        toast.success(`Admin access revoked for ${user.name || user.email}`);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0" disabled={isPending}>
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {user.is_super_admin ? (
          <DropdownMenuItem
            onClick={handleRevoke}
            className="text-red-600 focus:text-red-700"
          >
            <ShieldMinus className="mr-2 h-4 w-4" />
            <span>Revoke Admin Access</span>
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem onClick={handlePromote}>
            <ShieldPlus className="mr-2 h-4 w-4" />
            <span>Promote to Admin</span>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
