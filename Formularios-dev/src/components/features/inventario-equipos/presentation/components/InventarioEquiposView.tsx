"use client";

import { useState, type ChangeEvent } from "react";
import { Alert, Box, Button, CircularProgress, Container, Snackbar, Typography } from "@mui/material";
import { Add as AddIcon, Download as DownloadIcon, UploadFile as UploadFileIcon } from "@mui/icons-material";
import { useConfirmar } from "@/components/ui/feedback/Confirmacion";
import {
  LIMITE_FOTOS_EXPORTACION,
  useInventarioEquipos,
} from "../../application/hooks/useInventarioEquipos";
import type { ModoFormulario } from "../../application/hooks/useFormularioEquipo";
import type { Equipo } from "../../domain/models/Equipo";
import { FiltrosEquipos } from "./FiltrosEquipos";
import { TablaEquipos } from "./TablaEquipos";
import { DialogoEquipo } from "./DialogoEquipo";
import { DialogoEspecificaciones } from "./DialogoEspecificaciones";

/** Inventario de herramientas y equipos: lista, filtros, alta y Excel. */
export function InventarioEquiposView() {
  const inv = useInventarioEquipos();
  const confirmar = useConfirmar();
  const [modo, setModo] = useState<ModoFormulario | null>(null);
  const [verEspecificaciones, setVerEspecificaciones] = useState<Equipo | null>(null);

  const importarLocal = async () => {
    if (await confirmar("¿Importar el inventario desde el archivo Inventario.xlsx que está en el servidor?")) {
      await inv.importar();
    }
  };

  const importarArchivo = async (e: ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0];
    e.target.value = "";
    if (archivo) await inv.importar(archivo);
  };

  const exportar = async () => {
    if (inv.filtrados.length === 0) {
      inv.avisar("No hay equipos para exportar con estos filtros", "warning");
      return;
    }
    if (
      inv.filtrados.length > LIMITE_FOTOS_EXPORTACION &&
      !(await confirmar(
        `Va a exportar ${inv.filtrados.length} equipos. Por encima de ${LIMITE_FOTOS_EXPORTACION}, el Excel sale sin fotos para no volverlo lento y pesado. ¿Continuar?`,
      ))
    ) {
      return;
    }
    await inv.exportar();
  };

  const eliminar = async (e: Equipo) => {
    if (await confirmar(`¿Eliminar el equipo ${e.codigo} (${e.descripcion})?`)) await inv.darDeBaja(e);
  };

  const ocupado = inv.importando || inv.exportando;

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
        <Typography variant="h5" component="h1" fontWeight="bold">
          Inventario de Herramientas y Equipos
        </Typography>
        <Box display="flex" gap={1.5} flexWrap="wrap">
          <Button variant="outlined" color="secondary" startIcon={<UploadFileIcon />} onClick={importarLocal} disabled={ocupado}>
            Migrar Inventario.xlsx Local
          </Button>
          <Button component="label" variant="outlined" startIcon={<UploadFileIcon />} disabled={ocupado}>
            Subir Inventario Excel
            <input type="file" accept=".xlsx,.xls" hidden onChange={importarArchivo} />
          </Button>
          <Button variant="outlined" startIcon={<DownloadIcon />} onClick={exportar} disabled={ocupado}>
            Exportar Excel
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setModo({ tipo: "crear" })} disabled={inv.importando}>
            Agregar equipo
          </Button>
        </Box>
      </Box>

      {inv.exportando && (
        <Alert severity="info" sx={{ mb: 3 }} icon={<CircularProgress size={18} />}>
          Generando el Excel del inventario…
        </Alert>
      )}
      {inv.importando && (
        <Alert severity="info" sx={{ mb: 3 }} icon={<CircularProgress size={18} />}>
          Importando el inventario desde el Excel… Puede tardar unos minutos.
        </Alert>
      )}
      {inv.error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {inv.error}
        </Alert>
      )}

      <FiltrosEquipos filtros={inv.filtros} cambiar={inv.cambiarFiltro} catalogos={inv.catalogos} tipos={inv.tipos} />

      <TablaEquipos
        cargando={inv.cargando}
        visibles={inv.visibles}
        total={inv.filtrados.length}
        pagina={inv.pagina}
        porPagina={inv.porPagina}
        onPagina={inv.setPagina}
        onPorPagina={inv.cambiarPorPagina}
        onVerEspecificaciones={setVerEspecificaciones}
        onEditar={(equipo) => setModo({ tipo: "editar", equipo })}
        onDuplicar={(equipo) => setModo({ tipo: "duplicar", equipo })}
        onEliminar={eliminar}
      />

      <DialogoEquipo
        modo={modo}
        equipos={inv.equipos}
        catalogos={inv.catalogos}
        guardar={inv.guardar}
        avisar={inv.avisar}
        onCerrar={() => setModo(null)}
      />

      <DialogoEspecificaciones equipo={verEspecificaciones} onCerrar={() => setVerEspecificaciones(null)} />

      {inv.aviso && (
        <Snackbar
          // Un aviso nuevo reinicia el tiempo aunque el anterior siga abierto.
          key={inv.aviso.mensaje}
          open
          autoHideDuration={5000}
          onClose={(_, motivo) => motivo !== "clickaway" && inv.cerrarAviso()}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert onClose={inv.cerrarAviso} severity={inv.aviso.severidad} variant="filled" sx={{ width: "100%" }}>
            {inv.aviso.mensaje}
          </Alert>
        </Snackbar>
      )}
    </Container>
  );
}
