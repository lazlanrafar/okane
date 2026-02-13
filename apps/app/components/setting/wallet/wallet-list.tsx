"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverEvent,
  defaultDropAnimationSideEffects,
  DragOverlay,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@workspace/ui";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Skeleton,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@workspace/ui";
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  GripVertical,
  Settings2,
} from "lucide-react";
import {
  getWallets,
  deleteWallet,
  reorderWallets,
  Wallet,
} from "@/actions/wallet.actions";
import {
  getWalletGroups,
  deleteWalletGroup,
  reorderWalletGroups,
  WalletGroup,
} from "@/actions/wallet-group.actions";
import { WalletForm } from "./wallet-form";
import { WalletGroupForm } from "./wallet-group-form";

interface WalletListProps {
  dictionary: any;
}

// --- Sortable Wallet Row ---

interface SortableWalletRowProps {
  wallet: Wallet;
  onEdit: (wallet: Wallet) => void;
  onDelete: (wallet: Wallet) => void;
}

function SortableWalletRow({
  wallet,
  onEdit,
  onDelete,
}: SortableWalletRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: wallet.id, data: { type: "wallet", wallet } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
    position: isDragging ? "relative" : undefined,
  } as React.CSSProperties;

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      className={isDragging ? "bg-muted/50 opacity-50" : ""}
    >
      <TableCell className="font-medium">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="cursor-move h-8 w-8 -ml-2"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </Button>
          <span>{wallet.name}</span>
        </div>
      </TableCell>
      <TableCell className="text-right">
        {wallet.balance.toLocaleString()}
      </TableCell>
      <TableCell className="text-right w-[100px]">
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(wallet)}
            className="h-8 w-8"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive hover:text-destructive/90 h-8 w-8"
            onClick={() => onDelete(wallet)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

// --- Group Component ---
// For now, simpler implementation: Just render group header and wallets.
// We won't implement group sorting yet to reduce complexity, just wallet sorting.

export function WalletList({ dictionary }: WalletListProps) {
  const queryClient = useQueryClient();
  const [activeId, setActiveId] = React.useState<string | null>(null);

  // Dialog States
  const [isWalletDialogOpen, setIsWalletDialogOpen] = React.useState(false);
  const [editingWallet, setEditingWallet] = React.useState<Wallet | null>(null);

  const [isGroupDialogOpen, setIsGroupDialogOpen] = React.useState(false);
  const [editingGroup, setEditingGroup] = React.useState<WalletGroup | null>(
    null,
  );

  const [deleteAlert, setDeleteAlert] = React.useState<{
    type: "wallet" | "group";
    id: string;
  } | null>(null);

  // Queries
  const { data: serverGroups, isLoading: isLoadingGroups } = useQuery({
    queryKey: ["wallet-groups"],
    queryFn: getWalletGroups,
  });

  const { data: serverWallets, isLoading: isLoadingWallets } = useQuery({
    queryKey: ["wallets"],
    queryFn: getWallets,
  });

  // Local state for DnD
  const [groups, setGroups] = React.useState<WalletGroup[]>([]);
  const [wallets, setWallets] = React.useState<Wallet[]>([]);

  React.useEffect(() => {
    if (serverGroups && Array.isArray(serverGroups)) {
      setGroups(serverGroups);
    }
  }, [serverGroups]);

  React.useEffect(() => {
    if (serverWallets && Array.isArray(serverWallets)) {
      setWallets(serverWallets);
    }
  }, [serverWallets]);

  // Mutations
  const deleteWalletMutation = useMutation({
    mutationFn: deleteWallet,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallets"] });
      toast.success(dictionary.form.delete_success);
      setDeleteAlert(null);
    },
  });

  const deleteGroupMutation = useMutation({
    mutationFn: deleteWalletGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallet-groups"] });
      toast.success("Group deleted successfully"); // Use dict if available
      setDeleteAlert(null);
    },
  });

  const reorderWalletMutation = useMutation({
    mutationFn: reorderWallets,
    onMutate: async (updates) => {
      // Optimistic handled in dragEnd, this is just server sync
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallets"] });
    },
  });

  // DnD Sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    // Check if dragging wallet
    const activeWallet = wallets.find((w) => w.id === active.id);
    if (activeWallet) {
      if (active.id !== over.id) {
        setWallets((items) => {
          const oldIndex = items.findIndex((item) => item.id === active.id);
          const newIndex = items.findIndex((item) => item.id === over.id);
          const newItems = arrayMove(items, oldIndex, newIndex);

          // Check if group changed (if we support dragging to empty group, logic is harder)
          // For now assume flat sorting visually but grouped in UI.
          // Wait, if I render them in separate SortableContexts (one per group),
          // I need to handle group change.
          return newItems;
        });

        // Helper to get sort updates.
        // If we moved cross-group, we need to update groupId.
        // But here we rely on single-list strategy or need more complex logic.
      }
    }
  };

  // To keep it simple: We will perform reordering only WITHIN the same group for now.
  // Or: We use one big SortableContext but render headers in between.
  // But headers aren't sortable.
  // Better: Render each group as a SortableContext.

  // Categorize wallets by group
  const walletsByGroup = React.useMemo(() => {
    const map = new Map<string, Wallet[]>();
    // Initialize groups
    groups.forEach((g) => map.set(g.id, []));
    map.set("ungrouped", []);

    wallets.forEach((w) => {
      const gId = w.groupId || "ungrouped";
      if (!map.has(gId)) map.set("ungrouped", []); // Fallback
      map.get(gId)?.push(w);
    });
    return map;
  }, [wallets, groups]);

  if (isLoadingGroups || isLoadingWallets) {
    return <Skeleton className="h-64 w-full" />;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">{dictionary.title}</h3>
          <p className="text-sm text-muted-foreground">
            {dictionary.description}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setEditingGroup(null);
              setIsGroupDialogOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            {dictionary.add_group_button}
          </Button>
          <Button
            size="sm"
            onClick={() => {
              setEditingWallet(null);
              setIsWalletDialogOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            {dictionary.add_button}
          </Button>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {/* Render Groups */}
        {groups.map((group) => {
          const groupWallets = walletsByGroup.get(group.id) || [];
          // Hide empty groups to declutter the UI as requested by user
          if (groupWallets.length === 0) return null;

          return (
            <div
              key={group.id}
              className="border rounded-md mb-4 bg-background"
            >
              <div className="flex items-center justify-between p-4 border-b bg-muted/20">
                <h4 className="font-medium text-sm text-muted-foreground flex items-center gap-2">
                  {group.name}
                  <span className="text-xs bg-muted px-2 py-0.5 rounded-full">
                    {groupWallets.length}
                  </span>
                </h4>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => {
                      setEditingGroup(group);
                      setIsGroupDialogOpen(true);
                    }}
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-destructive"
                    onClick={() =>
                      setDeleteAlert({ type: "group", id: group.id })
                    }
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <Table>
                <SortableContext
                  items={groupWallets}
                  strategy={verticalListSortingStrategy}
                >
                  <TableBody>
                    {groupWallets.map((wallet) => (
                      <SortableWalletRow
                        key={wallet.id}
                        wallet={wallet}
                        onEdit={(w) => {
                          setEditingWallet(w);
                          setIsWalletDialogOpen(true);
                        }}
                        onDelete={(w) =>
                          setDeleteAlert({ type: "wallet", id: w.id })
                        }
                      />
                    ))}
                    {groupWallets.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          className="text-center text-sm text-muted-foreground h-16"
                        >
                          No wallets in this group
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </SortableContext>
              </Table>
            </div>
          );
        })}

        {/* Render Ungrouped */}
        {(() => {
          const ungrouped = walletsByGroup.get("ungrouped") || [];
          if (ungrouped.length === 0) return null;
          return (
            <div className="border rounded-md mb-4 bg-background">
              <div className="flex items-center justify-between p-4 border-b bg-muted/20">
                <h4 className="font-medium text-sm text-muted-foreground">
                  Ungrouped
                </h4>
              </div>
              <Table>
                <SortableContext
                  items={ungrouped}
                  strategy={verticalListSortingStrategy}
                >
                  <TableBody>
                    {ungrouped.map((wallet) => (
                      <SortableWalletRow
                        key={wallet.id}
                        wallet={wallet}
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
                </SortableContext>
              </Table>
            </div>
          );
        })()}
      </DndContext>

      {/* Dialogs */}
      <Dialog open={isWalletDialogOpen} onOpenChange={setIsWalletDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingWallet ? "Edit Wallet" : dictionary.add_button}
            </DialogTitle>
            <DialogDescription>{dictionary.description}</DialogDescription>
          </DialogHeader>
          <WalletForm
            wallet={editingWallet}
            onClose={() => setIsWalletDialogOpen(false)}
            dictionary={dictionary}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isGroupDialogOpen} onOpenChange={setIsGroupDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingGroup ? dictionary.groups.edit : dictionary.groups.add}
            </DialogTitle>
          </DialogHeader>
          <WalletGroupForm
            group={editingGroup}
            onClose={() => setIsGroupDialogOpen(false)}
            dictionary={dictionary}
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
              {deleteAlert?.type === "group"
                ? dictionary.groups.delete_confirm
                : dictionary.form.delete_confirm}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={() => {
                if (deleteAlert?.type === "wallet")
                  deleteWalletMutation.mutate(deleteAlert.id);
                else if (deleteAlert?.type === "group")
                  deleteGroupMutation.mutate(deleteAlert.id);
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
