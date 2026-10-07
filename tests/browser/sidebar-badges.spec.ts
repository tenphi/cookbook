import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("sidebar badges preserve labels, escape text, and stay visible in narrow navigation", async ({
  page,
}, testInfo) => {
  await page.goto("/sidebar-badges/offline-support/");
  const sidebar = page.locator("cookbook-sidebar");
  const current = sidebar.locator('a[aria-current="page"]');
  await expect(current).toHaveText("Offline supportNEW");
  await expect(current.locator('[data-element="Badge"]')).toHaveText("NEW");
  await expect(
    sidebar.locator('.sidebar-section-label [data-element="Badge"]'),
  ).toHaveText("BETA");
  await expect(
    sidebar.locator(
      'a[href="/sidebar-badges/deploying"] [data-element="Badge"]',
    ),
  ).toHaveCount(0);
  const experimental = sidebar.locator(
    'a[href="/sidebar-badges/reference/experimental"]',
  );
  await expect(experimental.locator('[data-element="Badge"]')).toHaveText(
    "ALPHA < BETA",
  );
  await expect(experimental.locator("beta")).toHaveCount(0);
  await page.goto("/sidebar-badges/reference/");
  await page.evaluate(() => document.fonts.ready);
  await sidebar
    .locator(".top-level > li")
    .first()
    .screenshot({
      path: testInfo.outputPath("sidebar-badges-light.png"),
      scale: "css",
    });
  await page.evaluate(() => {
    document.documentElement.dataset.theme = "dark";
  });
  await sidebar
    .locator(".top-level > li")
    .first()
    .screenshot({
      path: testInfo.outputPath("sidebar-badges-dark.png"),
      scale: "css",
    });
  await page.goto("/sidebar-badges/offline-support/");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: /Menu/ }).click();
  await expect(current.locator('[data-element="Badge"]')).toBeVisible();
  const bounds = await current.evaluate((link) => {
    const label = link.firstElementChild!.getBoundingClientRect();
    const badge = link
      .querySelector('[data-element="Badge"]')!
      .getBoundingClientRect();
    const row = link.getBoundingClientRect();
    return {
      labelEnd: label.right,
      badgeStart: badge.left,
      badgeEnd: badge.right,
      rowEnd: row.right,
    };
  });
  expect(bounds.labelEnd).toBeLessThanOrEqual(bounds.badgeStart);
  expect(bounds.badgeEnd).toBeLessThanOrEqual(bounds.rowEnd);
});

test("sidebar badges use brand colors in every appearance and accept partial style overrides", async ({
  page,
}) => {
  const colors: string[] = [];
  for (const site of ["sidebar-badges", "branded-badges"]) {
    await page.goto(`/${site}/offline-support/`);
    const badge = page.locator(
      'cookbook-sidebar a[aria-current="page"] [data-element="Badge"]',
    );
    for (const scheme of ["light", "dark"]) {
      for (const contrast of ["normal", "more"]) {
        await page.evaluate(
          ({ scheme, contrast }) => {
            document.documentElement.dataset.theme = scheme;
            document.documentElement.dataset.contrast = contrast;
          },
          { scheme, contrast },
        );
        const style = await badge.evaluate((element) => {
          const computed = getComputedStyle(element);
          return {
            color: computed.color,
            fill: computed.backgroundColor,
            accent: computed.getPropertyValue("--accent-text-color").trim(),
            subtle: computed
              .getPropertyValue("--accent-surface-subtle-color")
              .trim(),
          };
        });
        expect(style.color).toBe(style.accent);
        expect(style.fill).toBe(style.subtle);
        const result = await new AxeBuilder({ page })
          .include('cookbook-sidebar [data-element="Badge"]')
          .withRules(["color-contrast"])
          .analyze();
        expect(result.violations).toEqual([]);
        expect(result.incomplete).toEqual([]);
        expect(result.passes.some((rule) => rule.id === "color-contrast")).toBe(
          true,
        );
        if (scheme === "light" && contrast === "normal")
          colors.push(style.color);
      }
    }
    await expect(badge).toHaveCSS("white-space", "nowrap");
    if (site === "branded-badges") {
      await expect(badge).toHaveCSS("border-radius", "8px");
      await expect(badge).toHaveCSS("font-size", "12px");
    }
  }
  expect(colors[0]).not.toBe(colors[1]);
});
