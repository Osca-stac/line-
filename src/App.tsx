import React, { useState } from 'react';
import { UploadZone } from './components/UploadZone';
import { SourcePreview } from './components/SourcePreview';
import { Controls } from './components/Controls';
import { PreviewGrid } from './components/PreviewGrid';
import { CropModal } from './components/CropModal';
import { ProgressOverlay } from './components/ProgressOverlay';
import { ImageInfo, StickerPiece } from './types';
import { clamp, createStickerCanvas } from './utils/image';
import { downloadSingle, downloadZip } from './utils/export';
import { Package, Trash2 } from 'lucide-react';

export default function App() {
  const [imageInfo, setImageInfo] = useState<ImageInfo | null>(null);
  const [rows, setRows] = useState(4);
  const [cols, setCols] = useState(4);
  const [padding, setPadding] = useState(10);
  
  const [pieces, setPieces] = useState<StickerPiece[]>([]);
  const [tabIndex, setTabIndex] = useState(0);
  
  const [cropPiece, setCropPiece] = useState<StickerPiece | null>(null);
  const [progressText, setProgressText] = useState('');

  const handleFileSelect = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        setImageInfo({
          src: e.target?.result as string,
          width: img.width,
          height: img.height,
          size: file.size,
          name: file.name,
          image: img
        });
        setPieces([]);
        setTabIndex(0);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleCut = () => {
    if (!imageInfo) return;
    
    const r = clamp(rows, 1, 20);
    const c = clamp(cols, 1, 20);
    const p = clamp(padding, 0, 50);
    
    setRows(r);
    setCols(c);
    setPadding(p);

    const cellW = imageInfo.width / c;
    const cellH = imageInfo.height / r;
    const newPieces: StickerPiece[] = [];

    for (let row = 0; row < r; row++) {
      for (let col = 0; col < c; col++) {
        const idx = row * c + col;
        const sx = col * cellW;
        const sy = row * cellH;
        
        const canvas = createStickerCanvas(
          imageInfo.image, sx, sy, cellW, cellH, p
        );
        
        newPieces.push({
          id: `piece-${idx}`,
          index: idx,
          filename: `${String(idx + 1).padStart(2, '0')}.png`,
          canvas,
          sx, sy, sw: cellW, sh: cellH,
          origSx: sx, origSy: sy, origSw: cellW, origSh: cellH,
          padding: p,
          cropped: false
        });
      }
    }
    
    setPieces(newPieces);
    setTabIndex(0);
  };

  const handleCropApply = (newSx: number, newSy: number, newSw: number, newSh: number) => {
    if (!cropPiece || !imageInfo) return;
    
    const newCanvas = createStickerCanvas(
      imageInfo.image, newSx, newSy, newSw, newSh, cropPiece.padding
    );
    
    setPieces(prev => prev.map(p => {
      if (p.id === cropPiece.id) {
        return {
          ...p,
          sx: newSx,
          sy: newSy,
          sw: newSw,
          sh: newSh,
          cropped: true,
          canvas: newCanvas
        };
      }
      return p;
    }));
    
    setCropPiece(null);
  };

  const handleCropReset = () => {
    if (!cropPiece || !imageInfo) return;
    const newCanvas = createStickerCanvas(
      imageInfo.image, cropPiece.origSx, cropPiece.origSy, cropPiece.origSw, cropPiece.origSh, cropPiece.padding
    );
    setPieces(prev => prev.map(p => {
      if (p.id === cropPiece.id) {
        return {
          ...p,
          sx: p.origSx,
          sy: p.origSy,
          sw: p.origSw,
          sh: p.origSh,
          cropped: false,
          canvas: newCanvas
        };
      }
      return p;
    }));
    setCropPiece(null);
  };

  const handleReset = () => {
    setImageInfo(null);
    setPieces([]);
    setTabIndex(0);
    setRows(4);
    setCols(4);
    setPadding(10);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans p-5 pb-16">
      <div className="max-w-5xl mx-auto">
        <header className="text-center pt-8 pb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-br from-emerald-400 to-sky-500 bg-clip-text text-transparent inline-block mb-1.5">
            ✂️ LINE 貼圖切割器
          </h1>
          <p className="text-slate-400 text-sm">上傳圖片 → 設定格線 → 自動切割並輸出符合 LINE 官方規格的貼圖</p>
        </header>

        {!imageInfo && (
          <UploadZone onFileSelect={handleFileSelect} />
        )}

        {imageInfo && (
          <>
            <SourcePreview imageInfo={imageInfo} />
            <Controls
              rows={rows} cols={cols} padding={padding}
              onRowsChange={setRows} onColsChange={setCols} onPaddingChange={setPadding}
              onCut={handleCut}
            />
          </>
        )}

        {pieces.length > 0 && (
          <>
            <div className="mt-5 bg-slate-900 rounded-xl p-5 md:px-6">
              <label className="text-sm text-slate-400 font-medium">選擇作為聊天室標籤（tab.png）的格子：</label>
              <select
                value={tabIndex}
                onChange={(e) => setTabIndex(parseInt(e.target.value))}
                className="ml-3 p-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 text-sm focus:outline-none focus:border-emerald-400"
              >
                {pieces.map((p, i) => (
                  <option key={p.id} value={i}>
                    第 {String(i + 1).padStart(2, '0')} 格
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-5 bg-slate-900 rounded-xl p-5 md:px-6 flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex gap-3 flex-wrap">
                <button
                  onClick={() => downloadZip(pieces, tabIndex, setProgressText)}
                  className="inline-flex items-center justify-center gap-2 py-2 px-5 bg-emerald-400 hover:bg-emerald-500 text-slate-950 rounded-lg text-sm font-semibold transition-colors shadow-sm"
                >
                  <Package className="w-4 h-4" /> 下載全部 ZIP
                </button>
                <button
                  onClick={handleReset}
                  className="inline-flex items-center justify-center gap-2 py-2 px-5 bg-rose-500/15 hover:bg-rose-500/25 text-rose-500 border border-rose-500/30 rounded-lg text-sm font-medium transition-colors"
                >
                  <Trash2 className="w-4 h-4" /> 重新開始
                </button>
              </div>
              <div className="text-[13px] text-slate-400">
                貼圖尺寸：<span className="text-emerald-400 font-semibold">≤ 370×320 px</span>
                {'　｜　'}格式：<span className="text-emerald-400 font-semibold">PNG</span>
                {'　｜　'}留白：<span className="text-emerald-400 font-semibold">{padding}</span>px
              </div>
            </div>

            <PreviewGrid
              pieces={pieces}
              tabIndex={tabIndex}
              onCropClick={setCropPiece}
              onDownloadClick={(p) => downloadSingle(p.canvas, p.filename)}
            />
          </>
        )}
      </div>

      <CropModal
        piece={cropPiece}
        originalImage={imageInfo?.image || null}
        onClose={() => setCropPiece(null)}
        onApply={handleCropApply}
        onReset={handleCropReset}
      />

      <ProgressOverlay text={progressText} />
    </div>
  );
}
