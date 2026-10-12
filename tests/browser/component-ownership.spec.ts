import { expect, test } from "@playwright/test";

test("document media states preserve explicit dimensions and unconditional picture rules", async ({
  page,
}) => {
  await page.goto("/manual/guide/");
  await page.evaluate(() => {
    const fixture = document.createElement("section");
    fixture.innerHTML =
      '<img data-test-media="fluid"><img data-test-media="fixed" width="123" height="45"><picture data-test-media="picture" width="123" height="45"></picture><span data-test-media="hidden" hidden>hidden</span>';
    document.body.append(fixture);
  });
  await expect(page.locator('[data-test-media="fluid"]')).toHaveCSS(
    "max-width",
    "100%",
  );
  const fixed = page.locator('[data-test-media="fixed"]');
  await expect(fixed).toHaveCSS("max-width", "none");
  await expect(fixed).toHaveCSS("width", "123px");
  await expect(fixed).toHaveCSS("height", "45px");
  await expect(page.locator('[data-test-media="picture"]')).toHaveCSS(
    "max-width",
    "100%",
  );
  await expect(page.locator('[data-test-media="hidden"]')).toHaveCSS(
    "display",
    "none",
  );
});

test("current sidebar link retains its appearance while hovered", async ({
  page,
}) => {
  await page.goto("/manual/guide/");
  const current = page
    .locator('cookbook-sidebar a[aria-current="page"]')
    .first();
  const before = await current.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      color: style.color,
      background: style.backgroundColor,
      weight: style.fontWeight,
    };
  });
  await current.hover();
  await expect(current).toHaveCSS("color", before.color);
  await expect(current).toHaveCSS("background-color", before.background);
  await expect(current).toHaveCSS("font-weight", before.weight);
});

test("anatomy overrides stay scoped to copy controls and selector panels", async ({
  page,
}) => {
  await page.goto("/custom-header/guide/");
  const code = page.locator("[data-element=MarkdownCodeBlock]").first();
  await expect(code.locator('[data-element="CopyButton"]')).toHaveCSS(
    "width",
    "42px",
  );
  await expect(code.locator('[data-element="CopyButton"]')).toHaveCSS(
    "padding",
    "2px",
  );
  await expect(code.locator("pre")).toHaveCSS("position", "static");
  await expect(code.locator("pre")).toHaveCSS("padding-inline-start", "16px");
  const select = page.locator("cookbook-sidebar-pane cookbook-language-select");
  await expect(select.locator('[data-element="Panel"]')).toHaveCSS(
    "padding",
    "13px",
  );
  await expect(select.locator('[data-element="Panel"]')).toHaveCSS(
    "border-radius",
    "19px",
  );
  await expect(select.locator(":scope > button")).toHaveCSS(
    "position",
    "static",
  );
  await expect(select.locator(":scope > button")).toHaveCSS(
    "padding",
    "0px 8px",
  );
  await expect(select).toHaveCSS("border-top-width", "0px");
  await select.evaluate((element) => element.setAttribute("data-compact", ""));
  await expect(select).toHaveCSS("border-top-width", "4px");
  await select.evaluate((element) => element.removeAttribute("data-compact"));
  await expect(select).toHaveCSS("border-top-width", "0px");
});

test("prose owns block spacing while tab controls retain their own margins", async ({
  page,
}) => {
  await page.goto("/manual/guide/");
  await expect(page.locator('[data-element="Callout"]').first()).toHaveCSS(
    "margin-block-start",
    "24px",
  );
  const heading = page
    .locator("[data-element=MarkdownHeading][data-level=h2]")
    .nth(1);
  const spacing = await heading.evaluate(
    (e) => `${parseFloat(getComputedStyle(e).fontSize) * 1.5}px`,
  );
  await expect(heading).toHaveCSS("margin-block-start", spacing);
  await page.goto("/manual/");
  await expect(page.locator('[role="tab"]').nth(1)).toHaveCSS("margin", "0px");
  await expect(page.locator('[role="tabpanel"]').first()).toHaveCSS(
    "margin-block-start",
    "24px",
  );
});

test("Hero color variants preserve the configured action border width and style", async ({
  page,
}) => {
  await page.goto("/manual/");
  for (const variant of ["primary", "secondary", "minimal"]) {
    const action = page.locator(
      `[data-element=Hero] [data-element=Action][data-${variant}]`,
    );
    await expect(action).toHaveCSS("border-top-width", "3px");
    await expect(action).toHaveCSS("border-top-style", "dashed");
  }
  await expect(
    page.locator("[data-element=Hero] [data-element=Action][data-minimal]"),
  ).toHaveCSS("border-top-color", "oklch(1 0 0 / 0)");
});

