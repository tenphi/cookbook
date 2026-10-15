import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test as base, expect, type Page } from "@playwright/test";

const test = base.extend<{ cacheablePage: Page }>({
  cacheablePage: async ({ browser, baseURL, viewport }, use) => {
    // WebKit's ephemeral/private test contexts do not cache ordinary fetches.
    // Exercise actual HTTP-cache reuse in a normal persistent session.
    const directory = await mkdtemp(join(tmpdir(), "cookbook-prefetch-cache-"));
    const context = await browser
      .browserType()
      .launchPersistentContext(directory, { baseURL, viewport });
    try {
      await use(await context.newPage());
    } finally {
      await context.close();
      await rm(directory, { recursive: true, force: true });
    }
  },
});

test("brief hover crossings do not fetch a page", async ({ page }) => {
  await page.goto("/manual/guide/");
  const requests: string[] = [];
  page.on("request", (request) =>
    requests.push(new URL(request.url()).pathname),
  );
  await page
    .locator('cookbook-sidebar a[href="/manual/contents/"]')
    .evaluate((link) => {
      link.dispatchEvent(new MouseEvent("mouseenter"));
      link.dispatchEvent(new MouseEvent("mouseleave"));
    });
  await page.waitForTimeout(180);
  expect(requests).not.toContain("/manual/contents/");
});

for (const intent of ["hover", "focus"] as const) {
  test(`prefetch ${intent} refreshes after the first client navigation`, async ({
    page,
  }) => {
    await page.goto("/manual/guide/");
    await page
      .locator('cookbook-sidebar a[href="/manual/contents/"]')
      .evaluate((link: HTMLAnchorElement) => link.click());
    await expect(page).toHaveURL(/\/manual\/contents\/?$/);
    await expect(page.locator("#main-content")).toBeFocused();
    const loaded = page.waitForResponse(
      (response) =>
        new URL(response.url()).pathname === "/manual/heading-links/",
      { timeout: 3000 },
    );
    const link = page.locator(
      'cookbook-sidebar a[href="/manual/heading-links/"]',
    );
    if (intent === "hover") await link.hover();
    else await link.focus();
    await loaded;
  });
}

for (const warmRouter of [false, true]) {
  test(`initial page-load is notified once with router warming ${warmRouter}`, async ({
    page,
  }) => {
    await page.addInitScript(() => {
      Object.assign(window, { pageLoads: 0 });
      document.addEventListener("astro:page-load", () => {
        (window as any).pageLoads += 1;
      });
    });
    let release!: () => void;
    const ready = new Promise<void>((resolve) => {
      release = resolve;
    });
    await page.route("**/*.svg", async (route) => {
      await ready;
      await route.continue();
    });
    await page.goto("/manual/", { waitUntil: "domcontentloaded" });
    expect(await page.evaluate(() => document.readyState)).not.toBe("complete");
    if (warmRouter) {
      await page
        .locator('cookbook-sidebar a[href="/manual/contents/"]')
        .hover();
      await page.waitForFunction(() => history.scrollRestoration === "manual");
    }
    release();
    await page.waitForLoadState("load");
    await expect
      .poll(() => page.evaluate(() => (window as any).pageLoads))
      .toBe(1);
    await page.waitForTimeout(50);
    expect(await page.evaluate(() => (window as any).pageLoads)).toBe(1);
  });
}

for (const intent of ["hover", "focus"] as const) {
  test(`${intent} prefetches HTML which client navigation reuses`, async ({
    cacheablePage: page,
  }) => {
    await page.goto("/manual/guide/");
    const link = page.locator('cookbook-sidebar a[href="/manual/contents/"]');
    const warmed = page.waitForResponse(
      (response) => new URL(response.url()).pathname === "/manual/contents/",
    );
    if (intent === "hover") await link.hover();
    else await link.focus();
    const first = await warmed;
    await first.finished();
    const requestId = first.headers()["x-cookbook-request-id"];
    expect(requestId).toBeTruthy();
    const navigated = page.waitForResponse(
      (response) => new URL(response.url()).pathname === "/manual/contents/",
    );
    await link.click();
    const second = await navigated;
    await expect(page).toHaveURL(/\/manual\/contents\/?$/);
    // A new server response would carry a different ID. This checks actual
    // cache reuse, rather than merely observing that prefetch was requested.
    expect(second.headers()["x-cookbook-request-id"]).toBe(requestId);
    await expect(page.locator("#main-content")).toBeFocused();
  });
}

