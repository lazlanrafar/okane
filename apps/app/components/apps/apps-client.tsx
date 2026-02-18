"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getTransactionSettings,
  updateTransactionSettings,
} from "@/actions/setting.actions";
import {
  Cloud,
  Settings,
  ExternalLink,
  ShieldCheck,
  Info,
  CheckCircle2,
} from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Skeleton,
} from "@workspace/ui";

export function AppsClient() {
  const queryClient = useQueryClient();
  const { data: settings, isLoading } = useQuery({
    queryKey: ["transaction-settings"],
    queryFn: async () => {
      const result = await getTransactionSettings();
      if (result.success) return result.data;
      return null;
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateTransactionSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transaction-settings"] });
      toast.success("Storage settings updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update settings");
    },
  });

  const [formData, setFormData] = React.useState({
    r2Endpoint: "",
    r2AccessKeyId: "",
    r2SecretAccessKey: "",
    r2BucketName: "",
  });

  React.useEffect(() => {
    if (settings) {
      setFormData({
        r2Endpoint: settings.r2Endpoint || "",
        r2AccessKeyId: settings.r2AccessKeyId || "",
        r2SecretAccessKey: settings.r2SecretAccessKey || "",
        r2BucketName: settings.r2BucketName || "",
      });
    }
  }, [settings]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  const isConfigured = settings?.r2BucketName && settings?.r2Endpoint;

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Apps & Integrations</h1>
        <p className="text-muted-foreground text-sm">
          Connect your third-party services to enhance your experience.
        </p>
      </div>

      <div className="grid gap-6">
        <Card className={cn(isConfigured && "border-primary/50")}>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <Cloud className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  Cloudflare R2 Storage
                  {isConfigured && (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  )}
                </CardTitle>
                <CardDescription>
                  Use your own Cloudflare R2 bucket for file storage.
                </CardDescription>
              </div>
            </div>
            <Button variant="outline" size="sm" asChild>
              <a
                href="https://dash.cloudflare.com/"
                target="_blank"
                rel="noreferrer"
              >
                Dashboard <ExternalLink className="ml-2 h-3 w-3" />
              </a>
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-muted/30 p-4 rounded-lg flex gap-3 items-start border border-muted">
              <Info className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
              <div className="text-sm space-y-1">
                <p className="font-medium">Why connect your own storage?</p>
                <p className="text-muted-foreground">
                  By default, files are stored in our secure system bucket.
                  Connecting your own R2 bucket gives you full control and
                  ownership over your data.
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="endpoint">Endpoint</Label>
                <Input
                  id="endpoint"
                  placeholder="https://<id>.r2.cloudflarestorage.com"
                  value={formData.r2Endpoint}
                  onChange={(e) =>
                    setFormData({ ...formData, r2Endpoint: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bucket">Bucket Name</Label>
                <Input
                  id="bucket"
                  placeholder="my-vault-bucket"
                  value={formData.r2BucketName}
                  onChange={(e) =>
                    setFormData({ ...formData, r2BucketName: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="accessKey">Access Key ID</Label>
                <Input
                  id="accessKey"
                  type="password"
                  placeholder="Enter Access Key ID"
                  value={formData.r2AccessKeyId}
                  onChange={(e) =>
                    setFormData({ ...formData, r2AccessKeyId: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="secretKey">Secret Access Key</Label>
                <Input
                  id="secretKey"
                  type="password"
                  placeholder="Enter Secret Access Key"
                  value={formData.r2SecretAccessKey}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      r2SecretAccessKey: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              {isConfigured && (
                <Button
                  variant="ghost"
                  className="text-destructive"
                  onClick={() => {
                    if (confirm("Reset to system storage?")) {
                      updateMutation.mutate({
                        r2Endpoint: null,
                        r2AccessKeyId: null,
                        r2SecretAccessKey: null,
                        r2BucketName: null,
                      });
                    }
                  }}
                >
                  Reset to Default
                </Button>
              )}
              <Button
                onClick={() => updateMutation.mutate(formData)}
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? "Saving..." : "Save Configuration"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="opacity-60 grayscale cursor-not-allowed">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Box className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  Amazon S3
                  <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                    Coming Soon
                  </span>
                </CardTitle>
                <CardDescription>Connect your AWS S3 buckets.</CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}

function Box({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </svg>
  );
}
