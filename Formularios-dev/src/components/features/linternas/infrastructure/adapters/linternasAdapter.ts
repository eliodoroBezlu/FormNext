import {
  anularEntrega,
  corregirEntrega,
  descargarActa,
  firmarRecibo,
  obtenerEntregas,
  obtenerPerdidas,
  obtenerPorArea,
  obtenerPorTrabajador,
  obtenerResumen,
  obtenerEstadoTrabajador,
  obtenerHistorialTrabajador,
  obtenerPendientes,
  obtenerSinDotacion,
  obtenerStock,
  reclasificarEntrega,
  registrarEntrega,
  registrarIngresoStock,
  resolverPerdida,
  subirArchivoLinterna,
} from "@/lib/actions/linterna-actions";
import {
  enMegas,
  reducirImagen,
  TAMANO_MAXIMO_SUBIDA,
} from "@/components/ui/camera/reducirImagen";
import type {
  AnularEntregaPayload,
  ArchivoAdjunto,
  CorregirEntregaPayload,
  EntregaLinterna,
  EstadoTrabajador,
  FilaPorArea,
  FilaPorTrabajador,
  ReclasificarEntregaPayload,
  RegistrarEntregaPayload,
  ResumenLinternas,
  StockLinternas,
  TrabajadorSinDotacion,
} from "../../domain/models/Linterna";

const RESUMEN_VACIO: ResumenLinternas = {
  totalTrabajadores: 0,
  conDotacion: 0,
  sinDotacion: 0,
  totalCambios: 0,
  totalPerdidas: 0,
  perdidasPendientes: 0,
  stockDisponible: 0,
  ingresadas: 0,
  entregadas: 0,
};

/**
 * Único punto por el que la capa de presentación llega al servidor.
 *
 * Traduce el error crudo del backend a un mensaje utilizable: los conflictos de
 * este módulo (ya tiene dotación, no hay stock, falta la firma) son
 * precisamente lo que el usuario necesita leer, así que se dejan pasar tal cual
 * en vez de esconderlos tras un «error inesperado».
 */
const mensajeDeError = (error: unknown, porDefecto: string): string => {
  if (error instanceof Error && error.message) return error.message;
  return porDefecto;
};

/**
 * Un id vacío llegaba al servidor como la cadena «undefined» y volvía en un 500
 * sin decir nada útil. Se corta aquí, que es donde se sabe qué falta.
 */
const exigirId = (id: string | undefined, que: string): string => {
  if (!id) throw new Error(`Falta el identificador ${que}.`);
  return id;
};

