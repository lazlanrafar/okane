import * as React from "react";
import { cn } from "../../lib/utils";

const Skeleton = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div"> & { animate?: boolean }
>(({ className, animate = true, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="skeleton"
    className={cn(
      "relative overflow-hidden",
      "bg-linear-to-r from-transparent via-primary/10 to-transparent dark:via-primary/10",
      "bg-size-[200%_100%]",
      "rounded-none",
      animate && "animate-shimmer",
      className,
    )}
    {...props}
  />
));
Skeleton.displayName = "Skeleton";

export { Skeleton };
