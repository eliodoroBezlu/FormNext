"use client";

import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  IconButton,
  Paper,
  Snackbar,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tabs,
  Tooltip,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import PowerSettingsNewIcon from "@mui/icons-material/PowerSettingsNew";
import { usePgrCatalogos } from "../../application/hooks/usePgrCatalogos";
import { CatalogoSimplePanel } from "./CatalogoSimplePanel";
import { GrupoResponsableDialog } from "./GrupoResponsableDialog";
import type { GrupoResponsable } from "../../infrastructure/adapters/pgrCatalogoAdapter";

/**
 * Panel de administración de los catálogos del PGR.
 *
 * Los tres viven acá porque responden a la misma decisión: que las unidades de
 * recurso, los entregables sugeridos y los grupos de responsables se
 * configuren en la base y no como listas dentro del código.
 */
export function PgrCatalogosView() {
  const {
    unidades,
    entregables,
    grupos,
    cargando,
    guardando,
    snackbar,
    cerrarSnackbar,
    guardarUnidad,
    alternarUnidad,
    guardarEntregable,
    alternarEntregable,
    guardarGrupo,
    alternarGrupo,
    resolverGrupo,
  } = usePgrCatalogos();

  const [tab, setTab] = useState(0);
  const [dialogoAbierto, setDialogoAbierto] = useState(false);
  const [grupoEnEdicion, setGrupoEnEdicion] = useState<
    GrupoResponsable | undefined
  >();

  const abrirGrupo = (grupo?: GrupoResponsable) => {
    setGrupoEnEdicion(grupo);
    setDialogoAbierto(true);
  };

  if (cargando) {
    return (
      <Box display="flex" justifyContent="center" py={6}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        Catálogos del PGR
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Lo que ofrecen los formularios de actividad. Nada se borra: se desactiva,
        para no dejar sin explicación a las actividades ya cargadas que lo usan.
      </Typography>

      <Tabs value={tab} onChange={(_, v: number) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label={`Grupos de responsables (${grupos.length})`} />
        <Tab label={`Unidades de recurso (${unidades.length})`} />
        <Tab label={`Entregables sugeridos (${entregables.length})`} />
      </Tabs>

      {tab === 0 && (
        <Paper variant="outlined" sx={{ p: 2.5 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="flex-start"
            gap={2}
            mb={2}
          >
            <Box>
              <Typography variant="h6" fontWeight={700}>
                Grupos de responsables
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Asignar un grupo a una actividad alcanza a todos sus miembros.
                Los definidos <strong>por regla</strong> se mantienen solos con
                el sync del roster; los <strong>por lista</strong> se actualizan
                a mano.
              </Typography>
            </Box>
            <Button
              variant="contained"
              type="button"
              startIcon={<AddIcon />}
              onClick={() => abrirGrupo()}
              sx={{ textTransform: "none", whiteSpace: "nowrap" }}
            >
              Nuevo grupo
            </Button>
          </Stack>

          {grupos.length === 0 && (
            <Alert severity="info">
              Todavía no hay grupos. Mientras tanto, en las actividades solo se
              pueden escribir responsables sueltos.
            </Alert>
          )}

          {grupos.length > 0 && (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Ámbito</TableCell>
                  <TableCell>Criterio</TableCell>
                  <TableCell sx={{ width: 110 }}>Estado</TableCell>
                  <TableCell align="right" sx={{ width: 110 }}>
                    Acciones
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {grupos.map((g) => (
                  <TableRow key={g._id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {g.nombre}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary">
                        {g.superintendencia || "Todas las superintendencias"}
                        {g.areas.length > 0 && ` · ${g.areas.join(", ")}`}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        variant="outlined"
                        color={g.criterio === "regla" ? "primary" : "default"}
                        label={
                          g.criterio === "regla"
                            ? [
                                g.roles.join("/"),
                                g.puestoContiene && `puesto ~ ${g.puestoContiene}`,
                              ]
                                .filter(Boolean)
                                .join(" · ") || "regla sin criterio"
                            : `${g.miembros.length} CI(s)`
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={g.activo ? "Activo" : "Inactivo"}
                        color={g.activo ? "success" : "default"}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                      <IconButton
                        size="small"
                        type="button"
                        onClick={() => abrirGrupo(g)}
                        aria-label={`Editar ${g.nombre}`}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <Tooltip
                        title={
                          g.activo
                            ? "Desactivar: deja de ofrecerse en las actividades"
                            : "Volver a activar"
                        }
                      >
                        <IconButton
                          size="small"
                          type="button"
                          color={g.activo ? "warning" : "success"}
                          onClick={() => alternarGrupo(g)}
                          disabled={guardando}
                          aria-label={
                            g.activo
                              ? `Desactivar ${g.nombre}`
                              : `Activar ${g.nombre}`
                          }
                        >
                          <PowerSettingsNewIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Paper>
      )}

      {tab === 1 && (
        <CatalogoSimplePanel
          titulo="Unidades de recurso"
          descripcion="En qué se mide el esfuerzo de una actividad. Hoy la única en uso es HH (horas hombre), la misma que rotula la columna «Recursos (HH $)» del formulario."
          items={unidades}
          conCodigo
          guardando={guardando}
          onGuardar={guardarUnidad}
          onAlternar={(item) =>
            alternarUnidad(unidades.find((u) => u._id === item._id)!)
          }
        />
      )}

      {tab === 2 && (
        <CatalogoSimplePanel
          titulo="Entregables sugeridos"
          descripcion="Solo alimentan el autocompletado: el campo de la actividad admite texto libre, esto evita que los nombres se dispersen."
          items={entregables}
          guardando={guardando}
          onGuardar={({ nombre }, id) => guardarEntregable(nombre, id)}
          onAlternar={(item) =>
            alternarEntregable(entregables.find((e) => e._id === item._id)!)
          }
        />
      )}

      <GrupoResponsableDialog
        // Remonta al cambiar de grupo: el formulario toma sus valores iniciales
        // sin sincronizarse con un efecto.
        key={grupoEnEdicion?._id ?? "nuevo"}
        abierto={dialogoAbierto}
        grupo={grupoEnEdicion}
        guardando={guardando}
        onResolver={resolverGrupo}
        onGuardar={async (datos, id) => {
          const ok = await guardarGrupo(datos, id);
          if (ok) setDialogoAbierto(false);
        }}
        onCerrar={() => setDialogoAbierto(false)}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={cerrarSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={cerrarSnackbar}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
