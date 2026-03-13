import { useArtifacts } from "@ai-sdk-tools/artifacts/client";
import { parseAsString, useQueryState } from "nuqs";
import { useCallback } from "react";
import { CanvasErrorBoundary } from "./chat-canvas-error-boundary";
import { CanvasErrorFallback } from "./chat-canvas-error-fallback";

import { RevenueCanvas } from "./chat-canvas-revenue";
// import { isMonthlyBreakdownType } from "@/lib/metrics-breakdown-constants";

export function Canvas() {
  const [selectedType, setSelectedType] = useQueryState(
    "artifact-type",
    parseAsString,
  );

  const [data] = useArtifacts({
    value: selectedType,
    onChange: (v) => setSelectedType(v ?? null),
    exclude: ["chat-title", "suggestions"],
  });

  const renderCanvas = useCallback(() => {
    const activeType = data.activeType;

    // Handle monthly breakdown artifacts (pattern: breakdown-summary-canvas-YYYY-MM)
    // if (activeType && isMonthlyBreakdownType(activeType)) {
    //   return <MetricsBreakdownSummaryCanvas />;
    // }

    switch (activeType) {
      case "revenue-canvas":
        return <RevenueCanvas />;
      default:
        return null;
    }
  }, [data.activeType]);

  return (
    <CanvasErrorBoundary key={selectedType} fallback={<CanvasErrorFallback />}>
      {renderCanvas()}
    </CanvasErrorBoundary>
  );
}
