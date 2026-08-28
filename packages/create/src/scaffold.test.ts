import { describe, expect, it } from "vitest";
import { inferPackageManager } from "./scaffold.js";

describe("creator defaults", () => {
  it.each([
    ["pnpm/11.0.0 node/v22", "pnpm"],
    ["yarn/4.9.0 npm/? node/v22", "yarn"],
    ["npm/11.0.0 node/v22", "npm"],
    ["", "npm"],
  ] as const)("infers %s as %s", (agent, expected) => {
    expect(inferPackageManager(agent)).toBe(expected);
  });
});
