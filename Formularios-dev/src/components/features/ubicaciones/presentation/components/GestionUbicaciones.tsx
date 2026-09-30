"use client";

import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  FormControlLabel,
  IconButton,
  Paper,
  Snackbar,
  Stack,
  Switch,
  TableContainer,
  TextField,
  Typography,
} from "@mui/material";
import { Add as AddIcon, Clear as ClearIcon } from "@mui/icons-material";
import { useGestionUbicaciones } from "../../application/hooks/useGestionUbicaciones";
import { useArbolUbicaciones } from "../../application/hooks/useArbolUbicaciones";
import type { UbicacionBackend } from "../../infrastructure/adapters/ubicacionesAdapter";
import { TablaArbolUbicaciones } from "./TablaArbolUbicaciones";
import { DialogoUbicacion } from "./DialogoUbicacion";
import { DialogoFusion } from "./DialogoFusion";

/** Diálogo de alta/edición: cerrado, creando (con padre sugerido) o editando. */
type EstadoDialogo =
  | { modo: "cerrado" }
  | { modo: "crear"; padre: string | null }
  | { modo: "editar"; nodo: UbicacionBackend };

/**
 * Pantalla de gestión de ubicaciones: árbol de hasta 7 niveles
 * («Taller de flotación › Bodega 1 › Estante A»).
 */
export function GestionUbicaciones() {
  const gestion = useGestionUbicaciones();
  const arbol = useArbolUbicaciones(gestion.ubicaciones);
  const [dialogo, setDialogo] = useState<EstadoDialogo>({ modo: "cerrado" });
  const [origenFusion, setOrigenFusion] = useState<UbicacionBackend | null>(null);

  const editando = dialogo.modo === "editar" ? dialogo.nodo : null;
  const padreInicial = dialogo.modo === "crear" ? dialogo.padre : null;

  const guardar = async (valores: { nombre: string; padre: string | null }) => {
    const ok = editando
      ? await gestion.actualizar(editando._id, valores)
      : await gestion.crear(valores);
    if (ok && valores.padre) arbol.revelar(valores.padre);
    return ok;
  };

  const darDeBaja = (nodo: UbicacionBackend) => {
    if (window.confirm(`¿Dar de baja «${nodo.ruta}»? Se puede restaurar después.`)) {
      void gestion.darDeBaja(nodo);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1} gap={2} flexWrap="wrap">
        <Typography variant="h5" component="h1" fontWeight="bold">
          Gestión de Ubicaciones
        </Typography>
        <Button
          type="button"
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setDialogo({ modo: "crear", padre: null })}
        >
          Agregar ubicación principal
        </Button>
      </Box>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Hasta 7 niveles. En el Excel de importación, una ubicación anidada se escribe con{" "}
        <code>&gt;</code>: <code>Taller de flotación &gt; Bodega 1 &gt; Estante A</code>.
      </Typography>

      {gestion.error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {gestion.error}
        </Alert>
      )}

      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ md: "center" }}>
          <TextField
            label="Buscar ubicación…"
            size="small"
            value={arbol.busqueda}
            onChange={(e) => arbol.setBusqueda(e.target.value)}
            sx={{ flex: 1 }}
            slotProps={{
              input: {
                endAdornment: arbol.busqueda && (
                  <IconButton onClick={() => arbol.setBusqueda("")} size="small" aria-label="Limpiar búsqueda">
                    <ClearIcon />
                  </IconButton>
                ),
              },
            }}
          />
          {arbol.hayBajas && (
            <FormControlLabel
              control={
                <Switch checked={arbol.mostrarBajas} onChange={(e) => arbol.setMostrarBajas(e.target.checked)} />
              }
              label="Mostrar dadas de baja"
            />
          )}
          <Stack direction="row" spacing={1}>
            <Button type="button" size="small" onClick={arbol.expandirTodo} disabled={!!arbol.busqueda}>
              Expandir todo
            </Button>
            <Button type="button" size="small" onClick={arbol.contraerTodo} disabled={!!arbol.busqueda}>
              Contraer todo
            </Button>
            <Button type="button" variant="outlined" size="small" onClick={gestion.recargar} disabled={gestion.loading}>
              Refrescar
            </Button>
          </Stack>
        </Stack>
      </Paper>

      <TableContainer component={Paper}>
        {gestion.loading && gestion.ubicaciones.length === 0 ? (
          <Box display="flex" justifyContent="center" p={5}>
            <CircularProgress />
          </Box>
        ) : (
          <TablaArbolUbicaciones
            filas={arbol.filas}
            expandidos={arbol.expandidos}
            buscando={!!arbol.busqueda}
            onAlternar={arbol.alternar}
            onAgregarDebajo={(nodo) => setDialogo({ modo: "crear", padre: nodo._id })}
            onEditar={(nodo) => setDialogo({ modo: "editar", nodo })}
            onFusionar={setOrigenFusion}
            onDarDeBaja={darDeBaja}
            onRestaurar={(nodo) => void gestion.restaurar(nodo)}
          />
        )}
      </TableContainer>

      <DialogoUbicacion
        open={dialogo.modo !== "cerrado"}
        nodos={gestion.ubicaciones}
        editando={editando}
        padreInicial={padreInicial}
        onGuardar={guardar}
        onRestaurar={gestion.restaurar}
        onCerrar={() => setDialogo({ modo: "cerrado" })}
      />

      <DialogoFusion
        key={origenFusion?._id ?? "cerrado"}
        origen={origenFusion}
        nodos={gestion.ubicaciones}
        onFusionar={gestion.fusionar}
        onCerrar={() => setOrigenFusion(null)}
      />

      <Snackbar open={!!gestion.aviso} autoHideDuration={6000} onClose={gestion.cerrarAviso}>
        <Alert onClose={gestion.cerrarAviso} severity={gestion.aviso?.severidad ?? "info"} sx={{ width: "100%" }}>
          {gestion.aviso?.mensaje}
        </Alert>
      </Snackbar>
    </Container>
  );
}
