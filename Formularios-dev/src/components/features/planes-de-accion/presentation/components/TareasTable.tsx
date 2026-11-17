"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Box,
  Tooltip,
  Link,
} from "@mui/material";
import {
  Edit,
  Delete,
  CheckCircle,
  ChevronRight,
  AttachFile as AttachFileIcon,
  Visibility as VisibilityIcon,
  History as HistoryIcon,
  EditNote as EditNoteIcon,
} from "@mui/icons-material";
import { TareaObservacion } from "../../domain/models/IProps";
import { useUserRole } from "@/hooks/useUserRole";
import { Role } from "@/lib/routePermissions";
import { EstadoChip } from "@/components/ui/feedback/EstadoChip";
import { estadoDeTarea } from "../../domain/estadosVisuales";
import { alpha } from "@mui/material/styles";
import { keyframes } from "@emotion/react";
import { puedeContinuarTarea } from "../../domain/accionesTarea";

/** La fila recién cambiada: aparece teñida, se sostiene un instante y se apaga. */
const destello = keyframes`
  0%, 30% { background-color: var(--resalte); }
  100% { background-color: transparent; }
`;

interface TareasTableProps {
  tareas: TareaObservacion[];
  onEdit: (tarea: TareaObservacion) => void;
  onDelete: (tareaId: string) => void;
  onApprove: (tareaId: string) => void;
  /** Corrección del admin: datos y estado, también hacia atrás. */
  onCorregir: (tarea: TareaObservacion) => void;
  onHistorial: (tarea: TareaObservacion) => void;
  /** Tareas recién cambiadas: se iluminan un momento (ver `domain/resaltado.ts`). */
  resaltadas?: readonly string[];
}

