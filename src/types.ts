export interface StickerPiece {
  id: string;
  index: number;
  filename: string;
  canvas: HTMLCanvasElement;
  sx: number;
  sy: number;
  sw: number;
  sh: number;
  origSx: number;
  origSy: number;
  origSw: number;
  origSh: number;
  padding: number;
  cropped: boolean;
}

export interface ImageInfo {
  src: string;
  width: number;
  height: number;
  size: number;
  name: string;
  image: HTMLImageElement;
}
