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
import { CheckCircle, Cancel } from "@mui/icons-material";
import { ConclusionConfig, FormDataHerraEquipos } from "./types/IProps";

interface ScaffoldConclusionSectionProps {
  config: ConclusionConfig;
  register: UseFormRegister<FormDataHerraEquipos>;
  errors: FieldErrors<FormDataHerraEquipos>;
  value?: "liberated" | "not_liberated";
  onChange?: (value: "liberated" | "not_liberated") => void;
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
          onChange={(e) => onChange?.(e.target.value as "liberated" | "not_liberated")}
        >
          {/* Opción: NO Liberado */}
          <Box
            sx={{
              mb: 2,
              p: 2,
              border: 2,
              borderColor: value === "not_liberated" ? options.notLiberatedColor : "grey.300",
              borderRadius: 1,
              backgroundColor: value === "not_liberated" ? `${options.notLiberatedColor}15` : "transparent",
              transition: "all 0.2s",
              "&:hover": {
                borderColor: options.notLiberatedColor,
                backgroundColor: `${options.notLiberatedColor}08`,
              },
            }}
          >
            <FormControlLabel
              value="not_liberated"
              control={
                <Radio
                  sx={{
                    color: options.notLiberatedColor,
                    "&.Mui-checked": {
                      color: options.notLiberatedColor,
                    },
                  }}
                  icon={<Cancel />}
                  checkedIcon={<Cancel />}
                />
              }
              label={
                <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: value === "not_liberated" ? 600 : 400 }}>
                    Alguno de los ítems arriba mencionados marcó en la columna NO.
                  </Typography>
                </Box>
              }
            />
            <Alert
              severity="error"
              sx={{
                mt: 1,
                ml: 4,
                backgroundColor: `${options.notLiberatedColor}10`,
                "& .MuiAlert-icon": { color: options.notLiberatedColor },
              }}
            >
              {options.notLiberatedLabel}
            </Alert>
          </Box>

          {/* Opción: Liberado */}
          <Box
            sx={{
              p: 2,
              border: 2,
              borderColor: value === "liberated" ? options.liberatedColor : "grey.300",
              borderRadius: 1,
              backgroundColor: value === "liberated" ? `${options.liberatedColor}15` : "transparent",
              transition: "all 0.2s",
              "&:hover": {
                borderColor: options.liberatedColor,
                backgroundColor: `${options.liberatedColor}08`,
              },
            }}
          >
            <FormControlLabel
              value="liberated"
              control={
                <Radio
                  sx={{
                    color: options.liberatedColor,
                    "&.Mui-checked": {
                      color: options.liberatedColor,
                    },
                  }}
                  icon={<CheckCircle />}
                  checkedIcon={<CheckCircle />}
                />
              }
              label={
                <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: value === "liberated" ? 600 : 400 }}>
                    Todas las los ítems arriba mencionados cumplen marcaron en la columna SI.
                  </Typography>
                </Box>
              }
            />
            <Alert
              severity="success"
              sx={{
                mt: 1,
                ml: 4,
                backgroundColor: `${options.liberatedColor}10`,
                "& .MuiAlert-icon": { color: options.liberatedColor },
              }}
            >
              {options.liberatedLabel}
            </Alert>
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