const currentYear = new Date().getFullYear();

const sharedMeta = {
  description:
    "Oewang is a modern financial OS for businesses. Manage spending, send invoices, track transactions, and gain real-time visibility into your finances.",
} as const;

export const APP_CONFIG = {
  name: "Oewang - Financial OS",
  version: "1.0.0",
  copyright: `© ${currentYear}, Latoe.`,
  meta: {
    title: "Oewang - Financial OS",
    ...sharedMeta,
  },
} as const;

const getWebsiteUrl = () => {
  if (typeof process !== "undefined" && process.env.NEXT_PUBLIC_WEBSITE_URL) {
    return process.env.NEXT_PUBLIC_WEBSITE_URL;
  }
  return "https://oewang.com";
};

const websiteUrl = getWebsiteUrl();

export const WEBSITE_CONFIG = {
  name: "Oewang - Run your business finances without manual work",
  url: websiteUrl,
  logo: `${websiteUrl}/logo.png`,
  version: "1.0.0",
  copyright: `© ${currentYear}, Latoe.`,
  meta: {
    title: "Oewang – Run your business finances without manual work",
    description:
      "Oewang is the financial OS for modern businesses. AI-powered insights, automatic categorization, real-time sync. Manage spending, send invoices, track transactions.",
    og: {
      type: "website",
      locale: "en_US",
      url: websiteUrl,
      siteName: "Oewang",
      images: [
        {
          url: `${websiteUrl}/og-image.png`,
          width: 1200,
          height: 630,
          alt: "Oewang - Financial OS for Modern Businesses",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      site: "@oewang",
      creator: "@oewang",
      images: [`${websiteUrl}/og-image.png`],
    },
  },
} as const;

export const ADMIN_CONFIG = {
  name: "Oewang Admin Panel",
  version: "1.0.0",
  copyright: `© ${currentYear}, Latoe.`,
  meta: {
    title: "Oewang Admin Panel",
    ...sharedMeta,
  },
} as const;
