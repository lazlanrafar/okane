import { Separator } from "@workspace/ui";

import { SettingSidebar } from "@/components/setting/setting-sidebar";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col space-y-6 overflow-hidden md:h-[calc(100vh-3.5rem)]">
      <div className="flex-none space-y-0.5">
        <h2 className="font-bold text-2xl tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Manage your account settings and set e-mail preferences.
        </p>
        <Separator className="my-6" />
      </div>
      <div className="flex flex-1 flex-col overflow-hidden lg:flex-row lg:space-x-12 lg:space-y-0">
        <aside className="overflow-y-auto lg:w-1/5">
          <SettingSidebar />
        </aside>
        <div className="flex-1 overflow-y-auto lg:max-w-2xl">{children}</div>
      </div>
    </div>
  );
}
