import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";

export async function createDocsFixture(
  files: Record<string, string | Uint8Array>,
): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), "tasty-docs-fixture-"));
  for (const [path, contents] of Object.entries(files)) {
    const target = join(root, path);
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, contents);
  }
  return root;
}
