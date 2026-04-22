"use client";

import { Label, Separator, Switch, Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui";
import { toast } from "sonner";

import { useNotifications } from "@/hooks/use-notifications";
import { useAppStore } from "@/stores/app";

import { NotificationList } from "./notification-list";

export function NotificationSettings() {
  const { settings, updateSettings, isLoading } = useNotifications();
  const { dictionary } = useAppStore() as any;
  const dict = dictionary.settings.notifications || {};

  const handleToggle = (key: string, value: boolean) => {
    updateSettings({ [key]: value });
    toast.success(dict.preference_updated || "Notification preference updated");
  };

  if (isLoading || !settings) {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium tracking-tight">{dict.title || "Notifications"}</h3>
          <p className="text-sm text-muted-foreground">
            {dict.description || "Manage how you receive alerts and updates."}
          </p>
        </div>
        <Separator />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between space-x-2">
              <div className="space-y-0.5">
                <div className="h-4 w-32 bg-accent animate-pulse rounded" />
                <div className="h-3 w-48 bg-accent animate-pulse rounded mt-1" />
              </div>
              <div className="h-6 w-10 bg-accent animate-pulse rounded-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium tracking-tight">{dict.title || "Notifications"}</h3>
        <p className="text-sm text-muted-foreground">
          {dict.description || "Manage how you receive alerts and updates across different channels."}
        </p>
      </div>

      <Tabs defaultValue="inbox" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px] rounded-none h-9 p-0 bg-transparent border-b">
          <TabsTrigger
            value="inbox"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none h-full text-[10px] uppercase tracking-wider font-semibold"
          >
            {dict.inbox || "Inbox"}
          </TabsTrigger>
          <TabsTrigger
            value="settings"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none h-full text-[10px] uppercase tracking-wider font-semibold"
          >
            {dict.settings || "Settings"}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inbox" className="pt-6 border-none shadow-none focus-visible:ring-0">
          <NotificationList />
        </TabsContent>

        <TabsContent value="settings" className="pt-6 space-y-6 border-none shadow-none focus-visible:ring-0">
          <div className="grid gap-6">
            <div className="flex items-center justify-between space-x-2">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">{dict.push_notifications || "Push Notifications"}</Label>
                <p className="text-xs text-muted-foreground">
                  {dict.push_description || "Receive real-time alerts in your browser."}
                </p>
              </div>
              <Switch
                checked={settings?.push_enabled}
                onCheckedChange={(checked) => handleToggle("push_enabled", checked)}
              />
            </div>

            <div className="flex items-center justify-between space-x-2">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">{dict.email_notifications || "Email Notifications"}</Label>
                <p className="text-xs text-muted-foreground">
                  {dict.email_description || "Get detailed updates and reports via email."}
                </p>
              </div>
              <Switch
                checked={settings?.email_enabled}
                onCheckedChange={(checked) => handleToggle("email_enabled", checked)}
              />
            </div>

            <div className="flex items-center justify-between space-x-2">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">{dict.whatsapp_notifications || "WhatsApp Notifications"}</Label>
                <p className="text-xs text-muted-foreground">
                  {dict.whatsapp_description || "Receive quick alerts on your WhatsApp."}
                </p>
              </div>
              <Switch
                checked={settings?.whatsapp_enabled}
                onCheckedChange={(checked) => handleToggle("whatsapp_enabled", checked)}
              />
            </div>

            <div className="flex items-center justify-between space-x-2">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">{dict.marketing_comms || "Marketing Communications"}</Label>
                <p className="text-xs text-muted-foreground">
                  {dict.marketing_description || "Receive news about new features and promotions."}
                </p>
              </div>
              <Switch
                checked={settings?.marketing_enabled}
                onCheckedChange={(checked) => handleToggle("marketing_enabled", checked)}
              />
            </div>
          </div>

          <div className="rounded-lg border bg-accent/20 p-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              {dict.pro_tip || "Pro Tip"}
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {dict.pro_tip_description ||
                "You can also configure specific alerts for budgets and large transactions in the Category settings?."}
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
