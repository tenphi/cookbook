import assert from "node:assert/strict";
import { cp, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

/** Run from the clean npm consumer so workspace dependencies cannot mask exports. */
export async function checkStyleLinting({ site, root, run }) {
  await cp(join(root, "scripts/fixtures/linting"), join(site, "linting"), {
    recursive: true,
  });
  await run(
    process.execPath,
    [
      "--input-type=module",
      "-e",
      `
    import assert from 'node:assert/strict';
    import plugin, { recommended, strict, validationConfig } from '@tenphi/cookbook/eslint-plugin';
    import renderer, { validationConfig as rendererConfig } from '@tenphi/starlight/eslint-plugin';
    assert.equal(plugin, renderer);
    assert.equal(validationConfig, rendererConfig);
    assert.equal(recommended, plugin.configs.recommended.rules);
    assert.equal(strict, plugin.configs.strict.rules);
    assert.equal(validationConfig.styleFunctions.mergeStyles.partial, true);
  `,
    ],
    { cwd: site },
  );

  const fixablePath = join(site, "linting/fixable.ts");
  const fixable = await readFile(fixablePath, "utf8");
  const expectedFixed = fixable
    .replace(" !important", "")
    .replace('backgroundColor: "#surface-2"', 'fill: "#surface-2"');

  for (const linter of ["eslint", "oxlint"]) {
    for (const preset of ["recommended", "strict"]) {
      const configFile = `${linter}.config.mjs`;
      await writeFile(
        join(site, configFile),
        linter === "eslint"
          ? `
import parser from '@typescript-eslint/parser';
import plugin, { ${preset} } from '@tenphi/cookbook/eslint-plugin';
export default [{ files: ['**/*.ts'], languageOptions: { parser }, plugins: { tasty: plugin }, rules: ${preset} }];
`
          : `
import { ${preset} } from '@tenphi/cookbook/eslint-plugin';
export default {
  categories: { correctness: 'off' },
  jsPlugins: [{ name: 'tasty', specifier: '@tenphi/cookbook/eslint-plugin' }],
  rules: ${preset},
};
`,
      );
      async function lint(file, fix = false) {
        let result;
        try {
          result = await run(
            join(site, "node_modules/.bin", linter),
            [
              "--config",
              configFile,
              "--format",
              "json",
              ...(linter === "eslint"
                ? ["--max-warnings", "0"]
                : ["--deny-warnings"]),
              ...(fix
                ? [linter === "eslint" ? "--fix" : "--fix-suggestions"]
                : []),
              `linting/${file}.ts`,
            ],
            { cwd: site, maxBuffer: 8 * 1024 * 1024 },
          );
        } catch (error) {
          if (error.code !== 1) throw error;
          result = error;
        }
        const output = JSON.parse(result.stdout);
        return linter === "eslint"
          ? output.flatMap((file) =>
              file.messages.map((message) =>
                message.ruleId?.replace("tasty/", ""),
              ),
            )
          : output.diagnostics.map((message) =>
              message.code.replace(/^tasty[(/]/, "").replace(/\)$/, ""),
            );
      }

      assert.deepEqual(
        await lint("valid"),
        [],
        `${linter}/${preset}: valid Cookbook styles`,
      );
      assert.deepEqual(
        await lint("unrelated"),
        [],
        `${linter}/${preset}: import boundaries`,
      );
      const invalid = await lint("invalid");
      for (const rule of [
        "valid-color-token",
        "valid-custom-unit",
        "valid-preset",
        "valid-state-key",
      ]) {
        assert.ok(
          invalid.includes(rule),
          `${linter}/${preset}: missing ${rule}: ${invalid}`,
        );
      }
      assert.equal(
        invalid.filter((rule) => rule === "known-property").length,
        5,
        `${linter}/${preset}: every styling helper must be recognized`,
      );
      await writeFile(fixablePath, fixable);
      await lint("fixable", true);
      assert.equal(
        await readFile(fixablePath, "utf8"),
        expectedFixed,
        `${linter}/${preset}: safe fixes`,
      );
      // Check diagnostics against the saved file after each linter applies fixes.
      assert.deepEqual(
        await lint("fixable"),
        ["prefer-shorthand-property"],
        `${linter}/${preset}: partial override stays report-only`,
      );
    }
  }
  console.log(
    "Packed ESLint and oxlint exports, presets, validation metadata, and fixes passed.",
  );
}
