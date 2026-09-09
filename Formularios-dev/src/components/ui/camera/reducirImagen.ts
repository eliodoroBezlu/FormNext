/**
 * Reduce una imagen elegida del dispositivo antes de subirla.
 *
 * La cámara del sistema ya entregaba fotos pequeñas —captura a 1600 px y las
 * comprime—, pero un archivo elegido con «subir foto» viaja **tal cual sale
 * del sensor**: entre 3 y 6 MB en cualquier teléfono o tablet moderna. Y las
 * Server Actions de Next aceptan por defecto **1 MB**, así que la subida
 * fallaba con un error genérico de renderizado del servidor, sin decir en
 * ningún sitio que el problema era el tamaño.
 *
 * Se notaba solo en tablets, y no por ser tablets: es que ahí `getUserMedia`
 * no existe —hace falta HTTPS— así que el botón de cámara no aparece y no
 * queda más remedio que elegir el archivo original.
 *
 * Para dejar constancia de que una linterna se entregó o se devolvió, 1600 px
 * sobran: se lee el estado del equipo sin problema y el archivo baja a unos
 * pocos cientos de kB.
 */

/** Lado más largo de la imagen resultante, en píxeles. */
export const LADO_MAXIMO = 1600;

export const CALIDAD_JPEG = 0.9;

/**
 * Lo máximo que admite una subida, en bytes.
 *
 * Tiene que coincidir con `serverActions.bodySizeLimit` de `next.config.ts` y
 * con el tope de Express en el backend; los tres son 10 MB. Si alguno cambia,
 * cambian los tres o vuelve el error sin explicación.
 */
export const TAMANO_MAXIMO_SUBIDA = 10 * 1024 * 1024;

/** Tamaño en un formato que se pueda leer en un mensaje de error. */
export const enMegas = (bytes: number): string =>
  `${(bytes / 1024 / 1024).toFixed(1).replace(".", ",")} MB`;

/** Por debajo de esto no se toca: reprocesar solo perdería calidad. */
const TAMANO_MINIMO_PARA_REDUCIR = 600 * 1024;

const esImagen = (archivo: File): boolean => archivo.type.startsWith("image/");

/**
 * Devuelve la imagen reducida, o **el archivo original** si no hay nada que
 * hacer o si algo falla.
 *
 * Nunca lanza: que no se pueda encoger una foto no es motivo para impedir que
 * se suba. Si el navegador no puede con ella, que decida el límite del
 * servidor y no esta función.
 */
export async function reducirImagen(archivo: File): Promise<File> {
  // Un PDF adjunto pasa de largo: aquí solo se tocan imágenes.
  if (!esImagen(archivo)) return archivo;
  if (archivo.size <= TAMANO_MINIMO_PARA_REDUCIR) return archivo;
  if (typeof document === "undefined") return archivo;

  try {
    const bitmap = await crearBitmap(archivo);
    const escala = Math.min(
      1,
      LADO_MAXIMO / Math.max(bitmap.width, bitmap.height),
    );

    // Ya es pequeña de dimensiones aunque pese: recomprimirla la estropearía
    // sin ganar tamaño real.
    if (escala === 1 && archivo.type === "image/jpeg") return archivo;

    const lienzo = document.createElement("canvas");
    lienzo.width = Math.round(bitmap.width * escala);
    lienzo.height = Math.round(bitmap.height * escala);

    const ctx = lienzo.getContext("2d");
    if (!ctx) return archivo;
    ctx.drawImage(bitmap, 0, 0, lienzo.width, lienzo.height);

    const blob = await new Promise<Blob | null>((resolver) =>
      lienzo.toBlob(resolver, "image/jpeg", CALIDAD_JPEG),
    );
    if (!blob) return archivo;

    // Si el resultado no es más pequeño, no ha servido de nada.
    if (blob.size >= archivo.size) return archivo;

    const nombre = archivo.name.replace(/\.[^.]+$/, "") + ".jpg";
    return new File([blob], nombre, {
      type: "image/jpeg",
      lastModified: Date.now(),
    });
  } catch {
    return archivo;
  }
}

/**
 * `createImageBitmap` es lo rápido y lo que no bloquea el hilo, pero Safari lo
 * incorporó tarde; el `<img>` con object URL funciona en todo lo demás.
 */
async function crearBitmap(
  archivo: File,
): Promise<ImageBitmap | HTMLImageElement> {
  if (typeof createImageBitmap === "function") {
    return createImageBitmap(archivo);
  }

  const url = URL.createObjectURL(archivo);
  try {
    return await new Promise<HTMLImageElement>((resolver, rechazar) => {
      const img = new Image();
      img.onload = () => resolver(img);
      img.onerror = () => rechazar(new Error("no se pudo leer la imagen"));
      img.src = url;
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}
