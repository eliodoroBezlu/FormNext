"use client";

import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  useTheme,
} from "@mui/material";
import { Close, CheckCircle, Cancel, ExpandMore, Download } from "@mui/icons-material";
import { TagDelMes, FueraDeCatalogo, nivelCobertura, fechaCorta } from "../utils/coberturaMensual";
import { TablaExtintores, TablaFueraDeCatalogo, descargarCsv } from "./TablaExtintores";

interface TagDetailModalProps {
  area: string | null;
  periodo: string;
  /** Tags activos del área, con sus extintores del mes. */
  tags: TagDelMes[];
  /** Códigos inspeccionados en el área que no cuentan. */
  fueraDeCatalogo: FueraDeCatalogo[];
  onClose: () => void;
}

/** Detalle por tag de un área: cada tag se despliega para ver sus extintores. */
export const TagDetailModal: React.FC<TagDetailModalProps> = ({ area, periodo, tags, fueraDeCatalogo, onClose }) => {
  const theme = useTheme();
  const cantidad = tags.reduce((s, t) => s + t.cantidad, 0);
  const inspeccionados = tags.reduce((s, t) => s + t.inspeccionados, 0);
  const tagsConInspeccion = tags.filter((t) => t.inspeccionado).length;
  const extintores = tags.flatMap((t) => t.extintores);

  return (
    <Dialog open={!!area} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Box>
          <Typography variant="h6" fontWeight="bold" component="div">
            Detalle por tag
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {area} · {periodo}
          </Typography>
        </Box>
        <IconButton type="button" onClick={onClose} size="small" aria-label="Cerrar">
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Box display="flex" gap={1} mb={2} flexWrap="wrap">
          <Chip size="small" variant="outlined" label={`${tagsConInspeccion}/${tags.length} tags con inspección`} />
          <Chip size="small" variant="outlined" label={`Cantidad: ${cantidad} extintores`} />
          <Chip size="small" variant="outlined" label={`Inspeccionados: ${inspeccionados}`} />
        </Box>

        {tags.length === 0 ? (
          <Typography variant="body2" color="text.secondary" textAlign="center" py={3}>
            No hay tags activos en esta área.
          </Typography>
        ) : (
          <>
            {/* Encabezado de las columnas del resumen de cada tag */}
            <Box
              sx={{
                display: { xs: "none", sm: "grid" },
                gridTemplateColumns: "1fr 90px 80px 110px 70px",
                px: 2,
                pr: 6,
                pb: 0.5,
              }}
            >
              {["Tag", "Inspección", "Cantidad", "Inspeccionados", "%"].map((c, i) => (
                <Typography key={c} variant="caption" fontWeight={700} textAlign={i === 0 ? "left" : "center"}>
                  {c}
                </Typography>
              ))}
            </Box>

            {tags.map((t) => {
              const color = theme.palette[nivelCobertura(t.pct)].main;
              return (
                <Accordion key={t.tag} disableGutters variant="outlined" slotProps={{ transition: { unmountOnExit: true } }}>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr auto auto", sm: "1fr 90px 80px 110px 70px" },
                        alignItems: "center",
                        width: "100%",
                        gap: 1,
                      }}
                    >
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          {t.tag}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {t.inspeccionado
                            ? `${t.inspector ?? "Inspector sin registrar"}${t.fecha ? ` · ${fechaCorta(t.fecha)}` : ""}`
                            : "Sin inspección en el mes"}
                        </Typography>
                      </Box>
                      <Box textAlign="center" sx={{ display: { xs: "none", sm: "block" } }}>
                        {t.inspeccionado ? (
                          <CheckCircle fontSize="small" color="success" titleAccess="Con inspección" />
                        ) : (
                          <Cancel fontSize="small" color="error" titleAccess="Sin inspección" />
                        )}
                      </Box>
                      <Typography variant="body2" textAlign="center" sx={{ display: { xs: "none", sm: "block" } }}>
                        {t.cantidad}
                      </Typography>
                      <Typography variant="body2" textAlign="center">
                        <Box component="span" sx={{ display: { sm: "none" } }}>
                          {t.inspeccionados}/{t.cantidad}
                        </Box>
                        <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>
                          {t.inspeccionados}
                        </Box>
                      </Typography>
                      <Box textAlign="center">
                        <Chip
                          size="small"
                          label={`${t.pct} %`}
                          sx={{ bgcolor: color, color: theme.palette.getContrastText(color), fontWeight: 700, minWidth: 56 }}
                        />
                      </Box>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <TablaExtintores extintores={t.extintores} />
                  </AccordionDetails>
                </Accordion>
              );
            })}
          </>
        )}

        {fueraDeCatalogo.length > 0 && (
          <Box mt={3}>
            <Typography variant="subtitle2" fontWeight={700} mb={1}>
              Inspeccionados que no cuentan ({fueraDeCatalogo.length})
            </Typography>
            <TablaFueraDeCatalogo fuera={fueraDeCatalogo} />
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        {extintores.length > 0 && (
          <Button
            type="button"
            startIcon={<Download />}
            onClick={() => descargarCsv(`extintores-${area ?? ""}-${periodo}.csv`.replace(/\s+/g, "-").toLowerCase(), extintores)}
          >
            Descargar CSV
          </Button>
        )}
        <Button type="button" onClick={onClose}>
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};
