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
import dayjs from "dayjs";
import { UseFormRegister, FieldErrors, useForm } from "react-hook-form";
import { FormDataHerraEquipos, RoutineInspectionConfig, RoutineInspectionEntry } from "./types/IProps";
import AutocompleteCustom from "../molecules/autocomplete-custom/AutocompleteCustom";
import { SignatureField } from "../molecules/team-member-signature/SigantureField";

interface RoutineInspectionSectionProps {
  config: RoutineInspectionConfig;
  register: UseFormRegister<FormDataHerraEquipos>;
  errors: FieldErrors<FormDataHerraEquipos>;
  value?: RoutineInspectionEntry[];
  onChange?: (entries: RoutineInspectionEntry[]) => void;
  readonly?: boolean;
}

interface TempEntryForm {
  tempSignature: string;
}

export function RoutineInspectionSection({
  config,
  value = [],
  onChange,
  readonly = false,
}: RoutineInspectionSectionProps) {
  


  // ✅ NO usar estado local, trabajar directamente con value
  const [currentEntry, setCurrentEntry] = useState<Partial<RoutineInspectionEntry>>({
    date: dayjs().format("YYYY-MM-DD"),
    inspector: "",
    response: undefined,
    observations: "",
    signature: "",
  });

  const { control: tempControl, setValue: tempSetValue, watch, reset: resetTempForm } = useForm<TempEntryForm>({
    defaultValues: {
      tempSignature: "",
    },
  });

  const tempSignature = watch("tempSignature");

  const maxEntries = config.maxEntries || 10;
  const canAddMore = value.length < maxEntries;

  const handleAddEntry = () => {
    if (!currentEntry.date || !currentEntry.inspector || !currentEntry.response) {
      console.warn("❌ Campos requeridos faltantes:", {
        fecha: !!currentEntry.date,
        inspector: !!currentEntry.inspector,
        respuesta: !!currentEntry.response
      });
      return;
    }

    if (!onChange) {
      console.error("❌ CRÍTICO: onChange NO está disponible!");
      return;
    }

    const newEntry: RoutineInspectionEntry = {
      date: currentEntry.date,
      inspector: currentEntry.inspector,
      response: currentEntry.response as "si" | "no",
      observations: currentEntry.observations || "",
      signature: tempSignature || "",
    };

    // ✅ CRÍTICO: Crear nuevo array (inmutabilidad)
    const updatedEntries = [...value, newEntry];

    // ✅ CRÍTICO: Notificar cambio
    onChange(updatedEntries);

    // Resetear formulario
    setCurrentEntry({
      date: dayjs().format("YYYY-MM-DD"),
      inspector: "",
      response: undefined,
      observations: "",
      signature: "",
    });
    resetTempForm();
  };

  const handleDeleteEntry = (index: number) => {
    // ✅ CRÍTICO: Crear nuevo array (inmutabilidad)
    const updatedEntries = value.filter((_, i) => i !== index);
    

    
    // ✅ CRÍTICO: Notificar cambio
    if (onChange) {
      onChange(updatedEntries);
    }
  };

  const fields = config.fields || {
    showDate: true,
    showInspector: true,
    showResponse: true,
    showObservations: true,
    showSignature: true,
  };

  const formatDate = (dateString: string) => {
    return dayjs(dateString).format("DD/MM/YYYY");
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
      {value.length > 0 && (
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
                <TableCell align="center">SI</TableCell>
                <TableCell align="center">NO</TableCell>
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
              {value.map((entry, index) => (
                <TableRow key={index}>
                  {fields.showDate && (
                    <TableCell>{formatDate(entry.date)}</TableCell>
                  )}
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
                    <TableCell>
                      {entry.signature ? (
                        <img 
                          src={entry.signature} 
                          alt="Firma" 
                          style={{ maxWidth: "100px", maxHeight: "50px" }}
                        />
                      ) : (
                        "-"
                      )}
                    </TableCell>
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
                value={formatDate(currentEntry.date || "")}
                InputLabelProps={{ shrink: true }}
                required={fields.dateRequired !== false}
                disabled
                fullWidth
                helperText="La fecha se establece automáticamente"
              />
            )}

            {fields.showInspector && (
              <AutocompleteCustom
                dataSource="trabajador"
                label={fields.inspectorLabel || "Nombre del inspector"}
                placeholder="Buscar o ingresar inspector"
                value={currentEntry.inspector || null}
                onChange={(newValue) =>
                  setCurrentEntry({ ...currentEntry, inspector: newValue || "" })
                }
                required={fields.inspectorRequired !== false}
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
                <FormControlLabel 
                  value="si" 
                  control={
                    <Radio 
                      sx={{
                        color: "#4caf50",
                        "&.Mui-checked": {
                          color: "#4caf50",
                        },
                      }}
                    />
                  } 
                  label="SI" 
                />
                <FormControlLabel 
                  value="no" 
                  control={
                    <Radio 
                      sx={{
                        color: "#f44336",
                        "&.Mui-checked": {
                          color: "#f44336",
                        },
                      }}
                    />
                  } 
                  label="NO" 
                />
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
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                {fields.signatureLabel || "Firma del Inspector"}
              </Typography>
              <SignatureField
                fieldName="tempSignature"
                control={tempControl}
                setValue={tempSetValue}
                heightPercentage={50}
                format="png"
              />
            </Box>
          )}

          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => {
              handleAddEntry();
            }}
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

      {value.length === 0 && !readonly && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          No se han registrado inspecciones rutinarias aún.
        </Alert>
      )}

      {value.length === 0 && readonly && (
        <Alert severity="info" sx={{ mt: 2 }}>
          No hay inspecciones rutinarias registradas.
        </Alert>
      )}
    </Paper>
  );
}