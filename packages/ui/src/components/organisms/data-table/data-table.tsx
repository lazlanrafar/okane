"use client";

import { useInfiniteScroll } from "../../../hooks/use-infinite-scroll";
import { useScrollHeader } from "../../../hooks/use-scroll-header";
import { useSortParams } from "../../../hooks/use-sort-params";
import { useStickyColumns } from "../../../hooks/use-sticky-columns";
import { useTableDnd } from "../../../hooks/use-table-dnd";
import { useTableScroll } from "../../../hooks/use-table-scroll";
import { useTableSettings } from "../../../hooks/use-table-settings";

import { VirtualRow } from "./data-table-virtual-row";
import { TableId, type TableSettings } from "./data-table-settings";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import type {
  Column,
  ColumnDef,
  RowSelectionState,
} from "@tanstack/react-table";
import { type VirtualItem, useVirtualizer } from "@tanstack/react-virtual";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DataTableHeader } from "./data-table-header";
import { Table, TableBody, Tooltip, TooltipProvider } from "../../atoms";

// Stable reference for non-clickable columns (avoids recreation on each render)
const DEFAULT_NON_CLICKABLE_COLUMNS = new Set(["select", "actions"]);

type StickyConfig = {
  /** Column IDs that should be sticky. Order matters — they stack left-to-right. */
  columns: string[];
  /** How many leading columns to skip when computing scroll offsets (e.g. 3 for select + date + desc). */
  startFromColumn?: number;
};

type InfiniteScrollConfig = {
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
  /** How many px from the bottom triggers the next page fetch. Default: 50 */
  threshold?: number;
};

type DataTableMeta<TData> = {
  /** Called when a clickable cell row is clicked */
  onRowClick?: (row: TData) => void;
  /** Called when copy URL is triggered */
  onCopyUrl?: (id: string) => void;
};

type Props<TData extends { id: string | number }> = {
  data: TData[];

  columns: ColumnDef<TData>[];
  setColumns: (columns: Column<any, unknown>[]) => void;

  tableId: TableId;
  initialSettings?: Partial<TableSettings>;
  /** Columns that should not trigger row-click. Defaults to ["select", "actions"]. */
  nonClickableColumns?: Set<string>;
  /** Configure sticky columns. If omitted, no columns are sticky. */
  sticky?: StickyConfig;
  /** If provided, enables infinite scroll behaviour. */
  infiniteScroll?: InfiniteScrollConfig;
  /** Additional meta passed through to cell renderers via `table.options.meta`. */
  meta?: DataTableMeta<TData>;
  /** Height of each row in pixels. Default: 45 */
  rowHeight?: number;
  /** Number of rows rendered outside the visible viewport. Default: 10 */
  overscan?: number;
  /** Viewport height CSS value. Default: "calc(100vh - 180px)" */
  containerHeight?: string;
  /** Message shown when data is empty. Default: "No results" */
  emptyMessage?: string;
};

