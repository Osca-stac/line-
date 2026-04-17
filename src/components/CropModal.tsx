import React, { useEffect, useRef, useState, useCallback } from 'react';
import { StickerPiece } from '../types';
import { clamp } from '../utils/image';
import { Check, RotateCcw, X } from 'lucide-react';

interface CropModalProps {
  piece: StickerPiece | null;
  originalImage: HTMLImageElement | null;
  onClose: () => void;
  onApply: (newSx: number, newSy: number, newSw: number, newSh: number) => void;
  onReset: () => void;
}

export function CropModal({ piece, originalImage, onClose, onApply, onReset }: CropModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  
  const [cropDisplayScale, setCropDisplayScale] = useState(1);
  const [dispW, setDispW] = useState(0);
  const [dispH, setDispH] = useState(0);
  
  const [cropSel, setCropSel] = useState<{ x: number, y: number, w: number, h: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);

  const getCropDisplayLimit = () => {
    const vwLimit = Math.floor(window.innerWidth * 0.5);
    const vhLimit = Math.floor(window.innerHeight * 0.55);
    return Math.max(220, Math.min(360, vwLimit, vhLimit));
  };

  useEffect(() => {
    if (piece && originalImage) {
      const srcW = piece.origSw;
      const srcH = piece.origSh;
      const displayLimit = getCropDisplayLimit();
      const scale = Math.min(displayLimit / srcW, displayLimit / srcH, 1);
      
      const width = Math.round(srcW * scale);
      const height = Math.round(srcH * scale);
      
      setCropDisplayScale(scale);
      setDispW(width);
      setDispH(height);

      const relX = piece.sx - piece.origSx;
      const relY = piece.sy - piece.origSy;
      setCropSel({
        x: Math.round(relX * scale),
        y: Math.round(relY * scale),
        w: Math.round(piece.sw * scale),
        h: Math.round(piece.sh * scale)
      });
    }
  }, [piece, originalImage]);

  const drawCanvas = useCallback(() => {
    if (!canvasRef.current || !piece || !originalImage || dispW === 0 || dispH === 0) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, dispW, dispH);

    // Draw source region
    ctx.drawImage(
      originalImage,
      piece.origSx, piece.origSy, piece.origSw, piece.origSh,
      0, 0, dispW, dispH
    );

    // Dark overlay
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(0, 0, dispW, dispH);

    // Clear selected
    if (cropSel) {
      const s = cropSel;
      ctx.clearRect(s.x, s.y, s.w, s.h);
      ctx.drawImage(
        originalImage,
        piece.origSx, piece.origSy, piece.origSw, piece.origSh,
        0, 0, dispW, dispH
      );

      ctx.fillStyle = 'rgba(0,0,0,0.55)';
      ctx.fillRect(0, 0, dispW, s.y); // top
      ctx.fillRect(0, s.y + s.h, dispW, dispH - s.y - s.h); // bottom
      ctx.fillRect(0, s.y, s.x, s.h); // left
      ctx.fillRect(s.x + s.w, s.y, dispW - s.x - s.w, s.h); // right

      ctx.strokeStyle = '#06d6a0';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 3]);
      ctx.strokeRect(s.x, s.y, s.w, s.h);
      ctx.setLineDash([]);

      const hs = 6;
      ctx.fillStyle = '#06d6a0';
      [[s.x, s.y], [s.x + s.w, s.y], [s.x, s.y + s.h], [s.x + s.w, s.y + s.h]].forEach(([cx, cy]) => {
        ctx.fillRect(cx - hs / 2, cy - hs / 2, hs, hs);
      });
    }
  }, [piece, originalImage, cropSel, dispW, dispH]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!wrapRef.current) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    e.preventDefault();
    const rect = wrapRef.current.getBoundingClientRect();
    const x = clamp(e.clientX - rect.left, 0, dispW);
    const y = clamp(e.clientY - rect.top, 0, dispH);
    setStartX(x);
    setStartY(y);
    setIsDragging(true);
    setCropSel({ x, y, w: 0, h: 0 });
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || !wrapRef.current) return;
    e.preventDefault();
    const rect = wrapRef.current.getBoundingClientRect();
    const mx = clamp(e.clientX - rect.left, 0, dispW);
    const my = clamp(e.clientY - rect.top, 0, dispH);
    
    setCropSel({
      x: Math.min(startX, mx),
      y: Math.min(startY, my),
      w: Math.abs(mx - startX),
      h: Math.abs(my - startY)
    });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    e.currentTarget.releasePointerCapture(e.pointerId);
    setIsDragging(false);
    if (cropSel && cropSel.w < 5 && cropSel.h < 5) {
      setCropSel({ x: 0, y: 0, w: dispW, h: dispH });
    }
  };

  if (!piece) return null;

  return (
    <div 
      className="fixed inset-0 bg-slate-950/90 z-[200] flex items-center justify-center backdrop-blur-sm p-4"
      onPointerDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 max-w-[90vw] max-h-[90vh] flex flex-col gap-5 shadow-2xl">
        <h3 className="text-base font-semibold text-slate-200">
          裁切 — <span className="text-emerald-400">#{String(piece.index + 1).padStart(2, '0')}</span>
        </h3>
        
        <div 
          ref={wrapRef}
          className="relative inline-block self-center cursor-crosshair border border-slate-700 rounded-lg overflow-hidden leading-0 touch-none"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          <canvas ref={canvasRef} width={dispW} height={dispH} className="block" />
        </div>
        
        <div className="text-[13px] text-slate-400 text-center">
          框選範圍：
          <span className="text-emerald-400 font-semibold font-mono">
            {cropSel ? `${Math.round(cropSel.w / cropDisplayScale)} × ${Math.round(cropSel.h / cropDisplayScale)}` : '---'} px
          </span>
          {'　｜　'}拖曳滑鼠框選要保留的區域
        </div>
        
        <div className="flex gap-2.5 justify-center flex-wrap">
          <button
            onClick={() => {
              if (cropSel && piece) {
                const newSw = cropSel.w / cropDisplayScale;
                const newSh = cropSel.h / cropDisplayScale;
                if (newSw >= 2 && newSh >= 2) {
                  onApply(
                    piece.origSx + cropSel.x / cropDisplayScale,
                    piece.origSy + cropSel.y / cropDisplayScale,
                    newSw,
                    newSh
                  );
                }
              }
            }}
            className="inline-flex items-center gap-2 py-2 px-4 bg-emerald-400 hover:bg-emerald-500 text-slate-950 font-semibold rounded-lg text-sm transition-colors"
          >
            <Check className="w-4 h-4" /> 套用裁切
          </button>
          
          <button
            onClick={onReset}
            className="inline-flex items-center gap-2 py-2 px-4 bg-slate-800 hover:border-emerald-400 border border-slate-700 text-slate-200 font-medium rounded-lg text-sm transition-colors"
          >
            <RotateCcw className="w-4 h-4" /> 重置選取
          </button>
          
          <button
            onClick={onClose}
            className="inline-flex items-center gap-2 py-2 px-4 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-500 font-medium rounded-lg text-sm transition-colors"
          >
            <X className="w-4 h-4" /> 取消
          </button>
        </div>
      </div>
    </div>
  );
}
