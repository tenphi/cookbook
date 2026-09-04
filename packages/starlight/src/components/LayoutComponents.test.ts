import { describe, expect, it } from "vitest";
import { appearanceSelectStyles } from "./LayoutComponents.js";

describe("layout components", () => {
  it("keeps appearance pickers styled at compact viewports", () => {
    expect(appearanceSelectStyles.Select.appearance).toBe("base-select");
  });
});