export function TareasTable({
  tareas,
  resaltadas = [],
  onEdit,
  onDelete,
  onApprove,
  onCorregir,
  onHistorial,
}: TareasTableProps) {
  const { hasRole } = useUserRole();
  const canApprove = hasRole(Role.SUPERINTENDENTE) || hasRole(Role.ADMIN);
  const isAdmin = hasRole(Role.ADMIN);

  // Una tarea recién generada todavía no tiene fecha acordada: antes salía
  // «Invalid Date».
  const formatDate = (date?: Date | string): string => {
    if (!date) return "—";
    const fecha = new Date(date);
    return Number.isNaN(fecha.getTime())
      ? "—"
      : // Días de calendario guardados como medianoche UTC (ver TareaFormModal):
        // en la hora local salían un día antes.
        fecha.toLocaleDateString("es-ES", { timeZone: "UTC" });
  };

  return (
    <TableContainer
      component={Paper}
      sx={{ boxShadow: 1, mt: 3, overflow: "auto" }}
    >
      <Table sx={{ minWidth: 2600 }}>
        <TableHead
          sx={{ backgroundColor: "background.default", position: "sticky", top: 0 }}
        >
          <TableRow>
            <TableCell
              sx={{ fontWeight: 700, fontSize: "0.875rem", minWidth: 40 }}
            >
              #
            </TableCell>
            <TableCell
              sx={{ fontWeight: 700, fontSize: "0.875rem", minWidth: 100 }}
            >
              Fecha Hallazgo
            </TableCell>
            <TableCell
              sx={{ fontWeight: 700, fontSize: "0.875rem", minWidth: 120 }}
            >
              Responsable Observación
            </TableCell>
            <TableCell
              sx={{ fontWeight: 700, fontSize: "0.875rem", minWidth: 100 }}
            >
              Empresa
            </TableCell>
            <TableCell
              sx={{ fontWeight: 700, fontSize: "0.875rem", minWidth: 130 }}
            >
              Lugar Físico
            </TableCell>
            <TableCell
              sx={{ fontWeight: 700, fontSize: "0.875rem", minWidth: 100 }}
            >
              Actividad
            </TableCell>
            <TableCell
              sx={{ fontWeight: 700, fontSize: "0.875rem", minWidth: 120 }}
            >
              Familia de Peligro
            </TableCell>
            <TableCell
              sx={{ fontWeight: 700, fontSize: "0.875rem", minWidth: 150 }}
            >
              Descripción Observación
            </TableCell>
            <TableCell
              sx={{ fontWeight: 700, fontSize: "0.875rem", minWidth: 150 }}
            >
              Acción Propuesta
            </TableCell>
            <TableCell
              sx={{ fontWeight: 700, fontSize: "0.875rem", minWidth: 120 }}
            >
              Responsable Área Cierre
            </TableCell>
            <TableCell
              sx={{ fontWeight: 700, fontSize: "0.875rem", minWidth: 130 }}
            >
              Fecha Cumplimiento Acordada
            </TableCell>
            <TableCell
              sx={{ fontWeight: 700, fontSize: "0.875rem", minWidth: 130 }}
            >
              Fecha Cumplimiento Efectiva
            </TableCell>
            <TableCell
              sx={{ fontWeight: 700, fontSize: "0.875rem", minWidth: 80 }}
            >
              Días Retraso
            </TableCell>
            <TableCell
              sx={{ fontWeight: 700, fontSize: "0.875rem", minWidth: 120 }}
              align="center"
            >
              Evidencias
            </TableCell>
            <TableCell
              sx={{ fontWeight: 700, fontSize: "0.875rem", minWidth: 100 }}
              align="center"
            >
              Estado
            </TableCell>
            <TableCell
              sx={{ fontWeight: 700, fontSize: "0.875rem", minWidth: 90 }}
              align="center"
            >
              Aprobado
            </TableCell>
            <TableCell
              sx={{
                fontWeight: 700,
                fontSize: "0.875rem",
                minWidth: 100,
                textAlign: "center",
              }}
            >
              Acciones
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {tareas.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={17}
                sx={{ textAlign: "center", py: 3, color: "text.secondary" }}
              >
                No hay tareas registradas en este plan
              </TableCell>
            </TableRow>
          ) : (
            tareas.map((tarea) => (
              <TableRow
                key={tarea._id}
                hover
                sx={[
                  { "&:hover": { backgroundColor: "action.hover" } },
                  // Recién cambiada: se ilumina y se apaga sola.
                  resaltadas.includes(tarea._id ?? "") &&
                    ((theme) => ({
                      "--resalte": alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.22 : 0.14),
                      animation: `${destello} 2.6s ease-out`,
                      "@media (prefers-reduced-motion: reduce)": {
                        animation: "none",
                        backgroundColor: "var(--resalte)",
                      },
                    })),
                ]}
              >
                <TableCell sx={{ fontWeight: 500, minWidth: 40 }}>
                  {tarea.numeroItem}
                </TableCell>
                <TableCell sx={{ minWidth: 100 }}>
                  {formatDate(tarea.fechaHallazgo)}
                </TableCell>
                <TableCell sx={{ minWidth: 120 }}>
                  {tarea.responsableObservacion}
                </TableCell>
                <TableCell sx={{ minWidth: 100 }}>{tarea.empresa}</TableCell>
                <TableCell sx={{ minWidth: 130 }}>
                  {tarea.lugarFisico}
                </TableCell>
                <TableCell sx={{ minWidth: 100 }}>{tarea.actividad}</TableCell>
                <TableCell sx={{ minWidth: 120 }}>
                  {tarea.familiaPeligro}
                </TableCell>
                <TableCell
                  sx={{
                    minWidth: 150,
                    maxWidth: 200,
                    whiteSpace: "normal",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    wordBreak: "break-word",
                  }}
                >
                  {tarea.questionText ? (
                    <Tooltip
                      arrow
                      title={
                        <>
                          {tarea.sectionTitle && (
                            <>
                              <strong>Sección:</strong> {tarea.sectionTitle}
                              <br />
                            </>
                          )}
                          <strong>Pregunta:</strong> {tarea.questionText}
                        </>
                      }
                    >
                      <Box
                        component="span"
                        sx={{
                          textDecoration: "underline dotted",
                          textUnderlineOffset: 3,
                          cursor: "help",
                        }}
                      >
                        {tarea.descripcionObservacion}
                      </Box>
                    </Tooltip>
                  ) : (
                    tarea.descripcionObservacion
                  )}
                </TableCell>
                <TableCell
                  sx={{
                    minWidth: 150,
                    maxWidth: 200,
                    whiteSpace: "normal",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    wordBreak: "break-word",
                  }}
                >
                  {tarea.accionPropuesta}
                </TableCell>
                <TableCell sx={{ minWidth: 120 }}>
                  {tarea.responsableAreaCierre}
                </TableCell>
                <TableCell sx={{ minWidth: 130 }}>
                  {formatDate(tarea.fechaCumplimientoAcordada)}
                </TableCell>
                <TableCell sx={{ minWidth: 130 }}>
                  {tarea.fechaCumplimientoEfectiva
                    ? formatDate(tarea.fechaCumplimientoEfectiva)
                    : "-"}
                </TableCell>
                <TableCell
                  sx={{ minWidth: 80, textAlign: "center", fontWeight: 500 }}
                >
                  {tarea.diasRetraso > 0 ? (
                    <Chip
                      label={`${tarea.diasRetraso}d`}
                      size="small"
                      color={tarea.diasRetraso > 7 ? "error" : "warning"}
                    />
                  ) : (
                    "-"
                  )}
                </TableCell>

                <TableCell sx={{ minWidth: 120 }} align="center">
                  {tarea.evidencias && tarea.evidencias.length > 0 ? (
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 0.5,
                        alignItems: "center",
                      }}
                    >
                      <Chip
                        icon={<AttachFileIcon />}
                        label={`${tarea.evidencias.length} archivo${tarea.evidencias.length > 1 ? "s" : ""}`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                      {tarea.evidencias.map((evidencia, idx) => (
                        <Tooltip key={idx} title={evidencia.nombre} arrow>
                          <Link
                            href={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002"}${evidencia.url}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{
                              fontSize: "0.75rem",
                              display: "flex",
                              alignItems: "center",
                              gap: 0.5,
                              textDecoration: "none",
                              "&:hover": {
                                textDecoration: "underline",
                              },
                            }}
                          >
                            <VisibilityIcon sx={{ fontSize: "0.875rem" }} />
                            {evidencia.nombre.length > 15
                              ? `${evidencia.nombre.substring(0, 15)}...`
                              : evidencia.nombre}
                          </Link>
                        </Tooltip>
                      ))}
                    </Box>
                  ) : (
                    <Box sx={{ color: "text.secondary", fontSize: "0.875rem" }}>
                      Sin evidencias
                    </Box>
                  )}
                </TableCell>

                <TableCell sx={{ minWidth: 100 }} align="center">
                  <EstadoChip
                    etiqueta={estadoDeTarea(tarea.estado).etiqueta}
                    color={estadoDeTarea(tarea.estado).color}
                  />
                </TableCell>
                <TableCell sx={{ minWidth: 90 }} align="center">
                  {tarea.aprobado ? (
                    <CheckCircle
                      sx={{ color: "success.main", fontSize: "1.5rem" }}
                    />
                  ) : (
                    <Box sx={{ color: "text.secondary", fontSize: "1.5rem" }}>-</Box>
                  )}
                </TableCell>
                <TableCell sx={{ minWidth: 140, textAlign: "center", whiteSpace: "nowrap" }}>
                  <Tooltip title="Historial de cambios">
                    <IconButton size="small" onClick={() => onHistorial(tarea)}>
                      <HistoryIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  {isAdmin && (
                    <>
                      <IconButton
                        size="small"
                        onClick={() => onEdit(tarea)}
                        title="Editar"
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                      <Tooltip title="Corregir datos o estado (queda en el historial)">
                        <IconButton
                          size="small"
                          onClick={() => onCorregir(tarea)}
                        >
                          <EditNoteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <IconButton
                        size="small"
                        onClick={() => onDelete(tarea._id!)}
                        title="Eliminar"
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </>
                  )}

                  {puedeContinuarTarea(tarea, isAdmin) && (
                      <Tooltip title="Continuar">
                        <IconButton
                          size="small"
                          onClick={() => onEdit(tarea)}
                        >
                          <ChevronRight fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}

                  {canApprove &&
                    !tarea.aprobado &&
                    tarea.estado === "cerrado" && (
                      <Tooltip title="Aprobar (Solo Admin/Superintendente)">
                        <IconButton
                          size="small"
                          onClick={() => onApprove(tarea._id!)}
                        >
                          <CheckCircle
                            fontSize="small"
                            sx={{ color: "success.main" }}
                          />
                        </IconButton>
                      </Tooltip>
                    )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
