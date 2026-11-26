"use client";

import { Box, Button, Grid, IconButton, InputAdornment, Tooltip } from "@mui/material";
import { AutoFixHigh } from "@mui/icons-material";
import { useFormContext, useWatch } from "react-hook-form";
import type { OpcionTexto, ValoresEquipo } from "../../domain/formularioEquipo";
import type { SugerenciaCodigo } from "../../domain/codigoEquipo";
import { CampoSugerido, CampoTexto } from "./CamposEquipo";
import { TituloSeccion } from "./TituloSeccion";

interface Props {
  editando: boolean;
  sugerencia: SugerenciaCodigo | null;
  usarCodigoSugerido: () => void;
  validarCodigo: (valor: string) => string | true;
  mostrarPlaca: boolean;
  marcaParecida: string | null;
  opciones: { marcas: OpcionTexto[]; modelos: OpcionTexto[]; responsables: OpcionTexto[] };
}

/** Por qué se propone ese código: el usuario ve de dónde sale y puede cambiarlo. */
function ayudaCodigo(editando: boolean, sugerencia: SugerenciaCodigo | null, codigo: string): string {
  if (editando) return "Es el código grabado en el equipo.";
  if (!sugerencia) return "Elija tipo y área para proponer el siguiente, o escríbalo.";
  if (codigo.trim() !== sugerencia.codigo) return `El siguiente libre de la serie es ${sugerencia.codigo}.`;
  return sugerencia.ultimo
    ? `Siguiente de la serie: el último es ${sugerencia.ultimo}.`
    : "Primero de este tipo en el área: arranca la serie.";
}

/** 3. Cómo se identifica: código, marca, modelo, serie y a quién está asignado. */
export function SeccionIdentificacion({
  editando,
  sugerencia,
  usarCodigoSugerido,
  validarCodigo,
  mostrarPlaca,
  marcaParecida,
  opciones,
}: Props) {
  const { control, setValue } = useFormContext<ValoresEquipo>();
  const codigo = useWatch({ control, name: "codigo" }) ?? "";
  const puedeRestaurar = !editando && !!sugerencia && codigo.trim() !== sugerencia.codigo;

  return (
    <Box>
      <TituloSeccion numero={3} titulo="Identificación" />
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <CampoTexto
            nombre="codigo"
            label="Código (Cód. nuevo asignado)"
            reglas={{ validate: (v) => validarCodigo(String(v ?? "")) }}
            ayuda={ayudaCodigo(editando, sugerencia, codigo)}
            slotProps={{
              htmlInput: { style: { fontFamily: "monospace" }, autoCapitalize: "characters" },
              input: puedeRestaurar
                ? {
                    endAdornment: (
                      <InputAdornment position="end">
                        <Tooltip title={`Usar ${sugerencia?.codigo}`}>
                          <IconButton
                            type="button"
                            edge="end"
                            size="small"
                            aria-label={`Usar el código propuesto ${sugerencia?.codigo}`}
                            onClick={usarCodigoSugerido}
                          >
                            <AutoFixHigh fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </InputAdornment>
                    ),
                  }
                : undefined,
            }}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <CampoTexto
            nombre="codigo_parte"
            label="Código de parte"
            ayuda={editando ? undefined : "Sale del código."}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <CampoTexto nombre="num_serie" label="N.º de serie" />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <CampoSugerido
            nombre="marca"
            label="Marca"
            opciones={opciones.marcas}
            ayuda={
              marcaParecida ? (
                <Button
                  type="button"
                  size="small"
                  color="warning"
                  onClick={() => setValue("marca", marcaParecida, { shouldDirty: true })}
                  sx={{ p: 0, minWidth: 0, textTransform: "none", fontSize: "inherit" }}
                >
                  ¿Quiso decir {marcaParecida}? Usar esa
                </Button>
              ) : undefined
            }
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <CampoSugerido nombre="modelo" label="Modelo" opciones={opciones.modelos} />
        </Grid>

        <Grid size={{ xs: 12, sm: mostrarPlaca ? 6 : 12 }}>
          <CampoSugerido
            nombre="responsable"
            label="Responsable"
            opciones={opciones.responsables}
            ayuda="Persona que tiene el equipo a cargo, si está asignado."
          />
        </Grid>
        {mostrarPlaca && (
          <Grid size={{ xs: 12, sm: 6 }}>
            <CampoTexto
              nombre="placa"
              label="Placa"
              ayuda="Distinta del número interno de flota."
            />
          </Grid>
        )}
      </Grid>
    </Box>
  );
}
