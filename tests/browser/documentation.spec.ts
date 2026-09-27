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
    const hero = await page.getByAltText("Documentation preview").boundingBox();
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
