import { test, expect } from "@playwright/test";

test("the first click loads the router while keeping the outgoing page visible", async ({
  page,
}) => {
  await page.goto("/manual/guide/");
  expect(await page.evaluate(() => history.scrollRestoration)).toBe("auto");
  await page
    .locator('cookbook-table-of-contents a[href="#update-the-site"]')
    .click();
  await expect(page).toHaveURL(/#update-the-site$/);
  expect(await page.evaluate(() => history.scrollRestoration)).toBe("auto");
  await page.evaluate(() =>
    Object.assign(window, { originalDocument: document }),
  );
  let release!: () => void;
  const ready = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route("**/_astro/*.js", async (route) => {
    await ready;
    await route.continue();
  });
  const requested = page.waitForRequest(
    (request) => request.resourceType() === "script",
  );
  await page
    .locator('cookbook-sidebar a[href="/manual/contents"]')
    .evaluate((link: HTMLAnchorElement) => link.click());
  await requested;
  await expect(page).toHaveURL(/\/manual\/guide\/?#update-the-site$/);
  await expect(
    page.getByRole("heading", { name: "Guide", exact: true }),
  ).toBeVisible();
  release();
  await expect(page).toHaveURL(/\/manual\/contents\/?$/);
  expect(
    await page.evaluate(() => (window as any).originalDocument === document),
  ).toBe(true);
});

test("a failed router download falls back to native document navigation", async ({
  page,
}) => {
  await page.goto("/manual/guide/");
  await page.evaluate(() =>
    Object.assign(window, { originalDocument: document }),
  );
  await page.route("**/_astro/*.js", (route) => route.abort());
  await page
    .locator('cookbook-sidebar a[href="/manual/contents"]')
    .evaluate((link: HTMLAnchorElement) => link.click());
  await expect(page).toHaveURL(/\/manual\/contents\/?$/);
  await expect(
    page.getByRole("heading", { name: "Contents tracking", exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(() => (window as any).originalDocument === document),
  ).toBe(false);
});

test("navigation keeps the document and sidebar scroll while resetting article scroll", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 360 });
  await page.goto("/manual/guide/");
  const before = await page.evaluate(() => {
    const sidebar = document.querySelector<HTMLElement>("#cookbook__sidebar")!;
    sidebar.scrollTop = 100;
    window.scrollTo(0, 500);
    Object.assign(window, {
      originalDocument: document,
      originalSearch: document.querySelector("site-search"),
    });
    return { sidebar: sidebar.scrollTop, content: scrollY };
  });
  expect(before.sidebar).toBeGreaterThan(0);
  expect(before.content).toBeGreaterThan(0);
  await page
    .locator('cookbook-sidebar a[href="/manual/contents"]')
    .evaluate((link: HTMLAnchorElement) => link.click());
  await expect(page).toHaveURL(/\/manual\/contents\/?$/);
  await expect(page.locator("#main-content")).toBeFocused();
  const after = await page.evaluate(() => ({
    sidebar: document.querySelector("#cookbook__sidebar")!.scrollTop,
    content: scrollY,
    document: (window as any).originalDocument === document,
    search:
      (window as any).originalSearch === document.querySelector("site-search"),
  }));
  expect(after).toEqual({
    sidebar: before.sidebar,
    content: 0,
    document: true,
    search: true,
  });
  await expect(
    page.locator('cookbook-sidebar [aria-current="page"]'),
  ).toHaveAttribute("href", "/manual/contents");
  await page.evaluate(() => window.scrollTo(0, 600));
  await page.goBack();
  await expect(page).toHaveURL(/\/manual\/guide\/?$/);
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
  await page.goForward();
  await expect(page).toHaveURL(/\/manual\/contents\/?$/);
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
});

test("saved appearance is correct before delayed modules and survives every swap", async ({
  page,
}) => {
  await page.addInitScript(() => {
    localStorage.setItem("cookbook-theme", "light");
    localStorage.setItem("cookbook-appearance", '{"contrast":"more"}');
    Object.assign(window, { paintedSchemes: [] });
    const record = () => {
      if (document.body)
        (window as any).paintedSchemes.push({
          scheme: document.documentElement.dataset.theme,
          contrast: document.documentElement.dataset.contrast,
        });
      requestAnimationFrame(record);
    };
    requestAnimationFrame(record);
  });
  await page.route("**/_astro/*.js", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 250));
    await route.continue();
  });
  await page.goto("/manual/guide/");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.getByRole("link", { name: "Start", exact: true }).click();
  await expect(page).toHaveURL(/\/manual\/$/);
  await expect(
    page.getByRole("tab", { name: "npm", exact: true }),
  ).toBeVisible();
  const schemes = await page.evaluate(() => (window as any).paintedSchemes);
  expect(schemes.length).toBeGreaterThan(0);
  expect(
    schemes.every(
      (sample: { scheme: string; contrast: string }) =>
        sample.scheme === "light" && sample.contrast === "more",
    ),
  ).toBe(true);
  expect(await page.locator("[style]").count()).toBe(0);
  expect(await page.locator("style").count()).toBe(0);
});

