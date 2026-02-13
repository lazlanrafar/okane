import React from "react";
import { TransactionSettingsForm } from "@/components/setting/transaction/transaction-settings-form";
import { Separator } from "@workspace/ui";

export default function SettingTransactionPage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Transaction Settings</h3>
        <p className="text-sm text-muted-foreground">
          Manage how your transactions are handled and displayed.
        </p>
      </div>
      <Separator />
      <TransactionSettingsForm />
    </div>
  );
}
