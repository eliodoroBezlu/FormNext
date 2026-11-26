"use client";

import { Fragment } from "react";
import { Box, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import { useFormContext, useWatch, type Path } from "react-hook-form";
import { bajoAlerta, letraDePunto, minimoDe } from "../../domain/espesores";
import { numero, soloEspesor, type ValoresReporte } from "../../domain/formularioReporte";
import type { PiezaDeMedicion } from "../../domain/models/Monitoreo";

interface Props {
  pieza: PiezaDeMedicion;
  indice: number;
  /** Columnas de puntos de la tabla: las de la zona más ancha de la grilla. */
  maxPuntos: number;
  /** El mínimo de la medición anterior de cada zona. */
  anteriores?: (number | undefined)[];
  soloLectura: boolean;
}

const mm = (n?: number) => (n === undefined ? "—" : n.toFixed(2).replace(".", ","));

/**
 * Los espesores de una pieza: una fila por anillo, una columna por punto, y
 * el mínimo de cada zona calculado mientras se escribe. Lo bajo la alerta va
 * en rojo, como en el PDF.
 *
 * Las celdas son `<input>` registrados sin `Controller`: una grilla como la de
 * 250SA225 tiene más de 400 y así escribir en una no redibuja las demás.
 */
export function TablaPiezaEspesores({ pieza, indice, maxPuntos, anteriores, soloLectura }: Props) {
  const { control, register } = useFormContext<ValoresReporte>();
  const valores = useWatch({ control, name: `medicion_valores.${indice}` as Path<ValoresReporte> }) as
    | string[][][]
    | undefined;
  const conZonas = pieza.zonas.some((z) => z.nombre);
  const conAnterior = !!anteriores?.some((v) => v !== undefined);

  const celda = (j: number, k: number, n: number) => {
    const ruta = `medicion_valores.${indice}.${j}.${k}.${n}` as Path<ValoresReporte>;
    const r = register(ruta);
    const v = numero(valores?.[j]?.[k]?.[n] ?? "");
    const alerta = bajoAlerta(pieza, v);
    return (
      <TableCell key={n} sx={{ p: 0.25 }}>
        <Box
          component="input"
          {...r}
          aria-label={`Pieza ${pieza.nombre}${conZonas ? `, ${pieza.zonas[j].nombre}` : ""}, anillo ${k + 1}, punto ${letraDePunto(n)}`}
          inputMode="decimal"
          readOnly={soloLectura}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            e.target.value = soloEspesor(e.target.value);
            void r.onChange(e);
          }}
          sx={{
            width: "100%",
            minWidth: 44,
            textAlign: "center",
            font: "inherit",
            fontSize: 13,
            py: 0.5,
            border: "1px solid",
            borderColor: alerta ? "error.main" : "divider",
            borderRadius: 0.5,
            bgcolor: soloLectura ? "action.hover" : "background.paper",
            color: alerta ? "error.main" : "text.primary",
            fontWeight: alerta ? 700 : 400,
            "&:focus": { outline: "2px solid", outlineColor: "primary.main" },
          }}
        />
      </TableCell>
    );
  };

  return (
    <Box sx={{ overflowX: "auto", mb: 2 }}>
      <Typography variant="body2" fontWeight={700} mb={0.5}>
        Pieza {pieza.nombre}
        {pieza.espesor_nominal_mm !== undefined && ` · nominal ${mm(pieza.espesor_nominal_mm)} mm`}
        {pieza.espesor_alerta_mm !== undefined && ` · alerta bajo ${mm(pieza.espesor_alerta_mm)} mm`}
      </Typography>
      <Table size="small" sx={{ "& td, & th": { borderColor: "divider" } }}>
        <TableHead>
          <TableRow>
            {conZonas && <TableCell>Zona</TableCell>}
            <TableCell align="center">Anillo</TableCell>
            {Array.from({ length: maxPuntos }, (_, n) => (
              <TableCell key={n} align="center">
                {letraDePunto(n)}
              </TableCell>
            ))}
            <TableCell align="center">Esp. mín.</TableCell>
            {conAnterior && <TableCell align="center">Anterior</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {pieza.zonas.map((z, j) => {
            const minimo = minimoDe((valores?.[j] ?? []).flat().map((t) => numero(t)));
            const alerta = bajoAlerta(pieza, minimo);
            return (
              <Fragment key={j}>
                {Array.from({ length: z.anillos }, (_, k) => (
                  <TableRow key={k}>
                    {conZonas && k === 0 && (
                      <TableCell rowSpan={z.anillos} sx={{ fontWeight: 600, whiteSpace: "nowrap" }}>
                        {z.nombre}
                      </TableCell>
                    )}
                    <TableCell align="center">{k + 1}</TableCell>
                    {Array.from({ length: z.puntos }, (_, n) => celda(j, k, n))}
                    {z.puntos < maxPuntos && <TableCell colSpan={maxPuntos - z.puntos} />}
                    {k === 0 && (
                      <TableCell
                        rowSpan={z.anillos}
                        align="center"
                        sx={{ fontWeight: 700, color: alerta ? "error.main" : undefined }}
                      >
                        {mm(minimo)}
                      </TableCell>
                    )}
                    {conAnterior && k === 0 && (
                      <TableCell rowSpan={z.anillos} align="center" sx={{ color: "text.secondary" }}>
                        {mm(anteriores?.[j])}
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </Fragment>
            );
          })}
        </TableBody>
      </Table>
    </Box>
  );
}
