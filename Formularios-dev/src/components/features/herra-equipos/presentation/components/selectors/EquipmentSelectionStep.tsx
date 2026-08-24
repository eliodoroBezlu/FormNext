"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  Autocomplete,
  Box,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  TextField,
  Typography,
  Card,
  CardContent,
} from "@mui/material";
import { EquipoBackend } from "@/lib/actions/equipo-actions";
import type { Section } from "../../../domain/models/Section";
import {
  elementosPresentesEn,
  type SeleccionSpcc,
} from "../../../domain/models/SpccElementos";
import { SpccEquipoSelectors } from "./SpccEquipoSelectors";
import { obtenerPrestadosAhora } from "@/lib/actions/prestamo-actions";

const norm = (s: string) =>
  s
    .toUpperCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim();

interface EquipmentSelectionStepProps {
  templateCode: string;
  templateName: string;
  equipos: EquipoBackend[];
  areas: string[];
  onSelect: (area: string, code: string, equipo?: EquipoBackend) => void;
  onSkip: () => void;
  /**
   * Secciones de la plantilla. Solo se usan para reconocer los formularios que
   * inspeccionan varios elementos a la vez (SPCC); sin ellas el paso se
   * comporta como siempre, con un único TAG.
   */
  sections?: Section[];
  /** Continuar con un equipo por elemento, en vez de con un único TAG. */
  onSelectMultiple?: (area: string, seleccion: SeleccionSpcc) => void;
}

