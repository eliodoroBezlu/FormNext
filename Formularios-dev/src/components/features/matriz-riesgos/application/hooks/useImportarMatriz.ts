"use client";

import { useCallback, useMemo, useState } from "react";
import {
  analizarMatriz,
  importarMatriz,
} from "../../infrastructure/adapters/matrizRiesgosAdapter";
import {
  ResultadoAnalisis,
  ResumenImportacionGuardada,
} from "../../domain/models/IProps";

export type PasoImportacion = "archivo" | "revision" | "listo";

/**
 * Orquesta la importación de una matriz en tres pasos:
 * archivo → revisión de diferencias → confirmación.
 *
 * El paso intermedio no es decorativo: es lo que convierte la importación en
 * una verificación de que el motor reproduce la metodología, en vez de una
 * carga a ciegas donde el Excel pasa a ser la verdad sin que nadie lo mire.
 */
export function useImportarMatriz() {
  const [paso, setPaso] = useState<PasoImportacion>("archivo");
  const [archivo, setArchivo] = useState<File | null>(null);
  const [analisis, setAnalisis] = useState<ResultadoAnalisis | null>(null);
  const [guardada, setGuardada] = useState<ResumenImportacionGuardada | null>(
    null,
  );
  const [areaCodigo, setAreaCodigo] = useState<string>("");
  /**
   * Año de la matriz. Se precarga del archivo, pero es editable: sale del
   * nombre de la hoja o de las fechas del encabezado, y la mayoría de las
   * matrices de Mantenimiento Planta no traen ninguno de los dos. Sin año el
   * backend rechaza la confirmación, así que tiene que poder escribirse.
   */
  const [anio, setAnio] = useState<string>("");
  const [nuevaVersion, setNuevaVersion] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analizar = useCallback(async (file: File) => {
    setCargando(true);
    setError(null);
    setArchivo(file);

    const formData = new FormData();
    formData.append("file", file);

    const res = await analizarMatriz(formData);
    setCargando(false);

    if (!res.success || !res.data) {
      setError(res.error ?? "No se pudo analizar el archivo");
      return;
    }

    setAnalisis(res.data);
    // Con una sola candidata se preselecciona; con varias o ninguna, el
    // usuario tiene que elegir antes de poder confirmar.
    const candidatas = res.data.areasCandidatas ?? [];
    setAreaCodigo(candidatas.length === 1 ? (candidatas[0].codigo ?? "") : "");
    setAnio(res.data.cabecera.anio ? String(res.data.cabecera.anio) : "");
    setPaso("revision");
  }, []);

  const confirmar = useCallback(async () => {
    if (!archivo) return;
    setCargando(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", archivo);
    if (areaCodigo) formData.append("areaCodigo", areaCodigo);
    if (anio) formData.append("anio", anio);
    if (nuevaVersion) formData.append("nuevaVersion", "true");

    const res = await importarMatriz(formData);
    setCargando(false);

    if (!res.success || !res.data) {
      setError(res.error ?? "No se pudo importar la matriz");
      return;
    }

    setGuardada(res.data);
    setPaso("listo");
  }, [archivo, areaCodigo, anio, nuevaVersion]);

  const reiniciar = useCallback(() => {
    setPaso("archivo");
    setArchivo(null);
    setAnalisis(null);
    setGuardada(null);
    setAreaCodigo("");
    setAnio("");
    setNuevaVersion(false);
    setError(null);
  }, []);

  /**
   * Motivos por los que todavía no se puede confirmar. Se devuelven como
   * lista y no como booleano para poder decir *por qué* está deshabilitado
   * el botón, en vez de dejar al usuario adivinando.
   */
  const impedimentos = useMemo<string[]>(() => {
    if (!analisis) return ["Falta analizar el archivo."];
    const motivos = [...analisis.errores];

    if (analisis.resumen.totalDiscrepancias > 0) {
      motivos.push(
        `Hay ${analisis.resumen.totalDiscrepancias} valor(es) donde el archivo y el sistema no coinciden.`,
      );
    }
    if (!areaCodigo) {
      motivos.push("Falta elegir el área a la que pertenece la matriz.");
    }
    // El mismo rango que valida el DTO del backend, para no enterarse recién
    // en el 400.
    const n = Number(anio);
    if (!anio || !Number.isInteger(n) || n < 2000 || n > 2100) {
      motivos.push("Falta indicar el año de la matriz (entre 2000 y 2100).");
    }
    return motivos;
  }, [analisis, areaCodigo, anio]);

  return {
    paso,
    archivo,
    analisis,
    guardada,
    areaCodigo,
    setAreaCodigo,
    anio,
    setAnio,
    nuevaVersion,
    setNuevaVersion,
    cargando,
    error,
    impedimentos,
    puedeConfirmar: impedimentos.length === 0,
    analizar,
    confirmar,
    reiniciar,
    volverAArchivo: () => setPaso("archivo"),
  };
}
