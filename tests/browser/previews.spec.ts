import { expect, test, type Page } from "@playwright/test";

const frame = (page: Page, title: string) =>
  page.locator(`iframe[title="${title}"]`);
const frameHeight = (page: Page, title: string) =>
  frame(page, title).evaluate(
    (element) => element.getBoundingClientRect().height,
  );

async function setContentHeight(page: Page, title: string, height: string) {
  // Chromium defers rendering updates in offscreen cross-origin frames.
  await frame(page, title).scrollIntoViewIfNeeded();
  await page
    .frameLocator(`iframe[title="${title}"]`)
    .locator("#content")
    .evaluate((element, height) => {
      element.style.height = height;
    }, height);
}

test("scripted previews fit their frames to their content", async ({
  page,
}) => {
  await page.goto("/manual/previews/");
  // The content plus the frame body's 8px margins.
  await expect.poll(() => frameHeight(page, "Growing preview")).toBe(416);
  await setContentHeight(page, "Growing preview", "600px");
  await expect.poll(() => frameHeight(page, "Growing preview")).toBe(616);
  // Never below the default minimum, 10rem.
  await setContentHeight(page, "Growing preview", "20px");
  await expect.poll(() => frameHeight(page, "Growing preview")).toBe(160);

  // `height` is the minimum: 20rem.
  await expect.poll(() => frameHeight(page, "Reserved preview")).toBe(320);
  await setContentHeight(page, "Reserved preview", "500px");
  await expect.poll(() => frameHeight(page, "Reserved preview")).toBe(516);
  await setContentHeight(page, "Reserved preview", "100px");
  await expect.poll(() => frameHeight(page, "Reserved preview")).toBe(320);

  // `buffer` adds room below the content for an overlay, here a 180px list.
  // The frame is at least `height` (30rem), then follows content + 12rem.
  await expect.poll(() => frameHeight(page, "Picker preview")).toBe(480);
  await setContentHeight(page, "Picker preview", "300px");
  await expect.poll(() => frameHeight(page, "Picker preview")).toBe(508);
  const picker = page.frameLocator('iframe[title="Picker preview"]');
  expect(
    await picker
      .locator("ul")
      .evaluate(
        (list) =>
          list.getBoundingClientRect().bottom <=
          document.documentElement.clientHeight,
      ),
  ).toBe(true);

  // Without scripts, the frame keeps its minimum height and scrolls, and
  // ignores `buffer`.
  expect(await frameHeight(page, "Markup preview")).toBe(160);
  await expect(frame(page, "Markup preview")).not.toHaveAttribute("style");
  await expect(frame(page, "Markup preview")).not.toHaveAttribute(
    "data-buffer",
  );

  // Content sized by the frame stops growing at the window's height.
  await frame(page, "Viewport preview").scrollIntoViewIfNeeded();
  await expect.poll(() => frameHeight(page, "Viewport preview")).toBe(1000);
  await page.waitForTimeout(300);
  expect(await frameHeight(page, "Viewport preview")).toBe(1000);
});

test("previews follow the page width", async ({ page }) => {
  await page.goto("/manual/previews/");
  await frame(page, "Wrapping preview").scrollIntoViewIfNeeded();
  const content = () =>
    page
      .frameLocator('iframe[title="Wrapping preview"]')
      .locator("html")
      .evaluate((root) => Math.ceil(root.getBoundingClientRect().height));
  await expect.poll(() => frameHeight(page, "Wrapping preview")).toBe(160);
  await page.setViewportSize({ width: 375, height: 1000 });
  await expect
    .poll(() => frameHeight(page, "Wrapping preview"))
    .toBeGreaterThan(160);
  expect(await frameHeight(page, "Wrapping preview")).toBe(await content());
  await page.setViewportSize({ width: 1440, height: 1000 });
  await expect.poll(() => frameHeight(page, "Wrapping preview")).toBe(160);
});

test("previews ignore height messages from other windows", async ({ page }) => {
  await page.goto("/manual/previews/");
  await expect.poll(() => frameHeight(page, "Growing preview")).toBe(416);
  const heights = () =>
    Promise.all(
      ["Growing preview", "Reserved preview", "Markup preview"].map((title) =>
        frameHeight(page, title),
      ),
    );
  const before = await heights();
  await page.evaluate(async () => {
    const message = { type: "cookbook:preview-height", height: 700 };
    window.postMessage(message, "*");
    // A sandboxed frame outside any preview.
    const frame = document.createElement("iframe");
    frame.id = "other-frame";
    frame.sandbox.add("allow-scripts");
    frame.srcdoc = `<script>parent.postMessage(${JSON.stringify(message)}, "*")</script>`;
    document.querySelector("[data-element=Preview]")!.after(frame);
    await new Promise((resolve) => frame.addEventListener("load", resolve));
  });
  await page.waitForTimeout(200);
  expect(await heights()).toEqual(before);
  await expect(page.locator("#other-frame")).not.toHaveAttribute("style");
  // The preview's own reports still apply.
  await setContentHeight(page, "Growing preview", "300px");
  await expect.poll(() => frameHeight(page, "Growing preview")).toBe(316);
});

test("previews that report before the page script runs still fit", async ({
  page,
}) => {
  // Module scripts run in order, so the page's preview script waits for these.
  await page.route("**/_astro/*.js", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await route.continue();
  });
  await page.goto("/manual/previews/");
  await expect.poll(() => frameHeight(page, "Growing preview")).toBe(416);
});

test("previews fit after client-side navigation", async ({ page }) => {
  await page.goto("/manual/guide/");
  await page.evaluate(() =>
    Object.assign(window, { originalDocument: document }),
  );
  for (let visit = 0; visit < 2; visit++) {
    await page
      .locator('cookbook-sidebar a[href="/manual/previews/"]')
      .evaluate((link: HTMLAnchorElement) => link.click());
    await expect(page).toHaveURL(/\/manual\/previews\/?$/);
    await expect.poll(() => frameHeight(page, "Growing preview")).toBe(416);
    await page
      .locator('cookbook-sidebar a[href="/manual/guide/"]')
      .evaluate((link: HTMLAnchorElement) => link.click());
    await expect(page).toHaveURL(/\/manual\/guide\/?$/);
  }
  expect(
    await page.evaluate(() => (window as any).originalDocument === document),
  ).toBe(true);
});
