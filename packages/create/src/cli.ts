import { spawn } from "node:child_process";
import { parseArgs } from "node:util";
import { confirm, prompt } from "./prompts.js";
import { scaffold, type PackageManager } from "./scaffold.js";

const { positionals, values } = parseArgs({
  allowPositionals: true,
  allowNegative: true,
  options: {
    package: { type: "string" },
    yes: { type: "boolean", short: "y", default: false },
    brand: { type: "string" },
    site: { type: "string" },
    base: { type: "string" },
    deploy: { type: "string" },
    "package-manager": { type: "string" },
    install: { type: "boolean", default: true },
    open: { type: "boolean", default: false },
    vendor: { type: "boolean", default: false },
    "trust-package": { type: "boolean", default: false },
    help: { type: "boolean", short: "h", default: false },
  },
});

if (values.help) printHelp();

const packageSpecifier =
  values.package ?? (values.yes ? undefined : await prompt("npm package: "));
if (!packageSpecifier) {
  console.error("--package is required in non-interactive mode.");
  printHelp(1);
}

const manager = values["package-manager"];
if (manager && !["npm", "pnpm", "yarn"].includes(manager))
  throw new Error(`Invalid package manager: ${manager}.`);
const deployment = values.deploy;
if (deployment && deployment !== "github-pages" && deployment !== "none")
  throw new Error(`Invalid deploy preset: ${deployment}.`);

const result = await scaffold({
  package: packageSpecifier,
  ...(positionals[0] ? { destination: positionals[0] } : {}),
  ...(manager ? { packageManager: manager as PackageManager } : {}),
  install: values.install,
  ...(values.brand ? { brand: values.brand } : {}),
  ...(values.site ? { site: values.site } : {}),
  ...(values.base ? { base: values.base } : {}),
  ...(deployment ? { deploy: deployment as "github-pages" | "none" } : {}),
  trustPackage: values["trust-package"],
  vendor: values.vendor,
  ...(!values.yes
    ? {
        confirmNonEmpty: (destination: string) =>
          confirm(
            `${destination} is not empty. Continue and overwrite generated files?`,
          ),
      }
    : {}),
});

console.log(
  `\nPackage  ${result.lock.resolved}\nHome     ${result.discovery.home ?? "(none)"}\nPages    ${result.discovery.pages.length}\nAssets   ${result.discovery.assets.length}\n\nCreated ${result.destination}`,
);
if (values.open) {
  if (!values.install) {
    throw new Error(
      "--open requires dependency installation; remove --no-install.",
    );
  }
  const args =
    result.packageManager === "npm"
      ? ["run", "dev", "--", "--open"]
      : ["run", "dev", "--open"];
  const server = spawn(result.packageManager, args, {
    cwd: result.destination,
    detached: true,
    stdio: "ignore",
  });
  server.unref();
}

function printHelp(code = 0): never {
  console.log(
    `Usage: create-cookbook [destination] --package <specifier> [options]\n\nOptions:\n  --yes, -y\n  --brand <color>\n  --site <url>\n  --base <path>\n  --deploy github-pages|none\n  --package-manager npm|pnpm|yarn\n  --no-install\n  --vendor\n  --trust-package\n  --open`,
  );
  process.exit(code);
}
