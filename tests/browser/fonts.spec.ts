import { expect, test } from "@playwright/test";

for (const variant of ["manual", "custom-header"]) {
  test(`${variant} loads self-hosted variable Onest and renders intermediate weights`, async ({
    page,
  }) => {
    const fontResponses: { url: string; status: number }[] = [];
    page.on("response", (response) => {
      if (response.url().includes("/onest-"))
        fontResponses.push({ url: response.url(), status: response.status() });
    });
    await page.goto(`/${variant}/guide/`);
    const heading = page.locator(".cookbook-markdown-content h2").first();
    await expect(page.locator("body")).toHaveCSS(
      "font-family",
      /Onest Variable/i,
    );
    await expect(heading).toHaveCSS("font-family", /Onest Variable/i);
    await expect(heading).toHaveCSS("font-weight", "610");

    const rendered = await page.evaluate(async () => {
      const fonts = await document.fonts.load('610 64px "Onest Variable"');
      const canvas = document.createElement("canvas");
      canvas.width = 640;
      canvas.height = 100;
      const context = canvas.getContext("2d")!;
      const samples = [600, 610, 640, 650].map((weight) => {
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.font = `${weight} 64px "Onest Variable"`;
        context.fillText("Cookbook Onest", 0, 75);
        return canvas.toDataURL();
      });
      return {
        fonts: fonts.map((font) => ({
          family: font.family.replace(/["']/g, ""),
          weight: font.weight,
          status: font.status,
        })),
        samples,
      };
    });
    expect(rendered.fonts).toEqual([
      { family: "Onest Variable", weight: "100 900", status: "loaded" },
    ]);
    // Static weights advertised as a range would render neighboring values alike.
    expect(rendered.samples[0]).not.toBe(rendered.samples[1]);
    expect(rendered.samples[2]).not.toBe(rendered.samples[3]);
    expect(fontResponses).toEqual([
      {
        url: expect.stringMatching(
          new RegExp(
            `/${variant}/_astro/onest-latin-wght-normal\\.[\\w-]+\\.woff2$`,
          ),
        ),
        status: 200,
      },
    ]);
  });
}
