import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

for (const [site, contentWidth] of [
  ["manual", 928],
  ["custom-header", 1024],
] as const) {
  test(`${site} content stays centered while padding shrinks before prose`, async ({
    page,
  }) => {
    await page.goto(`/${site}/landing/`);
    const panel = page.locator(".content-panel").first();
    async function measure(width: number) {
      await page.setViewportSize({ width, height: 900 });
      return panel.evaluate((element) => {
        const container = element.querySelector(".cookbook-container")!;
        const rect = container.getBoundingClientRect();
        return {
          left: rect.left,
          right: window.innerWidth - rect.right,
          width: rect.width,
          padding: parseFloat(getComputedStyle(element).paddingInlineStart),
          scrollWidth: document.documentElement.scrollWidth,
        };
      });
    }

    // Crossing the TOC breakpoint must not change the landing page's alignment.
    const before = await measure(1152);
    const after = await measure(1151);
    expect(before.width).toBe(contentWidth);
    expect(after.width).toBe(contentWidth);
    expect(before.left - after.left).toBeCloseTo(0.5, 1);
    expect(after.left).toBeCloseTo(after.right, 1);

    // Keep the configured content width while progressively reducing padding.
    let previousPadding = Infinity;
    for (const width of [
      contentWidth + 128,
      contentWidth + 96,
      contentWidth + 48,
    ]) {
      const size = await measure(width);
      expect(size.width).toBe(contentWidth);
      expect(size.padding).toBeLessThan(previousPadding);
      expect(size.left).toBeCloseTo(size.right, 1);
      expect(size.scrollWidth).toBe(width);
      previousPadding = size.padding;
    }
    expect(previousPadding).toBe(24);

    // Once padding is minimal, only the content width follows the viewport.
    for (const width of [contentWidth + 47, 900, 800]) {
      const size = await measure(width);
      expect(size.padding).toBe(24);
      expect(size.left).toBe(24);
      expect(size.right).toBe(24);
      expect(size.width).toBe(width - 48);
      expect(size.scrollWidth).toBe(width);
    }
    for (const width of [799, 390]) {
      const size = await measure(width);
      expect(size.padding).toBe(16);
      expect(size.left).toBeGreaterThanOrEqual(16);
      expect(size.left).toBeCloseTo(size.right, 1);
      expect(size.scrollWidth).toBe(width);
    }
  });
}

test.describe("mobile viewport", () => {
  test.use({
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 3,
    viewport: { width: 390, height: 844 },
  });

  test("uses the device width without shrinking text or disabling zoom", async ({
    page,
  }) => {
    for (const route of ["/manual/", "/manual/guide/", "/manual/404.html"]) {
      await page.goto(route);
      const viewport = page.locator('meta[name="viewport"]');
      await expect(viewport).toHaveCount(1);
      await expect(viewport).toHaveAttribute(
        "content",
        "width=device-width, initial-scale=1",
      );
      expect(await page.evaluate(() => window.innerWidth)).toBe(390);
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth),
      ).toBeLessThanOrEqual(390);
      expect(await page.evaluate(() => window.visualViewport?.scale)).toBe(1);
    }
  });
});

test.describe("mobile search", () => {
  test.use({
    isMobile: true,
    hasTouch: true,
    viewport: { width: 390, height: 844 },
  });

  test("search focuses immediately while its first bundle is still loading", async ({
    page,
  }) => {
    let releaseBundle!: () => void;
    const heldBundle = new Promise<void>((resolve) => {
      releaseBundle = resolve;
    });
    await page.route("**/_astro/ui-core.*.js", async (route) => {
      await heldBundle;
      await route.continue();
    });
    await page.goto("/manual/guide/");
    const trigger = page.getByRole("button", { name: "Search", exact: true });
    await trigger.click();
    const input = page.getByRole("textbox", { name: "Search", exact: true });
    try {
      await expect(input).toBeFocused();
      await input.fill("configuration");
      await expect(page.locator(".pagefind-ui__search-input")).toHaveCount(0);
    } finally {
      releaseBundle();
    }
    await expect(
      page.locator(".pagefind-ui__result-link").first(),
    ).toBeVisible();
    await expect(input).toBeFocused();
    await page
      .getByRole("button", { name: "Clear search", exact: true })
      .click();
    await expect(input).toHaveValue("");
    await expect(input).toBeFocused();
    await expect(page.locator(".pagefind-ui__result-link")).toHaveCount(0);
    await page.keyboard.press("Escape");
    await expect(trigger).toBeFocused();
    await trigger.click();
    await expect(input).toBeFocused();
  });

  test("search does not steal focus when loading finishes after dismissal", async ({
    page,
  }) => {
    let releaseBundle!: () => void;
    const heldBundle = new Promise<void>((resolve) => {
      releaseBundle = resolve;
    });
    await page.route("**/_astro/ui-core.*.js", async (route) => {
      await heldBundle;
      await route.continue();
    });
    await page.goto("/manual/guide/");
    const trigger = page.getByRole("button", { name: "Search", exact: true });
    try {
      await trigger.click();
      await page.keyboard.press("Escape");
      await expect(trigger).toBeFocused();
    } finally {
      releaseBundle();
    }
    await expect(page.locator(".pagefind-ui__search-input")).toHaveCount(1);
    await expect(trigger).toBeFocused();
    await expect(page.locator("site-search dialog")).not.toBeVisible();
  });
});

