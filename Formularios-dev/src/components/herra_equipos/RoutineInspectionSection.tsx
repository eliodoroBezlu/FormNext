import { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  RadioGroup,
  FormControlLabel,
  Radio,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  FormLabel,
  Alert,
} from "@mui/material";
import { Add, Delete } from "@mui/icons-material";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import { FormDataHerraEquipos, RoutineInspectionConfig, RoutineInspectionEntry } from "./types/IProps";

interface RoutineInspectionSectionProps {
  config: RoutineInspectionConfig;
  register: UseFormRegister<FormDataHerraEquipos>;
  errors: FieldErrors<FormDataHerraEquipos>;
  value?: RoutineInspectionEntry[];
  onChange?: (entries: RoutineInspectionEntry[]) => void;
  readonly?: boolean;
}

export function RoutineInspectionSection({
  config,
  value = [],
  onChange,
  readonly = false,
}: RoutineInspectionSectionProps) {
  const [entries, setEntries] = useState<RoutineInspectionEntry[]>(value);
  const [currentEntry, setCurrentEntry] = useState<Partial<RoutineInspectionEntry>>({
    date: "",
    inspector: "",
    response: undefined,
    observations: "",
    signature: "",
  });

  const maxEntries = config.maxEntries || 10;
  const canAddMore = entries.length < maxEntries;

  const handleAddEntry = () => {
    if (!currentEntry.date || !currentEntry.inspector || !currentEntry.response) {
      return;
    }

    const newEntry: RoutineInspectionEntry = {
      date: currentEntry.date,
      inspector: currentEntry.inspector,
      response: currentEntry.response as "si" | "no",
      observations: currentEntry.observations || "",
      signature: currentEntry.signature || "",
    };

    const updatedEntries = [...entries, newEntry];
    setEntries(updatedEntries);
    onChange?.(updatedEntries);

    // Resetear formulario
    setCurrentEntry({
      date: "",
      inspector: "",
      response: undefined,
      observations: "",
      signature: "",
    });
  };

  const handleDeleteEntry = (index: number) => {
    const updatedEntries = entries.filter((_, i) => i !== index);
    setEntries(updatedEntries);
    onChange?.(updatedEntries);
  };

  const fields = config.fields || {
    showDate: true,
    showInspector: true,
    showResponse: true,
    showObservations: true,
    showSignature: true,
  };

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        {config.title || "II. INSPECCIÓN RUTINARIA DEL ANDAMIO"}
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {config.question ||
          "Esta parte del formulario la realiza el responsable del grupo de trabajo cada vez que las condiciones cambien o el andamio deba sufrir modificaciones"}
      </Typography>

      {/* Tabla de entradas existentes */}
      {entries.length > 0 && (
        <TableContainer sx={{ mb: 3 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                {fields.showDate && (
                  <TableCell>{fields.dateLabel || "FECHA DE INSPECCIÓN"}</TableCell>
                )}
                {fields.showInspector && (
                  <TableCell>{fields.inspectorLabel || "NOMBRE DEL INSPECTOR"}</TableCell>
                )}
                <TableCell>
                  {config.question ||
                    "EL ANDAMIO MANTIENE LOS ESTÁNDARES DE SEGURIDAD INICIALES"}
                </TableCell>
                <TableCell>SI</TableCell>
                <TableCell>NO</TableCell>
                {fields.showObservations && (
                  <TableCell>{fields.observationsLabel || "OBSERVACIONES"}</TableCell>
                )}
                {fields.showSignature && (
                  <TableCell>{fields.signatureLabel || "FIRMA"}</TableCell>
                )}
                {!readonly && <TableCell>Acciones</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {entries.map((entry, index) => (
                <TableRow key={index}>
                  {fields.showDate && <TableCell>{entry.date}</TableCell>}
                  {fields.showInspector && <TableCell>{entry.inspector}</TableCell>}
                  <TableCell>
                    {config.question?.substring(0, 30) || "Estándares de seguridad"}...
                  </TableCell>
                  <TableCell align="center">
                    {entry.response === "si" ? "✓" : ""}
                  </TableCell>
                  <TableCell align="center">
                    {entry.response === "no" ? "✓" : ""}
                  </TableCell>
                  {fields.showObservations && (
                    <TableCell>{entry.observations || "-"}</TableCell>
                  )}
                  {fields.showSignature && (
                    <TableCell>{entry.signature || "-"}</TableCell>
                  )}
                  {!readonly && (
                    <TableCell>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteEntry(index)}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Formulario para agregar nueva entrada */}
      {!readonly && canAddMore && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Typography variant="subtitle2" color="primary">
            Agregar nueva inspección
          </Typography>

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }}>
            {fields.showDate && (
              <TextField
                label={fields.dateLabel || "Fecha de inspección"}
                type="date"
                value={currentEntry.date}
                onChange={(e) =>
                  setCurrentEntry({ ...currentEntry, date: e.target.value })
                }
                InputLabelProps={{ shrink: true }}
                required={fields.dateRequired !== false}
                fullWidth
              />
            )}

            {fields.showInspector && (
              <TextField
                label={fields.inspectorLabel || "Nombre del inspector"}
                value={currentEntry.inspector}
                onChange={(e) =>
                  setCurrentEntry({ ...currentEntry, inspector: e.target.value })
                }
                required={fields.inspectorRequired !== false}
                fullWidth
              />
            )}
          </Box>

          {fields.showResponse && (
            <FormControl component="fieldset" required={fields.responseRequired !== false}>
              <FormLabel component="legend">
                {config.question ||
                  "¿El andamio mantiene los estándares de seguridad iniciales?"}
              </FormLabel>
              <RadioGroup
                row
                value={currentEntry.response || ""}
                onChange={(e) =>
                  setCurrentEntry({
                    ...currentEntry,
                    response: e.target.value as "si" | "no",
                  })
                }
              >
                <FormControlLabel value="si" control={<Radio />} label="SI" />
                <FormControlLabel value="no" control={<Radio />} label="NO" />
              </RadioGroup>
            </FormControl>
          )}

          {fields.showObservations && (
            <TextField
              label={fields.observationsLabel || "Observaciones"}
              placeholder={fields.observationsPlaceholder || "Ingrese observaciones adicionales"}
              value={currentEntry.observations}
              onChange={(e) =>
                setCurrentEntry({ ...currentEntry, observations: e.target.value })
              }
              multiline
              rows={2}
              fullWidth
            />
          )}

          {fields.showSignature && (
            <TextField
              label={fields.signatureLabel || "Firma"}
              value={currentEntry.signature}
              onChange={(e) =>
                setCurrentEntry({ ...currentEntry, signature: e.target.value })
              }
              fullWidth
            />
          )}

          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleAddEntry}
            disabled={
              !currentEntry.date ||
              !currentEntry.inspector ||
              !currentEntry.response
            }
          >
            Agregar Inspección
          </Button>
        </Box>
      )}

      {!canAddMore && (
        <Alert severity="info" sx={{ mt: 2 }}>
          Se ha alcanzado el máximo de {maxEntries} inspecciones permitidas.
        </Alert>
      )}

      {entries.length === 0 && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          No se han registrado inspecciones rutinarias aún.
        </Alert>
      )}
    </Paper>
  );
}