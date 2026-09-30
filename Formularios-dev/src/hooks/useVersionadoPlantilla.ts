"use client";

import { useCallback, useState } from "react";
import type {
  AdaptadorVersionado,
  EntradaHistorial,
  PlantillaVersionada,
} from "@/types/versionado";

export interface AvisoVersionado {
  mensaje: string;
  severidad: "success" | "error" | "info" | "warning";
}

interface Opciones {
  /** Operaciones de la API de plantillas correspondiente (IRO o herramientas). */
  adaptador: AdaptadorVersionado;
  /** Recarga el listado después de crear o publicar una revisión. */
  alCambiar: () => void | Promise<void>;
}

const mensajeDe = (e: unknown) =>
  e instanceof Error ? e.message : "No se pudo completar la operación";

/**
 * Estado y operaciones del versionado de plantillas, compartido por las
 * pantallas de IRO/ISOP y de herramientas. Cada una le pasa su adaptador.
 *
 * - `pedirEdicion` pregunta al backend si la revisión se puede editar; si no
 *   (vigente con inspecciones, u obsoleta), deja el motivo en `bloqueo` para
 *   que la pantalla ofrezca crear una revisión nueva en vez de abrir el editor.
 * - `crearRevision` clona la vigente como borrador y la devuelve, para que la
 *   pantalla pueda abrirla directamente en el editor.
 * - `pedirPublicacion` / `confirmarPublicacion` publican un borrador con su
 *   motivo de cambio.
 */
export function useVersionadoPlantilla({ adaptador, alCambiar }: Opciones) {
  const [publicando, setPublicando] = useState<PlantillaVersionada | null>(null);
  const [historial, setHistorial] = useState<{
    plantilla: PlantillaVersionada;
    entradas: EntradaHistorial[];
  } | null>(null);
  const [bloqueo, setBloqueo] = useState<{
    plantilla: PlantillaVersionada;
    motivo: string;
  } | null>(null);
  const [aviso, setAviso] = useState<AvisoVersionado | null>(null);
  const [trabajando, setTrabajando] = useState(false);

  const avisarFallo = useCallback((e: unknown) => {
    setAviso({ mensaje: mensajeDe(e), severidad: "error" });
  }, []);

  const crearRevision = useCallback(
    async (plantilla: PlantillaVersionada): Promise<PlantillaVersionada | null> => {
      setTrabajando(true);
      try {
        const borrador = await adaptador.nuevaRevision(plantilla._id);
        setBloqueo(null);
        setAviso({
          mensaje: `Se creó ${borrador.revision} de «${plantilla.name}» como borrador. Haga los cambios y publíquela cuando esté lista.`,
          severidad: "success",
        });
        await alCambiar();
        return borrador;
      } catch (e) {
        avisarFallo(e);
        return null;
      } finally {
        setTrabajando(false);
      }
    },
    [adaptador, alCambiar, avisarFallo],
  );

  const pedirEdicion = useCallback(
    async (plantilla: PlantillaVersionada, abrirEditor: () => void) => {
      try {
        const estado = await adaptador.estadoEdicion(plantilla._id);
        if (estado.editable) abrirEditor();
        else setBloqueo({ plantilla, motivo: estado.motivo ?? "Esta revisión no se puede editar." });
      } catch (e) {
        avisarFallo(e);
      }
    },
    [adaptador, avisarFallo],
  );

  const confirmarPublicacion = useCallback(
    async (motivo: string): Promise<boolean> => {
      if (!publicando) return false;
      setTrabajando(true);
      try {
        await adaptador.publicar(publicando._id, motivo);
        setAviso({
          mensaje: `${publicando.revision} de «${publicando.name}» ya está vigente; la revisión anterior quedó obsoleta.`,
          severidad: "success",
        });
        setPublicando(null);
        await alCambiar();
        return true;
      } catch (e) {
        avisarFallo(e);
        return false;
      } finally {
        setTrabajando(false);
      }
    },
    [adaptador, alCambiar, avisarFallo, publicando],
  );

  const verHistorial = useCallback(
    async (plantilla: PlantillaVersionada) => {
      try {
        setHistorial({ plantilla, entradas: await adaptador.historial(plantilla.code) });
      } catch (e) {
        avisarFallo(e);
      }
    },
    [adaptador, avisarFallo],
  );

  return {
    trabajando,
    aviso,
    cerrarAviso: useCallback(() => setAviso(null), []),
    crearRevision,
    pedirEdicion,
    bloqueo,
    cerrarBloqueo: useCallback(() => setBloqueo(null), []),
    publicando,
    pedirPublicacion: setPublicando,
    cancelarPublicacion: useCallback(() => setPublicando(null), []),
    confirmarPublicacion,
    historial,
    verHistorial,
    cerrarHistorial: useCallback(() => setHistorial(null), []),
  };
}
