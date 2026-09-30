"use client";

import { useState } from "react";
import {
  Box,
  Chip,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
} from "@mui/material";
import {
  Add as AddIcon,
  CallMerge as FusionarIcon,
  ChevronRight as ContraidoIcon,
  Delete as BajaIcon,
  Edit as EditIcon,
  ExpandMore as ExpandidoIcon,
  MoreVert as MasIcon,
  RestoreFromTrash as RestaurarIcon,
} from "@mui/icons-material";
import {
  PROFUNDIDAD_MAXIMA,
  type FilaArbol,
  type NodoUbicacion,
} from "../../domain/models/arbolUbicaciones";

interface TablaArbolUbicacionesProps<T extends NodoUbicacion> {
  filas: FilaArbol<T>[];
  expandidos: ReadonlySet<string>;
  /** Con búsqueda activa todo se muestra expandido y el chevron no aplica. */
  buscando: boolean;
  onAlternar: (id: string) => void;
  onAgregarDebajo: (nodo: T) => void;
  onEditar: (nodo: T) => void;
  onFusionar: (nodo: T) => void;
  onDarDeBaja: (nodo: T) => void;
  onRestaurar: (nodo: T) => void;
}

const SANGRIA_POR_NIVEL = 3; // unidades de spacing de MUI

export function TablaArbolUbicaciones<T extends NodoUbicacion>({
  filas,
  expandidos,
  buscando,
  onAlternar,
  onAgregarDebajo,
  onEditar,
  onFusionar,
  onDarDeBaja,
  onRestaurar,
}: TablaArbolUbicacionesProps<T>) {
  const [menu, setMenu] = useState<{ ancla: HTMLElement; nodo: T } | null>(null);
  const cerrarMenu = () => setMenu(null);
  const desdeMenu = (accion: (nodo: T) => void) => () => {
    if (menu) accion(menu.nodo);
    cerrarMenu();
  };

  return (
    <>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Ubicación</TableCell>
            <TableCell align="center" sx={{ width: 90 }}>
              Nivel
            </TableCell>
            <TableCell align="center" sx={{ width: 110 }}>
              Estado
            </TableCell>
            <TableCell align="right" sx={{ width: 150 }}>
              Acciones
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filas.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} align="center">
                No se encontraron ubicaciones
              </TableCell>
            </TableRow>
          ) : (
            filas.map(({ nodo, tieneHijos }) => {
              const abierto = buscando || expandidos.has(nodo._id);
              const admiteHijos = nodo.activo && nodo.nivel < PROFUNDIDAD_MAXIMA - 1;
              return (
                <TableRow key={nodo._id} hover sx={{ opacity: nodo.activo ? 1 : 0.55 }}>
                  <TableCell>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        pl: nodo.nivel * SANGRIA_POR_NIVEL,
                      }}
                    >
                      {tieneHijos ? (
                        <IconButton
                          size="small"
                          onClick={() => onAlternar(nodo._id)}
                          disabled={buscando}
                          aria-label={abierto ? "Contraer" : "Expandir"}
                          aria-expanded={abierto}
                        >
                          {abierto ? <ExpandidoIcon fontSize="small" /> : <ContraidoIcon fontSize="small" />}
                        </IconButton>
                      ) : (
                        <Box sx={{ width: 34 }} />
                      )}
                      <Box
                        component="span"
                        sx={{ fontWeight: nodo.nivel === 0 ? 600 : 400 }}
                        title={nodo.ruta}
                      >
                        {nodo.nombre}
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell align="center">{nodo.nivel + 1}</TableCell>
                  <TableCell align="center">
                    <Chip
                      label={nodo.activo ? "Activa" : "De baja"}
                      color={nodo.activo ? "success" : "default"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    {nodo.activo ? (
                      <>
                        <Tooltip
                          title={
                            admiteHijos
                              ? "Agregar ubicación debajo"
                              : `Nivel ${PROFUNDIDAD_MAXIMA}: no admite más niveles`
                          }
                        >
                          <span>
                            <IconButton
                              size="small"
                              color="primary"
                              disabled={!admiteHijos}
                              onClick={() => onAgregarDebajo(nodo)}
                              aria-label="Agregar ubicación debajo"
                            >
                              <AddIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                        <Tooltip title="Editar o mover">
                          <IconButton size="small" color="primary" onClick={() => onEditar(nodo)} aria-label="Editar o mover">
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <IconButton
                          size="small"
                          onClick={(e) => setMenu({ ancla: e.currentTarget, nodo })}
                          aria-label="Más acciones"
                        >
                          <MasIcon fontSize="small" />
                        </IconButton>
                      </>
                    ) : (
                      <Tooltip title="Restaurar">
                        <IconButton size="small" color="primary" onClick={() => onRestaurar(nodo)} aria-label="Restaurar">
                          <RestaurarIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      <Menu anchorEl={menu?.ancla} open={!!menu} onClose={cerrarMenu}>
        <MenuItem onClick={desdeMenu(onFusionar)}>
          <ListItemIcon>
            <FusionarIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Fusionar en…" secondary="Pasar sus equipos a otra ubicación" />
        </MenuItem>
        <MenuItem onClick={desdeMenu(onDarDeBaja)}>
          <ListItemIcon>
            <BajaIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText primary="Dar de baja" />
        </MenuItem>
      </Menu>
    </>
  );
}
