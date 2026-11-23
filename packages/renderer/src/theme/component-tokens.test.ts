import { readFile, readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { COMPONENT_TOKENS } from "./component-tokens.js";

const components = fileURLToPath(new URL("../components/", import.meta.url));

describe("component tokens", () => {
  it("lists every color and token name the component style trees define", async () => {
    const defined = new Set<string>();
    for (const file of await readdir(components)) {
      if (!file.endsWith(".js") || file.includes(".test.")) continue;
      const source = await readFile(`${components}${file}`, "utf8");
      // A style key that defines a name, quoted or not, such as
      // `"#callout-text": {`, `"$copy-button-size": "2rem"`, `$bg: "#text"` or
      // `$_line: "#text"`. The `$` selector key is not a name.
      for (const [, name] of source.matchAll(
        /(?:^|[{,\s])"?([#$][\w-]+)"?\s*:/gm,
      ))
        defined.add(name!);
    }
    expect(defined.size).toBeGreaterThan(0);
    // Add a new name to COMPONENT_TOKENS, so `tasty:styles` knows it.
    expect([...COMPONENT_TOKENS]).toEqual([...defined].sort());
  });
});