export function EquipmentSelectionStep({
  templateCode,
  templateName,
  equipos,
  areas,
  onSelect,
  onSkip,
  sections,
  onSelectMultiple,
}: EquipmentSelectionStepProps) {
  const [selectedArea, setSelectedArea] = useState<string>("");
  /**
   * Se guarda el equipo entero, no el código.
   *
   * El código **dejó de ser único**: hay SPCC distintos con el mismo ID
   * interno, diferenciados por su RFID. Seleccionando por código, cinco
   * arneses quedaban inalcanzables porque siempre se resolvía el primero.
   */
  const [selected, setSelected] = useState<EquipoBackend | null>(null);

  /**
   * Elementos SPCC de esta plantilla, si es que los tiene.
   *
   * Se deduce de las secciones y no del código del formulario: dos plantillas
   * comparten el código `1.02.P06.F19` y solo una tiene las cuatro secciones.
   * Lista vacía en cualquier otro formulario, que es lo que conserva el TAG
   * único de siempre.
   */
  const elementosSpcc = useMemo(
    () => (sections && onSelectMultiple ? elementosPresentesEn(sections) : []),
    [sections, onSelectMultiple],
  );
  const esFormularioMultiple = elementosSpcc.length > 0;

  const [seleccionMultiple, setSeleccionMultiple] = useState<SeleccionSpcc>({});

  /**
   * Qué está prestado ahora, para etiquetarlo. Solo se consulta en los
   * formularios que lo necesitan, y un fallo deja el mapa vacío sin estorbar.
   */
  const [prestados, setPrestados] = useState<Record<string, string>>({});
  useEffect(() => {
    if (!esFormularioMultiple) return;
    void obtenerPrestadosAhora().then(setPrestados);
  }, [esFormularioMultiple]);
  const haySeleccionMultiple = Object.values(seleccionMultiple).some(Boolean);

  /**
   * Equipos que se ofrecen para el área elegida.
   *
   * Además de los del área entran los de **ámbito superior**: uno de la
   * superintendencia lo puede inspeccionar cualquiera de sus áreas, y uno de
   * la gerencia, cualquiera. Es visibilidad — si el usuario puede inspeccionar
   * lo siguen decidiendo los roles.
   */
  const filteredEquipos = useMemo(() => {
    if (!selectedArea) return [];
    const buscada = norm(selectedArea);
    const superDelArea = norm(
      equipos.find((x) => norm(x.area_id?.nombre ?? "") === buscada)?.area_id
        ?.superintendencia?.nombre ?? "",
    );

    return equipos.filter((e) => {
      if (e.ambito === "gerencia") return true;

      if (e.ambito === "superintendencia") {
        const supEquipo = norm(e.superintendencia_id?.nombre ?? "");
        return !!supEquipo && !!superDelArea && supEquipo === superDelArea;
      }

      const area = norm(e.area_id?.nombre ?? "");
      if (!area) return false;
      return area === buscada || area.includes(buscada) || buscada.includes(area);
    });
  }, [equipos, selectedArea]);

  const handleContinue = () => {
    if (esFormularioMultiple) {
      onSelectMultiple?.(selectedArea, seleccionMultiple);
      return;
    }
    if (!selected) return;
    onSelect(selectedArea, selected.codigo, selected);
  };

  /**
   * Un vehículo se busca por su número interno **o** por su placa: son dos
   * identificadores distintos y el inspector rara vez tiene los dos a mano.
   * También se acepta la descripción, que es lo que se lee en el tablero.
   */
  const coincide = (equipo: EquipoBackend, consulta: string) => {
    const q = norm(consulta);
    if (!q) return true;
    return [equipo.codigo, equipo.placa, equipo.descripcion]
      .filter(Boolean)
      .some((campo) => norm(String(campo)).includes(q));
  };

  const etiqueta = (equipo: EquipoBackend) =>
    equipo.placa ? `${equipo.codigo} · ${equipo.placa}` : equipo.codigo;

  return (
    <Card sx={{ mb: 3, p: 2, borderRadius: 2, boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
      <CardContent>
        <Typography variant="h6" align="center" fontWeight={600} sx={{ mb: 1 }}>
          Formulario de Inspección de Seguridad
        </Typography>
        <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 3 }}>
          Código: {templateCode} — {templateName}
        </Typography>

        <Typography variant="subtitle1" align="center" fontWeight={500} sx={{ mb: 1 }}>
          {esFormularioMultiple
            ? "Elija el área y los elementos que lleva el trabajador"
            : "Seleccione primero el área y el TAG para continuar"}
        </Typography>

        {esFormularioMultiple && (
          <Typography
            variant="body2"
            align="center"
            color="text.secondary"
            sx={{ mb: 3 }}
          >
            Marque solo los que va a inspeccionar: cada uno activa su sección y
            llena su código. Los que deje vacíos no aparecerán.
          </Typography>
        )}

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth>
              <InputLabel id="step1-select-area-label">Área</InputLabel>
              <Select
                labelId="step1-select-area-label"
                value={selectedArea}
                label="Área"
                onChange={(e) => {
                  setSelectedArea(e.target.value);
                  setSelected(null); // al cambiar de área la selección anterior deja de valer
                }}
              >
                <MenuItem value="">
                  <em>Seleccione un área</em>
                </MenuItem>
                {areas.map((opt) => (
                  <MenuItem key={opt} value={opt}>
                    {opt}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {esFormularioMultiple ? (
            <Grid size={12}>
              <SpccEquipoSelectors
                elementos={elementosSpcc}
                equipos={filteredEquipos}
                seleccion={seleccionMultiple}
                onChange={setSeleccionMultiple}
                deshabilitado={!selectedArea}
                prestados={prestados}
              />
            </Grid>
          ) : (
          <Grid size={{ xs: 12, sm: 6 }}>
            <Autocomplete
              disabled={!selectedArea || filteredEquipos.length === 0}
              options={filteredEquipos}
              value={selected}
              onChange={(_, valor) => setSelected(valor)}
              getOptionLabel={etiqueta}
              isOptionEqualToValue={(a, b) => a._id === b._id}
              filterOptions={(opciones, { inputValue }) =>
                opciones.filter((o) => coincide(o, inputValue))
              }
              renderOption={(props, opt) => {
                const { key, ...rest } = props as React.HTMLAttributes<HTMLLIElement> & {
                  key: string;
                };
                return (
                  <Box component="li" key={key} {...rest}>
                    <Box>
                      <Typography variant="body2" fontWeight={600}>
                        {etiqueta(opt)}
                      </Typography>
                      {opt.descripcion && (
                        <Typography variant="caption" color="text.secondary">
                          {opt.descripcion}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                );
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="TAG / Código o placa"
                  placeholder="Escriba el número interno o la placa"
                />
              )}
            />
          </Grid>
          )}
        </Grid>

        <Box display="flex" flexDirection="column" gap={2} alignItems="center">
          <Button
            variant="contained"
            size="large"
            fullWidth
            onClick={handleContinue}
            disabled={esFormularioMultiple ? !haySeleccionMultiple : !selected}
            sx={{ py: 1.5, fontWeight: "bold", textTransform: "none" }}
          >
            Continuar
          </Button>

          <Button
            variant="text"
            color="secondary"
            onClick={onSkip}
            sx={{ textTransform: "none", fontWeight: 500 }}
          >
            Omitir selección (Inspeccionar equipo nuevo o no registrado)
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
