import { spawn } from "node:child_process";
import { parseArgs } from "node:util";
import { confirm } from "./prompts.js";
import { scaffold, type PackageManager } from "./scaffold.js";

const { positionals, values } = parseArgs({
  allowPositionals: true,
  allowNegative: true,
  options: {
    package: { type: "string" },
    source: { type: "string" },
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

if (values.package && values.source)
  throw new Error("Choose either --package or --source.");
if (values.open && !values.install)
  throw new Error(
    "--open requires dependency installation; remove --no-install.",
  );
if ((values.vendor || values["trust-package"]) && !values.package)
  throw new Error("--vendor and --trust-package require --package.");

const manager = values["package-manager"];
if (manager && !["npm", "pnpm", "yarn"].includes(manager))
  throw new Error(`Invalid package manager: ${manager}.`);
const deployment = values.deploy;
if (deployment && deployment !== "github-pages" && deployment !== "none")
  throw new Error(`Invalid deploy preset: ${deployment}.`);

const result = await scaffold({
  ...(values.package ? { package: values.package } : {}),
  ...(values.source ? { source: values.source } : {}),
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
  `\nCreated ${result.destination}${result.lock ? `\nPackage  ${result.lock.resolved}\nPages    ${result.discovery?.pages.length ?? 0}` : ""}\n\nNext:\n  cd ${JSON.stringify(result.destination)}\n  ${values.install ? "" : `${result.packageManager} install\n  `}${result.packageManager} run dev`,
);

if (values.open) {
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
    `Usage: create-cookbook [destination] [--source <repository> | --package <specifier>] [options]\n\nOptions:\n  --yes, -y\n  --brand <color>\n  --site <url>\n  --base <path>\n  --deploy github-pages|none\n  --package-manager npm|pnpm|yarn\n  --no-install\n  --vendor\n  --trust-package\n  --open`,
  );
  process.exit(code);
}
