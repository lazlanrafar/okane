export function generateSlug(text: string): string {
  const base_slug = text.toLowerCase().replace(/[^a-z0-9]/g, "-") || "slug";
  const random_suffix = Math.random().toString(36).substring(2, 7);
  return `${base_slug}-${random_suffix}`;
}
