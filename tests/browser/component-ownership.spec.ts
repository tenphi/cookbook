import { expect, test } from "@playwright/test";

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
  await expect(page.locator(".header")).toHaveCSS("position", "fixed");
  await expect(page.locator(".cookbook-banner a")).toHaveText("the home page");
  await expect(page.locator(".cookbook-banner")).toHaveCSS(
    "text-align",
    "center",
  );
  await expect(page.locator(".pagination-links a").first()).toHaveCSS(
    "border-radius",
    "13px",
  );
  await expect(page.locator("cookbook-sidebar a").first()).toHaveCSS(
    "padding",
    "8px",
  );
  await expect(
    page.locator(".cookbook-markdown-content blockquote").first(),
  ).toHaveCSS("padding-inline-start", "29px");
  await expect(page.locator(".cookbook-anchor-link").first()).toHaveCSS(
    "display",
    "grid",
  );
  await expect(
    page.locator(".td-code-block [data-copy-code]").first(),
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
    await expect(page.locator(".pagination-links a").first()).toHaveCSS(
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
  await expect(group.locator(".cookbook-markdown-content")).toHaveCount(0);
  await expect(group.locator("pre")).toHaveCSS("border-radius", "17px");
  await expect(group.locator("[data-copy-code]")).toHaveCSS(
    "position",
    "absolute",
  );
  await expect(group.locator(".td-code-block")).toHaveCSS(
    "position",
    "relative",
  );
  const keyword = group.locator(".td-syntax-keyword").first();
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
  await expect(
    page.locator(".td-code-block [data-copy-code]").first(),
  ).toHaveCSS("margin", "0px");
  const link = page.locator(".cookbook-anchor-link").first();
  const textMuted = await page.evaluate(() =>
    getComputedStyle(document.documentElement)
      .getPropertyValue("--text-muted-color")
      .trim(),
  );
  await expect(link).toHaveCSS("color", textMuted);
});

for (const systemScheme of ["light", "dark"] as const) {
  test(`scheme aliases honor explicit choices over system ${systemScheme}`, async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: systemScheme });
    await page.goto("/wide-logo/");
    const darkHero = page.locator('.hero > img[data-hero-image="dark"]');
    const lightHero = page.locator('.hero > img[data-hero-image="light"]');
    const darkLogo = page.locator(".td-site-logo__dark").first();
    const lightLogo = page.locator(".td-site-logo__light").first();
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
