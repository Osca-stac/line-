import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { StickerPiece } from '../types';
import { canvasToBlobCompressed, createResizedCanvas, MAIN_SIZE, TAB_W, TAB_H, canvasToBlob } from './image';

export async function downloadSingle(canvas: HTMLCanvasElement, filename: string) {
  const blob = await canvasToBlob(canvas);
  saveAs(blob, filename);
}

export async function downloadZip(pieces: StickerPiece[], tabIndex: number, setProgress: (msg: string) => void) {
  if (!pieces.length) return;

  setProgress('正在處理貼圖…');
  
  try {
    const zip = new JSZip();

    for (const piece of pieces) {
      const blob = await canvasToBlobCompressed(piece.canvas);
      zip.file(piece.filename, blob);
    }

    const mainCanvas = createResizedCanvas(pieces[0].canvas, MAIN_SIZE, MAIN_SIZE);
    const mainBlob = await canvasToBlobCompressed(mainCanvas);
    zip.file('main.png', mainBlob);

    const tabIdx = pieces[tabIndex] ? tabIndex : 0;
    const tabCanvas = createResizedCanvas(pieces[tabIdx].canvas, TAB_W, TAB_H);
    const tabBlob = await canvasToBlobCompressed(tabCanvas);
    zip.file('tab.png', tabBlob);

    setProgress('正在打包 ZIP…');
    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, 'line-stickers.zip');
  } catch (err) {
    console.error(err);
    alert('打包失敗：' + (err instanceof Error ? err.message : String(err)));
  } finally {
    setProgress('');
  }
}
