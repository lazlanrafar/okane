"use client";

import * as React from "react";

import type { SimpleIcon as SimpleIconType } from "simple-icons";

import { cn } from "../../lib/utils";

type SimpleIconProps = {
  icon: SimpleIconType;
  className?: string;
} & React.SVGProps<SVGSVGElement>;

const SimpleIcon = React.forwardRef<SVGSVGElement, SimpleIconProps>(
  ({ icon, className, ...props }, ref) => {
    const { title, path } = icon;

    return (
      <svg
        ref={ref}
        viewBox="0 0 24 24"
        aria-label={title}
        aria-hidden="false"
        focusable="false"
        className={cn("size-5 fill-foreground", className)}
        {...props}
      >
        <title>{title}</title>
        <path d={path} />
      </svg>
    );
  },
);
SimpleIcon.displayName = "SimpleIcon";

export { SimpleIcon };
