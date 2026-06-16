"use client";

import React, { useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  useTheme,
  Alert,
  CircularProgress,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import SaveIcon from "@mui/icons-material/Save";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningIcon from "@mui/icons-material/Warning";
import CancelIcon from "@mui/icons-material/Cancel";
import { FormTemplateHerraEquipos, FormDataHerraEquipos, QuestionResponse, RoutineInspectionEntry, Section, Question } from "../types/IProps";
import dayjs from "dayjs";

interface LocalDamage {
  type: string;
  x: number;
  y: number;
  timestamp?: string;
}

interface LocalAccessoryConfig {
  cantidad?: number;
}
import { descargarPdfHerraEquipoCliente } from "@/lib/actions/client";
import { SupervisorSignature } from "./SupervisorSignature";
import { ApprovalSection } from "./ApprovalSection";
import { getFormConfig } from "../config/form-config.helpers";

interface Step5ReviewSectionProps {
  template: FormTemplateHerraEquipos;
  formData: FormDataHerraEquipos;
  onPrev: () => void;
  onFinalSubmit: () => void;
  isSubmitting: boolean;
  inspectionId?: string;
  formType: "standard" | "grouped" | "vehicle" | "scaffold";
  isApprovalReview?: boolean;
  showApprovalInputs?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setValue?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  errors?: any;
  onApprove?: (comments?: string | null) => void;
  onReject?: (reason: string | null) => void;
  isSubmitDisabled?: boolean;
}

export function Step5ReviewSection({
  template,
  formData,
  onPrev,
  onFinalSubmit,
  isSubmitting,
  inspectionId,
  formType,
  isApprovalReview = false,
  showApprovalInputs = false,
  register,
  control,
  setValue,
  errors,
  onApprove,
  onReject,
  isSubmitDisabled = false,
}: Step5ReviewSectionProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  const handleDownloadPdf = async () => {
    if (!inspectionId) return;
    setDownloadingPdf(true);
    setPdfError(null);
    try {
      await descargarPdfHerraEquipoCliente(inspectionId);
    } catch (err) {
      console.error("Error al descargar PDF:", err);
      setPdfError("Error al descargar el PDF. Por favor, intente de nuevo.");
    } finally {
      setDownloadingPdf(false);
    }
  };

  // 1. FILTRAR Y ORDENAR CAMPOS DE VERIFICACIÓN (Paso 1 y Paso 2)
  const step1Labels = ["TAG", "Equipo", "Herramienta", "Instrumento", "Código de Instrumento", "Identificación", "Código del Equipo", "Área", "Planta", "Ubicación", "Lugar"];
  const verificationData = formData.verification || {};
  const fieldsStep1 = template.verificationFields.filter((f) => step1Labels.includes(f.label));
  const fieldsStep2 = template.verificationFields.filter((f) => !step1Labels.includes(f.label));

  // Interface for flattened review rows (supporting subsections recursively)
  interface FlatReviewRow {
    id: string;
    type: "section" | "question";
    text: string;
    level: number;
    response?: QuestionResponse;
  }

  const flatReviewRows: FlatReviewRow[] = [];

  const collectRows = (
    section: Section,
    sectionPath: string,
    level: number,
    responsesObj: Record<string, unknown>
  ) => {
    // Add section header row
    flatReviewRows.push({
      id: sectionPath,
      type: "section",
      text: section.title || "",
      level: level,
    });

    // Add questions from this section if it has any
    if (section.questions && section.questions.length > 0) {
      section.questions.forEach((question: Question, qIdx: number) => {
        const questionKey = `q${qIdx}`;
        const response: QuestionResponse = (responsesObj?.[questionKey] as QuestionResponse) || {
          value: "",
          description: "",
          observacion: "",
        };
        flatReviewRows.push({
          id: `${sectionPath}_q${qIdx}`,
          type: "question",
          text: question.text || "",
          level: level + 1,
          response,
        });
      });
    }

    // Add subsections recursively
    if (section.subsections && section.subsections.length > 0) {
      section.subsections.forEach((subsection: Section, subIdx: number) => {
        const subPath = `sub${subIdx}`;
        const subResponses = (responsesObj?.[subPath] as Record<string, unknown>) || {};
        collectRows(subsection, `${sectionPath}.${subPath}`, level + 1, subResponses);
      });
    }
  };

  if (formType === "standard" || formType === "vehicle" || formType === "scaffold") {
    template.sections.forEach((section, sIdx) => {
      const sectionKey = `section_${sIdx}`;
      const sectionResponses = (formData.responses?.[sectionKey] as Record<string, unknown>) || {};
      collectRows(section, sectionKey, 0, sectionResponses);
    });
  }

  // Helper para renderizar los valores de verificación
  const renderValue = (val: unknown) => {
    if (val === undefined || val === null || val === "") return "—";
    if (typeof val === "boolean") return val ? "Sí" : "No";
    return String(val);
  };

  // Helper para renderizar los chips de estado semánticos
  const renderStatusChip = (value: unknown) => {
    if (value === undefined || value === null || value === "") {
      return <Chip label="N/A" size="small" variant="outlined" />;
    }

    const valStr = String(value).toLowerCase().trim();

    // Bueno / Sí / Conforme
    if (["bueno", "si", "sí", "bien", "operativo", "conforme", "true"].includes(valStr)) {
      return (
        <Chip
          icon={<CheckCircleIcon sx={{ "&&": { color: "#ffffff" } }} />}
          label={valStr.toUpperCase()}
          size="small"
          sx={{
            bgcolor: "#10b981",
            color: "#ffffff",
            fontWeight: "bold",
          }}
        />
      );
    }

    // Regular / En observación
    if (["regular", "atencion", "observacion"].includes(valStr)) {
      return (
        <Chip
          icon={<WarningIcon sx={{ "&&": { color: "#ffffff" } }} />}
          label={valStr.toUpperCase()}
          size="small"
          sx={{
            bgcolor: "#f59e0b",
            color: "#ffffff",
            fontWeight: "bold",
          }}
        />
      );
    }

    // Malo / No / No conforme
    if (["malo", "no", "mal", "mantenimiento", "no conforme", "false"].includes(valStr)) {
      return (
        <Chip
          icon={<CancelIcon sx={{ "&&": { color: "#ffffff" } }} />}
          label={valStr.toUpperCase()}
          size="small"
          sx={{
            bgcolor: "#ef4444",
            color: "#ffffff",
            fontWeight: "bold",
          }}
        />
      );
    }

    // Por defecto gris
    return <Chip label={String(value).toUpperCase()} size="small" variant="outlined" />;
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Barra superior de acciones */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 2,
          pb: 2,
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Paso 5 — Revisión Final
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Verifique la información registrada antes de enviar el formulario.
          </Typography>
        </Box>

        <Box className="save-submit-buttons" sx={{ display: "flex", gap: 1.5 }}>
          {inspectionId ? (
            <Button
              variant="contained"
              color="secondary"
              startIcon={downloadingPdf ? <CircularProgress size={20} color="inherit" /> : <DownloadIcon />}
              onClick={handleDownloadPdf}
              disabled={downloadingPdf}
              sx={{
                bgcolor: "#06b6d4",
                "&:hover": { bgcolor: "#0891b2" },
                fontWeight: 600,
              }}
            >
              {downloadingPdf ? "Generando..." : "Certificado PDF"}
            </Button>
          ) : (
            <Alert severity="info" sx={{ py: 0.5, px: 1.5, fontSize: "0.85rem" }}>
              PDF disponible después de guardar borrador o enviar
            </Alert>
          )}
        </Box>
      </Box>

      {pdfError && <Alert severity="error">{pdfError}</Alert>}

      {/* 1. SECCIÓN: DATOS DE VERIFICACIÓN (PASO 1 Y PASO 2) */}
      <Card sx={{ bgcolor: isDark ? "background.paper" : "#f8fafc", border: "1px solid", borderColor: "divider" }}>
        <CardContent>
          <Typography variant="subtitle1" fontWeight={700} color="primary" gutterBottom sx={{ mb: 2 }}>
            📋 Datos de Identificación y Verificación (Pasos 1 y 2)
          </Typography>

          <Grid container spacing={2}>
            {/* Campos de Paso 1: Herramienta y Área */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="subtitle2" color="text.secondary" fontWeight={600} gutterBottom>
                HERRAMIENTA Y ÁREA (Paso 1)
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, pl: 1, borderLeft: "3px solid", borderColor: "primary.main" }}>
                {fieldsStep1.map((field) => (
                  <Box key={field.label} sx={{ display: "flex", justifyContent: "space-between", borderBottom: "1px dashed", borderColor: "divider", pb: 0.5 }}>
                    <Typography variant="body2" fontWeight={500} color="text.secondary">
                      {field.label}:
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {renderValue(verificationData[field.label])}
                    </Typography>
                  </Box>
                ))}
                {fieldsStep1.length === 0 && (
                  <Typography variant="caption" color="text.secondary">No se definieron campos para este paso.</Typography>
                )}
              </Box>
            </Grid>

            {/* Campos de Paso 2: Datos Generales */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="subtitle2" color="text.secondary" fontWeight={600} gutterBottom>
                DATOS GENERALES (Paso 2)
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, pl: 1, borderLeft: "3px solid", borderColor: "secondary.main" }}>
                {fieldsStep2.map((field) => (
                  <Box key={field.label} sx={{ display: "flex", justifyContent: "space-between", borderBottom: "1px dashed", borderColor: "divider", pb: 0.5 }}>
                    <Typography variant="body2" fontWeight={500} color="text.secondary">
                      {field.label}:
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {renderValue(verificationData[field.label])}
                    </Typography>
                  </Box>
                ))}
                {/* En agrupados, mostrar la cantidad configurada en Paso 2 */}
                {formType === "grouped" && formData.accesoriosConfig && (
                  <>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>CANTIDADES A INSPECCIONAR:</Typography>
                    {Object.entries(formData.accesoriosConfig as Record<string, LocalAccessoryConfig>).map(([key, configVal]) => (
                      <Box key={key} sx={{ display: "flex", justifyContent: "space-between", borderBottom: "1px dashed", borderColor: "divider", pb: 0.5 }}>
                        <Typography variant="body2" fontWeight={500} color="text.secondary">
                          {key.toUpperCase()}:
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {configVal.cantidad || 0} unidades
                        </Typography>
                      </Box>
                    ))}
                  </>
                )}
                {fieldsStep2.length === 0 && formType !== "grouped" && (
                  <Typography variant="caption" color="text.secondary">No se definieron campos para este paso.</Typography>
                )}
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* 2. SECCIÓN: CUERPO DEL FORMULARIO / CHECKLIST (PASO 3) */}
      <Card sx={{ border: "1px solid", borderColor: "divider" }}>
        <CardContent>
          <Typography variant="subtitle1" fontWeight={700} color="primary" gutterBottom sx={{ mb: 2 }}>
            🔍 Estado de Componentes / Checklist (Paso 3)
          </Typography>

          {/* RENDER POR TIPO: STANDARD O VEHICLE O SCAFFOLD */}
          {(formType === "standard" || formType === "vehicle" || formType === "scaffold") && (
            <TableContainer sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: isDark ? "rgba(255, 255, 255, 0.05)" : "#f1f5f9" }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: "bold" }}>Sección / Componente</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }} width="150px" align="center">Estado</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Observaciones / Comentarios</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {flatReviewRows.map((row) => {
                    if (row.type === "section") {
                      return (
                        <TableRow key={row.id}>
                          <TableCell
                            colSpan={3}
                            sx={{
                              bgcolor: isDark
                                ? `rgba(99, 102, 241, ${Math.max(0.04, 0.12 - row.level * 0.03)})`
                                : `rgba(99, 102, 241, ${Math.max(0.015, 0.06 - row.level * 0.015)})`,
                              fontWeight: "bold",
                              color: "primary.main",
                              pl: 2 + row.level * 2,
                            }}
                          >
                            {row.text}
                          </TableCell>
                        </TableRow>
                      );
                    }

                    return (
                      <TableRow
                        key={row.id}
                        sx={{
                          "&:hover": {
                            bgcolor: isDark ? "rgba(255, 255, 255, 0.02)" : "rgba(0, 0, 0, 0.01)",
                          },
                        }}
                      >
                        <TableCell sx={{ pl: 3 + row.level * 2 }}>
                          <Typography variant="body2" fontWeight={500}>
                            {row.text}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          {renderStatusChip(row.response?.value)}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {row.response?.observacion || row.response?.description || "Sin observaciones"}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* RENDER POR TIPO: GROUPED ACCESSORIES */}
          {formType === "grouped" && formData.responses && (
            <TableContainer sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: isDark ? "rgba(255, 255, 255, 0.05)" : "#f1f5f9" }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: "bold" }}>Accesorio / Ítem</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }} align="center">Estado</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Comentarios / Detalles</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {template.sections.map((section, sIdx) => {
                    const sectionResponses = formData.responses?.[sIdx] || {};
                    const questionsResponses = (sectionResponses as unknown as { questions?: QuestionResponse[] })?.questions || [];

                    return (
                      <React.Fragment key={sIdx}>
                        <TableRow>
                          <TableCell colSpan={3} sx={{ bgcolor: isDark ? "rgba(99, 102, 241, 0.1)" : "rgba(99, 102, 241, 0.05)", fontWeight: "bold", color: "primary.main" }}>
                            {section.title || "Accesorios"}
                          </TableCell>
                        </TableRow>

                        {section.questions.map((question, qIdx) => {
                          const response = questionsResponses[qIdx] || {};
                          return (
                            <TableRow key={qIdx}>
                              <TableCell sx={{ pl: 3 }}>
                                <Typography variant="body2" fontWeight={500}>{question.text}</Typography>
                              </TableCell>
                              <TableCell align="center">
                                {renderStatusChip(response.value)}
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">
                                  {response.observacion || response.description || "Sin comentarios"}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </React.Fragment>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* DATO ADICIONAL VEHÍCULOS: MAPA DE DAÑOS Y IMAGEN GENERADA */}
          {formType === "vehicle" && formData.vehicle && (
            <Box sx={{ mt: 3, p: 2, border: "1px solid", borderColor: "divider", borderRadius: 2, bgcolor: isDark ? "rgba(255,255,255,0.01)" : "#fafafa" }}>
              <Typography variant="subtitle2" color="text.secondary" fontWeight={700} gutterBottom>
                🚗 Registro de Daños del Vehículo
              </Typography>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="body2" fontWeight={500}>Detalle de Daños Marcados:</Typography>
                  <Box sx={{ mt: 1, maxHeight: "200px", overflowY: "auto", pl: 1 }}>
                    {formData.vehicle.damages && formData.vehicle.damages.length > 0 ? (
                      formData.vehicle.damages.map((damage: LocalDamage, dIdx: number) => (
                        <Typography key={dIdx} variant="caption" display="block" color="text.secondary">
                          • {damage.type} en coordenadas ({damage.x}%, {damage.y}%)
                        </Typography>
                      ))
                    ) : (
                      <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>No se registraron daños estructurales.</Typography>
                    )}
                  </Box>
                  <Typography variant="body2" fontWeight={500} sx={{ mt: 2 }}>Observaciones adicionales de daños:</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formData.vehicle.damageObservations || "Sin observaciones específicas de daños."}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }} sx={{ display: "flex", justifyContent: "center" }}>
                  {formData.vehicle.damageImageBase64 ? (
                    <Box sx={{ border: "1px solid", borderColor: "divider", p: 1, borderRadius: 2, bgcolor: "#ffffff" }}>
                      <img
                        src={formData.vehicle.damageImageBase64}
                        alt="Esquema de daños"
                        style={{ maxWidth: "100%", maxHeight: "200px", objectFit: "contain" }}
                      />
                    </Box>
                  ) : (
                    <Typography variant="caption" color="text.secondary" sx={{ alignSelf: "center" }}>Esquema de daños no generado.</Typography>
                  )}
                </Grid>
              </Grid>
            </Box>
          )}

          {/* DATO ADICIONAL SCAFFOLD: INSPECCIONES DIARIAS */}
          {formType === "scaffold" && formData.scaffold && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" color="text.secondary" fontWeight={700} gutterBottom>
                🏗️ Historial de Inspecciones Rutinarias del Andamio
              </Typography>
              <TableContainer sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, mt: 1 }}>
                <Table size="small">
                  <TableHead sx={{ bgcolor: isDark ? "rgba(255, 255, 255, 0.05)" : "#f1f5f9" }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: "bold" }}>Fecha de Inspección</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>Nombre del Inspector</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }} align="center">Liberado / Conforme</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>Observaciones</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }} align="center">Firma</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {formData.scaffold.routineInspections && formData.scaffold.routineInspections.length > 0 ? (
                      formData.scaffold.routineInspections.map((routine: RoutineInspectionEntry, rIdx: number) => (
                        <TableRow key={rIdx}>
                          <TableCell>{routine.date ? dayjs(routine.date).format("DD/MM/YYYY") : "—"}</TableCell>
                          <TableCell>{routine.inspector || "—"}</TableCell>
                          <TableCell align="center">
                            {renderStatusChip(routine.response === "si" ? "SI" : "NO")}
                          </TableCell>
                          <TableCell>{routine.observations || "—"}</TableCell>
                          <TableCell align="center">
                            {routine.signature ? (
                              <img
                                src={routine.signature}
                                alt="Firma"
                                style={{ maxWidth: "100px", maxHeight: "50px", objectFit: "contain" }}
                              />
                            ) : (
                              "—"
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ fontStyle: "italic", py: 2, color: "text.secondary" }}>
                          Ninguna inspección diaria rutinaria ha sido registrada aún en este andamio.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* 3. SECCIÓN: OBSERVACIONES GENERALES Y FUERA DE SERVICIO (PASO 4) */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: formData.outOfService?.activo ? 6 : 12 }}>
          <Card sx={{ height: "100%", border: "1px solid", borderColor: "divider" }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={700} color="primary" gutterBottom>
                📝 Observaciones Generales (Paso 4)
              </Typography>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: isDark ? "rgba(255,255,255,0.02)" : "#fafafa",
                  border: "1px solid",
                  borderColor: "divider",
                  minHeight: "100px",
                }}
              >
                <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                  {formData.generalObservations || "No se ingresaron observaciones generales."}
                </Typography>
              </Box>

              {/* Si es andamio, mostrar la conclusión final */}
              {formType === "scaffold" && formData.scaffold?.finalConclusion && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    Conclusión de Desmantelamiento / Final:
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formData.scaffold.finalConclusion}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {formData.outOfService?.activo && (
          <Grid size={{ xs: 12, md: 6 }}>
            <Card sx={{ height: "100%", border: "1px solid", borderColor: "#ef4444", bgcolor: isDark ? "rgba(239, 68, 68, 0.05)" : "rgba(239, 68, 68, 0.02)" }}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={700} color="error" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  ⚠️ Equipo Fuera de Servicio
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", borderBottom: "1px dashed", borderColor: "divider", pb: 0.5 }}>
                    <Typography variant="body2" color="text.secondary">Responsable:</Typography>
                    <Typography variant="body2" fontWeight={600}>{renderValue(formData.outOfService.responsable)}</Typography>
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between", borderBottom: "1px dashed", borderColor: "divider", pb: 0.5 }}>
                    <Typography variant="body2" color="text.secondary">Fecha Tarjeta Roja:</Typography>
                    <Typography variant="body2" fontWeight={600}>{renderValue(formData.outOfService.fechaTarjetaRoja)}</Typography>
                  </Box>
                  <Typography variant="body2" fontWeight={500} sx={{ mt: 1 }}>Detalle de Condición:</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
                    {formData.outOfService.motivo || "No se especificó motivo."}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* 4. SECCIÓN: REVISIÓN DE FIRMAS (PASO 4) */}
      <Card sx={{ border: "1px solid", borderColor: "divider" }}>
        <CardContent>
          <Typography variant="subtitle1" fontWeight={700} color="primary" gutterBottom sx={{ mb: 2 }}>
            ✍️ Firmas de Validación (Paso 4)
          </Typography>

          <Grid container spacing={3}>
            {/* Firma Inspector */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Box
                sx={{
                  p: 2,
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 3,
                  textAlign: "center",
                  bgcolor: isDark ? "rgba(255,255,255,0.01)" : "#f8fafc",
                }}
              >
                <Typography variant="subtitle2" color="text.secondary" fontWeight={700} gutterBottom>
                  TÉCNICO / INSPECTOR
                </Typography>
                <Typography variant="body1" fontWeight={600} gutterBottom sx={{ mt: 1 }}>
                  {formData.inspectorSignature?.inspectorName || formData.inspectorSignature?.name
                    ? String(formData.inspectorSignature.inspectorName || formData.inspectorSignature.name)
                    : "—"}
                </Typography>
                
                <Box
                  sx={{
                    my: 2,
                    height: "120px",
                    border: "1px dashed",
                    borderColor: "divider",
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: "#ffffff",
                    overflow: "hidden",
                  }}
                >
                  {formData.inspectorSignature?.inspectorSignature ||
                  formData.inspectorSignature?.signatureBase64 ||
                  formData.inspectorSignature?.signature ? (
                    <img
                      src={String(
                        formData.inspectorSignature.inspectorSignature ||
                          formData.inspectorSignature.signatureBase64 ||
                          formData.inspectorSignature.signature
                      )}
                      alt="Firma del inspector"
                      style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain" }}
                    />
                  ) : (
                    <Typography variant="caption" color="text.secondary">
                      Firma no registrada
                    </Typography>
                  )}
                </Box>
              </Box>
            </Grid>

            {/* Aprobación del Supervisor */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Box
                sx={{
                  p: 2,
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 3,
                  textAlign: "center",
                  bgcolor: isDark ? "rgba(255,255,255,0.01)" : "#f8fafc",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" fontWeight={700} gutterBottom>
                    SUPERVISOR APROBADOR
                  </Typography>
                  {isApprovalReview ? (
                    <Box sx={{ mt: 2 }}>
                      <Chip
                        label="FIRMA Y DECISIÓN REQUERIDAS"
                        color="warning"
                        sx={{ fontWeight: "bold" }}
                      />
                    </Box>
                  ) : formData.requiresApproval || formData.approval?.status ? (
                    <Box sx={{ mt: 2 }}>
                      <Chip
                        label={
                          formData.approval?.status === "approved"
                            ? "APROBADO POR SUPERVISOR"
                            : formData.approval?.status === "rejected"
                            ? "RECHAZADO POR SUPERVISOR"
                            : "PENDIENTE DE APROBACIÓN"
                        }
                        color={
                          formData.approval?.status === "approved"
                            ? "success"
                            : formData.approval?.status === "rejected"
                            ? "error"
                            : "warning"
                        }
                        sx={{ fontWeight: "bold" }}
                      />
                      {formData.approval?.approvedBy && (
                        <Typography variant="body2" sx={{ mt: 1, fontWeight: 600 }}>
                          Aprobado por: {formData.approval.approvedBy}
                        </Typography>
                      )}
                    </Box>
                  ) : (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
                        Esta inspección no requiere aprobación del supervisor
                      </Typography>
                    </Box>
                  )}
                </Box>

                {!isApprovalReview && (
                  <>
                    <Box sx={{ mt: 1 }}>
                      {(formData.supervisorSignature?.supervisorName || formData.supervisorSignature?.name) && (
                        <Typography variant="body1" fontWeight={600} gutterBottom>
                          {String(formData.supervisorSignature.supervisorName || formData.supervisorSignature.name)}
                        </Typography>
                      )}
                    </Box>

                    {(formData.supervisorSignature?.supervisorSignature ||
                      formData.supervisorSignature?.signatureBase64 ||
                      formData.supervisorSignature?.signature) ? (
                      <Box
                        sx={{
                          my: 2,
                          height: "120px",
                          border: "1px dashed",
                          borderColor: "divider",
                          borderRadius: 2,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          bgcolor: "#ffffff",
                          overflow: "hidden",
                        }}
                      >
                        <img
                          src={String(
                            formData.supervisorSignature.supervisorSignature ||
                              formData.supervisorSignature.signatureBase64 ||
                              formData.supervisorSignature.signature
                          )}
                          alt="Firma del supervisor"
                          style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain" }}
                        />
                      </Box>
                    ) : null}
                  </>
                )}
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {showApprovalInputs && register && control && setValue && errors && onApprove && onReject && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3, mt: 3 }}>
          <SupervisorSignature
            register={register}
            control={control}
            errors={errors}
            setValue={setValue}
            config={getFormConfig(template.code)?.signatures?.supervisor}
          />
          <ApprovalSection
            status={formData.status || "pending_approval"}
            approval={formData.approval}
            canApprove={true}
            onApprove={onApprove}
            onReject={onReject}
            readonly={false}
          />
        </Box>
      )}

      {/* Botones de navegación del paso final */}
      <Box
        className="save-submit-buttons"
        sx={{
          display: "flex",
          justifyContent: "space-between",
          mt: 2,
          pt: 2,
          borderTop: "1px solid",
          borderColor: "divider",
        }}
      >
        {isApprovalReview ? (
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={onPrev}
            disabled={isSubmitting}
          >
            Volver
          </Button>
        ) : (
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={onPrev}
            disabled={isSubmitting}
          >
            Anterior
          </Button>
        )}

        <Button
          variant="contained"
          color="success"
          startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
          onClick={onFinalSubmit}
          disabled={isSubmitting || isSubmitDisabled}
          sx={{
            px: 4,
            fontWeight: "bold",
            background: "linear-gradient(135deg, #10B981, #059669)",
            "&:hover": {
              background: "linear-gradient(135deg, #059669, #047857)",
            },
          }}
        >
          {isSubmitting
            ? "Procesando..."
            : showApprovalInputs
            ? "Enviar Decisión de Aprobación"
            : isApprovalReview
            ? "Siguiente"
            : "Guardar y Enviar"}
        </Button>
      </Box>
    </Box>
  );
}
