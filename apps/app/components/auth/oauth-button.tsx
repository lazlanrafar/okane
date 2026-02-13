"use client";

import { siGithub, siGoogle } from "simple-icons";

import { SimpleIcon } from "@workspace/ui";
import { Button } from "@workspace/ui";
import { cn } from "@workspace/ui";
import { loginWithOAuth } from "@/actions/auth.actions";

interface OAuthButtonProps extends React.ComponentProps<typeof Button> {
  provider: "google" | "github";
  label?: string;
}

export function OAuthButton({
  provider,
  className,
  label,
  ...props
}: OAuthButtonProps) {
  const icon = provider === "google" ? siGoogle : siGithub;
  const defaultLabel =
    provider === "google" ? "Continue with Google" : "Continue with GitHub";

  return (
    <Button
      variant="secondary"
      className={cn(className)}
      onClick={() => loginWithOAuth(provider)}
      {...props}
    >
      <SimpleIcon icon={icon} className="size-4" />
      {label ?? defaultLabel}
    </Button>
  );
}
