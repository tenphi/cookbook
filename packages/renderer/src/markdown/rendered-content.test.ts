import { describe, expect, it } from "vitest";
import { addHeadingPermalinks } from "./rendered-content.js";

describe("rendered Markdown content", () => {
  it("adds visible, accessible permalinks to headings with IDs", () => {
    const html = addHeadingPermalinks(
      '<h2 id="install"><code>Install</code> &amp; configure</h2><p>Body</p>',
    );

    expect(html).toContain('class="cookbook-heading-wrapper level-h2"');
    expect(html).toContain('class="cookbook-anchor-link" href="#install"');
    expect(html).toContain(
      'class="cookbook-anchor-icon" aria-hidden="true">#</span>',
    );
    expect(html).toContain("Permalink to “Install &amp; configure”");
  });

  it("leaves headings without IDs unchanged", () => {
    expect(addHeadingPermalinks("<h2>Unlinked</h2>")).toBe("<h2>Unlinked</h2>");
  });

  it("preserves headings that already have permalink wrappers", () => {
    const linked =
      '<div class="cookbook-heading-wrapper level-h2"><h2 id="install">Install</h2><a class="cookbook-anchor-link" href="#install"><span aria-hidden="true" class="cookbook-anchor-icon"><svg></svg></span><span class="sr-only">Section titled “Install”</span></a></div>';
    const html = addHeadingPermalinks(
      `${linked}<h3 id="configure">Configure</h3>`,
    );

    expect(html).toContain(linked);
    expect(html.match(/class="cookbook-heading-wrapper/g)).toHaveLength(2);
    expect(html.match(/class="cookbook-anchor-link/g)).toHaveLength(2);
    expect(html).not.toContain(
      '<div class="cookbook-heading-wrapper level-h2"><div class="cookbook-heading-wrapper',
    );
  });
});
