"use client";

import { Button } from "@workspace/ui";
import { Label } from "@workspace/ui";
import { Separator } from "@workspace/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui";
import { ToggleGroup, ToggleGroupItem } from "@workspace/ui";
import { type FontKey, fontOptions } from "@/lib/fonts/registry";
import type {
  ContentLayout,
  NavbarStyle,
  SidebarCollapsible,
  SidebarVariant,
} from "@/lib/preferences/layout";
import {
  applyContentLayout,
  applyFont,
  applyNavbarStyle,
  applySidebarCollapsible,
  applySidebarVariant,
} from "@/lib/preferences/layout-utils";
import { PREFERENCE_DEFAULTS } from "@/lib/preferences/preferences-config";
import { persistPreference } from "@/lib/preferences/preferences-storage";
import {
  THEME_PRESET_OPTIONS,
  type ThemeMode,
  type ThemePreset,
} from "@/lib/preferences/theme";
import { applyThemePreset } from "@/lib/preferences/theme-utils";
import { usePreferencesStore } from "@/stores/preferences/preferences-provider";

export default function SettingAppearancePage() {
  const themeMode = usePreferencesStore((s) => s.themeMode);
  const resolvedThemeMode = usePreferencesStore((s) => s.resolvedThemeMode);
  const setThemeMode = usePreferencesStore((s) => s.setThemeMode);
  const themePreset = usePreferencesStore((s) => s.themePreset);
  const setThemePreset = usePreferencesStore((s) => s.setThemePreset);
  const contentLayout = usePreferencesStore((s) => s.contentLayout);
  const setContentLayout = usePreferencesStore((s) => s.setContentLayout);
  const navbarStyle = usePreferencesStore((s) => s.navbarStyle);
  const setNavbarStyle = usePreferencesStore((s) => s.setNavbarStyle);
  const variant = usePreferencesStore((s) => s.sidebarVariant);
  const setSidebarVariant = usePreferencesStore((s) => s.setSidebarVariant);
  const collapsible = usePreferencesStore((s) => s.sidebarCollapsible);
  const setSidebarCollapsible = usePreferencesStore(
    (s) => s.setSidebarCollapsible,
  );
  const font = usePreferencesStore((s) => s.font);
  const setFont = usePreferencesStore((s) => s.setFont);

  const onThemePresetChange = (preset: ThemePreset) => {
    applyThemePreset(preset);
    setThemePreset(preset);
    persistPreference("theme_preset", preset);
  };

  const onThemeModeChange = (mode: ThemeMode | "") => {
    if (!mode) return;
    setThemeMode(mode);
    persistPreference("theme_mode", mode);
  };

  const onContentLayoutChange = (layout: ContentLayout | "") => {
    if (!layout) return;
    applyContentLayout(layout);
    setContentLayout(layout);
    persistPreference("content_layout", layout);
  };

  const onNavbarStyleChange = (style: NavbarStyle | "") => {
    if (!style) return;
    applyNavbarStyle(style);
    setNavbarStyle(style);
    persistPreference("navbar_style", style);
  };

  const onSidebarStyleChange = (value: SidebarVariant | "") => {
    if (!value) return;
    setSidebarVariant(value);
    applySidebarVariant(value);
    persistPreference("sidebar_variant", value);
  };

  const onSidebarCollapseModeChange = (value: SidebarCollapsible | "") => {
    if (!value) return;
    setSidebarCollapsible(value);
    applySidebarCollapsible(value);
    persistPreference("sidebar_collapsible", value);
  };

  const onFontChange = (value: FontKey | "") => {
    if (!value) return;
    applyFont(value);
    setFont(value);
    persistPreference("font", value);
  };

  const handleRestore = () => {
    onThemePresetChange(PREFERENCE_DEFAULTS.theme_preset);
    onThemeModeChange(PREFERENCE_DEFAULTS.theme_mode);
    onContentLayoutChange(PREFERENCE_DEFAULTS.content_layout);
    onNavbarStyleChange(PREFERENCE_DEFAULTS.navbar_style);
    onSidebarStyleChange(PREFERENCE_DEFAULTS.sidebar_variant);
    onSidebarCollapseModeChange(PREFERENCE_DEFAULTS.sidebar_collapsible);
    onFontChange(PREFERENCE_DEFAULTS.font);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Appearance</h3>
        <p className="text-sm text-muted-foreground">
          Customize the look and feel of the application. Automatically switch
          between day and night themes.
        </p>
      </div>
      <Separator />

      {/* Theme Settings */}
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium">Theme Settings</h4>
          <p className="text-sm text-muted-foreground">
            Customize your UI theme and colors.
          </p>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Theme Preset</Label>
            <Select value={themePreset} onValueChange={onThemePresetChange}>
              <SelectTrigger className="w-full md:w-[240px]">
                <SelectValue placeholder="Preset" />
              </SelectTrigger>
              <SelectContent>
                {THEME_PRESET_OPTIONS.map((preset) => (
                  <SelectItem key={preset.value} value={preset.value}>
                    <div className="flex items-center gap-2">
                      <span
                        className="size-4 rounded-full"
                        style={{
                          backgroundColor:
                            (resolvedThemeMode ?? "light") === "dark"
                              ? preset.primary.dark
                              : preset.primary.light,
                        }}
                      />
                      {preset.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Theme Mode</Label>
            <ToggleGroup
              type="single"
              variant="outline"
              value={themeMode}
              onValueChange={onThemeModeChange}
              className="justify-start"
            >
              <ToggleGroupItem value="light" aria-label="Toggle light">
                Light
              </ToggleGroupItem>
              <ToggleGroupItem value="dark" aria-label="Toggle dark">
                Dark
              </ToggleGroupItem>
              <ToggleGroupItem value="system" aria-label="Toggle system">
                System
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>
      </div>
      <Separator />

      {/* Layout Settings */}
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium">Layout Settings</h4>
          <p className="text-sm text-muted-foreground">
            Adjust spacing and navigation behavior.
          </p>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Page Layout</Label>
            <ToggleGroup
              type="single"
              variant="outline"
              value={contentLayout}
              onValueChange={onContentLayoutChange}
              className="justify-start"
            >
              <ToggleGroupItem value="centered" aria-label="Toggle centered">
                Centered
              </ToggleGroupItem>
              <ToggleGroupItem
                value="full-width"
                aria-label="Toggle full-width"
              >
                Full Width
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
          <div className="space-y-2">
            <Label>Navbar Behavior</Label>
            <ToggleGroup
              type="single"
              variant="outline"
              value={navbarStyle}
              onValueChange={onNavbarStyleChange}
              className="justify-start"
            >
              <ToggleGroupItem value="sticky" aria-label="Toggle sticky">
                Sticky
              </ToggleGroupItem>
              <ToggleGroupItem value="scroll" aria-label="Toggle scroll">
                Scroll
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>
      </div>
      <Separator />

      {/* Sidebar Settings */}
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium">Sidebar Settings</h4>
          <p className="text-sm text-muted-foreground">
            Configure the sidebar style and collapse behavior.
          </p>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Sidebar Style</Label>
            <ToggleGroup
              type="single"
              variant="outline"
              value={variant}
              onValueChange={onSidebarStyleChange}
              className="justify-start"
            >
              <ToggleGroupItem value="inset" aria-label="Toggle inset">
                Inset
              </ToggleGroupItem>
              <ToggleGroupItem value="sidebar" aria-label="Toggle sidebar">
                Sidebar
              </ToggleGroupItem>
              <ToggleGroupItem value="floating" aria-label="Toggle floating">
                Floating
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
          <div className="space-y-2">
            <Label>Collapse Mode</Label>
            <ToggleGroup
              type="single"
              variant="outline"
              value={collapsible}
              onValueChange={onSidebarCollapseModeChange}
              className="justify-start"
            >
              <ToggleGroupItem value="icon" aria-label="Toggle icon">
                Icon
              </ToggleGroupItem>
              <ToggleGroupItem value="offcanvas" aria-label="Toggle offcanvas">
                OffCanvas
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>
      </div>
      <Separator />

      {/* Typography */}
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium">Typography</h4>
          <p className="text-sm text-muted-foreground">
            Choose the font that suits your style.
          </p>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Font Family</Label>
            <Select value={font} onValueChange={onFontChange}>
              <SelectTrigger className="w-full md:w-[240px]">
                <SelectValue placeholder="Select font" />
              </SelectTrigger>
              <SelectContent>
                {fontOptions.map((font) => (
                  <SelectItem key={font.key} value={font.key}>
                    {font.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="pt-4">
            <Button type="button" variant="destructive" onClick={handleRestore}>
              Restore Defaults
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
