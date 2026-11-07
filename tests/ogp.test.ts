import { afterEach, describe, expect, it, vi } from "vitest";
import sharp from "sharp";
import { generateOgpImage } from "../src/ogp/generate-ogp";

afterEach(() => vi.restoreAllMocks());

describe("OGP image generation", () => {
  it("renders the site card as a 1200 by 630 WebP", async () => {
    const bytes = await generateOgpImage({ type: "site", isRandom: false });
    expect(await sharp(bytes).metadata()).toMatchObject({
      format: "webp",
      width: 1200,
      height: 630,
    });
  });

  it("renders note text containing SVG markup without fetching injected images", async () => {
    const fetch = vi
      .spyOn(globalThis, "fetch")
      .mockRejectedValue(new Error("Unexpected external image request"));
    const bytes = await generateOgpImage({
      type: "note",
      title: '</text><image href="https://example.com/injected.png"/>日本語',
      emoji: "",
      publishedAt: new Date("2026-01-01T00:00:00Z"),
      tags: ['<svg onload="alert(1)">'],
      isRandom: false,
    });
    expect(await sharp(bytes).metadata()).toMatchObject({
      format: "webp",
      width: 1200,
      height: 630,
    });
    expect(fetch).not.toHaveBeenCalled();
  });
});