for (const width of [390, 1440]) {
  test(`search actually fades on entry and exit at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/manual/guide/");
    const dialog = page.locator("site-search dialog");
    // Slow the configured transition so the test can inspect it mid-flight.
    await page.addStyleTag({
      content: "site-search { --dialog-transition: 600ms; }",
    });
    await page.getByRole("button", { name: "Search", exact: true }).click();
    await expect
      .poll(() =>
        dialog.evaluate((element) =>
          element
            .getAnimations()
            .some(
              (animation) =>
                animation instanceof CSSTransition &&
                animation.transitionProperty === "opacity" &&
                animation.playState === "running",
            ),
        ),
      )
      .toBe(true);
    await expect(dialog).toHaveCSS("opacity", "1");
    const backdrop = await dialog.evaluate((element) => {
      const styles = getComputedStyle(element, "::backdrop");
      return {
        fill: styles.backgroundColor,
        opacity: styles.opacity,
        blur: styles.backdropFilter,
        transition: styles.transitionProperty,
      };
    });
    if (width < 800) {
      expect(backdrop).toEqual({
        fill: expect.stringMatching(/(?:,\s*0|\/\s*0)\)$/),
        opacity: "0",
        blur: "none",
        transition: "none",
      });
    } else {
      expect(backdrop.fill).not.toMatch(/(?:,\s*0|\/\s*0)\)$/);
      expect(backdrop.opacity).toBe("1");
      expect(backdrop.blur).toBe("blur(4px)");
      expect(backdrop.transition).toContain("opacity");
    }
    await page.keyboard.press("Escape");
    await expect(dialog).not.toHaveAttribute("data-open");
    await expect(dialog).toHaveAttribute("open", "");
    await expect
      .poll(() =>
        dialog.evaluate((element) =>
          element
            .getAnimations()
            .some(
              (animation) =>
                animation instanceof CSSTransition &&
                animation.transitionProperty === "opacity" &&
                animation.playState === "running",
            ),
        ),
      )
      .toBe(true);
    await expect(dialog).not.toHaveAttribute("open");
  });
}

test("keyboard search focuses the input and returns focus on close", async ({
  page,
}) => {
  await page.goto("/manual/guide/");
  const trigger = page.getByRole("button", { name: "Search", exact: true });
  await trigger.focus();
  await page.keyboard.press("Enter");
  const search = page.getByRole("textbox", { name: "Search", exact: true });
  await expect(search).toBeFocused();
  await search.fill("configuration");
  await expect(page.locator(".pagefind-ui__result-link").first()).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
});

for (const width of [390, 1440]) {
  test(`search keeps its controls visible while results scroll at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 420 });
    await page.goto("/manual/guide/");
    await page.getByRole("button", { name: "Search", exact: true }).click();
    const input = page.getByRole("textbox", { name: "Search", exact: true });
    await input.fill("configuration");
    await expect(page.locator(".pagefind-ui__message")).toHaveText(
      /^\d+ results?$/,
    );
    await expect(input).not.toHaveAttribute("style");

    const results = page.locator(".pagefind-ui__results-area");
    const inputTop = (await input.boundingBox())!.y;
    const close = page.getByRole("button", { name: "Cancel", exact: true });
    const closeTop = width < 800 ? (await close.boundingBox())!.y : undefined;
    await results.evaluate((element) => (element.scrollTop = 150));
    expect(
      await results.evaluate((element) => element.scrollTop),
    ).toBeGreaterThan(0);
    expect((await input.boundingBox())!.y).toBeCloseTo(inputTop, 0);
    if (closeTop !== undefined) {
      const box = (await close.boundingBox())!;
      expect(box.y).toBeCloseTo(closeTop, 0);
      expect(box.width).toBe(box.height);
      const dialog = (await page.locator("site-search dialog").boundingBox())!;
      const pane = (await results.boundingBox())!;
      const field = (await input.boundingBox())!;
      const sideInset = field.x - dialog.x;
      const closeGap = field.y - box.y - box.height;
      const resultsGap = pane.y - field.y - field.height;
      expect(Math.abs(sideInset - closeGap)).toBeLessThan(2);
      expect(Math.abs(sideInset - resultsGap)).toBeLessThan(2);
      expect(Math.abs(pane.x - dialog.x)).toBeLessThan(2);
      expect(
        Math.abs(pane.x + pane.width - dialog.x - dialog.width),
      ).toBeLessThan(2);
      expect(
        Math.abs(pane.y + pane.height - dialog.y - dialog.height),
      ).toBeLessThan(2);
      expect(
        await results.evaluate(
          (element) => getComputedStyle(element).borderTopWidth,
        ),
      ).not.toBe("0px");
      const more = page.locator(".pagefind-ui__button");
      if (await more.isVisible()) {
        const button = (await more.boundingBox())!;
        const list = (await page
          .locator(".pagefind-ui__results")
          .boundingBox())!;
        expect(
          Math.abs(button.x + button.width - list.x - list.width),
        ).toBeLessThan(2);
      }
      await close.click();
      await expect(page.locator("site-search dialog")).not.toBeVisible();
    }
  });
}

