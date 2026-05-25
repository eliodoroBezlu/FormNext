// src/components/form-sistemas-emergencia/presentation/components/selectors/ExtintoresChecklist.tsx

import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  Typography,
  Paper,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Button,
  Divider,
} from "@mui/material";
import { ExtintorBackend } from "@/types/formTypes";
import { TAGS_CON_SELECCION_EXTINTORES } from "@/lib/constants";

interface ExtintoresChecklistProps {
  tag: string;
  extintores: ExtintorBackend[] | { extintores: ExtintorBackend[] };
  onExtintoresSeleccionados: (extintores: ExtintorBackend[]) => void;
}

interface ExtintoresSeleccionadosState {
  [key: string]: boolean;
}

export const ExtintoresChecklist = ({
  tag,
  extintores,
  onExtintoresSeleccionados,
}: ExtintoresChecklistProps) => {
  const [extintoresSeleccionados, setExtintoresSeleccionados] = useState<
    ExtintoresSeleccionadosState
  >({});

  const extintoresArray = useMemo(() => {
    if (!extintores) {
      return [];
    }

    if (
      typeof extintores === "object" &&
      !Array.isArray(extintores) &&
      "extintores" in extintores
    ) {
      return extintores.extintores || [];
    }

    if (Array.isArray(extintores)) {
      return extintores;
    }

    return [];
  }, [extintores]);

  const requiereSeleccion = TAGS_CON_SELECCION_EXTINTORES.includes(tag);

  useEffect(() => {
    if (!requiereSeleccion) {
      setExtintoresSeleccionados({});
      onExtintoresSeleccionados([]);
      return;
    }

    const initialState: ExtintoresSeleccionadosState = {};
    extintoresArray.forEach((extintor: ExtintorBackend) => {
      initialState[extintor._id] = false;
    });
    setExtintoresSeleccionados(initialState);
  }, [extintoresArray, tag, requiereSeleccion]);

  const handleCheckboxChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    extintorId: string
  ) => {
    const newSeleccionados = {
      ...extintoresSeleccionados,
      [extintorId]: event.target.checked,
    };
    setExtintoresSeleccionados(newSeleccionados);

    const seleccionados = extintoresArray.filter(
      (extintor) => newSeleccionados[extintor._id]
    );
    onExtintoresSeleccionados(seleccionados);
  };

  const seleccionarTodos = () => {
    const newSeleccionados: ExtintoresSeleccionadosState = {};
    extintoresArray.forEach((extintor: ExtintorBackend) => {
      newSeleccionados[extintor._id] = true;
    });
    setExtintoresSeleccionados(newSeleccionados);
    onExtintoresSeleccionados([...extintoresArray]);
  };

  const deseleccionarTodos = () => {
    const newSeleccionados: ExtintoresSeleccionadosState = {};
    extintoresArray.forEach((extintor: ExtintorBackend) => {
      newSeleccionados[extintor._id] = false;
    });
    setExtintoresSeleccionados(newSeleccionados);
    onExtintoresSeleccionados([]);
  };

  return (
    <Paper elevation={2} sx={{ p: 2, height: "100%", minHeight: "56px" }}>
      {tag ? (
        extintoresArray.length > 0 ? (
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Extintores en {tag}:
            </Typography>

            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
              <Button size="small" variant="outlined" onClick={seleccionarTodos}>
                Seleccionar todos
              </Button>
              <Button size="small" variant="outlined" onClick={deseleccionarTodos}>
                Deseleccionar todos
              </Button>
            </Box>

            <Divider sx={{ my: 1 }} />

            <Box sx={{ maxHeight: "200px", overflowY: "auto" }}>
              <FormGroup>
                {extintoresArray.map((extintor: ExtintorBackend) => (
                  <FormControlLabel
                    key={extintor._id}
                    control={
                      <Checkbox
                        checked={!!extintoresSeleccionados[extintor._id]}
                        onChange={(e) => handleCheckboxChange(e, extintor._id)}
                        size="small"
                      />
                    }
                    label={
                      <Typography variant="body2">
                        {extintor.CodigoExtintor} - {extintor.Ubicacion}
                      </Typography>
                    }
                  />
                ))}
              </FormGroup>
            </Box>
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No hay extintores registrados en esta área
          </Typography>
        )
      ) : (
        <Typography variant="body2" color="text.secondary">
          Seleccione un área para ver los extintores
        </Typography>
      )}
    </Paper>
  );
};

export default ExtintoresChecklist;
