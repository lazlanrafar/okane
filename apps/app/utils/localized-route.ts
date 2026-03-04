"use client";

import { createUseLocalizedRoute } from "@workspace/ui/hooks";

import { i18n } from "@/i18n-config";

export const useLocalizedRoute = createUseLocalizedRoute(i18n.locales);
