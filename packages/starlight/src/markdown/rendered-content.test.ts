import { describe, expect, it } from "vitest";
import { addHeadingPermalinks } from "./rendered-content.js";

describe("rendered Markdown content", () => {
  it("adds visible, accessible permalinks to headings with IDs", () => {
    const html = addHeadingPermalinks(
      '<h2 id="install"><code>Install</code> &amp; configure</h2><p>Body</p>',
    );

    expect(html).toContain('class="sl-heading-wrapper level-h2"');
    expect(html).toContain('class="sl-anchor-link" href="#install"');
    expect(html).toContain(">#</a>");
    expect(html).toContain("Permalink to “Install &amp; configure”");
  });

  it("leaves headings without IDs unchanged", () => {
    expect(addHeadingPermalinks("<h2>Unlinked</h2>")).toBe("<h2>Unlinked</h2>");
  });
});
