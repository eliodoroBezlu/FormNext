"use client";

import { useState } from "react";
import {
  problemaDelArchivo,
  type ResultadoCargaPlanilla,
} from "../../domain/cargaPlanilla";
import type { ActionResult } from "../../infrastructure/adapters/planesAccionAdapter";
import { mensajeParaUsuario } from "@/lib/errores/mensajeParaUsuario";

type Cargar = (
  formData: FormData,
  aplicar: boolean,
) => Promise<ActionResult<ResultadoCargaPlanilla>>;

/**
 * El estado del diálogo «Subir planilla»: al elegir el archivo se revisa (no
 * se guarda nada) y «Aplicar» lo vuelve a mandar para aplicarlo. El backend
 * revisa de nuevo al aplicar, así que lo que cambie entre medio no se pisa.
 */
export function useCargaPlanilla(cargar: Cargar) {
  const [archivo, setArchivo] = useState<File | null>(null);
  const [resultado, setResultado] = useState<ResultadoCargaPlanilla | null>(null);
  const [enCurso, setEnCurso] = useState<"revisando" | "aplicando" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const enviar = async (elegido: File, aplicar: boolean) => {
    const datos = new FormData();
    datos.append("file", elegido);
    setEnCurso(aplicar ? "aplicando" : "revisando");
    setError(null);
    try {
      const respuesta = await cargar(datos, aplicar);
      if (respuesta.success && respuesta.data) {
        setResultado(respuesta.data);
      } else {
        setError(respuesta.error ?? "No se pudo leer la planilla");
      }
    } catch (e) {
      setError(mensajeParaUsuario(e, "No se pudo leer la planilla"));
    } finally {
      setEnCurso(null);
    }
  };

  const elegir = (elegido: File | null) => {
    setResultado(null);
    setError(null);
    setArchivo(elegido);
    if (!elegido) return;
    const problema = problemaDelArchivo(elegido);
    if (problema) {
      setError(problema);
      return;
    }
    void enviar(elegido, false);
  };

  const aplicar = () => {
    if (archivo && resultado && !resultado.aplicado) void enviar(archivo, true);
  };

  const reiniciar = () => {
    setArchivo(null);
    setResultado(null);
    setError(null);
    setEnCurso(null);
  };

  return { archivo, resultado, enCurso, error, elegir, aplicar, reiniciar };
}