test("header popovers fade on open and close", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 700 });
  await page.goto("/manual/");

  for (const option of [
    {
      trigger: page.getByRole("button", {
        name: "Documentation version: Current",
      }),
      panel: page.locator('[data-element="VersionSwitcher"] [popover]'),
      close: page.getByRole("button", {
        name: "Documentation version: Current",
      }),
    },
    {
      trigger: page.getByRole("button", { name: "Search", exact: true }),
      panel: page.locator("site-search dialog"),
      close: page.getByRole("button", { name: "Cancel", exact: true }),
    },
    {
      trigger: page.getByRole("button", { name: "More", exact: true }),
      panel: page.locator(".td-header-links__panel"),
      close: page.getByRole("button", {
        name: "Close more menu",
        exact: true,
      }),
    },
    {
      trigger: page.getByRole("button", { name: "Appearance", exact: true }),
      panel: page.locator(
        '[data-element="MobileTheme"] cookbook-appearance-menu [popover]',
      ),
      close: page.getByRole("button", { name: "Appearance", exact: true }),
    },
    {
      before: () => page.getByRole("button", { name: /Menu/ }).click(),
      trigger: page.locator("cookbook-sidebar-pane").getByRole("button", {
        name: "Select language: English",
      }),
      panel: page.locator(
        "cookbook-sidebar-pane cookbook-language-select [popover]",
      ),
      close: page.locator("cookbook-sidebar-pane").getByRole("button", {
        name: "Select language: English",
      }),
    },
  ]) {
    if ("before" in option) await option.before();
    const { trigger, panel, close } = option;
    await trigger.click();
    await expect(panel).toHaveAttribute("data-open", "");
    expect(
      await panel.evaluate((element) => getComputedStyle(element).transition),
    ).toContain("opacity 0.12s");
    await expect(panel).toHaveCSS("opacity", "1");
    await close.click();
    await expect(panel).not.toHaveAttribute("data-open");
    await expect(panel).toHaveCSS("display", "none");
  }
});

