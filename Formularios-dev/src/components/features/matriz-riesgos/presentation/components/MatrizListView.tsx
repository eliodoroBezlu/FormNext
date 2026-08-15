"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { Add, UploadFile } from "@mui/icons-material";
import { listarMatrices } from "../../infrastructure/adapters/matrizRiesgosAdapter";
import {
  EstadoMatriz,
  MatrizRiesgoResumen,
} from "../../domain/models/IProps";
import { colorDeEstado, ETIQUETA_ESTADO } from "../../domain/matrizHelpers";
import { NuevaMatrizDialog } from "./NuevaMatrizDialog";

const ESTADOS: EstadoMatriz[] = [
  "BORRADOR",
  "EN_REVISION",
  "APROBADA",
  "SUPERADA",
];

export function MatrizListView() {
  const [nuevaAbierta, setNuevaAbierta] = useState(false);
  const router = useRouter();
  const [matrices, setMatrices] = useState<MatrizRiesgoResumen[]>([]);
  const [cargando, setCargando] = useState(true);
  const [estado, setEstado] = useState<string>("");
  const [anio, setAnio] = useState<string>("");

  useEffect(() => {
    // `cargando` ya arranca en `true`: ponerlo otra vez aquí solo dispararía
    // un render en cascada.
    let vigente = true;
    void listarMatrices().then((datos) => {
      if (vigente) {
        setMatrices(datos);
        setCargando(false);
      }
    });
    return () => {
      vigente = false;
    };
  }, []);

  const anios = useMemo(
    () => [...new Set(matrices.map((m) => m.anio))].sort((a, b) => b - a),
    [matrices],
  );

  const visibles = useMemo(
    () =>
      matrices.filter(
        (m) =>
          (!estado || m.estado === estado) &&
          (!anio || String(m.anio) === anio),
      ),
    [matrices, estado, anio],
  );

  return (
    <Box>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ sm: "center" }}
        gap={2}
        mb={3}
      >
        <Box>
          <Typography variant="h5" fontWeight={600}>
            Matrices de Riesgo
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Identificación y evaluación de riesgos por área (1.02.P06.F01)
          </Typography>
        </Box>
        <Stack direction="row" gap={1.5}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setNuevaAbierta(true)}
          >
            Nueva matriz
          </Button>
          <Button
            variant="outlined"
            startIcon={<UploadFile />}
            onClick={() => router.push("/dashboard/matriz-riesgos/importar")}
          >
            Importar de Excel
          </Button>
        </Stack>
      </Stack>

      <Stack direction="row" spacing={1.5} mb={2} flexWrap="wrap">
        <TextField
          select
          size="small"
          label="Estado"
          value={estado}
          onChange={(e) => setEstado(e.target.value)}
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="">Todos</MenuItem>
          {ESTADOS.map((e) => (
            <MenuItem key={e} value={e}>
              {ETIQUETA_ESTADO[e]}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          size="small"
          label="Año"
          value={anio}
          onChange={(e) => setAnio(e.target.value)}
          sx={{ minWidth: 120 }}
        >
          <MenuItem value="">Todos</MenuItem>
          {anios.map((a) => (
            <MenuItem key={a} value={String(a)}>
              {a}
            </MenuItem>
          ))}
        </TextField>
      </Stack>

      {cargando ? (
        <Box display="flex" justifyContent="center" py={6}>
          <CircularProgress />
        </Box>
      ) : visibles.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 6, textAlign: "center" }}>
          <Typography color="text.secondary" gutterBottom>
            {matrices.length === 0
              ? "Todavía no hay matrices cargadas."
              : "Ninguna matriz coincide con los filtros."}
          </Typography>
          {matrices.length === 0 && (
            <Button
              startIcon={<UploadFile />}
              onClick={() => router.push("/dashboard/matriz-riesgos/importar")}
            >
              Importar la primera
            </Button>
          )}
        </Paper>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Código</TableCell>
                <TableCell>Área</TableCell>
                <TableCell>Superintendencia</TableCell>
                <TableCell align="center">Año</TableCell>
                <TableCell align="center">Versión</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Elaborado por</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {visibles.map((m) => (
                <TableRow
                  key={m._id}
                  hover
                  sx={{ cursor: "pointer" }}
                  onClick={() =>
                    router.push(`/dashboard/matriz-riesgos/${m._id}`)
                  }
                >
                  <TableCell>
                    <Typography variant="body2" fontFamily="monospace">
                      {m.codigo}
                    </Typography>
                  </TableCell>
                  <TableCell>{m.areaNombre}</TableCell>
                  <TableCell>
                    <Typography variant="caption" color="text.secondary">
                      {m.superintendencia}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">{m.anio}</TableCell>
                  <TableCell align="center">v{m.version}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={ETIQUETA_ESTADO[m.estado]}
                      color={
                        colorDeEstado(m.estado) as
                          | "default"
                          | "warning"
                          | "success"
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption">
                      {m.elaboradoPor || "—"}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <NuevaMatrizDialog
        abierto={nuevaAbierta}
        onCerrar={() => setNuevaAbierta(false)}
      />
    </Box>
  );
}
