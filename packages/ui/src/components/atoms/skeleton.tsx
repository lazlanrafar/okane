import { cn } from "../../lib/utils";

function Skeleton({
  className,
  animate = true,
  ...props
}: React.ComponentProps<"div"> & { animate?: boolean }) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "relative overflow-hidden",
        "bg-muted/50 dark:bg-muted/20",
        "bg-linear-to-r from-transparent via-primary/10 to-transparent",
        "bg-size-[200%_100%]",
        "rounded-none",
        animate && "animate-shimmer",
        className,
      )}
      {...props}
    />
  );
}

export { Skeleton };
