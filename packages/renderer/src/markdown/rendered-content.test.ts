import { describe, expect, it } from "vitest";
import { addHeadingPermalinks } from "./rendered-content.js";

describe("rendered Markdown content", () => {
  it("adds visible, accessible permalinks to headings with IDs", () => {
    const html = addHeadingPermalinks(
      '<h2 id="install"><code>Install</code> &amp; configure</h2><p>Body</p>',
    );

    expect(html).toContain(
      'data-element="MarkdownHeading" data-heading="" data-level="h2"',
    );
    expect(html).toContain('data-element="Anchor" href="#install"');
    expect(html).toContain(
      'data-element="AnchorIcon" aria-hidden="true">#</span>',
    );
    expect(html).toContain("Permalink to “Install &amp; configure”");
  });

  it("leaves headings without IDs unchanged", () => {
    expect(addHeadingPermalinks("<h2>Unlinked</h2>")).toBe("<h2>Unlinked</h2>");
  });

  it("preserves headings that already have permalink wrappers", () => {
    const linked =
      '<div data-element="MarkdownHeading" data-heading="" data-level="h2"><h2 id="install">Install</h2><a data-element="Anchor" href="#install"><span aria-hidden="true" data-element="AnchorIcon"><svg></svg></span><span data-sr-only="">Section titled “Install”</span></a></div>';
    const html = addHeadingPermalinks(
      `${linked}<h3 id="configure">Configure</h3>`,
    );

    expect(html).toContain(linked);
    expect(html.match(/data-element="MarkdownHeading/g)).toHaveLength(2);
    expect(html.match(/data-element="Anchor"/g)).toHaveLength(2);
    expect(html).not.toContain(
      '<div data-element="MarkdownHeading" data-heading="" data-level="h2"><div data-element="MarkdownHeading',
    );
  });
});
