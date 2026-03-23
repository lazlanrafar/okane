"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@workspace/ui";
import { toast } from "sonner";
import { onboardingCreateWorkspaceAction } from "@workspace/modules/auth/auth.action";
import { BusinessDetailsForm } from "../auth/business-details-form";

interface CreateWorkspaceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateWorkspaceDialog({
  open,
  onOpenChange,
}: CreateWorkspaceDialogProps) {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;

  const [name, setName] = useState("");
  const [country, setCountry] = useState("Indonesia");
  const [currency, setCurrency] = useState({ code: "IDR", symbol: "Rp" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCountryChange = (countryName: string) => {
    setCountry(countryName);
    // Auto-update currency based on country if possible
    // Note: In a real app we'd share this logic more formally
    const countries = require("@workspace/constants").COUNTRIES as any[];
    const countryData = countries.find((c) => c.name === countryName);
    if (countryData?.currency) {
      setCurrency({
        code: countryData.currency.code,
        symbol: countryData.currency.symbol,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await onboardingCreateWorkspaceAction({
      name: name.trim(),
      country,
      mainCurrencyCode: currency.code,
      mainCurrencySymbol: currency.symbol,
    });

    if (result.success && result.data) {
      toast.success("Workspace created successfully");
      onOpenChange(false);
      // Refresh the page or redirect to the new workspace
      router.refresh();
      router.push(`/${locale}/overview`);
    } else {
      setError(result.error || "Failed to create workspace");
      toast.error(result.error || "Failed to create workspace");
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Create new workspace</DialogTitle>
          <DialogDescription>
            Add a new business or project to your account.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <BusinessDetailsForm
            name={name}
            setName={setName}
            country={country}
            onCountryChange={handleCountryChange}
            currencyCode={currency.code}
            onCurrencySelect={(c: { code: string; symbol: string }) => setCurrency({ code: c.code, symbol: c.symbol })}
            onSubmit={handleSubmit}
            submitLabel="Create Workspace"
            loading={loading}
          />
        </div>

        {error && (
          <p className="text-sm text-destructive mt-2">{error}</p>
        )}
      </DialogContent>
    </Dialog>
  );
}
