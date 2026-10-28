import { test, expect, type Locator, type Page } from "@playwright/test";

// Overlay behavior that must survive moving overlays to UniAria's elements.

const openOverlays = (page: Page) =>
  page.evaluate(
    () => document.querySelectorAll(":popover-open, dialog[open]").length,
  );

const isOpen = (element: Locator) =>
  element.evaluate((node) => node.matches(":popover-open"));

async function openFromKeyboard(page: Page, trigger: Locator) {
  await trigger.focus();
  await page.keyboard.press("Enter");
}

test("header popovers return focus to their trigger after Escape", async ({
  page,
}) => {
  await page.goto("/manual/guide/");
  const tools = page.locator("[data-element=Tools]");
  for (const { trigger, panel } of [
    {
      trigger: tools.getByRole("button", { name: "Appearance", exact: true }),
      panel: tools.locator("cookbook-appearance-menu [popover]"),
    },
    {
      trigger: tools.getByRole("button", { name: "Select language: English" }),
      panel: tools.locator("cookbook-language-select [popover]"),
    },
    {
      trigger: page.getByRole("button", {
        name: "Documentation version: Current",
      }),
      panel: page.locator('[data-element="VersionSwitcher"] [popover]'),
    },
  ]) {
    await openFromKeyboard(page, trigger);
    await expect(panel).toBeVisible();
    // WebKit's Tab skips buttons and links, so move focus in directly.
    await panel.locator("input:checked, a").first().focus();
    await page.keyboard.press("Escape");
    await expect(panel).toBeHidden();
    await expect(trigger).toBeFocused();
  }
});

