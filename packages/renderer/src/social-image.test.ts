import { describe, expect, it } from "vitest";
import sharp from "sharp";
import { createDefaultSocialImage } from "./social-image.js";
import { resolveDocsTheme } from "./theme/index.js";

describe("default social preview", () => {
  it("renders a base-aware PNG from the site and resolved theme", async () => {
    const blue = await createDefaultSocialImage(
      {
        title: "Acme <Docs> & API",
        description: "Guides for building with Acme",
        url: "https://docs.example.com",
      },
      "/manual/",
      resolveDocsTheme({ brand: { from: "#315efb" } }).colors,
    );
    const orange = await createDefaultSocialImage(
      { title: "Another project" },
      "/",
      resolveDocsTheme({ brand: { from: "#d97706" } }).colors,
    );
    expect(blue.image).toEqual({
      src: "/_cookbook/social-preview.png",
      alt: "Preview card for Acme <Docs> & API",
      width: 1200,
      height: 630,
    });
    expect(blue.publicPath).toBe("/manual/_cookbook/social-preview.png");
    expect(orange.publicPath).toBe("/_cookbook/social-preview.png");
    expect(await sharp(blue.body).metadata()).toMatchObject({
      format: "png",
      width: 1200,
      height: 630,
    });
    expect(orange.body.equals(blue.body)).toBe(false);
  });
});
