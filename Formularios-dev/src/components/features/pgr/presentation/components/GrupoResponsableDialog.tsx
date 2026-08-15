"use client";

import { useState } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import GroupsIcon from "@mui/icons-material/Groups";
import AutocompleteCustom from "@/components/ui/autocomplete/AutocompleteCustom";
import type {
  GrupoResponsable,
  GrupoResponsableDto,
  MiembroGrupo,
} from "../../infrastructure/adapters/pgrCatalogoAdapter";

export interface GrupoResponsableDialogProps {
  abierto: boolean;
  /** El grupo a editar; ausente para crear uno nuevo. */
  grupo?: GrupoResponsable;
  guardando: boolean;
  onGuardar: (datos: GrupoResponsableDto, id?: string) => void;
  onResolver: (grupoId: string) => Promise<MiembroGrupo[]>;
  onCerrar: () => void;
}

const VACIO: GrupoResponsableDto = {
  nombre: "",
  superintendencia: "",
  areas: [],
  criterio: "regla",
  roles: [],
  puestoContiene: "",
  miembros: [],
};

/**
 * Alta y edición de un grupo de responsables.
 *
 * Un grupo **por regla** se define por rol o puesto dentro de un ámbito y se
 * mantiene solo: cuando el sync trae un supervisor nuevo, ya pertenece. Uno
 * **por lista** enumera CIs y hay que actualizarlo a mano; existe para los
 * grupos que no responden a ninguna regla.
 *
 * El botón de resolver es la comprobación que importa: una regla mal armada
 * devuelve cero miembros, y conviene verlo acá y no cuando el grupo ya esté
 * asignado a cincuenta actividades.
 */
