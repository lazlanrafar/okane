"use client";

import { useState, useEffect, useCallback } from "react";
import { getAiQuota, type AiQuota } from "@workspace/modules/ai/ai.action";

export function useAiQuota() {
  const [quota, setQuota] = useState<AiQuota | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQuota = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getAiQuota();
      if (response.success && response.data) {
        setQuota(response.data);
        setError(null);
      } else {
        setError(response.error || "Failed to fetch AI quota");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuota();
  }, [fetchQuota]);

  const isExceeded = quota ? Number(quota.used) >= Number(quota.maxTokens) : false;

  return {
    quota,
    loading,
    error,
    isExceeded,
    refetch: fetchQuota,
  };
}