export const linternasAdapter = {
  async estadoDeTrabajador(id: string): Promise<EstadoTrabajador> {
    try {
      return await obtenerEstadoTrabajador(exigirId(id, "del trabajador"));
    } catch (error) {
      throw new Error(
        mensajeDeError(error, "No se pudo consultar el estado del trabajador."),
      );
    }
  },

  async historial(id: string): Promise<EntregaLinterna[]> {
    if (!id) return [];
    try {
      return await obtenerHistorialTrabajador(id);
    } catch {
      return [];
    }
  },

  async entregas(filtros?: {
    area?: string;
    estado?: string;
  }): Promise<EntregaLinterna[]> {
    try {
      return await obtenerEntregas(filtros);
    } catch {
      return [];
    }
  },

  async pendientes(): Promise<EntregaLinterna[]> {
    try {
      return await obtenerPendientes();
    } catch {
      return [];
    }
  },

  async sinDotacion(): Promise<TrabajadorSinDotacion[]> {
    try {
      return await obtenerSinDotacion();
    } catch {
      return [];
    }
  },

  async stock(): Promise<StockLinternas> {
    try {
      return await obtenerStock();
    } catch {
      return { cantidadDisponible: 0, ingresos: [] };
    }
  },

  async registrar(payload: RegistrarEntregaPayload): Promise<EntregaLinterna> {
    try {
      return await registrarEntrega(payload);
    } catch (error) {
      throw new Error(
        mensajeDeError(error, "No se pudo registrar la entrega."),
      );
    }
  },

  async resolver(
    id: string,
    payload: {
      aprobar: boolean;
      firmaAprobador?: string;
      metodoFirma?: string;
      comentario?: string;
    },
  ): Promise<EntregaLinterna> {
    try {
      return await resolverPerdida(id, payload);
    } catch (error) {
      throw new Error(
        mensajeDeError(error, "No se pudo resolver la solicitud."),
      );
    }
  },

  /**
   * Cambia el tipo de una entrega mal registrada.
   *
   * Los conflictos que devuelve el servidor —«ya está firmada», «una pérdida
   * no lleva devolución»— son exactamente lo que hay que leer antes de
   * reintentar, así que se dejan pasar tal cual.
   */
  async reclasificar(
    id: string,
    payload: ReclasificarEntregaPayload,
  ): Promise<EntregaLinterna> {
    try {
      return await reclasificarEntrega(exigirId(id, "de la entrega"), payload);
    } catch (error) {
      throw new Error(
        mensajeDeError(error, "No se pudo reclasificar la entrega."),
      );
    }
  },

  async anular(
    id: string,
    payload: AnularEntregaPayload,
  ): Promise<EntregaLinterna> {
    try {
      return await anularEntrega(exigirId(id, "de la entrega"), payload);
    } catch (error) {
      throw new Error(mensajeDeError(error, "No se pudo anular la entrega."));
    }
  },

  async corregir(
    id: string,
    payload: CorregirEntregaPayload,
  ): Promise<EntregaLinterna> {
    try {
      return await corregirEntrega(exigirId(id, "de la entrega"), payload);
    } catch (error) {
      throw new Error(mensajeDeError(error, "No se pudo corregir la entrega."));
    }
  },

  async firmar(
    id: string,
    firmaTrabajador: string,
    metodoFirma?: string,
  ): Promise<EntregaLinterna> {
    try {
      return await firmarRecibo(id, { firmaTrabajador, metodoFirma });
    } catch (error) {
      throw new Error(mensajeDeError(error, "No se pudo guardar la firma."));
    }
  },

  async ingresarStock(
    cantidad: number,
    observacion?: string,
  ): Promise<{ cantidadDisponible: number }> {
    try {
      return await registrarIngresoStock({ cantidad, observacion });
    } catch (error) {
      throw new Error(
        mensajeDeError(error, "No se pudo registrar el ingreso."),
      );
    }
  },

  async resumen(): Promise<ResumenLinternas> {
    try {
      return await obtenerResumen();
    } catch {
      return RESUMEN_VACIO;
    }
  },

  async porArea(): Promise<FilaPorArea[]> {
    try {
      return await obtenerPorArea();
    } catch {
      return [];
    }
  },

  async porTrabajador(): Promise<FilaPorTrabajador[]> {
    try {
      return await obtenerPorTrabajador();
    } catch {
      return [];
    }
  },

  async perdidas(filtros?: {
    desde?: string;
    hasta?: string;
  }): Promise<EntregaLinterna[]> {
    try {
      return await obtenerPerdidas(filtros);
    } catch {
      return [];
    }
  },

  /**
   * Trae el acta y dispara la descarga en el navegador.
   *
   * El backend la manda en base64 porque una Server Action no responde con un
   * stream binario; aquí se rehidrata a Blob para que el navegador la guarde.
   */
  async descargarActa(id: string): Promise<void> {
    const { base64, nombre } = await descargarActa(id);

    const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
    const url = URL.createObjectURL(
      new Blob([bytes], { type: "application/pdf" }),
    );

    const enlace = document.createElement("a");
    enlace.href = url;
    enlace.download = nombre;
    enlace.click();
    URL.revokeObjectURL(url);
  },

  async subirArchivo(archivo: File): Promise<ArchivoAdjunto> {
    // Se encoge aquí, en el único punto por el que pasan todas las subidas del
    // módulo, y no en cada pantalla que ofrece un selector de archivos: así no
    // hay forma de añadir una nueva y olvidarse. Los PDF pasan intactos.
    const aSubir = await reducirImagen(archivo);

    // Se comprueba **después** de encoger, porque lo que importa es lo que se
    // va a mandar, no lo que se eligió. Y se comprueba aquí, en el navegador,
    // porque pasarse del tope de las Server Actions no produce un error con
    // explicación: produce un «An error occurred in the Server Components
    // render» que no menciona el tamaño y manda a buscar donde no es.
    if (aSubir.size > TAMANO_MAXIMO_SUBIDA) {
      const esImagen = aSubir.type.startsWith("image/");
      throw new Error(
        `El archivo pesa ${enMegas(aSubir.size)} y el máximo son ` +
          `${enMegas(TAMANO_MAXIMO_SUBIDA)}.` +
          (esImagen
            ? " Haz la foto con menos resolución o recórtala antes de subirla."
            : " Comprímelo o divídelo antes de subirlo."),
      );
    }

    const formData = new FormData();
    formData.append("file", aSubir);
    try {
      const subido = await subirArchivoLinterna(formData);
      return {
        url: subido.url,
        // El nombre que se muestra es el que eligió la persona, aunque el
        // archivo haya cambiado de extensión al recomprimirse.
        nombre: archivo.name,
        mime: subido.mimetype,
        tamano: subido.size,
      };
    } catch (error) {
      throw new Error(mensajeDeError(error, "No se pudo subir el archivo."));
    }
  },
};
