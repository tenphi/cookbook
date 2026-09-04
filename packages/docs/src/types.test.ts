import { describe, expect, it } from "vitest";
import {
  COOKBOOK_COMPONENT_NAMES,
  COOKBOOK_COMPONENT_SUB_ELEMENTS,
  type CookbookComponentStyles,
  type ComponentStylesConfig,
} from "./types.js";

describe("component style metadata", () => {
  it("publishes a sub-element list for every configurable surface", () => {
    expect(Object.keys(COOKBOOK_COMPONENT_SUB_ELEMENTS).sort()).toEqual(
      [...COOKBOOK_COMPONENT_NAMES].sort(),
    );
  });

  it("publishes the complete navigation sub-element lists", () => {
    expect(COOKBOOK_COMPONENT_SUB_ELEMENTS.Sidebar).toEqual([
      "CurrentLink",
      "Content",
      "List",
      "Item",
      "TopLevelSpacing",
      "NestedItem",
      "Control",
      "Summary",
      "GroupLabel",
      "GroupLabelText",
      "Link",
      "LinkLabel",
      "InteractiveControl",
      "SummaryMarker",
      "TopLevelLink",
    ]);
    expect(COOKBOOK_COMPONENT_SUB_ELEMENTS.TableOfContents).toEqual([
      "Heading",
      "List",
      "Item",
      "Link",
      "LinkLabel",
      "HoverLink",
      "CurrentLink",
    ]);
    expect(COOKBOOK_COMPONENT_SUB_ELEMENTS.MobileTableOfContents).toEqual([
      "Item",
      "Link",
      "LinkLabel",
      "HoverLink",
      "CurrentLink",
      "CurrentIndicator",
    ]);
  });

  it("types configuration as partial style overrides without mode wrappers", () => {
    const styles = {
      Sidebar: { LinkLabel: { whiteSpace: "normal" } },
    } satisfies ComponentStylesConfig;
    const sidebar: CookbookComponentStyles<"Sidebar"> = {
      GroupLabelText: { fontWeight: 600 },
      LinkLabel: { whiteSpace: "normal" },
    };

    // @ts-expect-error Mode wrappers are not part of the public style API.
    const invalidStyles: ComponentStylesConfig = {
      Sidebar: { mode: "replace" },
    };

    expect(styles.Sidebar.LinkLabel).toEqual({ whiteSpace: "normal" });
    expect(sidebar.GroupLabelText).toEqual({ fontWeight: 600 });
    expect(invalidStyles).toBeDefined();
  });
});
