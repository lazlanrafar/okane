"use client";

import * as React from "react";
import { cn } from "../../lib/utils";
import { 
  Button, 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  Icons
} from "../atoms";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import { Skeleton } from "./skeleton";

// --- BaseCanvas ---
export function BaseCanvas({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col h-full bg-background border rounded-lg overflow-hidden shadow-sm", className)}>
      {children}
    </div>
  );
}

// --- CanvasHeader ---
interface CanvasHeaderProps {
  title: string;
  className?: string;
  onDownload?: () => Promise<void>;
  onShare?: () => Promise<void>;
}

export function CanvasHeader({ title, className, onDownload, onShare }: CanvasHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between border-b bg-muted/30 px-4 py-2", className)}>
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-medium truncate">{title}</h3>
      </div>

      <div className="flex items-center justify-end">
        {(onDownload || onShare) && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Icons.MoreVertical size={16} className="text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onShare && (
                <DropdownMenuItem onClick={onShare} className="text-xs">
                  Share
                </DropdownMenuItem>
              )}
              {onDownload && (
                <DropdownMenuItem onClick={onDownload} className="text-xs">
                  Download
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}

// --- CanvasContent ---
export function CanvasContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn("flex-1 overflow-y-auto scrollbar-hide px-6 py-4 animate-in fade-in slide-in-from-bottom-2 duration-700 ease-out", className)}
      data-canvas-content
    >
      {children}
    </div>
  );
}

// --- CanvasChart ---
interface CanvasChartProps {
  title?: string;
  children: React.ReactNode;
  isLoading?: boolean;
  height?: string | number;
  className?: string;
  legend?: {
    items: Array<{ label: string; type: "solid" | "pattern" }>;
  };
}

export function CanvasChart({ title, children, isLoading, height = "20rem", className, legend }: CanvasChartProps) {
  if (isLoading) {
    return <Skeleton className={cn("w-full rounded-lg", className)} style={{ height }} />;
  }

  return (
    <div className={cn("space-y-4", className)}>
      {title && (
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-muted-foreground">{title}</h4>
          {legend && (
            <div className="flex items-center gap-4">
              {legend.items.map((item) => (
                <div key={item.label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <div className={cn("size-2 rounded-full", item.type === "solid" ? "bg-primary" : "bg-primary/30")} />
                  {item.label}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      <div style={{ height }}>{children}</div>
    </div>
  );
}

// --- CanvasGrid ---
interface CanvasGridProps {
  items: Array<{
    id: string;
    title: string;
    value: string;
    subtitle?: string;
  }>;
  layout?: "2/2" | "3/1" | "1/3";
  isLoading?: boolean;
  className?: string;
}

export function CanvasGrid({ items, layout = "2/2", isLoading, className }: CanvasGridProps) {
  if (isLoading) {
    return (
      <div className={cn("grid gap-4", layout === "2/2" ? "grid-cols-2" : "grid-cols-1 md:grid-cols-3", className)}>
        {Array.from({ length: items.length || 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className={cn("grid gap-4", layout === "2/2" ? "grid-cols-2" : "grid-cols-1 md:grid-cols-3", className)}>
      {items.map((item) => (
        <div key={item.id} className="p-4 rounded-lg bg-muted/30 border space-y-1">
          <p className="text-xs text-muted-foreground font-medium">{item.title}</p>
          <p className="text-2xl font-bold">{item.value}</p>
          {item.subtitle && <p className="text-[10px] text-muted-foreground">{item.subtitle}</p>}
        </div>
      ))}
    </div>
  );
}

// --- CanvasSection ---
interface CanvasSectionProps {
  title: string;
  children: React.ReactNode;
  isLoading?: boolean;
  className?: string;
}

export function CanvasSection({ title, children, isLoading, className }: CanvasSectionProps) {
  if (isLoading) {
    return (
      <div className={cn("space-y-2", className)}>
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      <h4 className="text-sm font-medium text-muted-foreground">{title}</h4>
      <div className="text-sm leading-relaxed text-foreground/80">{children}</div>
    </div>
  );
}
