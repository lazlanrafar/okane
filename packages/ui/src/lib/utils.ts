import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export * from "@workspace/utils";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
