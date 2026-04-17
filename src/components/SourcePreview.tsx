import React from 'react';
import { ImageInfo } from '../types';
import { formatBytes } from '../utils/image';

interface SourcePreviewProps {
  imageInfo: ImageInfo;
}

export function SourcePreview({ imageInfo }: SourcePreviewProps) {
  return (
    <div className="mt-5 bg-slate-900 rounded-xl p-4 text-center">
      <img
        src={imageInfo.src}
        alt="原圖預覽"
        className="max-w-full max-h-[300px] rounded-lg border border-slate-700 mx-auto"
      />
      <div className="mt-3 text-sm text-slate-400">
        原始尺寸：<span className="text-emerald-400 font-semibold">{imageInfo.width} × {imageInfo.height} px</span>
        {'　｜　'}檔案大小：<span className="text-emerald-400 font-semibold">{formatBytes(imageInfo.size)}</span>
      </div>
    </div>
  );
}
