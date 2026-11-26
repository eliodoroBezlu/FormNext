"use client";

import { useState } from "react";
import { Box, Button, Grid } from "@mui/material";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import { SelectorUbicacion } from "@/components/features/ubicaciones/presentation/components/SelectorUbicacion";
import type { ValoresEquipo } from "../../domain/formularioEquipo";
import type { Ambito, CatalogosInventario } from "../../domain/models/Equipo";
import { CampoSelect } from "./CamposEquipo";
import { TituloSeccion } from "./TituloSeccion";

const ETIQUETA_AMBITO: Record<Ambito, string> = {
  area: "Un área",
  superintendencia: "Una superintendencia (lo ven todas sus áreas)",
  gerencia: "La gerencia (lo ven todos)",
};

/**
 * 2. Dónde está. Lo normal es un área; asignarlo a una superintendencia o a
 * la gerencia queda a un clic, para no sumar un campo que casi nunca se usa.
 */
export function SeccionDondeEsta({ catalogos }: { catalogos: CatalogosInventario }) {
  const { control, setValue, formState } = useFormContext<ValoresEquipo>();
  const ambito = useWatch({ control, name: "ambito" });
  const [verAmbito, setVerAmbito] = useState(false);
  const mostrarAmbito = verAmbito || ambito !== "area";
  const errorUbicacion = formState.errors.ubicacion_id;

  const cambiarAmbito = (nuevo: Ambito) => {
    // Pertenece a uno solo: al cambiar de nivel se limpian las otras referencias.
    setValue("ambito", nuevo, { shouldDirty: true });
    setValue("area_id", "", { shouldDirty: true });
    setValue("superintendencia_id", "", { shouldDirty: true });
    setValue("gerencia_id", "", { shouldDirty: true });
  };

  const aOpciones = (lista: { _id: string; nombre: string }[]) =>
    lista.map((x) => ({ valor: x._id, etiqueta: x.nombre }));

  return (
    <Box>
      <TituloSeccion numero={2} titulo="¿Dónde está?" />
      <Grid container spacing={2}>
        {mostrarAmbito && (
          <Grid size={{ xs: 12 }}>
            <Controller
              name="ambito"
              control={control}
              render={({ field }) => (
                <CampoAmbito valor={field.value} onChange={cambiarAmbito} />
              )}
            />
          </Grid>
        )}

        <Grid size={{ xs: 12, sm: 6 }}>
          {ambito === "area" && (
            <CampoSelect
              nombre="area_id"
              label="Área"
              reglas={{ required: "Elija el área." }}
              opciones={aOpciones(catalogos.areas)}
              ayuda={
                mostrarAmbito ? undefined : (
                  <Button
                    type="button"
                    size="small"
                    onClick={() => setVerAmbito(true)}
                    sx={{ p: 0, minWidth: 0, textTransform: "none", fontSize: "inherit" }}
                  >
                    ¿No es de un área? Asignarlo a una superintendencia o a la gerencia
                  </Button>
                )
              }
            />
          )}
          {ambito === "superintendencia" && (
            <CampoSelect
              nombre="superintendencia_id"
              label="Superintendencia"
              reglas={{ required: "Elija la superintendencia." }}
              opciones={aOpciones(catalogos.superintendencias)}
            />
          )}
          {ambito === "gerencia" && (
            <CampoSelect
              nombre="gerencia_id"
              label="Gerencia"
              reglas={{ required: "Elija la gerencia." }}
              opciones={aOpciones(catalogos.gerencias)}
            />
          )}
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller
            name="ubicacion_id"
            control={control}
            rules={{ required: "Elija dónde se guarda el equipo." }}
            render={({ field }) => (
              <Box data-question-error={errorUbicacion ? "true" : undefined}>
                <SelectorUbicacion
                  opciones={catalogos.ubicaciones}
                  valor={field.value || null}
                  onChange={(id) => field.onChange(id ?? "")}
                  onBlur={field.onBlur}
                  label="Ubicación"
                  required
                  error={!!errorUbicacion}
                  helperText={errorUbicacion?.message ?? "Taller, bodega o estante."}
                />
              </Box>
            )}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <CampoSelect
            nombre="clasificacion_id"
            label="Clasificación"
            reglas={{ required: "Elija la clasificación." }}
            opciones={aOpciones(catalogos.clasificaciones)}
            ayuda="Se propone la que tienen los equipos del mismo tipo."
          />
        </Grid>
      </Grid>
    </Box>
  );
}

function CampoAmbito({ valor, onChange }: { valor: Ambito; onChange: (a: Ambito) => void }) {
  return (
    <Box>
      <Box component="label" sx={{ display: "block", typography: "body2", color: "text.secondary", mb: 0.5 }}>
        Pertenece a
      </Box>
      <Box display="flex" gap={1} flexWrap="wrap">
        {(Object.keys(ETIQUETA_AMBITO) as Ambito[]).map((a) => (
          <Button
            key={a}
            type="button"
            size="small"
            variant={valor === a ? "contained" : "outlined"}
            aria-pressed={valor === a}
            onClick={() => onChange(a)}
          >
            {ETIQUETA_AMBITO[a]}
          </Button>
        ))}
      </Box>
    </Box>
  );
}
