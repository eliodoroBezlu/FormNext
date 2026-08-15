"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import { Add, ArrowBack } from "@mui/icons-material";
import {
  aprobarMatriz,
  devolverMatriz,
  enviarARevision,
  obtenerAcciones,
  obtenerMatriz,
} from "../../infrastructure/adapters/matrizRiesgosAdapter";
import {
  AccionesMatriz,
  ActividadDto,
  ActividadRiesgo,
  MatrizRiesgo,
  RiesgoDto,
  RiesgoIdentificado,
} from "../../domain/models/IProps";
import { useEditorRiesgos } from "../../application/hooks/useEditorRiesgos";
import { RiesgoFormDialog } from "./RiesgoFormDialog";
import { ActividadFormDialog } from "./ActividadFormDialog";
import { ActividadBloque } from "./ActividadBloque";
import { AccionesMatrizBar } from "./AccionesMatrizBar";
import {
  colorDeEstado,
  distribucionPorNivel,
  ETIQUETA_ESTADO,
  requierePgr,
  verificadoresDe,
} from "../../domain/matrizHelpers";

function Dato({ etiqueta, valor }: { etiqueta: string; valor?: string | number }) {
  return (
    <Box minWidth={150}>
      <Typography variant="caption" color="text.secondary" display="block">
        {etiqueta}
      </Typography>
      <Typography variant="body2" fontWeight={600}>
        {valor || "—"}
      </Typography>
    </Box>
  );
}

