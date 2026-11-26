"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type BaseSyntheticEvent } from "react";
import { useForm, useWatch } from "react-hook-form";
import { mensajeParaUsuario } from "@/lib/errores/mensajeParaUsuario";
import { irAlPrimerError } from "@/lib/formularios/irAlPrimerError";
import { useConfirmar } from "@/components/ui/feedback/Confirmacion";
import type {
  CatalogosInventario,
  Equipo,
  EquipoPayload,
} from "../../domain/models/Equipo";
import {
  clasificacionSugerida,
  clave,
  esVehiculo,
  opcionesDe,
  parecidoA,
  payloadDesdeValores,
  referenciaElegida,
  tiposDeEquipo,
  valoresDesdeEquipo,
  valoresParaDuplicar,
  valoresParaOtro,
  valoresVacios,
  type ValoresEquipo,
} from "../../domain/formularioEquipo";
import { codigoParteDesde, equipoConCodigo, sugerirCodigo } from "../../domain/codigoEquipo";
import type { Severidad } from "./useInventarioEquipos";

/** Cómo se abrió el formulario. */
export type ModoFormulario =
  | { tipo: "crear" }
  | { tipo: "editar"; equipo: Equipo }
  | { tipo: "duplicar"; equipo: Equipo };

/** Los valores con que abre el formulario. */
function valoresIniciales(modo: ModoFormulario): ValoresEquipo {
  if (modo.tipo === "editar") return valoresDesdeEquipo(modo.equipo);
  if (modo.tipo === "duplicar") return valoresParaDuplicar(modo.equipo);
  return valoresVacios();
}

interface Opciones {
  modo: ModoFormulario;
  equipos: Equipo[];
  catalogos: CatalogosInventario;
  guardar: (payload: EquipoPayload, id?: string) => Promise<Equipo>;
  avisar: (mensaje: string, severidad: Severidad) => void;
  onCerrar: () => void;
}

/** Lo último que se llenó solo: si el campo sigue así, se puede volver a llenar. */
interface Autollenado {
  descripcion: string;
  codigo: string;
  codigo_parte: string;
  clasificacion_id: string;
}
const sinAutollenado = (): Autollenado => ({ descripcion: "", codigo: "", codigo_parte: "", clasificacion_id: "" });

/** Un campo se llena solo mientras esté vacío o conserve lo que se puso solo. */
const libre = (actual: string, automatico: string) => actual.trim() === "" || actual === automatico;

/**
 * El formulario de un equipo del inventario.
 *
 * Al crear (o duplicar) llena solo lo que se puede deducir —la descripción y
 * la clasificación al elegir el tipo, el código siguiente de la serie y el
 * código de parte—, sin pisar nunca lo que el usuario escribió.
 *
 * Se monta al abrir el diálogo y se desmonta al cerrarlo: cada apertura
 * empieza de cero con los valores de su modo.
 */
