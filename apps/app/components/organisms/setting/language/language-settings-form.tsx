"use client";

import { usePathname, useRouter } from "next/navigation";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Separator, Skeleton } from "@workspace/ui";

import type { Locale } from "@/i18n-config";
import { useAppStore } from "@/stores/app";

function LanguageSkeleton() {
  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <Skeleton className="h-6 w-48 rounded-none" />
        <Skeleton className="h-4 w-72 rounded-none" />
      </div>
      <Separator className="rounded-none" />
      <Skeleton className="h-8 w-[180px] rounded-none" />
    </div>
  );
}

interface LanguageSettingsFormProps {
  dictionary: any;
}

export function LanguageSettingsForm({ dictionary: dict }: LanguageSettingsFormProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { dictionary: storeDict, isLoading } = useAppStore() as any;
  const dictionary = dict || storeDict;

  const currentLocale = pathname.split("/")[1] as Locale;

  const handleLanguageChange = (newLocale: string) => {
    const segments = pathname.split("/");
    segments[1] = newLocale;
    const newPath = segments.join("/");
    router.push(newPath);
  };

  if (!dictionary && (isLoading || !dictionary)) {
    return <LanguageSkeleton />;
  }

  const { title, description, options, placeholder } = dictionary.language;

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h2 className="font-medium text-lg tracking-tight">{title}</h2>
        <p className="text-muted-foreground text-xs">{description}</p>
      </div>
      <Separator className="rounded-none" />

      <Select value={currentLocale} onValueChange={handleLanguageChange}>
        <SelectTrigger className="h-8 w-[180px] rounded-none border bg-background font-normal text-xs">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="rounded-none border bg-background">
          {Object.entries(options as Record<string, string>).map(([value, label]) => (
            <SelectItem
              key={value}
              value={value}
              className="rounded-none text-xs focus:bg-accent focus:text-accent-foreground"
            >
              <span className="text-xs">{label}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
