"use client";

import { 
  BaseCanvas, 
  CanvasHeader, 
  CanvasContent,
  Button,
  Icons
} from "@workspace/ui";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

export function CanvasErrorFallback() {
  const router = useRouter();

  const handleGoBack = useCallback(() => {
    router.back();
  }, [router]);

  return (
    <BaseCanvas>
      <CanvasHeader title="Error" />
      <CanvasContent>
        <div className="flex flex-col items-center justify-center py-8 h-full min-h-[400px]">
          <div className="text-sm text-muted-foreground mb-6">
            Error loading content
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleGoBack}
            className="flex items-center gap-2"
          >
            <Icons.ArrowBack className="size-4" />
            Go back
          </Button>
        </div>
      </CanvasContent>
    </BaseCanvas>
  );
}
