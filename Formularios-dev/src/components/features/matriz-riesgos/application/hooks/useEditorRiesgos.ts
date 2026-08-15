"use client";

import { useCallback, useEffect, useState } from "react";
import {
  actualizarActividad,
  actualizarRiesgo,
  agregarActividad,
  agregarRiesgo,
  eliminarActividad,
  eliminarRiesgo,
  obtenerOpcionesDeCategoria,
  previsualizarRiesgo,
} from "../../infrastructure/adapters/matrizRiesgosAdapter";
import {
  ActividadDto,
  MatrizRiesgo,
  OpcionesDeCategoria,
  PreviaRiesgo,
  RiesgoDto,
} from "../../domain/models/IProps";

/** Espera antes de pedir la vista previa, para no llamar en cada tecla. */
const RETARDO_PREVIA_MS = 400;

interface Resultado {
  ok: boolean;
  mensaje: string;
}

/**
 * Alta, edición y borrado de riesgos de una matriz en BORRADOR.
 *
 * La vista previa del nivel la calcula el servidor: acá solo se debouncea la
 * llamada y se descartan las respuestas que llegan fuera de orden.
 */
export function useEditorRiesgos(
  matrizId: string,
  onMatrizActualizada: (matriz: MatrizRiesgo) => void,
) {
  /**
   * Categoría de la actividad en la que se está trabajando: define qué
   * catálogos se ofrecen a todos sus riesgos.
   */
  const [categoria, setCategoria] = useState("Seguridad");
  const [opciones, setOpciones] = useState<OpcionesDeCategoria | null>(null);

  const [previa, setPrevia] = useState<PreviaRiesgo | null>(null);
  const [guardando, setGuardando] = useState(false);

  // Catálogos de la categoría elegida.
  useEffect(() => {
    let vigente = true;

    const traer = async () => {
      const op = await obtenerOpcionesDeCategoria(categoria);
      if (vigente) setOpciones(op);
    };

    void traer();
    return () => {
      vigente = false;
    };
  }, [categoria]);

  /**
   * Pide la evaluación al servidor con retardo.
   *
   * `vigente` descarta la respuesta si mientras tanto se volvió a escribir: sin
   * eso, una respuesta lenta de un valor viejo podría pisar a la del actual y
   * mostrar un nivel que ya no corresponde.
   */
  const pedirPrevia = useCallback(
    (
      datos: Pick<
        RiesgoDto,
        "exposicion" | "posibilidad" | "severidad" | "controles"
      >,
    ): (() => void) => {
      const fueraDeRango =
        !datos.exposicion || !datos.posibilidad || !datos.severidad;
      if (fueraDeRango) {
        setPrevia(null);
        return () => undefined;
      }

      let vigente = true;
      const temporizador = setTimeout(() => {
        void (async () => {
          const p = await previsualizarRiesgo({
            exposicion: datos.exposicion,
            posibilidad: datos.posibilidad,
            severidad: datos.severidad,
            controles: (datos.controles ?? []).map((c) => ({
              calidadControl: c.calidadControl,
              jerarquiaControl: c.jerarquiaControl,
            })),
          });
          if (vigente) setPrevia(p);
        })();
      }, RETARDO_PREVIA_MS);

      return () => {
        vigente = false;
        clearTimeout(temporizador);
      };
    },
    [],
  );

  const guardar = useCallback(
    async (
      nroActividad: number,
      dto: RiesgoDto,
      numero?: number,
    ): Promise<Resultado> => {
      setGuardando(true);
      const res =
        numero === undefined
          ? await agregarRiesgo(matrizId, nroActividad, dto)
          : await actualizarRiesgo(matrizId, nroActividad, numero, dto);
      setGuardando(false);

      if (res.success && res.data) {
        onMatrizActualizada(res.data);
        return { ok: true, mensaje: res.message ?? "Riesgo guardado" };
      }
      return { ok: false, mensaje: res.error ?? "No se pudo guardar" };
    },
    [matrizId, onMatrizActualizada],
  );

  const borrar = useCallback(
    async (nroActividad: number, numero: number): Promise<Resultado> => {
      setGuardando(true);
      const res = await eliminarRiesgo(matrizId, nroActividad, numero);
      setGuardando(false);

      if (res.success && res.data) {
        onMatrizActualizada(res.data);
        return { ok: true, mensaje: res.message ?? "Riesgo eliminado" };
      }
      return { ok: false, mensaje: res.error ?? "No se pudo eliminar" };
    },
    [matrizId, onMatrizActualizada],
  );

  /** Alta, edición y borrado del encabezado de una actividad. */
  const guardarActividad = useCallback(
    async (dto: ActividadDto, numero?: number): Promise<Resultado> => {
      setGuardando(true);
      const res =
        numero === undefined
          ? await agregarActividad(matrizId, dto)
          : await actualizarActividad(matrizId, numero, dto);
      setGuardando(false);

      if (res.success && res.data) {
        onMatrizActualizada(res.data);
        return { ok: true, mensaje: res.message ?? "Actividad guardada" };
      }
      return { ok: false, mensaje: res.error ?? "No se pudo guardar" };
    },
    [matrizId, onMatrizActualizada],
  );

  const borrarActividad = useCallback(
    async (numero: number): Promise<Resultado> => {
      setGuardando(true);
      const res = await eliminarActividad(matrizId, numero);
      setGuardando(false);

      if (res.success && res.data) {
        onMatrizActualizada(res.data);
        return { ok: true, mensaje: res.message ?? "Actividad eliminada" };
      }
      return { ok: false, mensaje: res.error ?? "No se pudo eliminar" };
    },
    [matrizId, onMatrizActualizada],
  );

  return {
    categoria,
    setCategoria,
    opciones,
    previa,
    pedirPrevia,
    guardando,
    guardar,
    borrar,
    guardarActividad,
    borrarActividad,
  };
}
