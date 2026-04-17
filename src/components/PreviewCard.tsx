import React, { useEffect, useRef } from 'react';
import { Download, ScissorsLineDashed } from 'lucide-react';
import { StickerPiece } from '../types';

interface PreviewCardProps {
  key?: string | number;
  piece: StickerPiece;
  isMain: boolean;
  isTab: boolean;
  onCropClick: () => void;
  onDownloadClick: () => void;
}

export function PreviewCard({ piece, isMain, isTab, onCropClick, onDownloadClick }: PreviewCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      const displayCanvas = canvasRef.current;
      displayCanvas.width = piece.canvas.width;
      displayCanvas.height = piece.canvas.height;
      const ctx = displayCanvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, displayCanvas.width, displayCanvas.height);
        ctx.drawImage(piece.canvas, 0, 0);
      }
    }
  }, [piece.canvas]);

  return (
    <div
      className={`bg-slate-900 rounded-xl border overflow-hidden transition-all duration-200 hover:-translate-y-0.5 ${
        isMain ? 'border-amber-400' : isTab ? 'border-sky-500' : 'border-slate-700 hover:border-emerald-400'
      }`}
    >
      <div 
        className="aspect-[370/320] flex items-center justify-center p-2 relative"
        style={{
          background: 'repeating-conic-gradient(#2a2d3a 0% 25%, #1e2130 0% 50%) 0 0 / 16px 16px'
        }}
      >
        <canvas ref={canvasRef} className="max-w-full max-h-full" style={{ imageRendering: 'auto' }} />
        
        <span className="absolute top-2 left-2 text-[11px] font-bold py-0.5 px-2 rounded-md bg-black/65 backdrop-blur-sm border border-slate-700 text-slate-200">
          #{String(piece.index + 1).padStart(2, '0')}
        </span>

        {isMain && (
          <span className="absolute bottom-2 left-2 text-[11px] font-bold py-0.5 px-2 rounded-md bg-black/65 backdrop-blur-sm border border-amber-400/40 text-amber-400">
            main.png
          </span>
        )}
        
        {isTab && (
          <span className="absolute bottom-2 right-2 text-[11px] font-bold py-0.5 px-2 rounded-md bg-black/65 backdrop-blur-sm border border-sky-500/40 text-sky-500">
            tab.png
          </span>
        )}

        {piece.cropped && (
          <span className="absolute top-2 right-2 text-[11px] font-bold py-0.5 px-2 rounded-md bg-black/65 backdrop-blur-sm border border-emerald-400/40 text-emerald-400">
            已裁切
          </span>
        )}
      </div>

      <div className="p-2.5 flex items-center justify-between border-t border-slate-700">
        <div>
          <div className="text-[13px] font-semibold font-mono text-slate-200">{piece.filename}</div>
          <div className="text-[11px] text-slate-400">{piece.canvas.width}×{piece.canvas.height}</div>
        </div>
        <div className="flex gap-1.5">
          <button
            onClick={onCropClick}
            title="裁切此張"
            className="w-8 h-8 flex items-center justify-center border border-slate-700 text-slate-300 rounded-md bg-slate-800 hover:border-emerald-400 hover:text-emerald-400 transition-colors"
          >
            <ScissorsLineDashed className="w-4 h-4" />
          </button>
          <button
            onClick={onDownloadClick}
            title="下載此張"
            className="w-8 h-8 flex items-center justify-center border border-slate-700 text-slate-300 rounded-md bg-slate-800 hover:border-emerald-400 hover:text-emerald-400 transition-colors"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