export function DataTable<TData extends { id: string | number }>({
  data,
  columns,
  setColumns,
  tableId,
  initialSettings,
  nonClickableColumns = DEFAULT_NON_CLICKABLE_COLUMNS,
  sticky,
  infiniteScroll,
  meta,
  rowHeight = 45,
  overscan = 10,
  containerHeight = "calc(100vh - 180px + var(--header-offset, 0px))",
  emptyMessage = "No results",
}: Props<TData>) {
  const parentRef = useRef<HTMLDivElement>(null);

  useScrollHeader(parentRef);

  const {
    columnVisibility,
    setColumnVisibility,
    columnSizing,
    setColumnSizing,
    columnOrder,
    setColumnOrder,
  } = useTableSettings({ tableId, initialSettings });

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  // Stable meta callbacks
  const handleShiftClickRangeRef = useRef<
    (startIndex: number, endIndex: number) => void
  >(() => {});

  const handleShiftClickRange = useCallback(
    (startIndex: number, endIndex: number) =>
      handleShiftClickRangeRef.current(startIndex, endIndex),
    [],
  );

  const tableMeta = useMemo(
    () => ({
      onRowClick: meta?.onRowClick,
      onCopyUrl: meta?.onCopyUrl,
      handleShiftClickRange,
    }),
    [meta?.onRowClick, meta?.onCopyUrl, handleShiftClickRange],
  );

  const table = useReactTable({
    getRowId: (row) => String(row.id),
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onRowSelectionChange: setRowSelection,
    enableColumnResizing: true,
    columnResizeMode: "onChange",
    onColumnVisibilityChange: setColumnVisibility,
    onColumnSizingChange: setColumnSizing,
    onColumnOrderChange: setColumnOrder,
    state: { rowSelection, columnVisibility, columnSizing, columnOrder },
    meta: tableMeta,
  });

  const { sensors, handleDragEnd } = useTableDnd(table);

  // Update shift-click handler after table is created
  handleShiftClickRangeRef.current = useCallback(
    (startIndex: number, endIndex: number) => {
      const rows = table.getRowModel().rows;
      const start = Math.min(startIndex, endIndex);
      const end = Math.max(startIndex, endIndex);

      const allSelected = Array.from({ length: end - start + 1 }, (_, i) => {
        const row = rows[start + i];
        return row ? rowSelection[row.id] : true;
      }).every(Boolean);

      setRowSelection((prev) => {
        const next = { ...prev };
        for (let i = start; i <= end; i++) {
          const row = rows[i];
          if (!row) continue;
          if (allSelected) delete next[row.id];
          else next[row.id] = true;
        }
        return next;
      });
    },
    [table, rowSelection],
  );

  const { getStickyStyle, getStickyClassName } = useStickyColumns({
    columnVisibility,
    table,
    stickyColumns: sticky?.columns,
    tableId,
  });

  const tableScroll = useTableScroll({
    useColumnWidths: !!sticky,
    startFromColumn: sticky?.startFromColumn ?? 0,
  });

  const rows = table.getRowModel().rows;

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight,
    overscan,
  });

  useInfiniteScroll<HTMLDivElement>({
    scrollRef: parentRef,
    rowVirtualizer,
    rowCount: rows.length,
    hasNextPage: infiniteScroll?.hasNextPage ?? false,
    isFetchingNextPage: infiniteScroll?.isFetchingNextPage ?? false,
    fetchNextPage: infiniteScroll?.fetchNextPage ?? (() => {}),
    threshold: infiniteScroll?.threshold ?? 50,
  });

  useEffect(() => {
    setColumns(table.getAllLeafColumns());
  }, [columnVisibility, setColumns, table]);

  const handleCellClick = useCallback(
    (rowId: string) => {
      const row = data.find((d) => String(d.id) === rowId);
      if (row) meta?.onRowClick?.(row);
    },
    [data, meta],
  );

  if (!data.length) {
    return (
      <div className="relative h-[calc(100vh-200px)] overflow-hidden flex items-center justify-center">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  const virtualItems = rowVirtualizer.getVirtualItems();

  return (
    <div className="relative">
      <TooltipProvider delayDuration={20}>
        <Tooltip>
          <div className="w-full">
            <div
              ref={(el) => {
                (
                  parentRef as React.MutableRefObject<HTMLDivElement | null>
                ).current = el;
                (
                  tableScroll.containerRef as React.MutableRefObject<HTMLDivElement | null>
                ).current = el;
              }}
              className="overflow-auto overscroll-none border-l border-r border-b border-border scrollbar-hide"
              style={{ height: containerHeight }}
            >
              <DndContext
                id={`${tableId}-table-dnd`}
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <Table className="w-full min-w-full">
                  <DataTableHeader
                    table={table}
                    tableScroll={tableScroll}
                    tableId={tableId}
                  />

                  <TableBody
                    className="border-l-0 border-r-0 block"
                    style={{
                      height: `${rowVirtualizer.getTotalSize()}px`,
                      position: "relative",
                    }}
                  >
                    {virtualItems.map((virtualRow: VirtualItem) => {
                      const row = rows[virtualRow.index];
                      if (!row) return null;

                      return (
                        <VirtualRow
                          key={row.id}
                          row={row}
                          virtualStart={virtualRow.start}
                          rowHeight={rowHeight}
                          getStickyStyle={getStickyStyle}
                          getStickyClassName={getStickyClassName}
                          nonClickableColumns={nonClickableColumns}
                          onCellClick={handleCellClick}
                          columnSizing={columnSizing}
                          columnOrder={columnOrder}
                          columnVisibility={columnVisibility}
                          isSelected={!!rowSelection[row.id]}
                        />
                      );
                    })}
                  </TableBody>
                </Table>
              </DndContext>
              <div
                style={{ height: "var(--header-offset, 0px)", flexShrink: 0 }}
                aria-hidden
              />
            </div>
          </div>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
