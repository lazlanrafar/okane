"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { Wallet } from "@workspace/types";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deleteWallet } from "@workspace/modules/wallet/wallet.action";
import { formatCurrency } from "@workspace/utils";

const CellActions = ({
  row,
  onEdit,
}: {
  row: { original: Wallet };
  onEdit: (wallet: Wallet) => void;
}) => {
  const wallet = row.original;
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this account?")) return;

    try {
      const result = await deleteWallet(wallet.id);
      if (result.success) {
        toast.success("Account deleted successfully");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to delete account");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onEdit(wallet)}>
          <Pencil className="mr-2 h-4 w-4" />
          <span>Edit Account</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleDelete} className="text-destructive">
          <Trash2 className="mr-2 h-4 w-4" />
          <span>Delete Account</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const accountColumns = (
  onEdit: (wallet: Wallet) => void,
): ColumnDef<Wallet>[] => [
  {
    accessorKey: "name",
    header: "Name",
    size: 200,
    minSize: 120,
    maxSize: 400,
    enableResizing: true,
    enableHiding: false,
    meta: {
      sticky: true,
      headerLabel: "Name",
      className:
        "w-[200px] min-w-[120px] md:sticky md:left-[var(--stick-left)] bg-background group-hover:bg-[#F2F1EF] group-hover:dark:bg-[#0f0f0f] z-10",
    },
    cell: ({ getValue }) => (
      <span className="truncate font-medium font-sans">
        {getValue<string>() || "N/A"}
      </span>
    ),
  },
  {
    accessorKey: "groupId",
    header: "Group",
    size: 150,
    minSize: 100,
    maxSize: 300,
    enableResizing: true,
    meta: {
      headerLabel: "Group",
      className: "w-[150px] min-w-[100px]",
    },
    cell: ({ getValue, table }) => {
      const groupId = getValue<string>();
      const groups = (table.options.meta as any)?.groups || [];
      const group = groups.find((g: any) => g.id === groupId);
      return (
        <span className="truncate text-muted-foreground font-sans">
          {group?.name || "No Group"}
        </span>
      );
    },
  },
  {
    accessorKey: "balance",
    header: "Balance",
    size: 150,
    minSize: 100,
    maxSize: 250,
    enableResizing: true,
    meta: {
      headerLabel: "Balance",
      className: "w-[150px] min-w-[100px] text-right",
    },
    cell: ({ getValue, table }) => {
      const balance = getValue<number>();
      const settings = (table.options.meta as any)?.settings;
      return (
        <span className="font-sans font-medium text-right block w-full text-sm">
          {formatCurrency(balance, settings)}
        </span>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    size: 160,
    minSize: 120,
    maxSize: 220,
    enableResizing: true,
    meta: {
      headerLabel: "Created At",
      className: "w-[160px] min-w-[120px]",
    },
    cell: ({ getValue }) => {
      const val = getValue<string>();
      if (!val) return "N/A";
      return (
        <span className="font-sans text-muted-foreground">
          {new Date(val).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </span>
      );
    },
  },
  {
    id: "actions",
    size: 90,
    enableHiding: false,
    meta: {
      headerLabel: "Actions",
    },
    cell: ({ row }) => <CellActions row={row} onEdit={onEdit} />,
  },
];
