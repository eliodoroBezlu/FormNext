"use client";

import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Grid,
  Paper,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { useLinternas } from "@/components/features/linternas/application/hooks/useLinternas";

export default function StockLinternasPage() {
  const { stock, error, setError, ingresarStock } = useLinternas();
  const [cantidad, setCantidad] = useState("");
  const [observacion, setObservacion] = useState("");
  const [aviso, setAviso] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const registrar = async () => {
    const n = Number(cantidad);
    if (!Number.isInteger(n) || n < 1) {
      setError("La cantidad debe ser un entero mayor que cero.");
      return;
    }
    setEnviando(true);
    try {
      await ingresarStock(n, observacion || undefined);
      setCantidad("");
      setObservacion("");
      setAviso("Ingreso registrado.");
    } catch {
      // el hook ya dejó el mensaje en `error`
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 900, mx: "auto" }}>
      <Typography variant="h5" fontWeight={700}>
        Stock de linternas
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Las devueltas no vuelven al stock: están averiadas. Solo sube con un
        ingreso.
      </Typography>

      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        <Stack direction="row" alignItems="center" gap={2} mb={2}>
          <Typography variant="h4" fontWeight={700}>
            {stock.cantidadDisponible}
          </Typography>
          <Chip
            label={stock.cantidadDisponible > 0 ? "Disponible" : "Sin stock"}
            color={stock.cantidadDisponible > 0 ? "success" : "error"}
          />
        </Stack>

        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, sm: 3 }}>
            <TextField
              fullWidth
              size="small"
              type="number"
              label="Cantidad a ingresar"
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              size="small"
              label="Observación (opcional)"
              value={observacion}
              onChange={(e) => setObservacion(e.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
            <Button
              fullWidth
              variant="contained"
              onClick={() => void registrar()}
              disabled={enviando}
            >
              Registrar ingreso
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Typography variant="subtitle2" fontWeight={600} gutterBottom>
        Ingresos registrados
      </Typography>
      <Paper variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Fecha</TableCell>
              <TableCell align="right">Cantidad</TableCell>
              <TableCell>Registrado por</TableCell>
              <TableCell>Observación</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {stock.ingresos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  Todavía no hay ingresos.
                </TableCell>
              </TableRow>
            ) : (
              stock.ingresos.map((i) => (
                <TableRow key={i._id}>
                  <TableCell>
                    {new Date(i.fecha).toLocaleDateString("es-BO")}
                  </TableCell>
                  <TableCell align="right">{i.cantidad}</TableCell>
                  <TableCell>{i.registradoPor}</TableCell>
                  <TableCell>{i.observacion ?? "—"}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Paper>

      <Snackbar
        open={!!error}
        autoHideDuration={8000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>

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
    </Box>
  );
}
