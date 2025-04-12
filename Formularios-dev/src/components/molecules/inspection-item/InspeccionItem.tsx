import {
  Grid,
  Typography,
  Radio,
  FormControlLabel,
  RadioGroup,
} from "@mui/material";
import {  Controller } from "react-hook-form";
import { FormTextField } from "@/components/atoms/form-text-field/FormTextField";
import type { IProps } from "./types/IProps";


export const InspectionItem = ({
  titleIndex,
  sectionIndex,
  itemIndex,
  description,
  control,
}: IProps) => {
  const fieldName = `resultados.${titleIndex}.items.${sectionIndex}.items.${itemIndex}` as const

  return (
    <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
      <Grid size={{ xs: 6}}>
        <Typography>{description}</Typography>
      </Grid>
      <Grid size={{ xs: 4}}>
        <Controller
          name={`${fieldName}.response`}
          control={control}
          render={({ field }) => (
            <RadioGroup
              {...field}
              row
              value={field.value ?? ""}
              onChange={(e) => field.onChange(e.target.value)}
            >
              {[
                { value: "si", label: "Sí" },
                { value: "no", label: "No" },
                { value: "na", label: "No aplica" },
              ].map((option) => (
                <FormControlLabel
                  key={option.value}
                  value={option.value}
                  control={<Radio />}
                  label={option.label}
                />
              ))}
            </RadioGroup>
          )}
        />
      </Grid>
      <Grid size={{ xs: 2}}>
        <FormTextField
          name={`${fieldName}.observation`}
          control={control}
          label="Observaciones"
          size="small"
        />
      </Grid>
    </Grid>
  );
};
