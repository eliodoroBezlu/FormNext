"use client";

import {
  Alert, Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle,
  IconButton, InputAdornment, TextField, Typography, useMediaQuery, useTheme,
} from "@mui/material";
import { Close as CloseIcon, Search as SearchIcon } from "@mui/icons-material";
import {
  aplicables, estaAlDia, filtrarItems, hayCambiosDeRol,
} from "../../../domain/models/sincronizacionTrabajadores";
import type { EstadoSincronizacion } from "../../../application/hooks/useSincronizarTrabajadores";
import { GrupoDelPlan } from "./GrupoDelPlan";
import { SupervisoresDelPlan } from "./SupervisoresDelPlan";
import { ResultadoSincronizacion } from "./ResultadoSincronizacion";

const GRUPOS = [
  { clave: "nuevos", titulo: "Nuevos", descripcion: "Están en el Portal IAM y todavía no en forms.", color: "success" },
  { clave: "conCambios", titulo: "Con cambios", descripcion: "Sus datos en el Portal IAM son distintos a los de forms.", color: "info" },
  { clave: "bajas", titulo: "Dados de baja en el IAM", descripcion: "Siguen activos en forms. Se marcan inactivos; no se borran.", color: "warning" },
] as const;

/** Vista previa de la sincronización, elección y resultado. */
export function DialogoSincronizacion({ estado }: { estado: EstadoSincronizacion }) {
  const theme = useTheme();
  const pantallaChica = useMediaQuery(theme.breakpoints.down("sm"));
  const { vista, seleccion, resultado, resumen, busqueda } = estado;

  const elegidos = vista ? aplicables(vista).filter((i) => seleccion.has(i.idIam)).length : 0;
  const conRol = vista ? estado.supervisores && hayCambiosDeRol(vista) : false;
  const puedeAplicar = !estado.aplicando && !resultado && (elegidos > 0 || conRol);
  const conBusqueda = vista ? aplicables(vista).length + vista.problemas.length > 5 : false;

  return (
    <Dialog
      open={estado.abierto}
      onClose={estado.cerrar}
      fullScreen={pantallaChica}
      fullWidth
      maxWidth="md"
      aria-labelledby="sincronizacion-titulo"
    >
      <DialogTitle id="sincronizacion-titulo" sx={{ display: "flex", alignItems: "center", gap: 1, pr: 6 }}>
        Sincronizar con el Portal IAM
        <IconButton aria-label="Cerrar" onClick={estado.cerrar} disabled={estado.aplicando} sx={{ position: "absolute", right: 8, top: 8 }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {estado.error && (
          <Alert
            severity="error"
            sx={{ mb: 2 }}
            action={!vista && <Button type="button" color="inherit" size="small" onClick={() => void estado.recargar()}>Reintentar</Button>}
          >
            {estado.error}
          </Alert>
        )}

        {estado.cargando && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, py: 4, justifyContent: "center" }} role="status">
            <CircularProgress size={24} />
            <Typography>Consultando el Portal IAM…</Typography>
          </Box>
        )}

        {!estado.cargando && resultado && resumen && (
          <ResultadoSincronizacion resultado={resultado} resumen={resumen} />
        )}

        {!estado.cargando && vista && !resultado && (
          <>
            {estaAlDia(vista) ? (
              <Alert severity="success" sx={{ mb: 2 }}>
                forms ya está al día con el Portal IAM ({vista.sinCambios} trabajadores sin cambios).
                {vista.problemas.length > 0 && " Hay fichas con problemas para corregir en el portal."}
              </Alert>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Revisá los cambios: lo marcado se aplica al apretar «Aplicar». Desmarcá lo que parezca un error y
                corregilo en el Portal IAM; volverá a aparecer en la próxima sincronización. {vista.sinCambios} trabajadores no tienen cambios.
              </Typography>
            )}

            {conBusqueda && (
              <TextField
                fullWidth
                size="small"
                label="Buscar por nómina, CI o puesto"
                value={busqueda}
                onChange={(e) => estado.setBusqueda(e.target.value)}
                sx={{ mb: 2 }}
                slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> } }}
              />
            )}

            {GRUPOS.map((g) => (
              <GrupoDelPlan
                key={g.clave}
                titulo={g.titulo}
                descripcion={g.descripcion}
                color={g.color}
                items={filtrarItems(vista[g.clave], busqueda)}
                total={vista[g.clave].length}
                seleccionable
                seleccion={seleccion}
                alternar={estado.alternar}
                marcarVarios={estado.marcarVarios}
              />
            ))}

            <SupervisoresDelPlan
              supervisores={vista.supervisores}
              aplicar={estado.supervisores}
              setAplicar={estado.setSupervisores}
            />

            <GrupoDelPlan
              titulo="Con problemas"
              descripcion="No se pueden copiar a forms. Corregilos en el Portal IAM y volvé a sincronizar."
              color="error"
              items={filtrarItems(vista.problemas, busqueda)}
              total={vista.problemas.length}
              seleccionable={false}
              seleccion={seleccion}
              alternar={estado.alternar}
              marcarVarios={estado.marcarVarios}
            />
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 1.5 }}>
        {resultado ? (
          <Button type="button" variant="contained" onClick={estado.cerrar}>Cerrar</Button>
        ) : (
          <>
            <Button type="button" onClick={estado.cerrar} disabled={estado.aplicando}>Cancelar</Button>
            <Button
              type="button"
              variant="contained"
              onClick={() => void estado.aplicar()}
              disabled={!puedeAplicar}
              startIcon={estado.aplicando ? <CircularProgress size={18} color="inherit" /> : undefined}
            >
              {estado.aplicando ? "Aplicando…" : `Aplicar${elegidos ? ` (${elegidos})` : ""}`}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}
