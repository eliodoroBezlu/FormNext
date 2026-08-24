"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Autocomplete,
  Box,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { obtenerTrabajadores } from "@/lib/actions/trabajador-actions";
import type { Trabajador } from "@/types/trabajador";

interface BuscadorTrabajadorProps {
  onSelect: (trabajador: Trabajador | null) => void;
  disabled?: boolean;
}

/** Valor del filtro cuando no se está filtrando. Cadena vacía = todas. */
const TODAS = "";

const areaDe = (t: Trabajador): string => t.area || "Sin área";

/**
 * Selector de persona sobre el roster que ya sincroniza el IAM.
 *
 * Se busca por nómina o CI: en el turno se identifica a la gente por carnet
 * tanto como por nombre. El filtro de área va delante porque quien entrega
 * suele atender a una cuadrilla entera: acotar primero deja una lista de diez
 * o veinte nombres en vez de casi doscientos.
 *
 * Usa `obtenerTrabajadores()` y **no** `obtenerTrabajadoresCompletos()`: pese al
 * nombre, ese segundo endpoint solo devuelve nómina, CI y puesto — sin `_id`,
 * que es justamente lo que hace falta para registrar la entrega.
 */
export function BuscadorTrabajador({
  onSelect,
  disabled = false,
}: BuscadorTrabajadorProps) {
  const [trabajadores, setTrabajadores] = useState<Trabajador[]>([]);
  const [cargando, setCargando] = useState(true);
  const [area, setArea] = useState(TODAS);
  /**
   * La selección se controla desde aquí para poder vaciarla al cambiar de
   * área: si no, quedaría en pantalla un nombre que ya no está en la lista.
   */
  const [seleccionado, setSeleccionado] = useState<Trabajador | null>(null);

  useEffect(() => {
    let vivo = true;
    void (async () => {
      try {
        const datos = await obtenerTrabajadores();
        // Los dados de baja no reciben dotación.
        if (vivo) setTrabajadores(datos.filter((t) => t.activo !== false));
      } finally {
        if (vivo) setCargando(false);
      }
    })();
    return () => {
      vivo = false;
    };
  }, []);

  /**
   * Las áreas salen del propio roster, no de un catálogo aparte: así la lista
   * solo ofrece áreas donde de verdad hay gente, y no hace falta una segunda
   * petición para pintarla.
   */
  const areas = useMemo(
    () => [...new Set(trabajadores.map(areaDe))].sort((a, b) => a.localeCompare(b)),
    [trabajadores],
  );

  const visibles = useMemo(
    () => (area ? trabajadores.filter((t) => areaDe(t) === area) : trabajadores),
    [trabajadores, area],
  );

  const cambiarArea = (nueva: string) => {
    setArea(nueva);
    // Al acotar el área, quien estuviera elegido puede haber dejado de estar en
    // la lista. Se limpia siempre: dejarlo a medias confunde más que repetir la
    // búsqueda.
    if (seleccionado) {
      setSeleccionado(null);
      onSelect(null);
    }
  };

  return (
    <Stack spacing={2}>
      <TextField
        select
        size="small"
        label="Área"
        value={area}
        disabled={disabled || cargando}
        onChange={(e) => cambiarArea(e.target.value)}
        /*
          Sin `displayEmpty` el campo se ve en blanco mientras no hay filtro, y
          un desplegable vacío se lee como «no cargó» en vez de «sin filtrar».
          La etiqueta se fija arriba para que no se solape con el texto.
        */
        slotProps={{
          inputLabel: { shrink: true },
          select: {
            displayEmpty: true,
            renderValue: (valor: unknown) =>
              (valor as string) || "Todas las áreas",
          },
        }}
        helperText={
          area
            ? `${visibles.length} trabajador(es) en esta área`
            : "Acote la búsqueda si lo prefiere"
        }
      >
        <MenuItem value={TODAS}>Todas las áreas</MenuItem>
        {areas.map((a) => (
          <MenuItem key={a} value={a}>
            {a}
          </MenuItem>
        ))}
      </TextField>

      <Autocomplete
        options={visibles}
        value={seleccionado}
        loading={cargando}
        disabled={disabled}
        getOptionLabel={(t) => t.nomina}
        isOptionEqualToValue={(a, b) => a._id === b._id}
        filterOptions={(opciones, { inputValue }) => {
          const q = inputValue.trim().toLowerCase();
          if (!q) return opciones.slice(0, 50);
          return opciones
            .filter(
              (t) =>
                t.nomina?.toLowerCase().includes(q) ||
                t.ci?.toLowerCase().includes(q),
            )
            .slice(0, 50);
        }}
        onChange={(_, valor) => {
          setSeleccionado(valor);
          onSelect(valor);
        }}
        noOptionsText={
          area ? `Nadie en ${area} con ese nombre o CI` : "Sin coincidencias"
        }
        renderOption={(props, t) => {
          const { key, ...rest } =
            props as React.HTMLAttributes<HTMLLIElement> & {
              key: string;
            };
          return (
            <Box component="li" key={key} {...rest}>
              <Box>
                <Typography variant="body2" fontWeight={600}>
                  {t.nomina}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  CI {t.ci} · {areaDe(t)}
                </Typography>
              </Box>
            </Box>
          );
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Trabajador"
            placeholder="Nombre o CI"
            helperText={cargando ? "Cargando roster…" : undefined}
          />
        )}
      />
    </Stack>
  );
}
