import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  Chip,
  IconButton,
} from "@mui/material";
import { Close, CheckCircle, Cancel } from "@mui/icons-material";
import { TagDetalle } from "../types/IProps";
import { getColorSemaforo } from "./emergencychartsCharts";

interface TagDetailModalProps {
  open: boolean;
  area: string | null;
  detalle: TagDetalle[];
  onClose: () => void;
}

export const TagDetailModal: React.FC<TagDetailModalProps> = ({
  open,
  area,
  detalle,
  onClose,
}) => {
  const totalActivos = detalle.reduce((s, d) => s + d.extintoresActivos, 0);
  const totalInspeccionados = detalle.reduce((s, d) => s + d.extintoresInspeccionados, 0);
  const tagsConInspeccion = detalle.filter((d) => d.tieneInspeccion).length;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Box>
          <Typography variant="h6" fontWeight="bold">
            Detalle por Tag
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {area}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Box display="flex" gap={1} mb={2} flexWrap="wrap">
          <Chip
            size="small"
            label={`${tagsConInspeccion}/${detalle.length} tags con inspección`}
            sx={{ bgcolor: "#e0f2fe", color: "#0369a1", fontWeight: 600 }}
          />
          <Chip
            size="small"
            label={`🎯 ${totalActivos} extintores activos`}
            sx={{ bgcolor: "#f1f5f9", color: "#334155", fontWeight: 600 }}
          />
          <Chip
            size="small"
            label={`✅ ${totalInspeccionados} inspeccionados`}
            sx={{ bgcolor: "#dcfce7", color: "#15803d", fontWeight: 600 }}
          />
        </Box>

        {detalle.length === 0 ? (
          <Typography variant="body2" color="text.secondary" textAlign="center" py={3}>
            No hay tags registrados para esta área.
          </Typography>
        ) : (
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                  <TableCell>Tag</TableCell>
                  <TableCell align="center">Inspección</TableCell>
                  <TableCell align="right">Activos</TableCell>
                  <TableCell align="right">Inspeccionados</TableCell>
                  <TableCell align="right">%</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {detalle.map((d) => (
                  <TableRow key={d.tag} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {d.tag}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      {d.tieneInspeccion ? (
                        <CheckCircle fontSize="small" sx={{ color: "#22c55e" }} />
                      ) : (
                        <Cancel fontSize="small" sx={{ color: "#ef4444" }} />
                      )}
                    </TableCell>
                    <TableCell align="right">{d.extintoresActivos}</TableCell>
                    <TableCell align="right">{d.extintoresInspeccionados}</TableCell>
                    <TableCell align="right">
                      <Chip
                        size="small"
                        label={`${d.pctExtintores}%`}
                        sx={{
                          bgcolor: getColorSemaforo(d.pctExtintores),
                          color: "white",
                          fontWeight: 700,
                          minWidth: 52,
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>

      <DialogActions>
        <Button type="button" onClick={onClose}>
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};
