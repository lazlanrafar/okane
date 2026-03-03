import packageJson from "../package.json";

const currentYear = new Date().getFullYear();

export const APP_CONFIG = {
  name: "Okane Admin Panel",
  version: packageJson.version,
  copyright: `© ${currentYear}, Okane Admin Panel.`,
  meta: {
    title: "Okane Admin Panel",
    description:
      "Okane is a modern, privacy-first personal finance tracker built to help you take control of your wealth. Manage your budgets, track your expenses, and achieve your financial goals with ease.",
  },
};