test.describe("narrow screens", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("More returns focus to its trigger after Escape and its close button", async ({
    page,
  }) => {
    await page.goto("/manual/");
    const trigger = page.getByRole("button", { name: "More", exact: true });
    const panel = page.locator("cookbook-header-links > [data-element=Panel]");
    const close = panel.getByRole("button", {
      name: "Close more menu",
      exact: true,
    });

    // WebKit's Tab skips buttons and links, so move focus in directly.
    await openFromKeyboard(page, trigger);
    await expect(panel).toBeVisible();
    await close.focus();
    await page.keyboard.press("Escape");
    await expect(panel).toBeHidden();
    await expect(trigger).toBeFocused();

    await openFromKeyboard(page, trigger);
    await expect(panel).toBeVisible();
    await close.focus();
    await page.keyboard.press("Enter");
    await expect(panel).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test("the drawer returns focus to the menu button after its close button", async ({
    page,
  }) => {
    await page.goto("/manual/");
    const menu = page.getByRole("button", { name: /Menu/ });
    const drawer = page.locator("#cookbook__sidebar");
    await openFromKeyboard(page, menu);
    const close = drawer.getByRole("button", {
      name: "Close navigation",
      exact: true,
    });
    await expect(close).toBeFocused();
    await page.keyboard.press("Enter");
    await expect.poll(() => isOpen(drawer)).toBe(false);
    await expect(menu).toBeFocused();
  });

  test("Escape closes the drawer's language select before the drawer", async ({
    page,
  }) => {
    await page.goto("/manual/");
    const menu = page.getByRole("button", { name: /Menu/ });
    const drawer = page.locator("#cookbook__sidebar");
    await menu.click();
    // The drawer focuses its close button once open; start after that.
    await expect(
      drawer.getByRole("button", { name: "Close navigation", exact: true }),
    ).toBeFocused();
    const language = drawer.getByRole("button", {
      name: "Select language: English",
    });
    const panel = drawer.locator("cookbook-language-select [popover]");

    await openFromKeyboard(page, language);
    await expect(panel).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(panel).toBeHidden();
    expect(await isOpen(drawer)).toBe(true);
    await expect(language).toBeFocused();

    await page.keyboard.press("Escape");
    await expect.poll(() => isOpen(drawer)).toBe(false);
    await expect(menu).toBeFocused();
  });

  test("Escape closes the drawer's section switcher before the drawer", async ({
    page,
  }) => {
    await page.goto("/client-navigation/guide/");
    const menu = page.getByRole("button", { name: /Menu/ });
    const drawer = page.locator("#cookbook__sidebar");
    await menu.click();
    await expect(
      drawer.getByRole("button", { name: "Close navigation", exact: true }),
    ).toBeFocused();
    const sections = drawer.locator("[data-element=MobileNavigationTabs]");
    const trigger = sections.getByRole("button", { name: "Choose section" });
    const panel = sections.locator("[popover]");
    await trigger.click();
    await expect(panel).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(panel).toBeHidden();
    expect(await isOpen(drawer)).toBe(true);
    await expect(trigger).toBeFocused();

    await page.keyboard.press("Escape");
    await expect.poll(() => isOpen(drawer)).toBe(false);
    await expect(menu).toBeFocused();
  });

  test("More closes on navigation and opens again on the next page", async ({
    page,
  }) => {
    await page.goto("/manual/");
    const trigger = page.getByRole("button", { name: "More", exact: true });
    const panel = page.locator("cookbook-header-links > [data-element=Panel]");
    await trigger.click();
    await panel.getByRole("link", { name: "Guide", exact: true }).click();
    await expect(page).toHaveURL(/\/manual\/guide\/?$/);
    expect(await openOverlays(page)).toBe(0);
    await trigger.click();
    await expect(panel).toBeVisible();
  });
});

test("link popovers close on navigation and open again on the next page", async ({
  page,
}) => {
  await page.goto("/manual/guide/");
  const language = page.locator(
    "[data-element=Tools] cookbook-language-select",
  );
  await language.locator("button").click();
  await language.getByRole("link", { name: "Français" }).click();
  await expect(page).toHaveURL(/\/manual\/fr\/guide\/?$/);
  expect(await openOverlays(page)).toBe(0);
  await language.locator("button").click();
  await expect(language.locator("[popover]")).toBeVisible();
  await page.keyboard.press("Escape");

  const version = page.locator('[data-element="VersionSwitcher"]');
  await version.locator("button").click();
  await version.getByRole("link", { name: "v1" }).click();
  await expect(page).toHaveURL(/\/manual\/fr\/v1\/guide\/?$/);
  expect(await openOverlays(page)).toBe(0);
  await version.locator("button").click();
  await expect(version.locator("[popover]")).toBeVisible();
});

test("an open popover or search dialog does not survive history navigation", async ({
  page,
}) => {
  await page.goto("/manual/guide/");
  await page.locator('cookbook-sidebar a[href="/manual/contents/"]').click();
  await expect(page).toHaveURL(/\/manual\/contents\/?$/);

  const tools = page.locator("[data-element=Tools]");
  const appearance = tools.getByRole("button", {
    name: "Appearance",
    exact: true,
  });
  await appearance.click();
  await expect(
    tools.locator("cookbook-appearance-menu [popover]"),
  ).toBeVisible();
  await page.goBack();
  await expect(
    page.getByRole("heading", { name: "Guide", exact: true }),
  ).toBeVisible();
  expect(await openOverlays(page)).toBe(0);
  await appearance.click();
  await expect(
    tools.locator("cookbook-appearance-menu [popover]"),
  ).toBeVisible();
  await page.keyboard.press("Escape");

  const search = page.getByRole("button", { name: "Search", exact: true });
  await search.click();
  await expect(page.locator("site-search dialog")).toBeVisible();
  await page.goForward();
  await expect(
    page.getByRole("heading", { name: "Contents tracking", exact: true }),
  ).toBeVisible();
  expect(await openOverlays(page)).toBe(0);
  expect(
    await page.evaluate(() =>
      document.body.hasAttribute("data-search-modal-open"),
    ),
  ).toBe(false);
  await search.click();
  await expect(
    page.getByRole("textbox", { name: "Search", exact: true }),
  ).toBeFocused();
});
