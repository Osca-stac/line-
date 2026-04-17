import React, { useRef, useState } from 'react';
import { Upload } from 'lucide-react';

interface UploadZoneProps {
  onFileSelect: (file: File) => void;
}

export function UploadZone({ onFileSelect }: UploadZoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        onFileSelect(file);
      }
    }
  };

  return (
    <div
      className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-250 ${
        isDragOver
          ? 'border-emerald-400 bg-emerald-400/5'
          : 'border-slate-700 bg-slate-900 hover:border-emerald-400 hover:bg-emerald-400/5'
      }`}
      onClick={() => fileInputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
    >
      <Upload className="w-12 h-12 mx-auto mb-3 text-slate-400" />
      <div className="text-base font-semibold mb-1">拖曳圖片到這裡，或點擊選擇檔案</div>
      <div className="text-sm text-slate-400">支援 PNG / JPG，建議使用透明背景 PNG</div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/png, image/jpeg"
        className="hidden"
      />
    </div>
  );
}
