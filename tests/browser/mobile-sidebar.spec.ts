import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.use({ reducedMotion: "reduce" });

for (const viewport of [
  { width: 320, height: 568 },
  { width: 390, height: 700 },
  { width: 768, height: 360 },
]) {
  test(`mobile drawer scrolls only its navigation at ${viewport.width}×${viewport.height}`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize(viewport);
    await page.goto("/mobile-sidebar/guide/");
    await page.getByRole("button", { name: /Menu/ }).click();
    const drawer = page.locator("#cookbook__sidebar");
    await expect(drawer).toHaveAttribute("data-open", "");
    await expect(drawer).toHaveCSS("translate", "0px");
    const header = drawer.locator("[data-element=MobileHeader]");
    const footer = drawer.locator("[data-element=MobileFooter]");
    const tree = drawer.locator("cookbook-sidebar");
    await expect(header).toHaveCSS("border-bottom-width", "1px");
    await expect(footer.locator("[data-element=MobileMenuFooter]")).toHaveCSS(
      "border-top-width",
      "1px",
    );
    const before = {
      header: await header.boundingBox(),
      footer: await footer.boundingBox(),
    };
    expect(before.header!.y).toBe(0);
    expect(before.footer!.y + before.footer!.height).toBe(viewport.height);
    const bounds = (await tree.boundingBox())!;
    expect(bounds.y).toBe(before.header!.height);
    expect(bounds.y + bounds.height).toBe(before.footer!.y);
    await tree.hover();
    await page.mouse.wheel(0, 1000);
    await expect
      .poll(() => tree.evaluate((node) => node.scrollTop))
      .toBeGreaterThan(0);
    expect(await header.boundingBox()).toEqual(before.header);
    expect(await footer.boundingBox()).toEqual(before.footer);
    expect(await drawer.evaluate((node) => node.scrollTop)).toBe(0);
    expect(await page.evaluate(() => window.scrollY)).toBe(0);
    await expect(
      drawer.getByRole("button", { name: "Close navigation", exact: true }),
    ).toBeInViewport();
    const language = footer.getByRole("button", {
      name: "Select language: English",
    });
    await expect(
      footer.getByRole("link", { name: "Source repository" }),
    ).toBeInViewport();
    await expect(language).toBeInViewport();
    await language.click();
    const panel = footer.locator("[popover]");
    await expect(panel).toHaveCSS("opacity", "1");
    const placement = (await panel.boundingBox())!;
    expect(placement.y).toBeGreaterThanOrEqual(0);
    expect(placement.y + placement.height).toBeLessThanOrEqual(
      before.footer!.y + before.footer!.height,
    );
    await page.keyboard.press("Escape");
    await expect(panel).toBeHidden();
    await expect(language).toBeFocused();
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(results.violations).toEqual([]);
    await page.screenshot({ path: testInfo.outputPath("drawer.png") });
  });
}

