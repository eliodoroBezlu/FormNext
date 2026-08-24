"use client";

import React, { useState } from "react";
import {
  Box,
  Chip,
  CircularProgress,
  Collapse,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Pagination,
  Paper,
  Select,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import { useAuditoria } from "../../application/hooks/useAuditoria";
import {
  COLOR_POR_METODO,
  describirAccion,
  type AsientoAuditoria,
} from "../../domain/models/Auditoria";

const fecha = (iso: string) =>
  new Date(iso).toLocaleString("es-BO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

/** Fila con el detalle desplegable: los datos crudos solo cuando se piden. */
function Fila({ asiento }: { asiento: AsientoAuditoria }) {
  const [abierto, setAbierto] = useState(false);
  const hayDetalle = !!asiento.datos || !!asiento.mensajeError;

  return (
    <>
      <TableRow hover sx={{ "& > *": { borderBottom: "unset" } }}>
        <TableCell sx={{ width: 48 }}>
          {hayDetalle && (
            <IconButton size="small" onClick={() => setAbierto(!abierto)}>
              {abierto ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          )}
        </TableCell>
        <TableCell sx={{ whiteSpace: "nowrap" }}>
          {fecha(asiento.fecha)}
        </TableCell>
        <TableCell>
          <Typography variant="body2" fontWeight={600}>
            {asiento.usuario}
          </Typography>
          {asiento.roles.length > 0 && (
            <Typography variant="caption" color="text.secondary">
              {asiento.roles.join(", ")}
            </Typography>
          )}
        </TableCell>
        <TableCell>
          <Chip
            label={describirAccion(asiento)}
            size="small"
            color={COLOR_POR_METODO[asiento.metodo] ?? "default"}
            variant="outlined"
          />
        </TableCell>
        <TableCell>{asiento.recurso}</TableCell>
        <TableCell>
          <Typography variant="caption" sx={{ fontFamily: "monospace" }}>
            {asiento.ruta}
          </Typography>
        </TableCell>
        <TableCell>
          <Chip
            label={asiento.estado}
            size="small"
            color={asiento.fallo ? "error" : "success"}
          />
        </TableCell>
        <TableCell sx={{ whiteSpace: "nowrap" }}>
          <Tooltip title={asiento.userAgent ?? ""}>
            <span>{asiento.ip ?? "—"}</span>
          </Tooltip>
        </TableCell>
      </TableRow>
      {hayDetalle && (
        <TableRow>
          <TableCell colSpan={8} sx={{ py: 0, borderBottom: abierto ? undefined : "none" }}>
            <Collapse in={abierto} timeout="auto" unmountOnExit>
              <Box sx={{ py: 2 }}>
                {asiento.mensajeError && (
                  <Typography variant="body2" color="error" sx={{ mb: 1 }}>
                    {asiento.mensajeError}
                  </Typography>
                )}
                {asiento.datos && (
                  <Box
                    component="pre"
                    sx={{
                      m: 0,
                      p: 1.5,
                      borderRadius: 1,
                      bgcolor: "action.hover",
                      fontSize: "0.75rem",
                      overflowX: "auto",
                    }}
                  >
                    {JSON.stringify(asiento.datos, null, 2)}
                  </Box>
                )}
                {asiento.documentoId && (
                  <Typography variant="caption" color="text.secondary">
                    Documento: {asiento.documentoId}
                  </Typography>
                )}
              </Box>
            </Collapse>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

export function AuditoriaView() {
  const { pagina, opciones, filtros, cargando, filtrar, irAPagina } =
    useAuditoria();

  const totalPaginas = Math.max(1, Math.ceil(pagina.total / pagina.porPagina));

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 0.5 }}>
        Auditoría
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Todo lo que modifica el sistema queda aquí. Las consultas de solo lectura
        no se registran, y las contraseñas nunca se guardan.
      </Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
            <FormControl fullWidth size="small">
              <InputLabel id="f-usuario">Usuario</InputLabel>
              <Select
                labelId="f-usuario"
                label="Usuario"
                value={filtros.usuario ?? ""}
                onChange={(e) => filtrar({ usuario: e.target.value || undefined })}
              >
                <MenuItem value="">
                  <em>Todos</em>
                </MenuItem>
                {opciones.usuarios.map((u) => (
                  <MenuItem key={u} value={u}>
                    {u}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
            <FormControl fullWidth size="small">
              <InputLabel id="f-recurso">Módulo</InputLabel>
              <Select
                labelId="f-recurso"
                label="Módulo"
                value={filtros.recurso ?? ""}
                onChange={(e) => filtrar({ recurso: e.target.value || undefined })}
              >
                <MenuItem value="">
                  <em>Todos</em>
                </MenuItem>
                {opciones.recursos.map((r) => (
                  <MenuItem key={r} value={r}>
                    {r}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel id="f-metodo">Acción</InputLabel>
              <Select
                labelId="f-metodo"
                label="Acción"
                value={filtros.metodo ?? ""}
                onChange={(e) => filtrar({ metodo: e.target.value || undefined })}
              >
                <MenuItem value="">
                  <em>Todas</em>
                </MenuItem>
                <MenuItem value="POST">Creó</MenuItem>
                <MenuItem value="PATCH">Modificó</MenuItem>
                <MenuItem value="PUT">Reemplazó</MenuItem>
                <MenuItem value="DELETE">Eliminó</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 6, sm: 3, md: 1.5 }}>
            <TextField
              fullWidth
              size="small"
              type="date"
              label="Desde"
              slotProps={{ inputLabel: { shrink: true } }}
              value={filtros.desde ?? ""}
              onChange={(e) => filtrar({ desde: e.target.value || undefined })}
            />
          </Grid>

          <Grid size={{ xs: 6, sm: 3, md: 1.5 }}>
            <TextField
              fullWidth
              size="small"
              type="date"
              label="Hasta"
              slotProps={{ inputLabel: { shrink: true } }}
              value={filtros.hasta ?? ""}
              onChange={(e) => filtrar({ hasta: e.target.value || undefined })}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={!!filtros.soloFallos}
                  onChange={(e) => filtrar({ soloFallos: e.target.checked })}
                />
              }
              label="Solo fallos"
            />
          </Grid>
        </Grid>
      </Paper>

      {cargando ? (
        <Box display="flex" justifyContent="center" py={6}>
          <CircularProgress />
        </Box>
      ) : pagina.filas.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography color="text.secondary">
            No hay movimientos que coincidan con el filtro.
          </Typography>
        </Paper>
      ) : (
        <>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {pagina.total} movimiento(s)
          </Typography>
          <TableContainer component={Paper} sx={{ overflowX: "auto" }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell />
                  <TableCell>Fecha</TableCell>
                  <TableCell>Quién</TableCell>
                  <TableCell>Qué hizo</TableCell>
                  <TableCell>Módulo</TableCell>
                  <TableCell>Ruta</TableCell>
                  <TableCell>Resultado</TableCell>
                  <TableCell>Origen</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pagina.filas.map((a) => (
                  <Fila key={a._id} asiento={a} />
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {totalPaginas > 1 && (
            <Box display="flex" justifyContent="center" mt={3}>
              <Pagination
                count={totalPaginas}
                page={pagina.pagina}
                onChange={(_, n) => irAPagina(n)}
                color="primary"
              />
            </Box>
          )}
        </>
      )}
    </Box>
  );
}
