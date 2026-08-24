/**
 * Convierte el archivo de imagen que sube el usuario en un data URL apto para
 * guardar como firma.
 *
 * ── Por qué reescalar es obligatorio y no una mejora ──────────────────────
 *
 * Las firmas se guardan **dentro del documento**, como data URL base64, igual
 * que las dibujadas. Una foto de celular pesa 3–5 MB y en base64 crece un 33 %:
 * la primera firma sacada con la cámara supera el límite de 10 MB del backend y
 * el guardado falla; las que pasan inflan cada inspección para siempre.
 *
 * Una firma es un trazo sobre fondo claro: a 600 px de ancho se lee igual que a
 * 4000 y ocupa dos órdenes de magnitud menos.
 */

/** Ancho máximo del resultado. Suficiente para una firma legible en A4. */
const ANCHO_MAXIMO = 600;

/** Tope del archivo de entrada, antes de tocarlo. */
export const TAMANO_MAXIMO_BYTES = 10 * 1024 * 1024;

export class ImagenFirmaInvalida extends Error {}

const leerComoDataUrl = (archivo: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const lector = new FileReader();
    lector.onload = () => resolve(String(lector.result));
    lector.onerror = () =>
      reject(new ImagenFirmaInvalida('No se pudo leer el archivo.'));
    lector.readAsDataURL(archivo);
  });

const cargarImagen = (dataUrl: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () =>
      reject(
        new ImagenFirmaInvalida('El archivo no es una imagen que se pueda abrir.'),
      );
    img.src = dataUrl;
  });

/**
 * @throws {ImagenFirmaInvalida} si no es imagen, si excede el tope o si no se
 * puede decodificar. El mensaje está escrito para mostrarse tal cual al usuario.
 */
export async function normalizarImagenFirma(archivo: File): Promise<string> {
  if (!archivo.type.startsWith('image/')) {
    throw new ImagenFirmaInvalida(
      'El archivo debe ser una imagen (JPG, PNG o similar).',
    );
  }
  if (archivo.size > TAMANO_MAXIMO_BYTES) {
    const mb = (archivo.size / 1024 / 1024).toFixed(1);
    throw new ImagenFirmaInvalida(
      `La imagen pesa ${mb} MB y el máximo son 10 MB.`,
    );
  }

  const original = await leerComoDataUrl(archivo);
  const imagen = await cargarImagen(original);

  if (!imagen.width || !imagen.height) {
    throw new ImagenFirmaInvalida('La imagen no tiene dimensiones válidas.');
  }

  // Solo se reduce. Ampliar una firma pequeña no añade detalle, solo peso.
  const escala = Math.min(1, ANCHO_MAXIMO / imagen.width);
  const ancho = Math.round(imagen.width * escala);
  const alto = Math.round(imagen.height * escala);

  const lienzo = document.createElement('canvas');
  lienzo.width = ancho;
  lienzo.height = alto;

  const ctx = lienzo.getContext('2d');
  if (!ctx) {
    throw new ImagenFirmaInvalida('El navegador no pudo procesar la imagen.');
  }

  // Fondo blanco: un JPG no tiene transparencia, pero un PNG recortado sí, y
  // sobre el fondo oscuro del tema la firma quedaría invisible.
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, ancho, alto);
  ctx.drawImage(imagen, 0, 0, ancho, alto);

  // PNG para salir con el mismo formato que las dibujadas, que es lo que los
  // generadores de Excel y PDF ya saben incrustar.
  return lienzo.toDataURL('image/png');
}