test("button descendants inherit the shared theme and own their overrides", async ({
  page,
}) => {
  await page.goto("/manual/guide/");
  const search = page.locator('[data-element="SearchButton"]');
  await expect(search).toBeVisible();
  await expect(search).toHaveCSS("gap", "11px");
  await expect(search).toHaveCSS("min-block-size", "0px");
  await page.setViewportSize({ width: 390, height: 844 });
  const menu = page.locator('[data-element="MobileMenuToggle"]');
  await expect(menu).toBeVisible();
  await expect(menu).toHaveCSS("display", "flex");
  await expect(menu).toHaveCSS("gap", "7px");
  await expect(menu).toHaveCSS("min-block-size", "0px");
  await expect(search).toHaveCSS("gap", "11px");
});

test("replacing Header and Head preserves document foundations and component customization", async ({
  page,
}) => {
  await page.goto("/custom-header/guide/");
  await expect(page).toHaveTitle("Replacement head");
  await expect(page.locator("[data-custom-header]")).toHaveText(
    "Replacement header",
  );
  await expect(page.locator("body")).toHaveCSS("margin", "0px");
  await expect(page.locator("body")).toHaveCSS("font-size", "19px");
  await expect(page.locator("[data-element=HeaderFrame]")).toHaveCSS(
    "position",
    "fixed",
  );
  await expect(page.locator("[data-element=Banner] a")).toHaveText(
    "the home page",
  );
  await expect(page.locator("[data-element=Banner]")).toHaveCSS(
    "text-align",
    "center",
  );
  await expect(page.locator("[data-element=Pagination] a").first()).toHaveCSS(
    "border-radius",
    "13px",
  );
  await expect(page.locator("cookbook-sidebar a").first()).toHaveCSS(
    "padding",
    "8px",
  );
  await expect(
    page.locator("[data-element=Markdown] blockquote").first(),
  ).toHaveCSS("padding-inline-start", "29px");
  await expect(page.locator("[data-element=Anchor]").first()).toHaveCSS(
    "display",
    "grid",
  );
  await expect(
    page.locator("[data-element=MarkdownCodeBlock] [data-copy-code]").first(),
  ).toHaveCSS("position", "absolute");
  await expect(
    page.locator('link[rel="stylesheet"][data-tasty-ssr]'),
  ).not.toHaveCount(0);
  await expect(page.locator("style, [style], astro-island")).toHaveCount(0);

  for (const theme of ["light", "dark"]) {
    await page.evaluate((theme) => {
      document.documentElement.dataset.theme = theme;
      document.documentElement.dataset.contrast = "more";
    }, theme);
    await expect(page.locator("body")).toHaveCSS("font-size", "19px");
    await expect(page.locator("[data-element=Pagination] a").first()).toHaveCSS(
      "border-radius",
      "13px",
    );
  }
  await page.goto("/custom-header/404.html");
  await expect(page.locator("body")).toHaveCSS("margin", "0px");
  await expect(page.locator("body")).toHaveCSS("font-size", "19px");
  await expect(
    page.locator('link[rel="stylesheet"][data-tasty-ssr]'),
  ).not.toHaveCount(0);
  await expect(page.locator("style, [style], astro-island")).toHaveCount(0);
});

test("CodeGroup owns code styles outside MarkdownContent", async ({ page }) => {
  await page.goto("/custom-header/");
  const group = page.locator("[data-standalone-code-group]");
  await expect(group).toBeVisible();
  await expect(group.locator("[data-element=Markdown]")).toHaveCount(0);
  await expect(group.locator("pre")).toHaveCSS("border-radius", "17px");
  await expect(group.locator("[data-copy-code]")).toHaveCSS(
    "position",
    "absolute",
  );
  await expect(group.locator("[data-element=MarkdownCodeBlock]")).toHaveCSS(
    "position",
    "relative",
  );
  const keyword = group.locator("[data-syntax-keyword]").first();
  const keywordColor = await page.evaluate(() =>
    getComputedStyle(document.documentElement)
      .getPropertyValue("--syntax-keyword-color")
      .trim(),
  );
  await expect(keyword).toHaveCSS("color", keywordColor);
});