test("section Select matches other selects and navigates within the site base", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 420 });
  await page.goto("/mobile-sidebar/guide/");
  await page.getByRole("button", { name: /Menu/ }).click();
  const drawer = page.locator("#cookbook__sidebar");
  const sections = drawer.locator("[data-element=MobileNavigationTabs]");
  const trigger = sections.getByRole("button", { name: "Choose section" });
  await expect(trigger).toHaveText("Guide");
  const original = await trigger.boundingBox();
  await trigger.hover();
  expect(await trigger.boundingBox()).toEqual(original);
  await trigger.focus();
  await page.keyboard.press("Enter");
  const panel = sections.locator("[popover]");
  await expect(panel).toHaveCSS("opacity", "1");
  const position = (await panel.boundingBox())!;
  expect(position.y).toBeGreaterThanOrEqual(original!.y + original!.height);
  expect(position.y + position.height).toBeLessThanOrEqual(420);
  expect(position.x).toBeCloseTo(original!.x);
  expect(position.width).toBeCloseTo(original!.width);
  await expect(
    panel.getByRole("link", { name: "Guide", exact: true }),
  ).toHaveAttribute("aria-current", "page");
  await page.keyboard.press("Tab");
  await expect(
    panel.getByRole("link", { name: "Guide", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
  await expect(drawer).toHaveAttribute("data-open", "");
  await trigger.click();
  await drawer
    .getByRole("button", { name: "Close navigation", exact: true })
    .click();
  await expect(panel).toBeHidden();
  await expect(drawer).not.toHaveAttribute("data-open");
  await page.getByRole("button", { name: /Menu/ }).click();
  await trigger.click();
  await panel.getByRole("link", { name: "Versions", exact: true }).click();
  await expect(page).toHaveURL(/\/mobile-sidebar\/v1\/?$/);
  await page.getByRole("button", { name: /Menu/ }).click();
  await expect(trigger).toHaveText("Versions");
});

test("section Select supports dark contrast, RTL, locale fallback, and viewport changes", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "dark", contrast: "more" });
  await page.goto("/mobile-sidebar/fr/guide/");
  const drawer = page.locator("#cookbook__sidebar");
  await expect(drawer.locator("[data-element=MobileHeader]")).toBeHidden();
  await expect(drawer.locator("[data-element=MobileFooter]")).toBeHidden();
  await page.setViewportSize({ width: 390, height: 600 });
  await page.locator("html").evaluate((node) => {
    node.dir = "rtl";
  });
  await page.getByRole("button", { name: /Menu/ }).click();
  const sections = drawer.locator("[data-element=MobileNavigationTabs]");
  const trigger = sections.locator(":scope > button");
  const panel = sections.locator("[popover]");
  await trigger.click();
  await expect(panel).toHaveCSS("opacity", "1");
  const bounds = (await panel.boundingBox())!;
  const outer = (await drawer.boundingBox())!;
  expect(bounds.x).toBeGreaterThanOrEqual(outer.x);
  expect(bounds.x + bounds.width).toBeLessThanOrEqual(outer.x + outer.width);
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(results.violations).toEqual([]);
  await expect(
    panel.getByRole("link", { name: "Versions", exact: true }),
  ).toHaveAttribute("href", "/mobile-sidebar/v1/");
  await expect(
    panel.getByRole("link", { name: "Guide", exact: true }),
  ).toHaveAttribute("href", "/mobile-sidebar/fr/guide/");
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(panel).toBeHidden();
  await expect(drawer).not.toHaveAttribute("data-open");
  await expect(drawer.locator("[data-element=MobileHeader]")).toBeHidden();
  await expect(drawer.locator("[data-element=MobileFooter]")).toBeHidden();
  await page.setViewportSize({ width: 390, height: 600 });
  await page.getByRole("button", { name: /Menu/ }).click();
  await trigger.click();
  await panel.getByRole("link", { name: "Versions", exact: true }).click();
  await expect(page).toHaveURL(/\/mobile-sidebar\/v1\/?$/);
});

for (const reducedMotion of ["no-preference", "reduce"] as const) {
  test(`section Select entry and exit motion with ${reducedMotion}`, async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion });
    await page.setViewportSize({ width: 390, height: 700 });
    await page.goto("/mobile-sidebar/guide/");
    await page.getByRole("button", { name: /Menu/ }).click();
    await page.evaluate(() => customElements.whenDefined("cb-popover"));
    const sections = page.locator("[data-element=MobileNavigationTabs]");
    const trigger = sections.getByRole("button", { name: "Choose section" });
    const panel = sections.locator("[popover]");
    // Lengthen the theme token so both directions can be inspected in flight.
    await page.addStyleTag({
      content:
        "[data-element=MobileNavigationTabs] > [data-element=Panel] { --popover-transition: 600ms; }",
    });
    const hasFade = (from: number, to: number) =>
      panel.evaluate(
        (element, { from, to }) =>
          element.getAnimations().some((animation) => {
            if (
              !(animation instanceof CSSTransition) ||
              animation.transitionProperty !== "opacity" ||
              animation.playState !== "running"
            )
              return false;
            const frames = animation.effect!.getKeyframes();
            return (
              animation.effect!.getTiming().duration === 600 &&
              Number(frames[0].opacity) === from &&
              Number(frames.at(-1)!.opacity) === to
            );
          }),
        { from, to },
      );

    for (let cycle = 0; cycle < 2; cycle++) {
      await trigger.click();
      if (reducedMotion === "no-preference") {
        await expect.poll(() => hasFade(0, 1)).toBe(true);
      } else {
        await expect(panel).toHaveCSS("transition-property", "none");
        expect(await hasFade(0, 1)).toBe(false);
      }
      await expect(panel).toHaveCSS("opacity", "1");
      await page.keyboard.press("Escape");
      if (reducedMotion === "no-preference") {
        await expect.poll(() => hasFade(1, 0)).toBe(true);
      } else {
        expect(await hasFade(1, 0)).toBe(false);
      }
      await expect(panel).toHaveCSS("display", "none");
      await expect(trigger).toBeFocused();
    }
  });
}
