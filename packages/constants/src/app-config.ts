const currentYear = new Date().getFullYear();

const sharedMeta = {
  description:
    "oewang is a modern financial OS for businesses. Manage spending, send invoices, track transactions, and gain real-time visibility into your finances.",
} as const;

export const APP_CONFIG = {
  name: "oewang - Financial OS",
  version: "1.0.0",
  copyright: `© ${currentYear}, Latoe.`,
  meta: {
    title: "oewang - Financial OS",
    ...sharedMeta,
  },
} as const;

export const WEBSITE_CONFIG = {
  name: "oewang - Run your business finances without manual work",
  version: "1.0.0",
  copyright: `© ${currentYear}, Latoe.`,
  meta: {
    title: "oewang – Run your business finances without manual work",
    description:
      "oewang is the financial OS for modern businesses. AI-powered insights, automatic categorization, real-time sync. Manage spending, send invoices, track transactions.",
  },
} as const;

export const ADMIN_CONFIG = {
  name: "oewang Admin Panel",
  version: "1.0.0",
  copyright: `© ${currentYear}, Latoe.`,
  meta: {
    title: "oewang Admin Panel",
    ...sharedMeta,
  },
} as const;
