import "jspdf"

declare module "jspdf" {
  interface jsPDF {
    addPage(): jsPDF
    setFontSize(size: number): jsPDF
    setFont(fontName: string, fontStyle?: string): jsPDF
    text(text: string | string[], x: number, y: number, options?: TextOptions): jsPDF
    save(filename: string): void
    line(x1: number, y1: number, x2: number, y2: number): jsPDF
    rect(x: number, y: number, w: number, h: number, style?: "F" | "S" | "DF" | "FD"): jsPDF
    addImage(
      imageData: string | HTMLImageElement | HTMLCanvasElement | Uint8Array,
      format: "JPEG" | "PNG" | "WEBP",
      x: number,
      y: number,
      width: number,
      height: number,
      alias?: string,
      compression?: "NONE" | "FAST" | "MEDIUM" | "SLOW",
      rotation?: number,
    ): jsPDF
  }

  interface TextOptions {
    align?: "left" | "center" | "right" | "justify"
    baseline?: "alphabetic" | "ideographic" | "bottom" | "top" | "middle"
    angle?: number
    rotationDirection?: 0 | 1
    charSpace?: number
    lineHeightFactor?: number
    maxWidth?: number
    renderingMode?:
      | "fill"
      | "stroke"
      | "fillThenStroke"
      | "invisible"
      | "fillAndAddForClipping"
      | "strokeAndAddPathForClipping"
      | "fillThenStrokeAndAddToPathForClipping"
      | "addToPathForClipping"
  }
}