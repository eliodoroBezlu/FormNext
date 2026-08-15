"use client";

import { ReactNode } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { ControlRiesgo } from "../../domain/models/IProps";

interface Props {
  /**
   * Sirve tanto para `ControlRiesgo` como para `ControlAnalizado`: comparten
   * las seis primeras columnas y solo difieren en cómo tratan la eficacia.
   */
  controles: readonly Omit<ControlRiesgo, "eficacia">[];
  /**
   * Cómo se pinta la eficacia de cada control.
   *
   * El detalle muestra un chip con el color del semáforo; la previsualización
   * de importación compara el valor del Excel contra el calculado, y esa
   * comparación es justamente su razón de existir.
   */
  renderEficacia: (indice: number) => ReactNode;
}

/**
 * Las siete columnas de control del formulario 1.02.P06.F01, en su orden.
 *
 * Existe como componente para que el detalle de la matriz y la previsualización
 * de importación no vuelvan a divergir: antes cada uno tenía su propia tabla y
 * la del detalle terminó mostrando solo el **número** de controles, mientras la
 * de importación mostraba cinco de las siete columnas.
 */
export function TablaControles({ controles, renderEficacia }: Props) {
  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell>Familia de controles</TableCell>
          <TableCell>Medida de prevención, control y mitigación</TableCell>
          <TableCell>Familia de verificadores</TableCell>
          <TableCell>Verificador</TableCell>
          <TableCell>Calidad</TableCell>
          <TableCell>Jerarquía</TableCell>
          <TableCell>Eficacia</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {controles.map((c, i) => (
          <TableRow key={`${c.verificador}-${c.medida}-${i}`}>
            <TableCell sx={{ maxWidth: 170 }}>
              <Typography variant="caption">{c.familiaControl}</Typography>
            </TableCell>
            <TableCell sx={{ maxWidth: 320 }}>
              <Typography variant="body2">{c.medida}</Typography>
            </TableCell>
            <TableCell sx={{ maxWidth: 190 }}>
              <Typography variant="caption" color="text.secondary">
                {c.familiaVerificador || "—"}
              </Typography>
            </TableCell>
            <TableCell sx={{ maxWidth: 260 }}>
              <Typography variant="caption" color="text.secondary">
                {c.verificador || "— sin verificador —"}
              </Typography>
            </TableCell>
            <TableCell sx={{ whiteSpace: "nowrap" }}>
              <Typography variant="caption">{c.calidadControl}</Typography>
            </TableCell>
            <TableCell sx={{ maxWidth: 180 }}>
              <Typography variant="caption">{c.jerarquiaControl}</Typography>
            </TableCell>
            <TableCell>{renderEficacia(i)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
