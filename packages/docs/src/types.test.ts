import { describe, expect, it } from "vitest";
import {
  COOKBOOK_COMPONENT_NAMES,
  COOKBOOK_COMPONENT_SUB_ELEMENTS,
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
});