test("search preserves its query and engine, closes on results, and refreshes on language changes", async ({
  page,
}) => {
  await page.goto("/manual/guide/");
  await page.keyboard.press("Control+k");
  const input = page.locator("[data-search-input]");
  await input.fill("maintenance");
  const result = page.locator("[data-search-results] a").first();
  await expect(result).toBeVisible();
  await result.click();
  await expect(page).toHaveURL(/\/manual\/(#.*)?$/);
  await expect(page.locator("site-search dialog")).not.toBeVisible();
  await page.keyboard.press("Control+k");
  await expect(input).toHaveValue("maintenance");
  await expect(result).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator("site-search dialog")).not.toBeVisible();
  await page
    .getByRole("navigation", { name: "Header links" })
    .getByRole("link", { name: "Guide", exact: true })
    .click();
  await expect(page).toHaveURL(/\/manual\/guide\/?$/);
  await page
    .locator("[data-element=Tools] cookbook-language-select button")
    .click();
  await page
    .locator("[data-element=Tools] cookbook-language-select")
    .getByRole("link", { name: "Français" })
    .click();
  await expect(page).toHaveURL(/\/manual\/fr\/guide\/?$/);
  await page.keyboard.press("Control+k");
  await expect(page.locator("site-search dialog")).toBeVisible();
  await expect(input).toHaveValue("");
  await expect(page.locator("site-search dialog")).toHaveCount(1);
});

test("native document navigation remains available with reload links and without JavaScript", async ({
  page,
  browser,
}) => {
  await page.goto("/manual/guide/");
  await page.evaluate(() => {
    Object.assign(window, { originalDocument: document });
    document
      .querySelector('cookbook-sidebar a[href="/manual/contents"]')!
      .setAttribute("data-astro-reload", "");
  });
  await page.locator('cookbook-sidebar a[href="/manual/contents"]').click();
  await expect(page).toHaveURL(/\/manual\/contents\/?$/);
  expect(
    await page.evaluate(() => (window as any).originalDocument === document),
  ).toBe(false);
  const context = await browser.newContext({ javaScriptEnabled: false });
  const native = await context.newPage();
  await native.goto("http://127.0.0.1:4350/manual/guide/");
  await native.locator('cookbook-sidebar a[href="/manual/contents"]').click();
  await expect(native).toHaveURL(/\/manual\/contents\/?$/);
  await expect(
    native.getByRole("heading", { name: "Contents tracking", exact: true }),
  ).toBeVisible();
  await context.close();
});

test("sidebar disclosures survive swaps and navigation sections stay independent", async ({
  page,
}) => {
  await page.goto("/client-navigation/guide/");
  const examples = page
    .locator("cookbook-sidebar details")
    .filter({ has: page.locator("summary", { hasText: "Examples" }) })
    .last();
  const started = page
    .locator("cookbook-sidebar details")
    .filter({ has: page.locator("summary", { hasText: "Getting started" }) })
    .last();
  await expect(started).toHaveAttribute("open");
  await expect(examples).not.toHaveAttribute("open");
  await examples.locator(":scope > summary").click();
  await expect(examples).toHaveAttribute("open");
  await page
    .locator('cookbook-sidebar a[href="/client-navigation/contents"]')
    .click();
  await expect(page).toHaveURL(/\/client-navigation\/contents\/?$/);
  await expect(examples).toHaveAttribute("open");
  await expect(started).toHaveAttribute("open");
  await page
    .locator('[data-element=TopNavigation] a[href="/client-navigation/v1"]')
    .click();
  await expect(page).toHaveURL(/\/client-navigation\/v1\/?$/);
  await expect(
    page.locator('cookbook-sidebar a[href="/client-navigation/contents"]'),
  ).toHaveCount(0);
  await page
    .locator('[data-element=TopNavigation] a[href="/client-navigation/guide"]')
    .click();
  await expect(page).toHaveURL(/\/client-navigation\/guide\/?$/);
  await expect(examples).toHaveAttribute("open");
});

test("fragment links keep their destination and newly swapped controls initialize", async ({
  page,
}) => {
  await page.goto("/manual/guide/");
  await page.evaluate(() => {
    document.addEventListener(
      "astro:after-swap",
      () => {
        // Observe after synchronous swap listeners, before the next paint.
        queueMicrotask(() =>
          Object.assign(window, {
            tabsAtSwap: {
              tabs: document.querySelectorAll('[role="tab"]').length,
              panels: document.querySelectorAll(
                '[role="tabpanel"]:not([hidden])',
              ).length,
            },
          }),
        );
      },
      { once: true },
    );
  });
  await page.getByRole("link", { name: "Start", exact: true }).click();
  await expect(page).toHaveURL(/\/manual\/$/);
  expect(await page.evaluate(() => (window as any).tabsAtSwap)).toEqual({
    tabs: 2,
    panels: 1,
  });
  await page.getByRole("tab", { name: "pnpm", exact: true }).click();
  await expect(
    page.getByRole("tabpanel", { name: "pnpm", exact: true }),
  ).toBeVisible();
  await page
    .locator('cookbook-table-of-contents a[href="#maintenance"]')
    .click();
  await expect(page).toHaveURL(/#maintenance$/);
  expect(await page.evaluate(() => scrollY)).toBeGreaterThan(0);
  await page.getByRole("link", { name: "Start", exact: true }).click();
  await expect(page).toHaveURL(/\/manual\/$/);
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
  await page.goBack();
  await expect(page).toHaveURL(/#maintenance$/);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(0);
});

test("client navigation works with replaced Head and Header and without view transitions", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(document, "startViewTransition", {
      value: undefined,
    });
    localStorage.setItem("cookbook-theme", "light");
  });
  await page.goto("/custom-header/guide/");
  await page.evaluate(() =>
    Object.assign(window, { originalDocument: document }),
  );
  await page
    .locator('cookbook-sidebar a[href="/custom-header/contents"]')
    .click();
  await expect(page).toHaveURL(/\/custom-header\/contents\/?$/);
  expect(
    await page.evaluate(() => (window as any).originalDocument === document),
  ).toBe(true);
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(page.locator("[data-custom-header]")).toBeVisible();
  await expect(page.locator(".astro-route-announcer")).toHaveCSS(
    "position",
    "absolute",
  );
});

test("mobile navigation closes and releases inert content after a page swap", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/manual/guide/");
  await page.getByRole("button", { name: /Menu/ }).click();
  await page.locator('cookbook-sidebar a[href="/manual/contents"]').click();
  await expect(page).toHaveURL(/\/manual\/contents\/?$/);
  await expect(page.locator("#cookbook__sidebar")).not.toBeVisible();
  await expect(page.locator("#main-content")).toBeFocused();
  expect(await page.locator("[inert]").count()).toBe(0);
  await page.getByRole("button", { name: /Menu/ }).click();
  await expect(page.locator("#cookbook__sidebar")).toBeVisible();
});
