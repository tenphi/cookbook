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
  const code = page.locator(".td-code-block").first();
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
  await expect(
    page.locator('[data-tasty-anatomy="Callout"]').first(),
  ).toHaveCSS("margin-block-start", "24px");
  const heading = page.locator(".cookbook-heading-wrapper.level-h2").nth(1);
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
  await page.evaluate(() => {
    const hero = document.querySelector(".hero")!;
    for (const variant of ["primary", "secondary", "minimal"]) {
      const action = document.createElement("a");
      action.className = `cookbook-link-button ${variant}`;
      action.textContent = variant;
      hero.append(action);
    }
  });
  for (const variant of ["primary", "secondary"]) {
    const action = page.locator(`.hero .cookbook-link-button.${variant}`);
    await expect(action).toHaveCSS("border-top-width", "3px");
    await expect(action).toHaveCSS("border-top-style", "dashed");
  }
  await expect(page.locator(".hero .cookbook-link-button.minimal")).toHaveCSS(
    "border-top-width",
    "0px",
  );
});

test("button descendants inherit the shared theme and own their overrides", async ({
  page,
}) => {
  await page.goto("/manual/guide/");
  const search = page.locator('[data-tasty-anatomy="SearchButton"]');
  await expect(search).toBeVisible();
  await expect(search).toHaveCSS("gap", "11px");
  await expect(search).toHaveCSS("min-block-size", "0px");
  await page.setViewportSize({ width: 390, height: 844 });
  const menu = page.locator('[data-tasty-anatomy="MobileMenuToggle"]');
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
    page.locator('[data-tasty-anatomy="Callout"]').first(),
  ).toHaveCSS("margin-block-end", "16px");
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

test("Markdown warning alerts use registered warning colors in every appearance", async ({
  page,
}) => {
  await page.goto("/manual/guide/");
  const caution = page.locator(".cookbook-alert--caution");
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
