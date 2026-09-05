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

  it("preserves headings already linked by Starlight", () => {
    const linked =
      '<div class="sl-heading-wrapper level-h2"><h2 id="install">Install</h2><a class="sl-anchor-link" href="#install"><span aria-hidden="true" class="sl-anchor-icon"><svg></svg></span><span class="sr-only">Section titled “Install”</span></a></div>';
    const html = addHeadingPermalinks(
      `${linked}<h3 id="configure">Configure</h3>`,
    );

    expect(html).toContain(linked);
    expect(html.match(/class="sl-heading-wrapper/g)).toHaveLength(2);
    expect(html.match(/class="sl-anchor-link/g)).toHaveLength(2);
    expect(html).not.toContain(
      '<div class="sl-heading-wrapper level-h2"><div class="sl-heading-wrapper',
    );
  });
});
