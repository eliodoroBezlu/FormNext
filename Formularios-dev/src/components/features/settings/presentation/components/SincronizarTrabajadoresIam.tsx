"use client";

import { Alert, Box, Button, Stack, Typography } from "@mui/material";
import { Sync as SyncIcon } from "@mui/icons-material";
import { Can } from "@/components/layout/wrappers/Can";
import { Role } from "@/lib/routePermissions";
import { useSincronizarTrabajadores } from "../../application/hooks/useSincronizarTrabajadores";
import { describirUltima } from "../../domain/models/sincronizacionTrabajadores";
import { DialogoSincronizacion } from "./sincronizacion/DialogoSincronizacion";

interface Props {
  /** Se llama cuando se aplicó una sincronización, para recargar la lista. */
  alTerminar: () => void;
}

/**
 * Botón «Sincronizar con el IAM», la última sincronización y el diálogo con
 * la vista previa. Solo para admin (el backend también lo exige); el panel va
 * aparte para que los demás roles ni siquiera consulten la última.
 */
export function SincronizarTrabajadoresIam({ alTerminar }: Props) {
  return (
    <Can role={Role.ADMIN}>
      <PanelDeSincronizacion alTerminar={alTerminar} />
    </Can>
  );
}

function PanelDeSincronizacion({ alTerminar }: Props) {
  const estado = useSincronizarTrabajadores(alTerminar);

  return (
    <Box sx={{ mb: 3 }}>
      <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ sm: "center" }} gap={{ xs: 1, sm: 2 }}>
        <Button type="button" variant="contained" startIcon={<SyncIcon />} onClick={estado.abrir} sx={{ alignSelf: "flex-start" }}>
          Sincronizar con el IAM
        </Button>
        <Typography variant="body2" color="text.secondary">
          {describirUltima(estado.ultima)}
        </Typography>
      </Stack>

      {!estado.abierto && estado.resumen && (
        <Alert severity={estado.resumen.severidad} sx={{ mt: 2 }} role="status">
          {estado.resumen.mensaje}
        </Alert>
      )}

      <DialogoSincronizacion estado={estado} />
    </Box>
  );
}
