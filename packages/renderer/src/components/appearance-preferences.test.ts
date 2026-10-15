import { describe, expect, it } from "vitest";
import { loadPreferences, storePreferences } from "./appearance-preferences.js";

function storage(values: Record<string, string> = {}) {
  return {
    getItem: (key: string) => values[key] ?? null,
    setItem: (key: string, value: string) => {
      values[key] = value;
    },
    removeItem: (key: string) => {
      delete values[key];
    },
  };
}

describe("appearance preferences", () => {
  it("restores independent theme and contrast choices from one object", () => {
    const saved = storage({
      "cookbook-appearance": JSON.stringify({
        theme: "dark",
        contrast: "more",
      }),
    });
    expect(loadPreferences(saved)).toEqual({
      theme: "dark",
      contrast: "more",
    });
    storePreferences({ theme: "light", contrast: "more" }, saved);
    expect(loadPreferences(saved)).toEqual({
      theme: "light",
      contrast: "more",
    });
    storePreferences({ theme: "light", contrast: "normal" }, saved);
    expect(JSON.parse(saved.getItem("cookbook-appearance")!)).toEqual({
      theme: "light",
      contrast: "normal",
    });
  });

  it("persists system choices without losing other fields", () => {
    const saved = storage({
      "cookbook-appearance": JSON.stringify({ contrast: "more", other: true }),
    });
    storePreferences({ theme: "system", contrast: "system" }, saved);
    expect(JSON.parse(saved.getItem("cookbook-appearance")!)).toEqual({
      theme: "system",
      contrast: "system",
      other: true,
    });
    expect(loadPreferences(saved)).toEqual({
      theme: "system",
      contrast: "system",
    });
  });

  it("reads a scheme saved under the legacy key and removes it on save", () => {
    const saved = storage({
      "cookbook-theme": "dark",
      "cookbook-appearance": JSON.stringify({ contrast: "more" }),
    });
    expect(loadPreferences(saved)).toEqual({
      theme: "dark",
      contrast: "more",
    });
    storePreferences(loadPreferences(saved), saved);
    expect(saved.getItem("cookbook-theme")).toBeNull();
    expect(JSON.parse(saved.getItem("cookbook-appearance")!)).toEqual({
      theme: "dark",
      contrast: "more",
    });
  });

  it("prefers the object's theme over the legacy key", () => {
    const saved = storage({
      "cookbook-theme": "dark",
      "cookbook-appearance": JSON.stringify({ theme: "system" }),
    });
    expect(loadPreferences(saved).theme).toBe("system");
  });

  it.each(["{broken", "null", "[]", '"more"', '{"contrast":"invalid"}'])(
    "recovers from malformed appearance data: %s",
    (value) => {
      const saved = storage({ "cookbook-appearance": value });
      expect(loadPreferences(saved)).toEqual({
        theme: "system",
        contrast: "system",
      });
      storePreferences({ theme: "dark", contrast: "more" }, saved);
      expect(loadPreferences(saved)).toEqual({
        theme: "dark",
        contrast: "more",
      });
    },
  );

  it("uses system defaults for unknown values or unavailable storage", () => {
    expect(
      loadPreferences(
        storage({
          "cookbook-appearance": JSON.stringify({
            theme: "invalid",
            contrast: "invalid",
          }),
        }),
      ),
    ).toEqual({ theme: "system", contrast: "system" });
    const unavailable = {
      getItem: () => {
        throw new Error("Storage unavailable");
      },
      setItem: () => {
        throw new Error("Storage unavailable");
      },
      removeItem: () => {
        throw new Error("Storage unavailable");
      },
    };
    expect(loadPreferences(unavailable)).toEqual({
      theme: "system",
      contrast: "system",
    });
    expect(() =>
      storePreferences({ theme: "dark", contrast: "more" }, unavailable),
    ).not.toThrow();
  });
});
