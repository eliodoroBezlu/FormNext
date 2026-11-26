"use client";

import { useEffect, useState } from "react";
import { Alert, Box, Snackbar, Stack } from "@mui/material";
import { FormProvider, useForm, type Path } from "react-hook-form";
import {
  faltantesParaEnviar,
  piezasDesdeAntecedentes,
  piezasSinTocar,
  valoresDesdeReporte,
  valoresVacios,
  type ValoresReporte,
} from "../../domain/formularioReporte";
import type { AccionesReporte } from "../../domain/accionesReporte";
import type {
  AntecedentesReporte,
  BombaResumen,
  Catalogos,
  Coordinador,
  ImagenSubida,
  PlantillaMedicion,
  ReporteMonitoreo,
  UsoDeImagen,
} from "../../domain/models/Monitoreo";
import { motivosDeError } from "../../infrastructure/adapters/monitoreoAdapter";
import type { MedicionEnPantalla } from "../../application/hooks/useReporteMonitoreo";
import { useGrillaDeMedicion } from "../../application/hooks/useGrillaDeMedicion";
import { BarraAccionesReporte } from "./BarraAccionesReporte";
import { HistorialReporte } from "./HistorialReporte";
import { SeccionAnalisis } from "./SeccionAnalisis";
import { SeccionAnexos } from "./SeccionAnexos";
import { SeccionAntecedentes } from "./SeccionAntecedentes";
import { SeccionAntecedentesMedicion } from "./SeccionAntecedentesMedicion";
import { SeccionEspesores } from "./SeccionEspesores";
import { SeccionCabecera } from "./SeccionCabecera";
import { SeccionRecopilacion } from "./SeccionRecopilacion";
import { SeccionTareas } from "./SeccionTareas";

export interface ReporteFormProps {
  reporte: ReporteMonitoreo | null;
  /** Un reporte nuevo que ya sabe de qué bomba es (viene de su ficha). */
  tagInicial?: string;
  antecedentes: AntecedentesReporte | null;
  /** La grilla de espesores del tag y la técnica, si tienen plantilla. */
  medicion: MedicionEnPantalla | null;
  catalogos: Catalogos;
  bombas: BombaResumen[];
  plantillasMedicion: PlantillaMedicion[];
  coordinadores: Coordinador[];
  fotosPorFila: number;
  acciones: AccionesReporte;
  colorDeResultado: (r?: string) => string | undefined;
  prellenar: (
    tag: string,
    fecha: string,
    horas: string,
    tecnica: string,
  ) => Promise<AntecedentesReporte | null>;
  guardar: (v: ValoresReporte) => Promise<ReporteMonitoreo>;
  enviar: (v: ValoresReporte) => Promise<ReporteMonitoreo>;
  devolver: (motivo: string) => Promise<ReporteMonitoreo>;
  emitir: () => Promise<ReporteMonitoreo>;
  darDeBaja: () => Promise<ReporteMonitoreo>;
  subirImagen: (archivo: File, uso: UsoDeImagen) => Promise<ImagenSubida>;
  /** Tras el primer guardado de un reporte nuevo, o al descartarlo. */
  onCreado: (r: ReporteMonitoreo) => void;
  onDescartado: () => void;
}

const hoy = () => new Date().toISOString().slice(0, 10);

/** Lleva la vista al primer campo marcado (doble frame: MUI pinta el error en el siguiente). */
function irAlPrimerError() {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const el = document.querySelector<HTMLElement>('[data-question-error="true"]');
      if (!el) return;
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      (el.querySelector<HTMLElement>("input, textarea") ?? el).focus?.();
    });
  });
}

