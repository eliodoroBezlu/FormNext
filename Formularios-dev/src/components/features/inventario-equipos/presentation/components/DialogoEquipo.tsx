"use client";

import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { FormProvider } from "react-hook-form";
import {
  useFormularioEquipo,
  type ModoFormulario,
} from "../../application/hooks/useFormularioEquipo";
import type { Severidad } from "../../application/hooks/useInventarioEquipos";
import type { CatalogosInventario, Equipo, EquipoPayload } from "../../domain/models/Equipo";
import { SeccionQueEquipo } from "./SeccionQueEquipo";
import { SeccionDondeEsta } from "./SeccionDondeEsta";
import { SeccionIdentificacion } from "./SeccionIdentificacion";
import { SeccionMasDatos } from "./SeccionMasDatos";

interface Props {
  modo: ModoFormulario | null;
  equipos: Equipo[];
  catalogos: CatalogosInventario;
  guardar: (payload: EquipoPayload, id?: string) => Promise<Equipo>;
  avisar: (mensaje: string, severidad: Severidad) => void;
  onCerrar: () => void;
}

const TITULO: Record<ModoFormulario["tipo"], string> = {
  crear: "Agregar equipo",
  editar: "Editar equipo",
  duplicar: "Agregar equipo igual a otro",
};

/**
 * Alta, edición y duplicado de un equipo. El orden es el de la carga real:
 * qué es → dónde está → cómo se identifica → lo opcional.
 *
 * El formulario existe solo mientras el diálogo está abierto: cada apertura
 * arranca con los valores de su modo.
 */
export function DialogoEquipo({ modo, ...resto }: Props) {
  return modo ? <FormularioEquipo modo={modo} {...resto} /> : null;
}

function FormularioEquipo({
  modo,
  equipos,
  catalogos,
  guardar,
  avisar,
  onCerrar,
}: Omit<Props, "modo"> & { modo: ModoFormulario }) {
  const f = useFormularioEquipo({ modo, equipos, catalogos, guardar, avisar, onCerrar });
  const theme = useTheme();
  const celular = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Dialog
      open
      onClose={() => void f.cerrar()}
      maxWidth="md"
      fullWidth
      fullScreen={celular}
      aria-labelledby="titulo-dialogo-equipo"
    >
      <FormProvider {...f.metodos}>
        <Box
          component="form"
          noValidate
          onSubmit={f.guardarYCerrar}
          sx={{ display: "flex", flexDirection: "column", minHeight: 0, flex: 1 }}
        >
          <DialogTitle id="titulo-dialogo-equipo">
            {TITULO[modo.tipo]}
            {modo.tipo === "duplicar" && (
              <Box component="span" sx={{ display: "block", typography: "body2", color: "text.secondary" }}>
                A partir de {modo.equipo.codigo}: se copian tipo, lugar, marca, modelo y datos técnicos.
              </Box>
            )}
          </DialogTitle>

          <DialogContent dividers>
            <Stack spacing={3} divider={<Divider flexItem />}>
              <SeccionQueEquipo
                tipos={f.opciones.tipos}
                configActiva={f.configActiva}
                cambiarTipo={f.cambiarTipo}
              />
              <SeccionDondeEsta catalogos={catalogos} />
              <SeccionIdentificacion
                editando={f.editando}
                sugerencia={f.sugerencia}
                usarCodigoSugerido={f.usarCodigoSugerido}
                validarCodigo={f.validarCodigo}
                mostrarPlaca={f.mostrarPlaca}
                marcaParecida={f.marcaParecida}
                opciones={f.opciones}
              />
              <SeccionMasDatos frecuencias={f.opciones.frecuencias} />
            </Stack>
          </DialogContent>

          {f.errorGuardar && (
            <Alert severity="error" sx={{ mx: 3, mt: 2 }}>
              {f.errorGuardar}
            </Alert>
          )}

          <DialogActions sx={{ px: 3, py: 2, gap: 1, flexWrap: "wrap" }}>
            <Button type="button" onClick={() => void f.cerrar()} disabled={f.guardando} sx={{ mr: "auto" }}>
              Cancelar
            </Button>
            {!f.editando && (
              <Button
                type="button"
                variant="outlined"
                onClick={() => void f.guardarYOtro()}
                loading={f.guardando}
              >
                Guardar y agregar otro
              </Button>
            )}
            <Button type="submit" variant="contained" loading={f.guardando}>
              Guardar
            </Button>
          </DialogActions>
        </Box>
      </FormProvider>
    </Dialog>
  );
}