export function GrupoResponsableDialog({
  abierto,
  grupo,
  guardando,
  onGuardar,
  onResolver,
  onCerrar,
}: GrupoResponsableDialogProps) {
  // El estado inicial se calcula una sola vez: el padre monta este diálogo con
  // `key`, así que abrir otro grupo lo remonta con sus datos. Sincronizarlo con
  // un efecto sería un render de más y el `setState` dispararía la regla de
  // `set-state-in-effect`.
  const [datos, setDatos] = useState<GrupoResponsableDto>(() =>
    grupo
      ? {
          nombre: grupo.nombre,
          superintendencia: grupo.superintendencia ?? "",
          areas: grupo.areas ?? [],
          criterio: grupo.criterio,
          roles: grupo.roles ?? [],
          puestoContiene: grupo.puestoContiene ?? "",
          miembros: grupo.miembros ?? [],
        }
      : VACIO,
  );
  const [miembros, setMiembros] = useState<MiembroGrupo[] | null>(null);
  const [resolviendo, setResolviendo] = useState(false);

  const cambiar = <K extends keyof GrupoResponsableDto>(
    campo: K,
    valor: GrupoResponsableDto[K],
  ) => setDatos((d) => ({ ...d, [campo]: valor }));

  const porRegla = datos.criterio === "regla";

  // Una regla sin ningún criterio alcanzaría al roster entero; el backend la
  // trata como vacía, así que se avisa antes de guardarla.
  const reglaSinCriterio =
    porRegla &&
    !datos.superintendencia &&
    (datos.areas ?? []).length === 0 &&
    (datos.roles ?? []).length === 0 &&
    !datos.puestoContiene?.trim();

  const resolver = async () => {
    if (!grupo) return;
    setResolviendo(true);
    try {
      setMiembros(await onResolver(grupo._id));
    } finally {
      setResolviendo(false);
    }
  };

  return (
    <Dialog open={abierto} onClose={onCerrar} maxWidth="md" fullWidth>
      <DialogTitle>
        {grupo ? `Editar «${grupo.nombre}»` : "Nuevo grupo de responsables"}
      </DialogTitle>

      <DialogContent dividers>
        <Stack gap={2.5}>
          <TextField
            label="Nombre del grupo"
            placeholder="Supervisores de Mantenimiento Chancado"
            size="small"
            fullWidth
            value={datos.nombre}
            onChange={(e) => cambiar("nombre", e.target.value)}
          />

          <Divider textAlign="left">
            <Typography variant="caption" color="text.secondary">
              Ámbito — dejalo vacío para no restringir
            </Typography>
          </Divider>

          <AutocompleteCustom
            dataSource="superintendencia"
            label="Superintendencia"
            value={datos.superintendencia || null}
            onChange={(v) => cambiar("superintendencia", v ?? "")}
          />

          <Autocomplete
            multiple
            freeSolo
            size="small"
            options={[]}
            value={datos.areas ?? []}
            onChange={(_, v) => cambiar("areas", v)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Áreas"
                helperText="Escribí y presioná Enter. Vacío = todas las de la superintendencia."
              />
            )}
          />

          <Divider textAlign="left">
            <Typography variant="caption" color="text.secondary">
              Quiénes lo integran
            </Typography>
          </Divider>

          <TextField
            select
            label="Criterio"
            size="small"
            value={datos.criterio}
            onChange={(e) =>
              cambiar("criterio", e.target.value as "regla" | "lista")
            }
            helperText={
              porRegla
                ? "Se resuelve contra el roster y se mantiene solo con el sync."
                : "Lista fija de CIs; hay que actualizarla a mano."
            }
          >
            <MenuItem value="regla">Por regla (rol o puesto)</MenuItem>
            <MenuItem value="lista">Por lista de CIs</MenuItem>
          </TextField>

          {porRegla ? (
            <>
              <Autocomplete
                multiple
                freeSolo
                size="small"
                options={["ADMIN", "SUPERVISOR", "SUPERINTENDENTE", "INSPECTOR"]}
                value={datos.roles ?? []}
                onChange={(_, v) => cambiar("roles", v)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Roles del IAM"
                    helperText="El trabajador entra si tiene alguno de estos roles."
                  />
                )}
              />
              <TextField
                label="El puesto contiene"
                placeholder="Supervisor"
                size="small"
                fullWidth
                value={datos.puestoContiene ?? ""}
                onChange={(e) => cambiar("puestoContiene", e.target.value)}
                helperText="Opcional, se suma a los roles. Sin distinguir mayúsculas."
              />
            </>
          ) : (
            <Autocomplete
              multiple
              freeSolo
              size="small"
              options={[]}
              value={datos.miembros ?? []}
              onChange={(_, v) => cambiar("miembros", v)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="CIs de los miembros"
                  helperText="Escribí cada CI y presioná Enter."
                />
              )}
            />
          )}

          {reglaSinCriterio && (
            <Alert severity="warning">
              Esta regla no tiene ningún criterio: no va a alcanzar a nadie.
              Indicá al menos un ámbito, un rol o un puesto.
            </Alert>
          )}

          {grupo && (
            <Box>
              <Button
                type="button"
                variant="outlined"
                startIcon={<GroupsIcon />}
                onClick={() => void resolver()}
                disabled={resolviendo}
              >
                {resolviendo ? "Resolviendo…" : "Ver a quiénes alcanza"}
              </Button>

              {miembros !== null && (
                <Box mt={1.5}>
                  {miembros.length === 0 ? (
                    <Alert severity="warning">
                      No alcanza a ningún trabajador. Revisá el ámbito y el
                      criterio: así configurado, asignarlo no responsabiliza a
                      nadie.
                    </Alert>
                  ) : (
                    <>
                      <Typography variant="body2" gutterBottom>
                        {miembros.length} trabajador(es):
                      </Typography>
                      <Box
                        sx={{
                          maxHeight: 200,
                          overflow: "auto",
                          border: 1,
                          borderColor: "divider",
                          borderRadius: 1,
                          p: 1,
                        }}
                      >
                        {miembros.map((m) => (
                          <Typography key={m.ci} variant="caption" display="block">
                            {m.nombre} — {m.puesto} · {m.area}
                          </Typography>
                        ))}
                      </Box>
                    </>
                  )}
                </Box>
              )}
            </Box>
          )}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button type="button" onClick={onCerrar} disabled={guardando}>
          Cancelar
        </Button>
        <Button
          type="button"
          variant="contained"
          disabled={guardando || !datos.nombre.trim()}
          onClick={() => onGuardar(datos, grupo?._id)}
        >
          {guardando ? "Guardando…" : "Guardar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
