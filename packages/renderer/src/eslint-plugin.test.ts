import { describe, expect, it } from "vitest";
import upstream, {
  recommended as upstreamRecommended,
  strict as upstreamStrict,
} from "@tenphi/eslint-plugin-tasty";
import plugin, {
  recommended,
  strict,
  validationConfig,
} from "./eslint-plugin.js";
import { cookbookStates } from "./components/tasty-states.js";
import { resolveDocsTheme } from "./theme/index.js";
import { TASTY_UNITS } from "./theme/tasty-config.js";

describe("consumer style validation", () => {
  it("preserves the upstream plugin and its rule maps", () => {
    expect(plugin).toBe(upstream);
    expect(recommended).toBe(upstreamRecommended);
    expect(strict).toBe(upstreamStrict);
  });

  it("covers the renderer's complete default theme without stale names", () => {
    const theme = resolveDocsTheme();
    const tastyBuiltins = [
      "#clear",
      "#current",
      "#white",
      "#black",
      "$transition",
      "$sharp-radius",
      "$bold-font-weight",
    ];
    expect([...validationConfig.tokens].sort()).toEqual(
      [
        ...new Set([
          ...Object.keys(theme.tokens),
          ...Object.keys(theme.colorTokens),
          ...tastyBuiltins,
        ]),
      ].sort(),
    );
    expect([...validationConfig.presets].sort()).toEqual(
      Object.keys(theme.presets).sort(),
    );
    expect([...validationConfig.states].sort()).toEqual(
      Object.keys(cookbookStates).sort(),
    );
    expect([...validationConfig.units].sort()).toEqual(
      Object.keys(TASTY_UNITS).sort(),
    );
  });
});