test("header popovers respect reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 390, height: 700 });
  await page.goto("/manual/");

  for (const option of [
    {
      trigger: page.getByRole("button", {
        name: "Documentation version: Current",
      }),
      panel: page.locator('[data-element="VersionSwitcher"] [popover]'),
      close: page.getByRole("button", {
        name: "Documentation version: Current",
      }),
    },
    {
      trigger: page.getByRole("button", { name: "Search", exact: true }),
      panel: page.locator("site-search dialog"),
      close: page.getByRole("button", { name: "Cancel", exact: true }),
    },
    {
      trigger: page.getByRole("button", { name: "More", exact: true }),
      panel: page.locator(".td-header-links__panel"),
      close: page.getByRole("button", {
        name: "Close more menu",
        exact: true,
      }),
    },
    {
      trigger: page.getByRole("button", { name: "Appearance", exact: true }),
      panel: page.locator(
        '[data-element="MobileTheme"] cookbook-appearance-menu [popover]',
      ),
      close: page.getByRole("button", { name: "Appearance", exact: true }),
    },
    {
      before: () => page.getByRole("button", { name: /Menu/ }).click(),
      trigger: page.locator("cookbook-sidebar-pane").getByRole("button", {
        name: "Select language: English",
      }),
      panel: page.locator(
        "cookbook-sidebar-pane cookbook-language-select [popover]",
      ),
      close: page.locator("cookbook-sidebar-pane").getByRole("button", {
        name: "Select language: English",
      }),
    },
  ]) {
    if ("before" in option) await option.before();
    const { trigger, panel, close } = option;
    await trigger.click();
    await expect(panel).toHaveCSS("transition-property", "none");
    await expect(panel).toHaveCSS("opacity", "1");
    await close.click();
    await expect(panel).toHaveCSS("display", "none");
  }
});

test("selection popovers dismiss on Escape and outside click", async ({
  page,
}) => {
  await page.goto("/manual/guide/");
  for (const { trigger, panel } of [
    {
      trigger: page.getByRole("button", {
        name: "Documentation version: Current",
      }),
      panel: page.locator('[data-element="VersionSwitcher"] [popover]'),
    },
    {
      trigger: page.getByRole("button", { name: "Appearance", exact: true }),
      panel: page.locator(
        '[data-element="Tools"] cookbook-appearance-menu [popover]',
      ),
    },
    {
      trigger: page.getByRole("button", { name: "Select language: English" }),
      panel: page.locator(
        '[data-element="Tools"] cookbook-language-select [popover]',
      ),
    },
  ]) {
    await trigger.click();
    await expect(panel).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(panel).toBeHidden();
    await trigger.click();
    await page.getByRole("heading", { name: "Update the site" }).click();
    await expect(panel).toBeHidden();
  }

  await page.setViewportSize({ width: 390, height: 844 });
  const more = page.getByRole("button", { name: "More", exact: true });
  const morePanel = page.locator(".td-header-links__panel");
  await more.click();
  await page.keyboard.press("Escape");
  await expect(morePanel).toBeHidden();
  await more.click();
  await page.getByRole("heading", { name: "Update the site" }).click();
  await expect(morePanel).toBeHidden();

  await page.getByRole("button", { name: /Menu/ }).click();
  const sidebar = page.locator("cookbook-sidebar-pane");
  const language = sidebar.getByRole("button", {
    name: "Select language: English",
  });
  const languagePanel = sidebar.locator("cookbook-language-select [popover]");
  await language.click();
  await page.keyboard.press("Escape");
  await expect(languagePanel).toBeHidden();
  await language.click();
  await page.mouse.click(380, 700);
  await expect(languagePanel).toBeHidden();
});

test("code group keyboard navigation and copying share the fence controls", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/manual/");
  await page.getByRole("tab", { name: "npm", exact: true }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(
    page.getByRole("tab", { name: "pnpm", exact: true }),
  ).toBeFocused();
  const panel = page.getByRole("tabpanel", { name: "pnpm", exact: true });
  await expect(panel).toBeVisible();
  await panel.getByRole("button", { name: "Copy code", exact: true }).click();
  await expect(
    panel.getByRole("button", { name: "Code copied", exact: true }),
  ).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    "pnpm add cookbook",
  );
  await page.getByRole("button", { name: "Copy page", exact: true }).click();
  await expect(page.getByText("Page copied", { exact: true })).toBeVisible();
});