export function MatrizDetailView({ id }: { id: string }) {
  const router = useRouter();
  const [matriz, setMatriz] = useState<MatrizRiesgo | null>(null);
  const [acciones, setAcciones] = useState<AccionesMatriz | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState(false);

  // Edición de riesgos. `formAbierto` distingue alta (sin riesgo) de edición.
  const [formAbierto, setFormAbierto] = useState(false);
  const [enEdicion, setEnEdicion] = useState<RiesgoIdentificado | undefined>();
  /** La actividad a la que pertenece el riesgo que se está editando. */
  const [actividadActiva, setActividadActiva] = useState<
    ActividadRiesgo | undefined
  >();
  const [formActividadAbierto, setFormActividadAbierto] = useState(false);
  const [actividadEnEdicion, setActividadEnEdicion] = useState<
    ActividadRiesgo | undefined
  >();

  const editor = useEditorRiesgos(id, (actualizada) => {
    setMatriz(actualizada);
  });

  // Los catálogos del formulario dependen de la categoría de la actividad.
  const categoriaActiva = actividadActiva?.categoria;
  useEffect(() => {
    if (categoriaActiva) editor.setCategoria(categoriaActiva);
  }, [categoriaActiva, editor]);

  const recargar = useCallback(async () => {
    const [res, acc] = await Promise.all([
      obtenerMatriz(id),
      obtenerAcciones(id),
    ]);
    if (res.success && res.data) {
      setMatriz(res.data);
      setError(null);
    } else {
      setError(res.error ?? "No se pudo cargar la matriz");
    }
    setAcciones(acc);
    setCargando(false);
  }, [id]);

  useEffect(() => {
    // La regla no distingue que `recargar` es async: todos sus `setState`
    // ocurren después del `await Promise.all`, nunca durante el render.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void recargar();
  }, [recargar]);

  /**
   * Solo se editan riesgos en BORRADOR: una matriz en revisión o aprobada es
   * inmutable, y el backend rechaza la escritura igual.
   */
  const esEditable = matriz?.estado === "BORRADOR";

  const guardarRiesgo = async (dto: RiesgoDto) => {
    if (!actividadActiva) return;
    const res = await editor.guardar(
      actividadActiva.numero,
      dto,
      enEdicion?.numero,
    );
    if (res.ok) {
      setFormAbierto(false);
      setEnEdicion(undefined);
      setAviso(res.mensaje);
    } else {
      setError(res.mensaje);
    }
  };

  const borrarRiesgo = async (nroActividad: number, numero: number) => {
    const res = await editor.borrar(nroActividad, numero);
    if (res.ok) setAviso(res.mensaje);
    else setError(res.mensaje);
  };

  const guardarActividad = async (dto: ActividadDto) => {
    const res = await editor.guardarActividad(dto, actividadEnEdicion?.numero);
    if (res.ok) {
      setFormActividadAbierto(false);
      setActividadEnEdicion(undefined);
      setAviso(res.mensaje);
    } else {
      setError(res.mensaje);
    }
  };

  const borrarActividad = async (numero: number) => {
    const res = await editor.borrarActividad(numero);
    if (res.ok) setAviso(res.mensaje);
    else setError(res.mensaje);
  };

  /** Ejecuta un cambio de estado y refresca todo desde el servidor. */
  const ejecutar = useCallback(
    async (
      accion: () => Promise<{ success: boolean; error?: string }>,
      exito: string,
    ) => {
      setProcesando(true);
      setError(null);
      const res = await accion();
      if (res.success) {
        setAviso(exito);
        await recargar();
      } else {
        setError(res.error ?? "No se pudo completar la acción");
      }
      setProcesando(false);
    },
    [recargar],
  );

  if (cargando) {
    return (
      <Box display="flex" justifyContent="center" py={6}>
        <CircularProgress />
      </Box>
    );
  }
  if (error || !matriz) {
    return <Alert severity="error">{error ?? "Matriz no encontrada"}</Alert>;
  }

  // Los helpers siguen trabajando sobre listas planas de riesgos: se les pasa
  // el aplanado de todas las actividades.
  const todosLosRiesgos = matriz.actividades.flatMap((a) => a.riesgos);

  const porNivel: Record<string, number> = {};
  for (const r of todosLosRiesgos) {
    const k = r.nivelActual ?? "(sin calcular)";
    porNivel[k] = (porNivel[k] ?? 0) + 1;
  }
  const criticos = todosLosRiesgos.filter((r) => requierePgr(r.nivelActual));
  const verificadores = verificadoresDe(criticos);

  return (
    <Box>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => router.push("/dashboard/matriz-riesgos")}
        sx={{ mb: 2 }}
      >
        Volver al listado
      </Button>

      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ sm: "center" }}
        gap={1}
        mb={2}
      >
        <Box>
          <Typography variant="h5" fontWeight={600} fontFamily="monospace">
            {matriz.codigo}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {matriz.areaNombre} · {matriz.superintendencia}
          </Typography>
        </Box>
        <Chip
          label={ETIQUETA_ESTADO[matriz.estado]}
          color={
            colorDeEstado(matriz.estado) as "default" | "warning" | "success"
          }
        />
      </Stack>

      {aviso && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setAviso(null)}>
          {aviso}
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box mb={2}>
        <AccionesMatrizBar
          estado={matriz.estado}
          acciones={acciones}
          procesando={procesando}
          onEnviarARevision={(obs) =>
            void ejecutar(
              () => enviarARevision(id, obs),
              "Matriz enviada a revisión",
            )
          }
          onAprobar={(obs) =>
            void ejecutar(() => aprobarMatriz(id, obs), "Matriz aprobada")
          }
          onDevolver={(motivo) =>
            void ejecutar(
              () => devolverMatriz(id, motivo),
              "Matriz devuelta a borrador",
            )
          }
        />
      </Box>

      <Stack spacing={2}>
        <Card variant="outlined">
          <CardContent>
            <Stack direction="row" flexWrap="wrap" gap={2.5}>
              <Dato etiqueta="Año" valor={matriz.anio} />
              <Dato etiqueta="Versión" valor={`v${matriz.version}`} />
              <Dato etiqueta="Gerencia" valor={matriz.gerencia} />
              <Dato etiqueta="Elaborado por" valor={matriz.elaboradoPor} />
              <Dato
                etiqueta="Revisado y aprobado por"
                valor={matriz.revisadoAprobadoPor}
              />
              <Dato etiqueta="Metodología" valor={matriz.metodologiaVersion} />
              <Dato etiqueta="Origen" valor={matriz.archivoOrigen} />
            </Stack>

            <Divider sx={{ my: 2 }} />

            <Stack direction="row" flexWrap="wrap" gap={1}>
              <Chip
                size="small"
                label={`${matriz.actividades.length} actividades`}
                variant="outlined"
              />
              <Chip
                size="small"
                label={`${todosLosRiesgos.length} riesgos`}
                variant="outlined"
              />
              {distribucionPorNivel(porNivel).map((d) => (
                <Chip
                  key={d.nivel}
                  size="small"
                  label={`${d.nivel}: ${d.cantidad}`}
                  sx={{ bgcolor: d.color, color: "#fff" }}
                />
              ))}
            </Stack>
          </CardContent>
        </Card>

        {criticos.length > 0 && (
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle2" gutterBottom>
                Verificadores que alimentarán el PGR
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                Salen de los controles de los {criticos.length} riesgos en nivel
                SUSTANCIAL o INACEPTABLE. Al aprobar la matriz se consolidan en
                el PGR de la superintendencia.
              </Typography>
              <Stack direction="row" flexWrap="wrap" gap={1}>
                {verificadores.map((v) => (
                  <Chip
                    key={v.verificador}
                    size="small"
                    variant="outlined"
                    label={`${v.verificador} (${v.controles})`}
                  />
                ))}
              </Stack>
            </CardContent>
          </Card>
        )}

        {esEditable && (
          <Box display="flex" justifyContent="flex-end" mb={1.5}>
            <Button
              type="button"
              variant="contained"
              startIcon={<Add />}
              onClick={() => {
                setActividadEnEdicion(undefined);
                setFormActividadAbierto(true);
              }}
            >
              Agregar actividad
            </Button>
          </Box>
        )}

        {matriz.actividades.length === 0 ? (
          <Alert severity="info" sx={{ mb: 2 }}>
            La matriz no tiene actividades todavía. Los riesgos se cargan dentro
            de una actividad.
          </Alert>
        ) : (
          matriz.actividades.map((a) => (
            <ActividadBloque
              key={a.numero}
              actividad={a}
              editable={!!esEditable}
              ocupado={editor.guardando}
              onAgregarRiesgo={() => {
                setActividadActiva(a);
                setEnEdicion(undefined);
                setFormAbierto(true);
              }}
              onEditarRiesgo={(r) => {
                setActividadActiva(a);
                setEnEdicion(r);
                setFormAbierto(true);
              }}
              onEliminarRiesgo={(numero) => void borrarRiesgo(a.numero, numero)}
              onEditarActividad={() => {
                setActividadEnEdicion(a);
                setFormActividadAbierto(true);
              }}
              onEliminarActividad={() => void borrarActividad(a.numero)}
            />
          ))
        )}

        {formAbierto && actividadActiva && (
          <RiesgoFormDialog
            abierto={formAbierto}
            actividad={actividadActiva}
            riesgo={enEdicion}
            opciones={editor.opciones}
            previa={editor.previa}
            guardando={editor.guardando}
            onValoresChange={editor.pedirPrevia}
            onGuardar={(dto) => void guardarRiesgo(dto)}
            onCerrar={() => {
              setFormAbierto(false);
              setEnEdicion(undefined);
            }}
          />
        )}

        {formActividadAbierto && (
          <ActividadFormDialog
            abierto={formActividadAbierto}
            actividad={actividadEnEdicion}
            guardando={editor.guardando}
            onGuardar={(dto) => void guardarActividad(dto)}
            onCerrar={() => {
              setFormActividadAbierto(false);
              setActividadEnEdicion(undefined);
            }}
          />
        )}

        {matriz.historial.length > 0 && (
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle2" gutterBottom>
                Historial
              </Typography>
              {matriz.historial.map((h, i) => (
                <Typography key={i} variant="body2" color="text.secondary">
                  {new Date(h.fecha).toLocaleString()} · {h.usuario} ·{" "}
                  {h.estadoAnterior} → {h.estadoNuevo}
                  {h.observaciones ? ` — ${h.observaciones}` : ""}
                </Typography>
              ))}
            </CardContent>
          </Card>
        )}
      </Stack>
    </Box>
  );
}
