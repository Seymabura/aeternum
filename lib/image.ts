/** Tarayıcıda resmi küçültüp webp'ye çevirir (depolama ve Vercel limitleri için). */
export async function compressImage(file: File, maxSide = 1600, quality = 0.82): Promise<Blob> {
  const bmp = await createImageBitmap(file).catch(async () => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.src = url;
    await img.decode();
    URL.revokeObjectURL(url);
    return img;
  });
  const w0 = "width" in bmp ? bmp.width : 0;
  const h0 = "height" in bmp ? bmp.height : 0;
  const s = Math.min(1, maxSide / Math.max(w0, h0));
  const w = Math.round(w0 * s);
  const h = Math.round(h0 * s);
  const cv = document.createElement("canvas");
  cv.width = w;
  cv.height = h;
  cv.getContext("2d")!.drawImage(bmp as CanvasImageSource, 0, 0, w, h);
  const blob = await new Promise<Blob | null>((r) => cv.toBlob(r, "image/webp", quality));
  if (blob && blob.type === "image/webp") return blob;
  return new Promise<Blob>((r) => cv.toBlob((b) => r(b!), "image/jpeg", quality));
}