test("generated Markdown controls preserve spacing and link colors", async ({
  page,
}) => {
  await page.goto("/manual/guide/");
  await expect(page.locator('[data-element="Callout"]').first()).toHaveCSS(
    "margin-block-end",
    "16px",
  );
  await expect(
    page.locator("[data-element=MarkdownCodeBlock] [data-copy-code]").first(),
  ).toHaveCSS("margin", "0px");
  const link = page.locator("[data-element=Anchor]").first();
  const textMuted = await page.evaluate(() =>
    getComputedStyle(document.documentElement)
      .getPropertyValue("--text-muted-color")
      .trim(),
  );
  await expect(link).toHaveCSS("color", textMuted);
});

test("Markdown warning alerts use registered warning colors in every appearance", async ({
  page,
}) => {
  await page.goto("/manual/guide/");
  const caution = page.locator("[data-caution]");
  await expect(caution).toBeVisible();
  for (const scheme of ["light", "dark"]) {
    for (const contrast of ["normal", "more"]) {
      const colors = await page.evaluate(
        ({ scheme, contrast }) => {
          document.documentElement.dataset.theme = scheme;
          document.documentElement.dataset.contrast = contrast;
          const root = getComputedStyle(document.documentElement);
          return ["warning", "warning-text", "warning-surface"].map((token) =>
            root.getPropertyValue(`--${token}-color`).trim(),
          );
        },
        { scheme, contrast },
      );
      await expect(caution).toHaveCSS("border-color", colors[0]);
      await expect(caution).toHaveCSS("color", colors[1]);
      await expect(caution).toHaveCSS("background-color", colors[2]);
    }
  }
});

for (const systemScheme of ["light", "dark"] as const) {
  test(`scheme aliases honor explicit choices over system ${systemScheme}`, async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: systemScheme });
    await page.goto("/wide-logo/");
    const darkHero = page.locator(
      '[data-element=Hero] > img[data-hero-image="dark"]',
    );
    const lightHero = page.locator(
      '[data-element=Hero] > img[data-hero-image="light"]',
    );
    const darkLogo = page.locator("[data-element=Dark]").first();
    const lightLogo = page.locator("[data-element=Light]").first();
    for (const selected of [undefined, "light", "dark"] as const) {
      await page.evaluate((theme) => {
        if (theme) document.documentElement.dataset.theme = theme;
        else delete document.documentElement.dataset.theme;
      }, selected);
      const effective = selected ?? systemScheme;
      await expect(page.locator("html")).toHaveCSS("color-scheme", effective);
      if (effective === "dark") {
        await expect(darkHero).toBeVisible();
        await expect(lightHero).toBeHidden();
        await expect(darkLogo).toBeVisible();
        await expect(lightLogo).toBeHidden();
      } else {
        await expect(darkHero).toBeHidden();
        await expect(lightHero).toBeVisible();
        await expect(darkLogo).toBeHidden();
        await expect(lightLogo).toBeVisible();
      }
    }
  });
}

test("owned data-element identities replace legacy anatomy markers", async ({
  page,
}) => {
  await page.goto("/manual/guide/");
  await expect(page.locator("[data-tasty-anatomy]")).toHaveCount(0);
  const header = page.locator('[data-element="Header"]');
  await expect(header.locator('[data-element="Logo"]')).toHaveCount(1);
  await expect(header.locator('[data-element="Logo"]')).not.toHaveAttribute(
    "class",
    /td-header__logo/,
  );
  await expect(
    header.locator('[data-element="Search"] > site-search'),
  ).toHaveCSS("display", "contents");
  const mark = header.locator('[data-element="Logo"] [data-element="Mark"]');
  await expect(mark).toHaveCount(2);
});

test("prose changes only the start token and preserves a custom end margin", async ({
  page,
}) => {
  await page.goto("/custom-header/guide/");
  const callout = page.locator('[data-element="Callout"]').first();
  await expect(callout).toHaveCSS("margin-block-start", "24px");
  await expect(callout).toHaveCSS("margin-block-end", "37px");
  await expect(callout.locator('[data-element="Body"]')).toHaveCSS(
    "margin-block-end",
    "0px",
  );
  await callout.locator('[data-element="Body"]').evaluate((element) => {
    const paragraph = document.createElement("p");
    paragraph.textContent = "Nested prose";
    element.append(paragraph);
  });
  await expect(callout.locator('[data-element="Body"] p')).toHaveCSS(
    "margin-block-end",
    "0px",
  );
  await page.evaluate(() => {
    const heading = document.createElement("h3");
    heading.dataset.testHeading = "";
    heading.textContent = "Plain heading";
    document.body.append(heading);
  });
  const heading = page.locator("[data-test-heading]");
  await expect(heading).toHaveCSS("text-wrap-style", "pretty");
});

