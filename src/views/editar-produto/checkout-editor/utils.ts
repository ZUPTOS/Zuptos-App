export type ImagePreview = {
  src: string;
  name: string;
  ext: string;
  size: number | null;
  objectUrl?: string;
};

export const formatBytes = (bytes: number | null) => {
  if (bytes === null) return "-";
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let index = 0;
  while (value >= 1024 && index < units.length - 1) {
    value /= 1024;
    index += 1;
  }
  const precision = value < 10 && index > 0 ? 1 : 0;
  return `${value.toFixed(precision)} ${units[index]}`;
};

export const truncateFileName = (name: string, maxLength = 7) =>
  name.length > maxLength ? name.slice(0, maxLength) : name;

const loadImageFromFile = (file: File) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("Image compression not available on the server"));
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(img);
    };
    img.onerror = (error) => {
      URL.revokeObjectURL(objectUrl);
      reject(error);
    };
    img.src = objectUrl;
  });

export const compressImageFile = async (
  file: File,
  options: { maxWidth: number; maxHeight: number; quality?: number }
) => {
  const img = await loadImageFromFile(file);
  const scale = Math.min(
    options.maxWidth / img.width,
    options.maxHeight / img.height,
    1
  );
  const targetWidth = Math.max(1, Math.round(img.width * scale));
  const targetHeight = Math.max(1, Math.round(img.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Não foi possível criar o contexto do canvas");
  }
  ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
  const mime = file.type === "image/png" ? "image/png" : "image/jpeg";
  const quality = mime === "image/png" ? undefined : options.quality ?? 0.82;
  return canvas.toDataURL(mime, quality);
};

const parseFileName = (src: string) => {
  try {
    const url = new URL(src);
    const segment = url.pathname.split("/").pop();
    return decodeURIComponent(segment || "imagem");
  } catch {
    const segment = src.split("/").pop();
    return decodeURIComponent(segment || "imagem");
  }
};

export const normalizeImageUrl = (value?: string | null) => {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  if (trimmed === "null" || trimmed === "undefined") return undefined;
  if (trimmed.startsWith("data:") || trimmed.startsWith("blob:")) return undefined;
  const lower = trimmed.toLowerCase();
  try {
    const url = new URL(trimmed);
    const path = url.pathname.toLowerCase();
    if (path === "/null" || path.endsWith("/null") || path.includes("/null/")) {
      return undefined;
    }
  } catch {
    if (lower === "null" || lower.includes("/null")) return undefined;
  }
  return trimmed;
};

export const resolveUploadedUrl = (response: unknown, type: "logo" | "banner") => {
  if (!response) return undefined;
  if (typeof response === "string") return normalizeImageUrl(response);
  const data = response as Record<string, unknown>;
  return normalizeImageUrl(
    (data.url as string | undefined) ??
      (data.path as string | undefined) ??
      (data.location as string | undefined) ??
      (data[type] as string | undefined) ??
      ((data.data as Record<string, unknown> | undefined)?.url as string | undefined) ??
      ((data.data as Record<string, unknown> | undefined)?.[type] as string | undefined)
  );
};

export const resolveUploadedImageUrl = (response: unknown) => {
  if (!response) return undefined;
  if (typeof response === "string") return normalizeImageUrl(response);
  const data = response as Record<string, unknown>;
  return normalizeImageUrl(
    (data.url as string | undefined) ??
      (data.path as string | undefined) ??
      (data.location as string | undefined) ??
      (data.image as string | undefined) ??
      ((data.data as Record<string, unknown> | undefined)?.url as string | undefined) ??
      ((data.data as Record<string, unknown> | undefined)?.image as string | undefined)
  );
};

export const buildPreviewFromUrl = (src: string): ImagePreview => {
  const name = parseFileName(src);
  const dotIndex = name.lastIndexOf(".");
  const baseName = dotIndex > 0 ? name.slice(0, dotIndex) : name;
  const ext = dotIndex > 0 ? name.slice(dotIndex + 1) : "";
  return {
    src,
    name: baseName,
    ext: ext.toUpperCase() || "IMG",
    size: null,
  };
};

export const buildStoredPreview = (src: string, label: string): ImagePreview => {
  if (src.startsWith("blob:")) {
    return {
      src,
      name: label,
      ext: "IMG",
      size: null,
    };
  }
  return buildPreviewFromUrl(src);
};

export const buildPreviewFromFile = (file: File, srcOverride?: string): ImagePreview => {
  const rawName = file.name || "imagem";
  const dotIndex = rawName.lastIndexOf(".");
  const baseName = dotIndex > 0 ? rawName.slice(0, dotIndex) : rawName;
  const ext = dotIndex > 0 ? rawName.slice(dotIndex + 1) : "";
  const objectUrl = srcOverride ? undefined : URL.createObjectURL(file);
  return {
    src: srcOverride ?? objectUrl ?? "",
    name: baseName,
    ext: ext.toUpperCase() || "IMG",
    size: file.size,
    objectUrl,
  };
};
