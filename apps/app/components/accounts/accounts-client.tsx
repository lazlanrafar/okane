"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getWallets, deleteWallet } from "@/actions/wallet.actions";
import {
  getWalletGroups,
  deleteWalletGroup,
} from "@/actions/wallet-group.actions";
import {
  WalletItem,
  WalletGroupHeader,
  Wallet,
  WalletGroup,
} from "@/components/shared/wallet-display";
import {
  Skeleton,
  Table,
  TableBody,
  Separator,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@workspace/ui";
import { Plus, Pencil } from "lucide-react";
import { toast } from "sonner";
import { WalletForm } from "@/components/setting/wallet/wallet-form";
import { WalletGroupForm } from "@/components/setting/wallet/wallet-group-form";

interface AccountsClientProps {
  dictionary: any;
  walletsDictionary: any; // Added to reuse WalletForm
}

export function AccountsClient({
  dictionary,
  walletsDictionary,
}: AccountsClientProps) {
  const queryClient = useQueryClient();

  // Dialog States
  const [isWalletDialogOpen, setIsWalletDialogOpen] = React.useState(false);
  const [editingWallet, setEditingWallet] = React.useState<Wallet | null>(null);
  const [deleteAlert, setDeleteAlert] = React.useState<{
    type: "wallet" | "group";
    id: string;
  } | null>(null);

  const { data: wallets, isLoading: isLoadingWallets } = useQuery({
    queryKey: ["wallets"],
    queryFn: async () => {
      const result = await getWallets();
      if (result.success) return result.data;
      throw new Error(result.error);
    },
  });

  const { data: groups, isLoading: isLoadingGroups } = useQuery({
    queryKey: ["wallet-groups"],
    queryFn: async () => {
      const result = await getWalletGroups();
      if (result.success) return result.data;
      throw new Error(result.error);
    },
  });

  const deleteWalletMutation = useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteWallet(id);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallets"] });
      toast.success(walletsDictionary.form.delete_success);
      setDeleteAlert(null);
    },
    onError: (error: any) => toast.error(error.message),
  });

  const assets = React.useMemo(
    () =>
      wallets
        ?.filter((w) => w.balance > 0)
        .reduce((acc, w) => acc + w.balance, 0) ?? 0,
    [wallets],
  );

  const liabilities = React.useMemo(
    () =>
      wallets
        ?.filter((w) => w.balance < 0)
        .reduce((acc, w) => acc + w.balance, 0) ?? 0,
    [wallets],
  );

  const total = assets + liabilities;

  const walletsByGroup = React.useMemo(() => {
    const map = new Map<string, Wallet[]>();
    groups?.forEach((g) => map.set(g.id, []));
    map.set("ungrouped", []);

    wallets?.forEach((w) => {
      const gId = w.groupId || "ungrouped";
      if (!map.has(gId)) map.set("ungrouped", []);
      map.get(gId)?.push(w);
    });
    return map;
  }, [wallets, groups]);

  const formatCurrency = (amount: number) => {
    return amount
      .toLocaleString("id-ID", { style: "currency", currency: "IDR" })
      .replace("Rp", "")
      .trim();
  };

  if (isLoadingWallets || isLoadingGroups) {
    return (
      <div className="space-y-8 p-4">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4">
        <div className="w-10" />
        <h1 className="text-xl font-semibold">{dictionary.title}</h1>
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setEditingWallet(null);
              setIsWalletDialogOpen(true);
            }}
          >
            <Plus className="size-6" />
          </Button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 text-center px-4 py-6 border-b border-t bg-muted/5">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">
            {dictionary.assets}
          </p>
          <p className="text-base font-bold text-blue-500">
            {formatCurrency(assets)}
          </p>
        </div>
        <div className="space-y-1 border-x">
          <p className="text-sm font-medium text-muted-foreground">
            {dictionary.liabilities}
          </p>
          <p className="text-base font-bold text-red-500">
            {formatCurrency(liabilities)}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">
            {dictionary.total}
          </p>
          <p className="text-base font-bold">{formatCurrency(total)}</p>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {groups?.map((group) => {
          const groupWallets = walletsByGroup.get(group.id) || [];
          if (groupWallets.length === 0) return null;

          return (
            <div key={group.id} className="last:pb-20">
              <WalletGroupHeader
                groupName={group.name}
                count={groupWallets.length}
                mode="manage"
                onEdit={() => {}} // Could add edit group here too
                onDelete={() => {}}
              />
              <Table>
                <TableBody>
                  {groupWallets.map((wallet) => (
                    <WalletItem
                      key={wallet.id}
                      wallet={wallet}
                      mode="manage"
                      onEdit={(w) => {
                        setEditingWallet(w);
                        setIsWalletDialogOpen(true);
                      }}
                      onDelete={(w) =>
                        setDeleteAlert({ type: "wallet", id: w.id })
                      }
                    />
                  ))}
                </TableBody>
              </Table>
            </div>
          );
        })}

        {(() => {
          const ungrouped = walletsByGroup.get("ungrouped") || [];
          if (ungrouped.length === 0) return null;
          return (
            <div className="last:pb-20">
              <WalletGroupHeader
                groupName="Ungrouped"
                count={ungrouped.length}
                mode="manage"
              />
              <Table>
                <TableBody>
                  {ungrouped.map((wallet) => (
                    <WalletItem
                      key={wallet.id}
                      wallet={wallet}
                      mode="manage"
                      onEdit={(w) => {
                        setEditingWallet(w);
                        setIsWalletDialogOpen(true);
                      }}
                      onDelete={(w) =>
                        setDeleteAlert({ type: "wallet", id: w.id })
                      }
                    />
                  ))}
                </TableBody>
              </Table>
            </div>
          );
        })()}

        {(!wallets || wallets.length === 0) && (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <p className="text-muted-foreground">{dictionary.empty}</p>
          </div>
        )}
      </div>

      <Dialog open={isWalletDialogOpen} onOpenChange={setIsWalletDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingWallet ? "Edit Wallet" : walletsDictionary.add_button}
            </DialogTitle>
            <DialogDescription>
              {walletsDictionary.description}
            </DialogDescription>
          </DialogHeader>
          <WalletForm
            wallet={editingWallet}
            onClose={() => setIsWalletDialogOpen(false)}
            dictionary={walletsDictionary}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deleteAlert}
        onOpenChange={(open) => !open && setDeleteAlert(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              {walletsDictionary.form.delete_confirm}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={() => {
                if (deleteAlert?.type === "wallet")
                  deleteWalletMutation.mutate(deleteAlert.id);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
