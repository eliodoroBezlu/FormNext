"use client";

import React from "react";
import { Typography } from "@mui/material";
import { mismoNombre } from "@/lib/organizacion/cadenaOrganizativa";

interface SuperintendenciaCeldaProps {
  /** La del maestro para el área de la fila (`null` si el maestro no conoce el área). */
  delMaestro: string | null;
  /** La que quedó escrita en el formulario el día que se llenó. */
  guardada: string;
}

/**
 * La superintendencia de una fila: la del maestro, que es por la que se filtra. Si el formulario
 * guardó otro nombre (uno viejo, de antes de sincronizar con el IAM), se muestra debajo: el
 * registro no se reescribe, pero tampoco se esconde.
 */
export function SuperintendenciaCelda({ delMaestro, guardada }: SuperintendenciaCeldaProps) {
  const principal = delMaestro ?? guardada;
  if (!principal) return <>—</>;
  const distinta = !!delMaestro && !!guardada && !mismoNombre(delMaestro, guardada);
  return (
    <>
      {principal}
      {distinta && (
        <Typography variant="caption" color="text.secondary" display="block">
          En el formulario: {guardada}
        </Typography>
      )}
    </>
  );
}