/** Raíz del formulario del reporte (RHF). La lógica de servidor llega por props. */
export function ReporteForm(p: ReporteFormProps) {
  const metodos = useForm<ValoresReporte>({
    defaultValues: p.reporte
      ? valoresDesdeReporte(p.reporte)
      : { ...valoresVacios(hoy()), tag: p.tagInicial ?? "" },
    mode: "onTouched",
  });
  const {
    reset,
    getValues,
    setValue,
    setError,
    clearErrors,
    formState: { isDirty },
  } = metodos;

  const [trabajando, setTrabajando] = useState(false);
  const [errores, setErrores] = useState<string[] | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const soloLectura = !p.acciones.editar;
  const conMedicion = p.medicion !== null;

  // Lo que vuelve del servidor tras cada guardado manda: deja el formulario limpio.
  useEffect(() => {
    if (p.reporte) reset(valoresDesdeReporte(p.reporte));
  }, [p.reporte, reset]);

  // En un reporte nuevo, en cuanto llegan los antecedentes de la bomba: el
  // alcance arranca con el de su ficha y la tabla de piezas con sus piezas.
  // Lo que el analista ya escribió no se toca.
  const prellenado = p.reporte ? null : p.antecedentes;
  useEffect(() => {
    if (!prellenado) return;
    const alcance = prellenado.ficha.alcance;
    if (alcance && !getValues("alcance")) {
      setValue("alcance", alcance, { shouldDirty: true });
    }
    if (piezasSinTocar(getValues("piezas"))) {
      setValue("piezas", piezasDesdeAntecedentes(prellenado), { shouldDirty: true });
    }
  }, [prellenado, getValues, setValue]);

  useGrillaDeMedicion(p.medicion, !!p.reporte?.medicion, getValues, setValue);

  // Guardián de salida: no perder un borrador a medio escribir.
  useEffect(() => {
    if (!isDirty || soloLectura) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty, soloLectura]);

  /** Ejecuta una acción de servidor con el indicador y los motivos de error a la vista. */
  const ejecutar = async (accion: () => Promise<ReporteMonitoreo>, exito: string) => {
    setTrabajando(true);
    setErrores(null);
    try {
      const r = await accion();
      setAviso(exito);
      return r;
    } catch (e) {
      setErrores(motivosDeError(e));
      return undefined;
    } finally {
      setTrabajando(false);
    }
  };

  const exigirTag = (): boolean => {
    if (getValues("tag")) return true;
    setError("tag", { message: "Elija el TAG" });
    irAlPrimerError();
    return false;
  };

  const onGuardar = async () => {
    clearErrors();
    if (!exigirTag()) return;
    const r = await ejecutar(() => p.guardar(getValues()), "Borrador guardado.");
    if (r && !p.reporte) p.onCreado(r);
  };

  const onEnviar = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();
    if (!exigirTag()) return;
    const faltan = faltantesParaEnviar(getValues(), conMedicion);
    if (faltan.length > 0) {
      for (const f of faltan) setError(f.campo as Path<ValoresReporte>, { message: f.mensaje });
      setErrores(["Falta completar el reporte antes de enviarlo a revisión."]);
      irAlPrimerError();
      return;
    }
    const r = await ejecutar(() => p.enviar(getValues()), "Enviado a revisión.");
    if (r && !p.reporte) p.onCreado(r);
  };

  /**
   * Al elegir TAG, fecha, horas o técnica: los antecedentes y la plantilla de
   * medición. Un borrador guardado sin grilla también la toma si su nueva
   * técnica la tiene; uno con grilla ya no la cambia.
   */
  const onCambioDeBomba = async () => {
    if (p.reporte?.medicion) return;
    const v = getValues();
    await p.prellenar(p.reporte?.tag ?? v.tag, v.fecha, v.lecturas.horas, v.tecnica);
  };

  return (
    <FormProvider {...metodos}>
      <Box component="form" noValidate onSubmit={(e) => void onEnviar(e)}>
        <Stack gap={2}>
          <SeccionCabecera
            catalogos={p.catalogos}
            bombas={p.bombas}
            plantillasMedicion={p.plantillasMedicion}
            conMedicion={conMedicion}
            tagFijo={!!p.reporte}
            soloLectura={soloLectura}
            codigoInterno={p.reporte?.codigo_interno}
            colorDeResultado={p.colorDeResultado}
            onCambioDeBomba={() => void onCambioDeBomba()}
          />
          {conMedicion ? (
            <SeccionAntecedentesMedicion
              antecedentes={p.antecedentes}
              catalogos={p.catalogos}
              soloLectura={soloLectura}
            />
          ) : (
            <SeccionAntecedentes
              antecedentes={p.antecedentes}
              catalogos={p.catalogos}
              soloLectura={soloLectura}
              onCambioDeHoras={() => void onCambioDeBomba()}
            />
          )}
          {p.medicion && (
            <SeccionEspesores
              medicion={p.medicion}
              antecedentes={p.antecedentes}
              soloLectura={soloLectura}
            />
          )}
          <SeccionRecopilacion
            soloLectura={soloLectura}
            conGrafico={!conMedicion}
            fotosPorFila={p.reporte?.fotos_por_fila ?? p.fotosPorFila}
            subirImagen={p.subirImagen}
            onError={(e) => setErrores(motivosDeError(e))}
          />
          <SeccionAnexos
            soloLectura={soloLectura}
            subirImagen={p.subirImagen}
            onError={(e) => setErrores(motivosDeError(e))}
          />
          <SeccionAnalisis catalogos={p.catalogos} soloLectura={soloLectura} />
          <SeccionTareas
            catalogos={p.catalogos}
            coordinadores={p.coordinadores}
            soloLectura={soloLectura}
          />
          {p.reporte && <HistorialReporte historial={p.reporte.historial} />}
        </Stack>

        {errores && (
          <Alert severity="error" sx={{ mt: 2 }} onClose={() => setErrores(null)}>
            {errores.length === 1 ? (
              errores[0]
            ) : (
              <Box component="ul" sx={{ m: 0, pl: 2 }}>
                {errores.map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </Box>
            )}
          </Alert>
        )}

        <BarraAccionesReporte
          acciones={p.acciones}
          trabajando={trabajando}
          onGuardar={() => void onGuardar()}
          onDevolver={(motivo) => void ejecutar(() => p.devolver(motivo), "Devuelto a borrador.")}
          onEmitir={() => void ejecutar(p.emitir, "Reporte emitido.")}
          onDarDeBaja={() =>
            void ejecutar(p.darDeBaja, "Borrador descartado.").then((r) => {
              if (r) p.onDescartado();
            })
          }
        />
      </Box>

      <Snackbar
        open={!!aviso}
        autoHideDuration={4000}
        onClose={() => setAviso(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="success" onClose={() => setAviso(null)}>
          {aviso}
        </Alert>
      </Snackbar>
    </FormProvider>
  );
}