test("footer states style actual metadata parts without affecting unrelated children", async ({
  page,
}) => {
  await page.goto("/manual/guide/");
  const meta = page.locator('[data-element="Footer"] [data-element="Meta"]');
  await meta.evaluate((element) => {
    element.replaceChildren();
    const link = document.createElement("a");
    link.dataset.element = "MetaLink";
    link.href = "#metadata";
    link.textContent = "Edit this page";
    element.append(link);
  });
  const link = meta.locator('[data-element="MetaLink"]');
  const single = await link.evaluate((element) =>
    parseFloat(getComputedStyle(element).marginInlineStart),
  );
  expect(single).toBeGreaterThan(0);
  await meta.evaluate((element) => {
    const updated = document.createElement("p");
    updated.dataset.element = "MetaUpdated";
    updated.textContent = "Updated today";
    element.append(updated);
  });
  await expect(link).toHaveCSS("margin-inline-start", "0px");
  await expect(meta.locator('[data-element="MetaUpdated"]')).toHaveCSS(
    "margin-inline-start",
    "0px",
  );
  await link.evaluate((element) => element.remove());
  expect(
    await meta
      .locator('[data-element="MetaUpdated"]')
      .evaluate((element) =>
        parseFloat(getComputedStyle(element).marginInlineStart),
      ),
  ).toBeGreaterThan(0);
  await meta.evaluate((element) => {
    const unknown = document.createElement("div");
    unknown.textContent = "Unowned child";
    element.replaceChildren(unknown);
  });
  await expect(meta.locator("div")).toHaveCSS("margin-inline-start", "0px");
});

test("root button states preserve inherited defaults and interaction colors", async ({
  page,
}) => {
  await page.goto("/manual/guide/");
  const colors = await page.evaluate(() => {
    const root = getComputedStyle(document.documentElement);
    return Object.fromEntries(
      [
        "text-soft",
        "text",
        "accent-text",
        "surface-2-hover",
        "surface-2-pressed",
      ].map((name) => [name, root.getPropertyValue(`--${name}-color`).trim()]),
    );
  });
  const search = page.locator('[data-element="SearchButton"]');
  await expect(search).toHaveCSS("color", colors["text-soft"]);
  await search.hover();
  await expect(search).toHaveCSS("color", colors.text);
  await expect(search).toHaveCSS("background-color", colors["surface-2-hover"]);
  await page.mouse.down();
  await expect(search).toHaveCSS(
    "background-color",
    colors["surface-2-pressed"],
  );
  await page.mouse.move(0, 0);
  await page.mouse.up();
  await expect(search).toHaveCSS("color", colors["text-soft"]);
  await page.setViewportSize({ width: 390, height: 844 });
  const menu = page.locator('[data-element="MobileMenuToggle"]');
  await expect(menu).toHaveCSS("color", colors["text-soft"]);
  await menu.hover();
  await expect(menu).toHaveCSS("color", colors.text);
  await page.mouse.down();
  await expect(menu).toHaveCSS("color", colors["accent-text"]);
  await page.mouse.move(0, 0);
  await page.mouse.up();
});

