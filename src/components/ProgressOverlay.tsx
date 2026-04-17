import React from 'react';

interface ProgressOverlayProps {
  text: string;
}

export function ProgressOverlay({ text }: ProgressOverlayProps) {
  if (!text) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/85 z-[100] flex items-center justify-center">
      <div className="bg-slate-900 rounded-xl p-8 px-10 text-center border border-slate-700">
        <div className="w-10 h-10 border-4 border-slate-700 border-t-emerald-400 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-sm text-slate-400">{text}</p>
      </div>
    </div>
  );
}
