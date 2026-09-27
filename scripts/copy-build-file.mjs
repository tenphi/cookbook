import { cp, mkdir } from "node:fs/promises";
import { dirname } from "node:path";

const [source, destination] = process.argv.slice(2);
if (!source || !destination)
  throw new Error("Usage: copy-build-file <source> <destination>");
await mkdir(dirname(destination), { recursive: true });
await cp(source, destination);