test("callout kind states and syntax root states retain their semantic styles", async ({
  page,
}) => {
  await page.goto("/manual/guide/");
  const callout = page.locator('[data-element="Callout"]').first();
  for (const [kind, role] of [
    ["note", "info"],
    ["tip", "success"],
    ["caution", "warning"],
    ["danger", "danger"],
  ]) {
    const colors = await callout.evaluate(
      (element, { kind, role }) => {
        element.setAttribute("data-kind", kind);
        const root = getComputedStyle(document.documentElement);
        // The fixture customizes Title independently of the callout kind.
        return [role, "accent-text", `${role}-surface`].map((name) =>
          root.getPropertyValue(`--${name}-color`).trim(),
        );
      },
      { kind, role },
    );
    await expect(callout).toHaveCSS("border-top-color", colors[0]);
    await expect(callout.locator('[data-element="Title"]')).toHaveCSS(
      "color",
      colors[1],
    );
    await expect(callout).toHaveCSS("background-color", colors[2]);
  }
  const keywordColor = await page.evaluate(() => {
    // Exercise the syntax bridge independently of MarkdownCodeBlock's owned defaults.
    const code = document.createElement("pre");
    code.dataset.testSyntax = "";
    code.className = "tasty-code";
    for (const modifier of [
      "syntax",
      "syntax-scroll",
      "syntax-wrap",
      "syntax-keyword",
    ]) {
      code.setAttribute(`data-${modifier}`, "");
    }
    code.textContent = "const standalone = true;";
    document.body.append(code);
    return getComputedStyle(document.documentElement)
      .getPropertyValue("--syntax-keyword-color")
      .trim();
  });
  const code = page.locator("[data-test-syntax]");
  await expect(code).toHaveCSS("overflow-x", "auto");
  await expect(code).toHaveCSS("white-space", "pre-wrap");
  await expect(code).toHaveCSS("overflow-wrap", "break-word");
  await expect(code).toHaveCSS("color", keywordColor);
});

test("hero actions keep their geometry on hover and minimal shares outline sizing", async ({
  page,
}) => {
  await page.goto("/manual/");
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    const actions = page.locator("[data-element=Hero] [data-element=Action]");
    await expect(actions).toHaveCount(3);
    for (const action of await actions.all()) {
      await page.mouse.move(0, 0);
      const before = await action.boundingBox();
      await action.hover();
      await expect(action).toHaveCSS("translate", "none");
      await expect.poll(() => action.boundingBox()).toEqual(before);
    }
    const geometry = async (variant: string) =>
      page
        .locator(`[data-element=Hero] [data-element=Action][data-${variant}]`)
        .evaluate((element) => {
          const style = getComputedStyle(element);
          return [
            style.padding,
            style.borderTopWidth,
            style.borderTopStyle,
            style.backgroundColor,
            style.borderRadius,
            style.minBlockSize,
          ];
        });
    await page.mouse.move(0, 0);
    const surface = await page.evaluate(() =>
      getComputedStyle(document.documentElement)
        .getPropertyValue("--surface-2-color")
        .trim(),
    );
    await expect(
      page.locator("[data-element=Hero] [data-element=Action][data-minimal]"),
    ).toHaveCSS("background-color", surface);
    expect(await geometry("minimal")).toEqual(await geometry("secondary"));
  }
});

test("width aliases preserve pagination, navigation, and contents boundaries", async ({
  page,
}) => {
  await page.goto("/manual/guide/");
  const links = page.locator("[data-element=Pagination] > a");
  await expect(links).toHaveCount(2);
  for (const width of [640, 641]) {
    await page.setViewportSize({ width, height: 1000 });
    const next = (await links.nth(0).boundingBox())!;
    const previous = (await links.nth(1).boundingBox())!;
    if (width === 640) {
      expect(previous.y).toBeGreaterThan(next.y);
    } else {
      expect(previous.y).toBe(next.y);
      expect(previous.x).toBeLessThan(next.x);
    }
  }
  for (const width of [799, 800]) {
    await page.setViewportSize({ width, height: 1000 });
    await expect(page.locator("[data-element=MobileMenuToggle]")).toHaveCSS(
      "display",
      width < 800 ? "flex" : "none",
    );
  }
  for (const width of [1151, 1152]) {
    await page.setViewportSize({ width, height: 1000 });
    await expect(page.locator("[data-element=TableOfContents]")).toHaveCSS(
      "display",
      width < 1152 ? "none" : "block",
    );
  }
});

