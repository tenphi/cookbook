import { createHash, randomUUID } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { FontLoadingConfig } from "@tenphi/docs";

export const fontHash = (bytes: string | Uint8Array): string =>
  createHash("sha256").update(bytes).digest("hex");
const userAgent =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

/** Content-verified, atomic cache entries. Cache keys include the fixed browser profile. */
export function createFontFetcher(
  directory: string | undefined,
  mode: FontLoadingConfig["cache"] = "reuse",
  fetchFont: typeof fetch = fetch,
) {
  const pending = new Map<string, Promise<{ status: number; body: Buffer }>>();
  return (url: string) => {
    const load = async () => {
      const key = fontHash(`${userAgent}\n${url}`);
      const path = directory ? join(directory, `${key}.json`) : undefined;
      if (path && mode !== "refresh") {
        try {
          const cached = JSON.parse(await readFile(path, "utf8"));
          const body = Buffer.from(cached.body, "base64");
          if (
            ![200, 400].includes(cached.status) ||
            cached.url !== url ||
            fontHash(body) !== cached.sha256
          )
            throw new Error("Invalid font cache entry");
          return { status: cached.status as number, body };
        } catch {
          /* Fetch a missing or corrupted entry unless offline. */
        }
      }
      if (mode === "offline")
        throw new Error(
          `Google font cache is missing or corrupt for ${url}. Run once with theme.fontLoading.cache: "reuse" and preserve the Astro cache directory.`,
        );
      let response: Response;
      try {
        response = await fetchFont(url, {
          headers: { "User-Agent": userAgent },
          signal: AbortSignal.timeout(15_000),
        });
      } catch (error) {
        throw new Error(
          `Could not download Google font resource ${url}: ${String(error)}. Preserve the Astro cache for offline builds, or use local font files.`,
        );
      }
      const body = Buffer.from(await response.arrayBuffer());
      if (![200, 400].includes(response.status))
        throw new Error(
          `Google font request failed (${response.status}): ${url}.`,
        );
      if (path) {
        await mkdir(directory!, { recursive: true });
        const temporary = `${path}.${randomUUID()}.tmp`;
        await writeFile(
          temporary,
          JSON.stringify({
            url,
            status: response.status,
            sha256: fontHash(body),
            body: body.toString("base64"),
          }),
        );
        await rename(temporary, path);
      }
      return { status: response.status, body };
    };
    if (!pending.has(url)) pending.set(url, load());
    return pending.get(url)!;
  };
}
