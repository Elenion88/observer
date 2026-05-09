/**
 * Downscale a (typically multi-MB) phone photo to ~150KB before upload.
 * Preserves aspect ratio. Default 1024px max dimension @ 80% JPEG quality.
 */
export async function resizeImage(
  file: File,
  opts: { maxDim?: number; quality?: number } = {}
): Promise<File> {
  const maxDim = opts.maxDim ?? 1024;
  const quality = opts.quality ?? 0.8;

  // If the file is already small or not an image, skip resize.
  if (!file.type.startsWith("image/") || file.size < 200 * 1024) {
    return file;
  }

  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error("image decode failed"));
      i.src = url;
    });

    const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
    if (scale === 1) {
      // Already within bounds; recompress only if it's worth it.
      if (file.size < 600 * 1024) return file;
    }

    const w = Math.round(img.width * scale);
    const h = Math.round(img.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(img, 0, 0, w, h);

    const blob: Blob | null = await new Promise((resolve) =>
      canvas.toBlob((b) => resolve(b), "image/jpeg", quality)
    );
    if (!blob) return file;

    const newName = file.name.replace(/\.[^.]+$/, "") + ".jpg";
    return new File([blob], newName, {
      type: "image/jpeg",
      lastModified: Date.now(),
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}
