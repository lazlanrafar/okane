"use client";

import { loginWithOAuth } from "@workspace/modules/auth/auth.action";
import { ActionResponse } from "@workspace/types";
import { Button, cn, SimpleIcon } from "@workspace/ui";
import { siGithub, siGoogle } from "simple-icons";
import { toast } from "sonner";

import { useAppStore } from "@/stores/app";

interface OAuthButtonProps extends React.ComponentProps<typeof Button> {
  provider: "google" | "github";
  label?: string;
  dictionary: any;
}

export function OAuthButton({ provider, className, label, dictionary, ...props }: OAuthButtonProps) {
  const icon = provider === "google" ? siGoogle : siGithub;
  const defaultLabel =
    provider === "google"
      ? dictionary.auth.social.google || "Continue with Google"
      : dictionary.auth.social.github || "Continue with GitHub";

  return (
    <Button
      variant="outline"
      className={cn("w-full bg-transparent", className)}
      onClick={async () => {
        const result = await loginWithOAuth(provider);
        if (result && !result.success) {
          toast.error(result.error);
        }
      }}
      {...props}
    >
      <SimpleIcon icon={icon} className="size-4 me-2" />
      {label ?? defaultLabel}
    </Button>
  );
}
