import {
  Box,
  Paper,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  Alert,
} from "@mui/material";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import { ConclusionConfig, FormDataHerraEquipos } from "./types/IProps";

interface ScaffoldConclusionSectionProps {
  config: ConclusionConfig;
  register: UseFormRegister<FormDataHerraEquipos>;
  errors: FieldErrors<FormDataHerraEquipos>;
  value?: "liberado" | "no_liberado";
  onChange?: (value: "liberado" | "no_liberado") => void;
  readonly?: boolean;
}

export function ScaffoldConclusionSection({
  config,
  errors,
  value,
  onChange,
  readonly = false,
}: ScaffoldConclusionSectionProps) {
  const options = config.checkboxOptions || {
    liberatedLabel: "El Andamio es liberado, colocar una tarjeta verde y autorizar la utilización del mismo.",
    liberatedColor: "#4caf50",
    notLiberatedLabel: "El Andamio No es liberado, colocar tarjeta roja y cinta de peligro hasta que las observaciones se corrijan.",
    notLiberatedColor: "#f44336",
  };

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        {config.label || "A LA CONCLUSIÓN DE LA INSPECCIÓN DE TODOS LOS ITEMS EL INSPECTOR DEBERÁ VERIFICAR QUE:"}
      </Typography>

      <FormControl component="fieldset" fullWidth disabled={readonly}>
        <RadioGroup
          value={value || ""}
          onChange={(e) => onChange?.(e.target.value as "liberado" | "no_liberado")}
        >
          {/* Opción: NO Liberado */}
          <Box
            sx={{
              mb: 2,
              p: 2,
              border: 2,
              borderColor: value === "no_liberado" ? options.notLiberatedColor : "grey.300",
              borderRadius: 1,
              backgroundColor: value === "no_liberado" ? `${options.notLiberatedColor}15` : "transparent",
              transition: "all 0.2s",
              "&:hover": {
                borderColor: options.notLiberatedColor,
                backgroundColor: `${options.notLiberatedColor}08`,
              },
            }}
          >
            <FormControlLabel
              value="no_liberado"
              control={
                <Radio
                  sx={{
                    color: options.notLiberatedColor,
                    "&.Mui-checked": {
                      color: options.notLiberatedColor,
                    },
                  }}
                />
              }
              label={
                <Typography variant="body2" sx={{ fontWeight: value === "no_liberado" ? 600 : 400 }}>
                  Alguno de los ítems arriba mencionados marcó en la columna NO.
                </Typography>
              }
            />
            
            <Box
              sx={{
                mt: 1,
                ml: 4,
                p: 1.5,
                borderRadius: 1,
                backgroundColor: value === "no_liberado" 
                  ? `${options.notLiberatedColor}15` 
                  : 'grey.50',
                border: 1,
                borderColor: value === "no_liberado" 
                  ? options.notLiberatedColor 
                  : 'grey.200',
                opacity: value === "no_liberado" ? 1 : 0.6,
                transition: 'all 0.2s'
              }}
            >
              <Typography 
                variant="caption" 
                sx={{ 
                  fontWeight: value === "no_liberado" ? 600 : 400,
                  color: value === "no_liberado" ? options.notLiberatedColor : 'text.secondary'
                }}
              >
                <strong>Acción:</strong> {options.notLiberatedLabel}
              </Typography>
            </Box>
          </Box>

          {/* Opción: Liberado */}
          <Box
            sx={{
              p: 2,
              border: 2,
              borderColor: value === "liberado" ? options.liberatedColor : "grey.300",
              borderRadius: 1,
              backgroundColor: value === "liberado" ? `${options.liberatedColor}15` : "transparent",
              transition: "all 0.2s",
              "&:hover": {
                borderColor: options.liberatedColor,
                backgroundColor: `${options.liberatedColor}08`,
              },
            }}
          >
            <FormControlLabel
              value="liberado"
              control={
                <Radio
                  sx={{
                    color: options.liberatedColor,
                    "&.Mui-checked": {
                      color: options.liberatedColor,
                    },
                  }}
                />
              }
              label={
                <Typography variant="body2" sx={{ fontWeight: value === "liberado" ? 600 : 400 }}>
                  Todas las los ítems arriba mencionados cumplen marcaron en la columna SI.
                </Typography>
              }
            />
            
            <Box
              sx={{
                mt: 1,
                ml: 4,
                p: 1.5,
                borderRadius: 1,
                backgroundColor: value === "liberado" 
                  ? `${options.liberatedColor}15` 
                  : 'grey.50',
                border: 1,
                borderColor: value === "liberado" 
                  ? options.liberatedColor 
                  : 'grey.200',
                opacity: value === "liberado" ? 1 : 0.6,
                transition: 'all 0.2s'
              }}
            >
              <Typography 
                variant="caption" 
                sx={{ 
                  fontWeight: value === "liberado" ? 600 : 400,
                  color: value === "liberado" ? options.liberatedColor : 'text.secondary'
                }}
              >
                <strong>Acción:</strong> {options.liberatedLabel}
              </Typography>
            </Box>
          </Box>
        </RadioGroup>
      </FormControl>

      {errors.scaffold?.finalConclusion && (
        <Typography color="error" variant="caption" sx={{ mt: 1, display: "block" }}>
          {errors.scaffold.finalConclusion.message}
        </Typography>
      )}
    </Paper>
  );
}
