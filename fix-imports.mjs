import fs from "fs";
import path from "path";

const modulesDir = "./packages/modules/src";
const actionsMap = {};

function grepActions(dir) {
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const full = path.join(dir, file);
    if (fs.statSync(full).isDirectory()) {
      grepActions(full);
    } else if (full.endsWith(".ts") && !full.endsWith(".test.ts")) {
      const content = fs.readFileSync(full, "utf8");
      const matches = content.matchAll(
        /export (?:const|function|async function|let) ([a-zA-Z0-9_]+)/g,
      );
      for (const match of matches) {
        let importPath =
          "@workspace/modules/" +
          path
            .relative(modulesDir, full)
            .replace(".ts", "")
            .replace(/\\/g, "/");
        actionsMap[match[1]] = importPath;
      }
    }
  }
}
grepActions(modulesDir);
actionsMap["axiosInstance"] = "@workspace/modules/client";

const files = [
  "apps/app/components/auth/register-form.tsx",
  "apps/app/components/auth/oauth-button.tsx",
  "apps/app/components/auth/workspace-form.tsx",
  "apps/app/components/auth/login-form.tsx",
  "apps/app/components/layout/account-switcher.tsx",
  "apps/app/components/shared/vault-picker-modal.tsx",
  "apps/app/components/shared/wallet-display.tsx",
  "apps/app/components/transactions/vault-picker-modal.tsx",
  "apps/app/components/transactions/transaction-view.tsx",
  "apps/app/components/transactions/import-modal.tsx",
  "apps/app/components/transactions/transaction-form.tsx",
  "apps/app/components/accounts/accounts-client.tsx",
  "apps/app/components/setting/transaction/transaction-settings-form.tsx",
  "apps/app/components/setting/category/category-form.tsx",
  "apps/app/components/setting/sub-currency/sub-currency-list.tsx",
  "apps/app/components/setting/main-currency/main-currency-form.tsx",
  "apps/app/components/setting/profile/setting-profile-form.tsx",
  "apps/app/components/setting/wallet/wallet-list.tsx",
  "apps/app/components/setting/wallet/wallet-group-form.tsx",
  "apps/app/components/setting/wallet/wallet-form.tsx",
  "apps/app/components/setting/members/invite-member-dialog.tsx",
  "apps/app/components/setting/members/members-client.tsx",
  "apps/app/components/setting/account/account-form.tsx",
  "apps/app/components/setting/billing/billing-view.tsx",
  "apps/app/components/overview/overview-metrics.tsx",
  "apps/app/components/overview/ai-chat.tsx",
  "apps/app/components/apps/apps-client.tsx",
  "apps/app/components/vault/vault-client.tsx",
];

for (const file of files) {
  let content = fs.readFileSync(file, "utf8");
  content = content.replace(
    /import\s+\{([^}]+)\}\s+from\s+["']@workspace\/modules\/client["'];?/g,
    (match, importsStr) => {
      // Handle multi-line imports
      const imports = importsStr
        .replace(/\n/g, " ")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const byPath = {};
      for (const imp of imports) {
        let name = imp;
        if (imp.includes(" as ")) {
          const parts = imp.split(" as ").map((s) => s.trim());
          name = parts[0];
        }
        let importPath = actionsMap[name];
        if (name === "sync_user")
          importPath = "@workspace/modules/user/user.action";
        if (name === "get_me")
          importPath = "@workspace/modules/user/user.action";
        if (!importPath) importPath = "@workspace/modules/client";
        if (!byPath[importPath]) byPath[importPath] = [];
        byPath[importPath].push(imp);
      }
      return Object.entries(byPath)
        .map(
          ([p, imps]) => "import { " + imps.join(", ") + ' } from "' + p + '";',
        )
        .join("\n");
    },
  );
  fs.writeFileSync(file, content);
}
console.log("Success!");
