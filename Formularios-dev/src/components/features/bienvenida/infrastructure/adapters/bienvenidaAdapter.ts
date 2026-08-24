import { uploadImageToCloudinary } from "@/lib/actions/cloudinary";
import {
  BIENVENIDA_POR_DEFECTO,
  normalizar,
  type ConfigBienvenida,
} from "../../domain/models/Bienvenida";

/**
 * Se llama al backend por la reescritura `/api/forms/*` y no a su URL directa.
 *
 * Es el mismo origen, así que entra por `connect-src 'self'` de la CSP y no
 * necesita CORS. La alternativa —apuntar al backend— obligaría a mantener su
 * host en la cabecera de seguridad para una pantalla decorativa.
 */
const RUTA = "/api/forms/config-bienvenida";

/** Si tarda más que esto, no vale la pena esperarla: se usa la caché. */
const TIEMPO_LIMITE_MS = 4000;

export const bienvenidaAdapter = {
  /**
   * Lee la configuración pública.
   *
   * **Nunca lanza.** Cualquier fallo —red caída, backend en despliegue, JSON
   * corrupto— devuelve los valores por defecto. Esta pantalla se dibuja
   * delante del login: si supiera fallar, sabría dejar a alguien fuera del
   * sistema.
   */
  async obtener(): Promise<ConfigBienvenida> {
    try {
      const corte = AbortSignal.timeout(TIEMPO_LIMITE_MS);
      const res = await fetch(RUTA, { signal: corte, cache: "no-store" });
      if (!res.ok) return BIENVENIDA_POR_DEFECTO;
      return normalizar(await res.json());
    } catch {
      return BIENVENIDA_POR_DEFECTO;
    }
  },

  /** Lo guardado tal cual, para la pantalla de configuración. */
  async obtenerCrudo(): Promise<ConfigBienvenida> {
    const res = await fetch(`${RUTA}/crudo`, { cache: "no-store" });
    if (!res.ok) throw new Error("No se pudo leer la configuración.");
    return normalizar(await res.json());
  },

  /**
   * Sube el logotipo y devuelve su URL.
   *
   * Reutiliza el mismo Server Action que ya usa el constructor de formularios:
   * las claves de Cloudinary no salen del servidor y **en la base solo se
   * guarda la URL**, nunca la imagen. Cloudinary además la redimensiona y
   * elige el formato, así que un PNG de 4 MB no acaba en la pantalla de
   * entrada.
   *
   * Carpeta propia (`marca`) para no mezclarla con las imágenes de las
   * plantillas de inspección, que es otra cosa.
   *
   * **Sobre el SVG.** Se acepta, y no contradice la decisión de no admitir
   * animaciones subidas. La diferencia está en cómo se pinta: aquí el logo va
   * en un `<img src=…>`, y el navegador **no ejecuta scripts** de un SVG
   * cargado así. Lo peligroso es *incrustar* el SVG en el DOM —que es lo que
   * haría falta para animarlo—, porque entonces sí corre lo que lleve dentro.
   */
  async subirLogo(archivo: File): Promise<string> {
    if (!archivo.type.startsWith("image/")) {
      throw new Error("El logotipo debe ser una imagen.");
    }
    if (archivo.size > 5 * 1024 * 1024) {
      throw new Error("La imagen no debe pesar más de 5 MB.");
    }

    const datos = new FormData();
    datos.append("file", archivo);
    const { url } = await uploadImageToCloudinary(datos, "marca");
    return url;
  },

  async guardar(cambios: Partial<ConfigBienvenida>): Promise<ConfigBienvenida> {
    const res = await fetch(RUTA, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cambios),
    });
    if (!res.ok) {
      const cuerpo = (await res.json().catch(() => ({}))) as {
        mensaje?: string;
        message?: string;
      };
      throw new Error(
        cuerpo.mensaje ?? cuerpo.message ?? "No se pudo guardar la configuración.",
      );
    }
    return normalizar(await res.json());
  },
};
