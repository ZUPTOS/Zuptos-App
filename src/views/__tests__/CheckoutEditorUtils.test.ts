import {
  buildPreviewFromFile,
  buildPreviewFromUrl,
  buildStoredPreview,
  formatBytes,
  normalizeImageUrl,
  resolveUploadedImageUrl,
  resolveUploadedUrl,
  truncateFileName,
} from "@/views/editar-produto/checkout-editor/utils";

describe("checkout-editor/utils", () => {
  it("formatBytes/truncateFileName", () => {
    expect(formatBytes(null)).toBe("-");
    expect(formatBytes(0)).toBe("0 B");
    expect(formatBytes(1024)).toBe("1.0 KB");
    expect(formatBytes(1536)).toBe("1.5 KB");
    expect(formatBytes(1024 * 1024)).toBe("1.0 MB");

    expect(truncateFileName("abc")).toBe("abc");
    expect(truncateFileName("1234567890", 7)).toBe("1234567");
  });

  it("normalizeImageUrl", () => {
    expect(normalizeImageUrl(undefined)).toBeUndefined();
    expect(normalizeImageUrl("")).toBeUndefined();
    expect(normalizeImageUrl("   ")).toBeUndefined();
    expect(normalizeImageUrl("null")).toBeUndefined();
    expect(normalizeImageUrl("undefined")).toBeUndefined();
    expect(normalizeImageUrl("data:image/png;base64,abc")).toBeUndefined();
    expect(normalizeImageUrl("blob:abc")).toBeUndefined();

    expect(normalizeImageUrl("https://example.com/logo.png")).toBe("https://example.com/logo.png");
    expect(normalizeImageUrl("https://example.com/null")).toBeUndefined();
    expect(normalizeImageUrl("/assets/null")).toBeUndefined();
  });

  it("resolveUploadedUrl/resolveUploadedImageUrl", () => {
    expect(resolveUploadedUrl("https://example.com/logo.png", "logo")).toBe("https://example.com/logo.png");
    expect(resolveUploadedUrl({ url: "https://example.com/banner.png" }, "banner")).toBe("https://example.com/banner.png");
    expect(resolveUploadedUrl({ data: { logo: "https://example.com/logo2.png" } }, "logo")).toBe(
      "https://example.com/logo2.png"
    );
    expect(resolveUploadedUrl({ path: "null" }, "logo")).toBeUndefined();

    expect(resolveUploadedImageUrl("https://example.com/img.png")).toBe("https://example.com/img.png");
    expect(resolveUploadedImageUrl({ image: "https://example.com/img2.png" })).toBe("https://example.com/img2.png");
    expect(resolveUploadedImageUrl({ data: { url: "https://example.com/img3.png" } })).toBe(
      "https://example.com/img3.png"
    );
    expect(resolveUploadedImageUrl({ url: "null" })).toBeUndefined();
  });

  it("build previews", () => {
    const preview = buildPreviewFromUrl("https://example.com/assets/My%20Logo.png");
    expect(preview.ext).toBe("PNG");
    expect(preview.name).toBe("My Logo");
    expect(preview.size).toBeNull();

    const storedBlob = buildStoredPreview("blob:mock", "Logo cadastrada");
    expect(storedBlob.name).toBe("Logo cadastrada");
    expect(storedBlob.ext).toBe("IMG");

    const file = new File(["x".repeat(3)], "foto.jpg", { type: "image/jpeg" });
    const filePreview = buildPreviewFromFile(file);
    expect(filePreview.ext).toBe("JPG");
    expect(filePreview.name).toBe("foto");
    expect(typeof filePreview.src).toBe("string");
    expect(filePreview.size).toBe(3);
  });
});