const headingCases = [
  ...[320, 390, 768, 1024, 1440].map((width) => ({ site: "manual", width })),
  { site: "wide-logo", width: 320 },
  { site: "wide-logo", width: 1440 },
];
for (const { site, width } of headingCases) {
  test(`heading copy links align with text in ${site} at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(`/${site}/heading-links/`);
    const positions = await page
      .locator(".cookbook-heading-wrapper")
      .evaluateAll((wrappers) =>
        wrappers.map((wrapper) => {
          const heading = wrapper.firstElementChild!;
          const link = wrapper.querySelector<HTMLElement>(
            ".cookbook-anchor-link",
          )!;
          const icon = link.querySelector<HTMLElement>(
            ".cookbook-anchor-icon",
          )!;
          const text = document.createRange();
          text.selectNodeContents(heading);
          const lines = [...text.getClientRects()];
          const line =
            getComputedStyle(link).position === "relative"
              ? lines.at(-1)!
              : lines[0]!;
          const linkBox = link.getBoundingClientRect();
          const iconBox = icon.getBoundingClientRect();
          return {
            level: heading.tagName,
            lines: lines.length,
            iconFontSize: Number.parseFloat(getComputedStyle(icon).fontSize),
            iconHeight: iconBox.height,
            linkHeight: linkBox.height,
            centerOffset:
              (iconBox.top + iconBox.bottom - line.top - line.bottom) / 2,
          };
        }),
      );
    expect(positions).toHaveLength(12);
    expect(new Set(positions.map(({ level }) => level))).toEqual(
      new Set(["H1", "H2", "H3", "H4", "H5", "H6"]),
    );
    if (width <= 390)
      expect(positions.some(({ lines }) => lines > 1)).toBe(true);
    for (const position of positions) {
      expect(
        Math.abs(position.iconHeight - position.iconFontSize),
      ).toBeLessThan(0.5);
      expect(position.iconHeight).toBeLessThanOrEqual(
        position.linkHeight + 0.5,
      );
      expect(Math.abs(position.centerOffset)).toBeLessThan(4);
    }
  });
}

test("desktop contents follows the current section and keeps its link visible", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 600 });
  await page.goto("/manual/contents/");
  const contents = page.locator("cookbook-table-of-contents");
  const links = contents.locator('nav a[href^="#"]');
  const count = await links.count();
  expect(count).toBeGreaterThan(12);
  await expect(links.first()).toHaveAttribute("aria-current", "location");

  const sidebar = page.locator(".right-sidebar");
  const initialTop = (await sidebar.boundingBox())!.y;
  const middle = links.nth(Math.floor(count / 2));
  const middleHref = await middle.getAttribute("href");
  await page
    .locator(middleHref!)
    .evaluate((heading) => heading.scrollIntoView({ block: "start" }));
  await expect(middle).toHaveAttribute("aria-current", "location");
  await expect(links.first()).not.toHaveAttribute("aria-current");
  expect((await sidebar.boundingBox())!.y).toBeCloseTo(initialTop, 0);

  const last = links.last();
  const lastHref = await last.getAttribute("href");
  await page
    .locator(lastHref!)
    .evaluate((heading) => heading.scrollIntoView({ block: "start" }));
  await expect(last).toHaveAttribute("aria-current", "location");
  const position = await last.evaluate((link) => {
    const item = link.getBoundingClientRect();
    const sidebar = link.closest<HTMLElement>(".right-sidebar")!;
    const panel = sidebar.getBoundingClientRect();
    return {
      itemTop: item.top,
      itemBottom: item.bottom,
      panelTop: panel.top,
      panelBottom: panel.bottom,
      scrollTop: sidebar.scrollTop,
      scrollHeight: sidebar.scrollHeight,
    };
  });
  expect(position.scrollHeight).toBeGreaterThan(600);
  expect(position.itemTop).toBeGreaterThanOrEqual(position.panelTop - 1);
  expect(position.itemBottom).toBeLessThanOrEqual(position.panelBottom + 1);
});

for (const scheme of ["Light", "Dark"])
  for (const contrast of ["Normal", "High"]) {
    test(`accessible ${scheme} / ${contrast}`, async ({ page }, testInfo) => {
      await page.goto("/manual/guide/");
      await page
        .getByRole("button", { name: "Appearance", exact: true })
        .click();
      await page.getByRole("radio", { name: scheme, exact: true }).focus();
      await page.keyboard.press("Space");
      await page.getByRole("radio", { name: contrast, exact: true }).focus();
      await page.keyboard.press("Space");
      await page.keyboard.press("Escape");
      await expect(page.locator("html")).toHaveAttribute(
        "data-theme",
        scheme.toLowerCase(),
      );
      const logo = await page
        .locator('[data-element="Header"] [data-element="Logo"]')
        .evaluate((e) => ({
          background: getComputedStyle(e).color,
          mark: getComputedStyle(e.querySelector('[data-element="Mark"]')!)
            .color,
        }));
      // Glaze emits OKLCH: fixed logo colors retain a light book on a darker brand fill.
      const lightness = (color: string) =>
        Number(color.match(/^oklch\(([\d.]+)/)![1]);
      expect(lightness(logo.mark)).toBeGreaterThan(lightness(logo.background));
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();
      expect(results.violations).toEqual([]);
      expect(await page.locator("[style]").count()).toBe(0);
      if (scheme === "Light" && contrast === "Normal")
        await page.screenshot({
          path: testInfo.outputPath("desktop.png"),
          fullPage: true,
        });
    });
  }

test("hero image follows the selected appearance", async ({ page }) => {
  await page.goto("/manual/");
  const darkImage = page.locator('.hero > img[data-hero-image="dark"]');
  const lightImage = page.locator('.hero > img[data-hero-image="light"]');
  await page.getByRole("button", { name: "Appearance", exact: true }).click();
  await page.getByRole("radio", { name: "Dark", exact: true }).focus();
  await page.keyboard.press("Space");
  await expect(darkImage).toBeVisible();
  await expect(lightImage).toBeHidden();
  await page.getByRole("radio", { name: "Light", exact: true }).focus();
  await page.keyboard.press("Space");
  await expect(darkImage).toBeHidden();
  await expect(lightImage).toBeVisible();
});

for (const width of [320, 390, 768]) {
  test(`mobile navigation, full-width divider and controls at ${width}px`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/manual/");
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBe(width);
    const menu = page.getByRole("button", { name: /Menu/ });
    await menu.click();
    const close = page.getByRole("button", {
      name: "Close navigation",
      exact: true,
    });
    await expect(close).toBeFocused();
    expect(await close.evaluate((e) => getComputedStyle(e).borderRadius)).toBe(
      "999px",
    );
    await page.keyboard.press("Escape");
    await expect(menu).toBeFocused();
    const summary = page.locator("cookbook-mobile-toc summary");
    await summary.click();
    await page.locator('cookbook-mobile-toc a[href="#maintenance"]').click();
    await expect(page.locator("#maintenance")).toBeFocused();
    await expect(
      page.locator("cookbook-mobile-toc details"),
    ).not.toHaveAttribute("open");
    const hero = await page.locator(".hero > img:visible").boundingBox();
    expect(hero!.width / hero!.height).toBeCloseTo(3, 1);
    const divider = await page.locator(".td-menu-button").boundingBox();
    expect(divider!.x).toBe(0);
    expect(divider!.width).toBe(width);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(results.violations).toEqual([]);
    if (width === 390) {
      await page.goto("/manual/");
      await page.screenshot({
        path: testInfo.outputPath("mobile.png"),
        fullPage: true,
      });
    }
  });
}

test("locale/version navigation keeps prefixes and drafts remain direct-only", async ({
  page,
}) => {
  await page.goto("/manual/fr/v1/guide/");
  await expect(page).toHaveTitle("Ancien guide | Browser fixture");
  expect(
    await page.locator('meta[name="robots"]').getAttribute("content"),
  ).toContain("noindex");
  await page.goto("/manual/guide/");
  await page.getByRole("link", { name: "Direct draft", exact: true }).click();
  await expect(page).toHaveURL(/\/manual\/draft\/?$/);
  await expect(
    page.getByRole("heading", { name: "Draft", exact: true }),
  ).toBeVisible();
  expect(
    await page.locator('meta[name="robots"]').getAttribute("content"),
  ).toContain("noindex");
  expect(
    await page.locator('cookbook-sidebar a[href="/manual/draft"]').count(),
  ).toBe(0);
});

test("version popover dismisses and switches matching pages on desktop and mobile", async ({
  page,
}) => {
  await page.goto("/manual/guide/");
  const switcher = page.locator('[data-element="VersionSwitcher"]');
  const trigger = switcher.getByRole("button", {
    name: "Documentation version: Current",
  });
  const panel = switcher.locator("[popover]");
  await expect(panel).toBeHidden();
  await trigger.click();
  await expect(panel).toHaveCSS("opacity", "1");
  await expect(panel.getByRole("link", { name: "Current" })).toHaveAttribute(
    "aria-current",
    "page",
  );
  await page.keyboard.press("Tab");
  await expect(panel.getByRole("link", { name: "Current" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(panel).toBeHidden();

  await trigger.click();
  await page.getByRole("heading", { name: "Update the site" }).click();
  await expect(panel).toBeHidden();
  await trigger.click();
  await panel.getByRole("link", { name: "v1" }).click();
  await expect(page).toHaveURL(/\/manual\/v1\/guide\/?$/);
  await expect(
    switcher.getByRole("button", { name: "Documentation version: v1" }),
  ).toBeVisible();

  await page.setViewportSize({ width: 390, height: 844 });
  await switcher
    .getByRole("button", { name: "Documentation version: v1" })
    .click();
  await expect(panel).toHaveCSS("opacity", "1");
  const placement = await switcher.evaluate((root) => {
    const panel = root.querySelector("[popover]")!.getBoundingClientRect();
    const trigger = root.querySelector("button")!.getBoundingClientRect();
    return {
      left: panel.left,
      right: panel.right,
      top: panel.top,
      triggerBottom: trigger.bottom,
    };
  });
  expect(placement.left).toBeGreaterThanOrEqual(0);
  expect(placement.right).toBeLessThanOrEqual(390);
  expect(placement.top).toBeGreaterThan(placement.triggerBottom);
  await panel.getByRole("link", { name: "Current" }).click();
  await expect(page).toHaveURL(/\/manual\/guide\/?$/);

  await page.goto("/manual/fr/guide/");
  await switcher
    .getByRole("button", { name: "Version de la documentation: Current" })
    .click();
  await panel.getByRole("link", { name: "v1" }).click();
  await expect(page).toHaveURL(/\/manual\/fr\/v1\/guide\/?$/);
});

test("language popover is styled and switches pages on desktop and mobile", async ({
  page,
}) => {
  await page.goto("/manual/guide/");
  const desktop = page.locator(
    '[data-element="Tools"] cookbook-language-select',
  );
  await desktop
    .getByRole("button", { name: "Select language: English" })
    .click();
  const panel = desktop.locator("[popover]");
  await expect(panel).toHaveCSS("opacity", "1");
  await expect(panel.getByRole("link", { name: "English" })).toHaveAttribute(
    "aria-current",
    "page",
  );
  expect(
    await desktop
      .locator(".label-icon")
      .evaluate((icon) => Math.round(icon.getBoundingClientRect().width)),
  ).toBe(20);
  await page.keyboard.press("Tab");
  await expect(panel.getByRole("link", { name: "English" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(panel).toBeHidden();

  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: /Menu/ }).click();
  const mobile = page.locator("cookbook-sidebar-pane cookbook-language-select");
  await mobile
    .getByRole("button", { name: "Select language: English" })
    .click();
  await expect(mobile.locator("[popover]")).toHaveCSS("opacity", "1");
  const placement = await mobile.evaluate((root) => {
    const panel = root.querySelector("[popover]")!.getBoundingClientRect();
    const trigger = root.querySelector("button")!.getBoundingClientRect();
    const sidebar = document
      .querySelector("#cookbook__sidebar")!
      .getBoundingClientRect();
    return {
      left: panel.left,
      right: panel.right,
      bottom: panel.bottom,
      sidebarLeft: sidebar.left,
      sidebarRight: sidebar.right,
      triggerTop: trigger.top,
    };
  });
  expect(placement.left).toBeGreaterThanOrEqual(placement.sidebarLeft);
  expect(placement.right).toBeLessThanOrEqual(placement.sidebarRight);
  expect(placement.bottom).toBeLessThan(placement.triggerTop);
  await mobile.getByRole("link", { name: "Français" }).click();
  await expect(page).toHaveURL(/\/manual\/fr\/guide\/?$/);
});

test("footer credit keeps its space and pagination uses heading weight", async ({
  page,
}) => {
  await page.goto("/manual/guide/");
  const credit = page.locator('[data-element="Credit"]');
  await expect(credit).toHaveText("Generated with Cookbook.");
  const gap = await credit.evaluate((element) => {
    const label = element.firstChild!;
    const range = document.createRange();
    range.setStart(label, 0);
    range.setEnd(label, label.textContent!.trimEnd().length);
    return (
      element.querySelector("a")!.getBoundingClientRect().left -
      range.getBoundingClientRect().right
    );
  });
  expect(gap).toBeGreaterThan(2);
  const heading = await page
    .locator(".cookbook-markdown-content h2")
    .first()
    .evaluate((e) => ({
      weight: getComputedStyle(e).fontWeight,
      color: getComputedStyle(e).color,
    }));
  const title = await page
    .locator(".pagination-links .link-title")
    .first()
    .evaluate((e) => ({
      weight: getComputedStyle(e).fontWeight,
      color: getComputedStyle(e).color,
    }));
  expect(title).toEqual(heading);
});

test("pagination keeps Next first in keyboard order across layouts", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/manual/guide/");
  const links = page.locator(".pagination-links > a");
  await expect(links).toHaveCount(2);
  await expect(links.nth(0)).toHaveAttribute("rel", "next");
  await expect(links.nth(1)).toHaveAttribute("rel", "prev");
  expect((await links.nth(0).boundingBox())!.y).toBeLessThan(
    (await links.nth(1).boundingBox())!.y,
  );
  await links.nth(0).focus();
  await page.keyboard.press("Tab");
  await expect(links.nth(1)).toBeFocused();
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(links.nth(0)).toHaveAttribute("rel", "next");
  await expect(links.nth(1)).toHaveAttribute("rel", "prev");
  const next = (await links.nth(0).boundingBox())!;
  const previous = (await links.nth(1).boundingBox())!;
  expect(previous.x).toBeLessThan(next.x);
  expect(previous.y).toBe(next.y);
  await links.nth(0).focus();
  await page.keyboard.press("Tab");
  await expect(links.nth(1)).toBeFocused();
  await page.emulateMedia({ media: "print" });
  await expect(page.locator(".pagination-links")).toBeHidden();
});

for (const width of [390, 1440]) {
  test(`single-line code copy has equal card insets at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/manual/");
    const block = page
      .getByRole("tabpanel", { name: "npm", exact: true })
      .locator(".td-code-block");
    const pre = (await block.locator("pre").boundingBox())!;
    const button = (await block
      .getByRole("button", { name: "Copy code", exact: true })
      .boundingBox())!;
    const top = button.y - pre.y;
    const right = pre.x + pre.width - button.x - button.width;
    const bottom = pre.y + pre.height - button.y - button.height;
    expect(Math.abs(top - right)).toBeLessThan(0.1);
    expect(Math.abs(top - bottom)).toBeLessThan(0.1);
    await page.goto("/manual/guide/");
    const fence = page.locator(".td-code-block").last();
    const card = (await fence.locator("pre").boundingBox())!;
    const copy = (await fence.locator("[data-copy-code]").boundingBox())!;
    expect(
      Math.abs(copy.y - card.y - (card.y + card.height - copy.y - copy.height)),
    ).toBeLessThan(0.1);
  });
}

