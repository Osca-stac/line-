import React from 'react';
import { StickerPiece } from '../types';
import { PreviewCard } from './PreviewCard';

interface PreviewGridProps {
  pieces: StickerPiece[];
  tabIndex: number;
  onCropClick: (piece: StickerPiece) => void;
  onDownloadClick: (piece: StickerPiece) => void;
}

export function PreviewGrid({ pieces, tabIndex, onCropClick, onDownloadClick }: PreviewGridProps) {
  if (pieces.length === 0) return null;

  const cols = Math.min(pieces.length, 6);

  return (
    <div className="mt-8">
      <h2 className="text-lg font-semibold mb-4 text-slate-200">
        切割預覽 <span className="text-[13px] font-normal text-slate-400">（📢點擊 ✂ 可進一步裁切毛邊）</span>
      </h2>
      <div 
        className="grid gap-3"
        style={{ gridTemplateColumns: `repeat(auto-fit, minmax(160px, 1fr))` }}
      >
        {pieces.map((piece, index) => (
          <PreviewCard
            key={piece.id}
            piece={piece}
            isMain={index === 0}
            isTab={index === tabIndex}
            onCropClick={() => onCropClick(piece)}
            onDownloadClick={() => onDownloadClick(piece)}
          />
        ))}
      </div>
    </div>
  );
}