test("repeat hover and fragment variants do not download the same page again", async ({
  page,
}) => {
  await page.goto("/manual/guide/");
  const requests: string[] = [];
  page.on("request", (request) =>
    requests.push(new URL(request.url()).pathname),
  );
  const link = page.locator('cookbook-sidebar a[href="/manual/contents/"]');
  const warmed = page.waitForResponse(
    (response) => new URL(response.url()).pathname === "/manual/contents/",
  );
  await link.hover();
  await (await warmed).finished();
  await page.mouse.move(0, 0);
  await link.hover();
  await page.waitForTimeout(180);
  await page.evaluate(() => {
    const anchor = document.createElement("a");
    anchor.href = "/manual/contents/#section-2";
    anchor.textContent = "Prefetch fragment fixture";
    document.getElementById("main-content")!.append(anchor);
  });
  await page.getByRole("link", { name: "Prefetch fragment fixture" }).hover();
  await page.waitForTimeout(180);
  expect(requests.filter((path) => path === "/manual/contents/")).toHaveLength(
    1,
  );
});

for (const connection of [
  { saveData: true, effectiveType: "4g" },
  { saveData: false, effectiveType: "2g" },
]) {
  test(`constrained connection ${connection.effectiveType}/${connection.saveData} waits for touch intent`, async ({
    page,
  }) => {
    await page.addInitScript((value) => {
      Object.defineProperty(navigator, "connection", {
        value,
        configurable: true,
      });
    }, connection);
    await page.goto("/manual/guide/");
    const requests: string[] = [];
    page.on("request", (request) =>
      requests.push(new URL(request.url()).pathname),
    );
    const link = page.locator('cookbook-sidebar a[href="/manual/contents/"]');
    await link.hover();
    await page.waitForTimeout(180);
    expect(requests).not.toContain("/manual/contents/");
    const warmed = page.waitForResponse(
      (response) => new URL(response.url()).pathname === "/manual/contents/",
    );
    await link.dispatchEvent("touchstart");
    await (await warmed).finished();
    expect(
      requests.filter((path) => path === "/manual/contents/"),
    ).toHaveLength(1);
  });
}

test("explicit Astro false disables prefetching while preserving client navigation", async ({
  page,
}) => {
  await page.goto("/wide-logo/guide/");
  const requests: string[] = [];
  page.on("request", (request) =>
    requests.push(new URL(request.url()).pathname),
  );
  const link = page.locator('cookbook-sidebar a[href="/wide-logo/contents/"]');
  await link.hover();
  await page.waitForTimeout(180);
  expect(requests).not.toContain("/wide-logo/contents/");
  await link.click();
  await expect(page).toHaveURL(/\/wide-logo\/contents\/?$/);
  await expect(page.locator("#main-content")).toBeFocused();
});

test("Astro selective prefetch and individual opt-outs remain supported", async ({
  page,
}) => {
  await page.goto("/tall-logo/guide/");
  const requests: string[] = [];
  page.on("request", (request) =>
    requests.push(new URL(request.url()).pathname),
  );
  await page.locator('cookbook-sidebar a[href="/tall-logo/contents/"]').hover();
  await page.waitForTimeout(180);
  expect(requests).not.toContain("/tall-logo/contents/");
  await page.evaluate(() => {
    for (const [path, enabled] of [
      ["/contents/", "true"],
      ["/heading-links/", "false"],
    ]) {
      const anchor = document.createElement("a");
      anchor.href = `/tall-logo${path}`;
      anchor.dataset.astroPrefetch = enabled === "true" ? "" : "false";
      anchor.textContent = `Prefetch ${enabled}`;
      document.getElementById("main-content")!.append(anchor);
    }
  });
  await page.getByRole("link", { name: "Prefetch false", exact: true }).hover();
  await page.waitForTimeout(180);
  expect(requests).not.toContain("/tall-logo/heading-links/");
  const warmed = page.waitForResponse(
    (response) => new URL(response.url()).pathname === "/tall-logo/contents/",
  );
  await page.getByRole("link", { name: "Prefetch true", exact: true }).hover();
  await (await warmed).finished();
});
