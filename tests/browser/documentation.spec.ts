import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

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
      expect(position.iconHeight).toBeLessThan(position.linkHeight);
      expect(Math.abs(position.centerOffset)).toBeLessThan(3);
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
        .locator('.td-header__logo[data-tasty-anatomy="Logo"]')
        .evaluate((e) => ({
          background: getComputedStyle(e).color,
          mark: getComputedStyle(e.querySelector(".td-logo__mark")!).color,
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

test("footer credit keeps its space and pagination uses heading weight", async ({
  page,
}) => {
  await page.goto("/manual/guide/");
  const credit = page.locator(".td-footer__credit");
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
      const logo = (await page.locator(".td-header__logo").boundingBox())!;
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
          .locator(".td-header__logo img")
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
          .locator(
            '[data-tasty-anatomy="Logo"], [data-tasty-anatomy="SiteLogo"]',
          )
          .boundingBox())!;
        const label = (await home.locator("[data-site-title]").boundingBox())!;
        expect(
          Math.abs(mark.y + mark.height / 2 - label.y - label.height / 2),
        ).toBeLessThan(0.5);
      }
    });
  }
}