export function useFormularioEquipo({ modo, equipos, catalogos, guardar, avisar, onCerrar }: Opciones) {
  const [iniciales] = useState(() => valoresIniciales(modo));
  const metodos = useForm<ValoresEquipo>({ defaultValues: iniciales, mode: "onTouched" });
  const { control, reset, setValue, getValues, clearErrors, handleSubmit, formState } = metodos;
  const confirmar = useConfirmar();

  const editando = modo.tipo === "editar";
  const idActual = modo.tipo === "editar" ? modo.equipo._id : undefined;

  const auto = useRef<Autollenado>({
    ...sinAutollenado(),
    descripcion: iniciales.descripcion === iniciales.tipo_equipo ? iniciales.descripcion : "",
  });
  /** Sube con «Guardar y agregar otro»: vuelve a proponer el código aunque nada más cambie. */
  const [ronda, setRonda] = useState(0);
  const [errorGuardar, setErrorGuardar] = useState<string | null>(null);

  const [tipo, ambito, areaId, superintendenciaId, gerenciaId, codigo, marca, placa] = useWatch({
    control,
    name: ["tipo_equipo", "ambito", "area_id", "superintendencia_id", "gerencia_id", "codigo", "marca", "placa"],
  });
  const referencia = referenciaElegida({
    ambito,
    area_id: areaId,
    superintendencia_id: superintendenciaId,
    gerencia_id: gerenciaId,
  });

  const sugerencia = useMemo(
    () => (editando ? null : sugerirCodigo(equipos, tipo, ambito, referencia)),
    [editando, equipos, tipo, ambito, referencia],
  );

  // El código siguiente de la serie, mientras el usuario no haya escrito otro.
  useEffect(() => {
    if (editando) return;
    const actual = getValues("codigo");
    if (!libre(actual, auto.current.codigo)) return;
    const propuesto = sugerencia?.codigo ?? "";
    if (actual !== propuesto && (propuesto || auto.current.codigo)) {
      setValue("codigo", propuesto);
      clearErrors("codigo");
    }
    auto.current.codigo = propuesto;
  }, [editando, sugerencia, ronda, getValues, setValue, clearErrors]);

  // El código de parte sale del código.
  useEffect(() => {
    if (editando) return;
    const actual = getValues("codigo_parte");
    if (!libre(actual, auto.current.codigo_parte)) return;
    const derivado = codigoParteDesde(codigo ?? "");
    if (actual !== derivado) setValue("codigo_parte", derivado);
    auto.current.codigo_parte = derivado;
  }, [editando, codigo, getValues, setValue]);

  const configActiva = useMemo(
    () => catalogos.configs.find((c) => c.tipo_equipo === tipo) ?? null,
    [catalogos.configs, tipo],
  );

  /** Elegir el tipo cambia sus datos técnicos y propone descripción y clasificación. */
  const cambiarTipo = useCallback(
    (nuevo: string) => {
      const v = getValues();
      setValue("tipo_equipo", nuevo, { shouldDirty: true, shouldTouch: true, shouldValidate: true });
      setValue("especificaciones", {}, { shouldDirty: true });
      if (libre(v.descripcion, auto.current.descripcion) || v.descripcion === v.tipo_equipo) {
        setValue("descripcion", nuevo, { shouldDirty: true });
        auto.current.descripcion = nuevo;
        clearErrors("descripcion");
      }
      if (!editando) {
        const sugerida = clasificacionSugerida(equipos, nuevo);
        if (sugerida && libre(v.clasificacion_id, auto.current.clasificacion_id)) {
          setValue("clasificacion_id", sugerida, { shouldDirty: true });
          auto.current.clasificacion_id = sugerida;
          clearErrors("clasificacion_id");
        }
      }
    },
    [editando, equipos, getValues, setValue, clearErrors],
  );

  /** Vuelve a poner el código propuesto después de haberlo cambiado a mano. */
  const usarCodigoSugerido = useCallback(() => {
    if (!sugerencia) return;
    setValue("codigo", sugerencia.codigo, { shouldDirty: true, shouldValidate: true });
    auto.current.codigo = sugerencia.codigo;
  }, [sugerencia, setValue]);

  /** Mensaje de error del código, o `true` si sirve. */
  const validarCodigo = useCallback(
    (valor: string): string | true => {
      if (!valor.trim()) return "Escriba el código del equipo.";
      const otro = equipoConCodigo(equipos, valor, getValues("rfid"), idActual);
      if (!otro) return true;
      const donde = otro.area_id?.nombre ? ` de ${otro.area_id.nombre}` : "";
      return `Ya lo tiene «${otro.descripcion}»${donde}.${sugerencia ? ` Libre: ${sugerencia.codigo}.` : ""}`;
    },
    [equipos, getValues, idActual, sugerencia],
  );

  const opciones = useMemo(
    () => ({
      tipos: tiposDeEquipo(catalogos.configs, equipos),
      marcas: opcionesDe(equipos, "marca"),
      modelos: opcionesDe(equipos, "modelo", (e) => !marca?.trim() || clave(e.marca ?? "") === clave(marca)),
      responsables: opcionesDe(equipos, "responsable"),
      frecuencias: opcionesDe(equipos, "frecuencia_uso"),
    }),
    [catalogos.configs, equipos, marca],
  );
  const marcaParecida = useMemo(() => parecidoA(marca ?? "", opciones.marcas), [marca, opciones.marcas]);

  const fallaValidacion = useCallback(() => irAlPrimerError(), []);

  const enviar = (seguir: boolean) =>
    handleSubmit(async (v) => {
      setErrorGuardar(null);
      try {
        const guardado = await guardar(payloadDesdeValores(v, configActiva), idActual);
        if (!seguir) {
          avisar(editando ? `Se actualizó ${guardado.codigo}` : `Se agregó ${guardado.codigo}`, "success");
          onCerrar();
          return;
        }
        reset(valoresParaOtro(v));
        auto.current = {
          ...sinAutollenado(),
          descripcion: v.descripcion === v.tipo_equipo ? v.descripcion : "",
          clasificacion_id: v.clasificacion_id,
        };
        setRonda((r) => r + 1);
        avisar(`Se agregó ${guardado.codigo}. Cargue el siguiente.`, "success");
      } catch (e) {
        setErrorGuardar(mensajeParaUsuario(e, "No se pudo guardar el equipo"));
      }
    }, fallaValidacion);

  // Patrón 3: no perder lo escrito al recargar o cerrar la pestaña.
  const { isDirty, isSubmitting } = formState;
  useEffect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  /** Cerrar con cambios sin guardar pide confirmación. */
  const cerrar = useCallback(async () => {
    if (isSubmitting) return;
    if (
      isDirty &&
      !(await confirmar({
        titulo: "¿Descartar lo que cargó?",
        mensaje: "Hay datos sin guardar en este equipo. Si cierra ahora se pierden.",
        textoConfirmar: "Descartar",
        peligro: true,
      }))
    ) {
      return;
    }
    onCerrar();
  }, [confirmar, isDirty, isSubmitting, onCerrar]);

  return {
    metodos,
    editando,
    configActiva,
    sugerencia,
    usarCodigoSugerido,
    validarCodigo,
    cambiarTipo,
    opciones,
    marcaParecida,
    mostrarPlaca: esVehiculo(tipo) || !!placa?.trim(),
    guardando: isSubmitting,
    errorGuardar,
    guardarYCerrar: (e?: BaseSyntheticEvent) => enviar(false)(e),
    guardarYOtro: () => enviar(true)(),
    cerrar,
  };
}
