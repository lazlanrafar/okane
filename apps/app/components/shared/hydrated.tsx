"use client";

import { useEffect, useState, type ReactNode } from "react";

interface HydratedProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function Hydrated({ children, fallback = null }: HydratedProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
