import React from 'react';
import { Scissors, WandSparkles } from 'lucide-react';

interface ControlsProps {
  rows: number;
  cols: number;
  padding: number;
  bgRemoving: boolean;
  onRowsChange: (v: number) => void;
  onColsChange: (v: number) => void;
  onPaddingChange: (v: number) => void;
  onRemoveBackground: () => void;
  onCut: () => void;
}

export function Controls({
  rows,
  cols,
  padding,
  bgRemoving,
  onRowsChange,
  onColsChange,
  onPaddingChange,
  onRemoveBackground,
  onCut
}: ControlsProps) {
  return (
    <div className="mt-5 bg-slate-900 rounded-xl p-5 md:px-6">
      <div className="flex flex-col md:flex-row gap-4 md:items-end">
        <div className="flex-1 min-w-[120px]">
          <label className="block text-sm text-slate-400 mb-1.5 font-medium">列數（Rows）</label>
          <input
            type="number"
            value={rows}
            onChange={(e) => onRowsChange(parseInt(e.target.value) || 1)}
            min="1" max="20"
            className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 text-sm focus:outline-none focus:border-emerald-400 transition-colors"
          />
        </div>
        <div className="flex-1 min-w-[120px]">
          <label className="block text-sm text-slate-400 mb-1.5 font-medium">欄數（Columns）</label>
          <input
            type="number"
            value={cols}
            onChange={(e) => onColsChange(parseInt(e.target.value) || 1)}
            min="1" max="20"
            className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 text-sm focus:outline-none focus:border-emerald-400 transition-colors"
          />
        </div>
        <div className="flex-1 min-w-[120px]">
          <label className="block text-sm text-slate-400 mb-1.5 font-medium">內縮留白（預設值）</label>
          <input
            type="number"
            value={padding}
            onChange={(e) => onPaddingChange(parseInt(e.target.value) || 0)}
            min="0" max="50"
            className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 text-sm focus:outline-none focus:border-emerald-400 transition-colors"
          />
        </div>
        <div className="flex-1 min-w-[120px] flex items-end">
          <button
            onClick={onRemoveBackground}
            disabled={bgRemoving}
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-5 bg-indigo-400 hover:bg-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed text-slate-950 rounded-lg text-sm font-semibold transition-colors shadow-sm"
          >
            <WandSparkles className="w-4 h-4" />
            {bgRemoving ? '去背中...' : '圖片去背'}
          </button>
        </div>
        <div className="flex-1 min-w-[120px] flex items-end">
          <button
            onClick={onCut}
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-5 bg-emerald-400 hover:bg-emerald-500 text-slate-950 rounded-lg text-sm font-semibold transition-colors shadow-sm"
          >
            <Scissors className="w-4 h-4" />
            開始切割
          </button>
        </div>
      </div>
    </div>
  );
}
