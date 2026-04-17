export const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(max, val));

export const STICKER_MAX_W = 370;
export const STICKER_MAX_H = 320;
export const MAIN_SIZE = 240;
export const TAB_W = 96;
export const TAB_H = 74;
export const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1MB

export function createStickerCanvas(img: HTMLImageElement | HTMLCanvasElement, sx: number, sy: number, sw: number, sh: number, padding: number) {
  const contentW = STICKER_MAX_W - padding * 2;
  const contentH = STICKER_MAX_H - padding * 2;

  const scale = Math.min(contentW / sw, contentH / sh, 1);
  const drawW = Math.round(sw * scale);
  const drawH = Math.round(sh * scale);

  const canvas = document.createElement('canvas');
  canvas.width = STICKER_MAX_W;
  canvas.height = STICKER_MAX_H;

  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;
  
  const offsetX = Math.round((STICKER_MAX_W - drawW) / 2);
  const offsetY = Math.round((STICKER_MAX_H - drawH) / 2);

  ctx.drawImage(img, sx, sy, sw, sh, offsetX, offsetY, drawW, drawH);
  return canvas;
}

export function createResizedCanvas(srcCanvas: HTMLCanvasElement, targetW: number, targetH: number) {
  const canvas = document.createElement('canvas');
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;
  
  const srcW = srcCanvas.width;
  const srcH = srcCanvas.height;
  const scale = Math.min(targetW / srcW, targetH / srcH);
  const drawW = Math.round(srcW * scale);
  const drawH = Math.round(srcH * scale);
  const ox = Math.round((targetW - drawW) / 2);
  const oy = Math.round((targetH - drawH) / 2);
  
  ctx.drawImage(srcCanvas, 0, 0, srcW, srcH, ox, oy, drawW, drawH);
  return canvas;
}

export function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Canvas to Blob failed.'));
    }, 'image/png');
  });
}

export async function canvasToBlobCompressed(canvas: HTMLCanvasElement): Promise<Blob> {
  let blob = await canvasToBlob(canvas);
  if (blob.size <= MAX_FILE_SIZE) return blob;

  let scale = 0.95;
  while (blob.size > MAX_FILE_SIZE && scale > 0.3) {
    const w = Math.round(canvas.width * scale);
    const h = Math.round(canvas.height * scale);
    const tmpCanvas = document.createElement('canvas');
    tmpCanvas.width = w;
    tmpCanvas.height = h;
    const ctx = tmpCanvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(canvas, 0, 0, w, h);
    }
    blob = await canvasToBlob(tmpCanvas);
    scale -= 0.05;
  }
  return blob;
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(2) + ' MB';
}