for (const variant of ["manual", "wide-logo", "tall-logo"]) {
  for (const width of [320, 390, 1440]) {
    test(`${variant} logo stays centered with its title at ${width}px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`/${variant}/guide/`);
      await page.evaluate(() => document.fonts.ready);
      const logo = (await page
        .locator('[data-element="Header"] [data-element="LogoLink"] > span')
        .boundingBox())!;
      const title = (await page.locator(".site-title").boundingBox())!;
      expect(
        Math.abs(logo.y + logo.height / 2 - title.y - title.height / 2),
      ).toBeLessThan(0.5);
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth),
      ).toBe(width);
      if (variant !== "manual") {
        expect(
          await page
            .locator(".site-title")
            .evaluate((e) => getComputedStyle(e).fontSize),
        ).toBe(width < 1440 ? "22px" : "28px");
        const artwork = (await page
          .locator(
            '[data-element="Header"] [data-element="SiteLogo"] img:visible',
          )
          .boundingBox())!;
        expect(artwork.width / artwork.height).toBeCloseTo(
          variant === "wide-logo" ? 3 : 1 / 3,
          1,
        );
        expect(
          Math.abs(artwork.y + artwork.height / 2 - title.y - title.height / 2),
        ).toBeLessThan(0.5);
        const fence = page.locator(".td-code-block").last();
        const card = (await fence.locator("pre").boundingBox())!;
        const copy = (await fence.locator("[data-copy-code]").boundingBox())!;
        expect(
          Math.abs(
            copy.y - card.y - (card.y + card.height - copy.y - copy.height),
          ),
        ).toBeLessThan(0.1);
      }
      if (width < 1440) {
        await page.getByRole("button", { name: /Menu/ }).click();
        const home = page.locator(".td-sidebar-heading__home");
        const mark = (await home
          .locator('[data-element="Logo"], [data-element="SiteLogo"]')
          .boundingBox())!;
        const label = (await home.locator("[data-site-title]").boundingBox())!;
        expect(
          Math.abs(mark.y + mark.height / 2 - label.y - label.height / 2),
        ).toBeLessThan(0.5);
      }
    });
  }
}
