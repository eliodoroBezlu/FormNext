import {
  generarCodigoQR,
  obtenerUrlImagenQR,
  obtenerUrlSvgQR,
  validarUrl,
} from "@/app/actions/inspeccion";
import type {
  QRGenerateRequest,
  QRGenerateResponse,
  QROptions,
} from "@/types/formTypes";

export const qrAdapter = {
  /**
   * Genera un código QR (base64) a partir de una solicitud.
   */
  async generateQR(data: QRGenerateRequest): Promise<QRGenerateResponse> {
    return generarCodigoQR(data);
  },

  /**
   * Obtiene la URL de descarga/visualización de la imagen PNG del QR.
   */
  async getImageUrl(
    text: string,
    options?: Omit<QROptions, "color" | "errorCorrectionLevel">
  ): Promise<{ url: string }> {
    return obtenerUrlImagenQR(text, options);
  },

  /**
   * Obtiene la URL de descarga/visualización del SVG del QR.
   */
  async getSvgUrl(
    text: string,
    options?: Omit<QROptions, "color" | "errorCorrectionLevel">
  ): Promise<{ url: string }> {
    return obtenerUrlSvgQR(text, options);
  },

  /**
   * Valida el formato de una URL antes de generar el QR.
   */
  async validateUrl(
    url: string
  ): Promise<{ valida: boolean; mensaje?: string }> {
    return validarUrl(url);
  },
};