test("authored classes identify roots only", async ({ page }) => {
  for (const route of ["/manual/", "/manual/guide/", "/custom-header/guide/"]) {
    await page.goto(route);
    const authored = await page.locator("[class]").evaluateAll((elements) => {
      const roots: Record<string, string> = {
        "cookbook-markdown-content": '[data-element="Markdown"]',
        "cookbook-skip-link": '[data-element="SkipLink"]',
        "right-sidebar-container": '[data-element="TableOfContentsLayout"]',
        "right-sidebar-panel": '[data-element="TableOfContents"]',
        "main-pane": '[data-element="MainPane"]',
        "cookbook-banner": '[data-element="Banner"]',
        page: '[data-element="PageFrame"]',
        header: '[data-element="HeaderFrame"]',
        "sidebar-pane": '[data-element="Sidebar"]',
        "td-header": '[data-element="Header"]',
        "td-top-tabs": '[data-element="TopNavigation"]',
        "td-footer": '[data-element="Footer"]',
        hero: '[data-element="Hero"]',
        "td-mobile-preferences": '[data-element="MobileMenuFooter"]',
        "td-menu-button": '[data-element="MobileMenuToggle"]',
        "cookbook-menu-button": '[data-element="MobileMenuToggle"]',
        "td-card": '[data-element="Card"]',
        "td-steps": '[data-element="Steps"]',
        "td-preview": '[data-element="Preview"]',
        "pagination-links": '[data-element="Pagination"]',
        "td-package-version": '[data-element="PackageVersion"]',
        "td-mobile-tabs": '[data-element="MobileNavigationTabs"]',
        "site-title": '[data-element="SiteTitle"]',
        "cookbook-heading-wrapper": '[data-element="MarkdownHeading"]',
        "td-code-block": "cookbook-code-block",
        "tasty-code": "pre",
        "cookbook-alert": '[data-element="MarkdownAlert"]',
        "td-mermaid": '[data-element="Mermaid"]',
      };
      return elements.flatMap((element) =>
        [...element.classList].filter(
          (name) =>
            !/^t[0-9a-z]+$/.test(name) &&
            !(roots[name] && element.matches(roots[name])),
        ),
      );
    });
    expect(authored).toEqual([]);
  }
});

test("prose states preserve linked block spacing and nested isolation", async ({
  page,
}) => {
  await page.goto("/manual/prose/");
  const card = page.locator('[data-element="Card"]');
  await expect(card).toHaveCSS("margin-block-start", "24px");
  await expect(card.locator("p")).toHaveCSS("margin-block-start", "0px");
  await expect(card.locator("p")).toHaveCSS("margin-block-end", "0px");
  await expect(page.locator('[data-element="Card"] + p')).toHaveCSS(
    "margin-block-start",
    "24px",
  );
  const isolated = page.locator("[data-isolated-paragraph]");
  const oneEm = await isolated.evaluate(
    (element) => getComputedStyle(element).fontSize,
  );
  await expect(isolated).toHaveCSS("margin-block-start", oneEm);
  await expect(page.locator("[data-isolated-code]")).toHaveCSS(
    "padding",
    "0px",
  );
  await expect(page.locator("[data-isolated-code]")).toHaveCSS(
    "background-color",
    "rgba(0, 0, 0, 0)",
  );
  const icons = await page
    .locator("[data-isolated-details] summary")
    .evaluate((element) => getComputedStyle(element, "::before").content);
  expect(icons).toBe("none");
  await expect(page.locator("[data-prose-details] summary")).toHaveCSS(
    "margin-block-end",
    "16px",
  );
});

test("diff and copy state belong to code-block roots in fences and CodeGroup", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/manual/prose/");
  const blocks = page.locator("cookbook-code-block[data-diff]");
  await expect(blocks).toHaveCount(2);
  for (const block of await blocks.all()) {
    await expect(block.locator("pre")).toHaveCSS("padding-inline-start", "0px");
    await expect(block.locator("pre code")).toHaveCSS("display", "block");
    await expect(block.locator("pre code")).toHaveCSS("line-height", "0px");
    await expect(block.locator('[data-element="Line"]').first()).toHaveCSS(
      "display",
      "block",
    );
    await expect(block.locator('[data-element="Line"]').first()).toHaveCSS(
      "padding-inline-start",
      "16px",
    );
    const emptyLine = block.locator('[data-element="Line"]:empty');
    await expect(emptyLine).toHaveCount(1);
    expect(
      await emptyLine.evaluate(
        (element) => getComputedStyle(element, "::before").content,
      ),
    ).not.toBe("none");
    const insertedColor = await page.evaluate(() =>
      getComputedStyle(document.documentElement)
        .getPropertyValue("--green-surface-color")
        .trim(),
    );
    await expect(block.locator("[data-inserted]")).toHaveCSS(
      "background-color",
      insertedColor,
    );
    await block.getByRole("button", { name: "Copy code", exact: true }).click();
    await expect(block).toHaveAttribute("data-copy-state", "copied");
    const copiedColor = await page.evaluate(() =>
      getComputedStyle(document.documentElement)
        .getPropertyValue("--green-text-color")
        .trim(),
    );
    await expect(block.locator('[data-element="CopyButton"]')).toHaveCSS(
      "color",
      copiedColor,
    );
  }
});
