import { describe, expect, it } from "vitest";
import { loadPreferences, storePreferences } from "./appearance-preferences.js";

function storage(values: Record<string, string> = {}) {
  return {
    getItem: (key: string) => values[key] ?? null,
    setItem: (key: string, value: string) => {
      values[key] = value;
    },
  };
}

describe("appearance preferences", () => {
  it("restores existing independent scheme and contrast choices", () => {
    const saved = storage({
      "starlight-theme": "dark",
      "cookbook-appearance": JSON.stringify({ contrast: "more" }),
    });
    expect(loadPreferences(saved)).toEqual({
      scheme: "dark",
      contrast: "more",
    });
    storePreferences({ scheme: "light", contrast: "more" }, saved);
    expect(loadPreferences(saved)).toEqual({
      scheme: "light",
      contrast: "more",
    });
    storePreferences({ scheme: "light", contrast: "normal" }, saved);
    expect(loadPreferences(saved)).toEqual({
      scheme: "light",
      contrast: "normal",
    });
  });

  it("persists Auto using the existing storage conventions without losing other preferences", () => {
    const saved = storage({
      "cookbook-appearance": JSON.stringify({ contrast: "more", other: true }),
    });
    storePreferences({ scheme: "auto", contrast: "system" }, saved);
    expect(saved.getItem("starlight-theme")).toBe("");
    expect(JSON.parse(saved.getItem("cookbook-appearance")!)).toEqual({
      contrast: "system",
      other: true,
    });
    expect(loadPreferences(saved)).toEqual({
      scheme: "auto",
      contrast: "system",
    });
  });

  it.each(["{broken", "null", "[]", '"more"', '{"contrast":"invalid"}'])(
    "recovers from malformed contrast data: %s",
    (value) => {
      const saved = storage({
        "starlight-theme": "light",
        "cookbook-appearance": value,
      });
      expect(loadPreferences(saved)).toEqual({
        scheme: "light",
        contrast: "system",
      });
      storePreferences({ scheme: "dark", contrast: "more" }, saved);
      expect(loadPreferences(saved)).toEqual({
        scheme: "dark",
        contrast: "more",
      });
    },
  );

  it("uses system defaults for unknown values or unavailable storage", () => {
    expect(loadPreferences(storage({ "starlight-theme": "invalid" }))).toEqual({
      scheme: "auto",
      contrast: "system",
    });
    const unavailable = {
      getItem: () => {
        throw new Error("Storage unavailable");
      },
      setItem: () => {
        throw new Error("Storage unavailable");
      },
    };
    expect(loadPreferences(unavailable)).toEqual({
      scheme: "auto",
      contrast: "system",
    });
    expect(() =>
      storePreferences({ scheme: "dark", contrast: "more" }, unavailable),
    ).not.toThrow();
  });
});
