"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Alert,
  Autocomplete,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  crearMatriz,
  obtenerAreasDisponibles,
} from "../../infrastructure/adapters/matrizRiesgosAdapter";
import { AreaDisponible } from "../../domain/models/IProps";

interface Props {
  abierto: boolean;
  onCerrar: () => void;
}

/**
 * Alta de una matriz en blanco, sin Excel.
 *
 * El área se elige del maestro y no se escribe: de ella sale la
 * superintendencia, que determina a qué PGR se consolidará la matriz. Las
 * áreas sin código sincronizado con IAM no aparecen —su código forma parte del
 * identificador de la matriz—, y eso se avisa en pantalla en vez de dejar al
 * usuario buscando un área que no está.
 */
export function NuevaMatrizDialog({ abierto, onCerrar }: Props) {
  const router = useRouter();
  const [areas, setAreas] = useState<AreaDisponible[]>([]);
  const [area, setArea] = useState<AreaDisponible | null>(null);
  const [anio, setAnio] = useState(new Date().getFullYear());
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!abierto) return;
    let vigente = true;

    void (async () => {
      const lista = await obtenerAreasDisponibles();
      if (vigente) setAreas(lista);
    })();

    return () => {
      vigente = false;
    };
  }, [abierto]);

  const crear = async () => {
    if (!area) return;
    setGuardando(true);
    setError(null);

    const res = await crearMatriz({ areaCodigo: area.codigo, anio });
    setGuardando(false);

    if (res.success && res.data) {
      onCerrar();
      router.push(`/dashboard/matriz-riesgos/${res.data._id}`);
      return;
    }
    setError(res.error ?? "No se pudo crear la matriz");
  };

  return (
    <Dialog open={abierto} onClose={onCerrar} maxWidth="sm" fullWidth>
      <DialogTitle>Nueva matriz de riesgos</DialogTitle>

      <DialogContent dividers>
        <Stack gap={2.5}>
          <Typography variant="body2" color="text.secondary">
            Se crea vacía y en BORRADOR. Los riesgos se cargan después, uno a
            uno, con el nivel calculado por la metodología.
          </Typography>

          {error && <Alert severity="error">{error}</Alert>}

          <Autocomplete
            options={areas}
            value={area}
            onChange={(_, v) => setArea(v)}
            getOptionLabel={(a) => `${a.nombre} [${a.codigo}]`}
            isOptionEqualToValue={(a, b) => a.codigo === b.codigo}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Área"
                helperText={
                  area
                    ? area.superintendencia
                    : "De ella sale la superintendencia y, con eso, el PGR destino"
                }
              />
            )}
          />

          <TextField
            type="number"
            label="Gestión"
            value={anio}
            onChange={(e) => setAnio(Number(e.target.value))}
            slotProps={{ htmlInput: { min: 2000, max: 2100 } }}
          />

          {areas.length > 0 && (
            <Typography variant="caption" color="text.secondary">
              {areas.length} área(s) disponibles. Si falta alguna, es porque
              todavía no tiene código sincronizado desde IAM.
            </Typography>
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
          onClick={() => void crear()}
          disabled={!area || guardando}
        >
          {guardando ? "Creando…" : "Crear matriz"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
