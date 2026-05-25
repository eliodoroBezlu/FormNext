// src/components/organisms/inspection-form-iro-isop/presentation/components/sections/InspectionTeamSection.tsx

import React from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Paper,
  Grid,
  IconButton,
  Box,
} from "@mui/material";
import { ExpandMore, Delete, Add } from "@mui/icons-material";
import { Button } from "@/components/atoms/button/Button";
import { Controller, useFormContext, type Control, type UseFormSetValue, type Path, type FieldArrayWithId } from "react-hook-form";
import AutocompleteTrabajador from "@/components/molecules/autocomplete-trabajador/AutocompleteTrabajador";
import { FormField } from "@/components/molecules/form-field/FormField";
import { SignatureField } from "@/components/molecules/team-member-signature/SigantureField";
import type { InspectionFormData } from "@/components/organisms/inspection-form-iro-isop/types/IProps";

interface InspectionTeamSectionProps {
  control: Control<InspectionFormData>;
  setValue: UseFormSetValue<InspectionFormData>;
  teamMembers: FieldArrayWithId<InspectionFormData, "inspectionTeam", "id">[];
  addTeamMember: () => void;
  removeTeamMember: (index: number) => void;
  readonly: boolean;
}

export const InspectionTeamSection = ({
  control,
  setValue,
  teamMembers,
  addTeamMember,
  removeTeamMember,
  readonly,
}: InspectionTeamSectionProps) => {
  const { formState: { errors } } = useFormContext();

  return (
    <Accordion elevation={2} sx={{ mb: 2 }} defaultExpanded>
      <AccordionSummary
        expandIcon={<ExpandMore />}
        sx={{ bgcolor: "primary.main", color: "white" }}
      >
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          EQUIPO DE INSPECCIÓN
        </Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ p: 2 }}>
        {teamMembers.map((member, index) => {
          const teamErrors = (errors.inspectionTeam as unknown as Record<string, unknown>[])?.[index];
          const signatureError = teamErrors?.firma;

          return (
            <Paper
              key={member.id}
              variant="outlined"
              sx={{
                mb: 2,
                p: 2,
                transition: "box-shadow 0.3s ease",
                "&:hover": {
                  boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.05)",
                },
              }}
            >
              <Grid container spacing={2} alignItems="center">
                <Grid size={{ xs: 12, md: 1 }}>
                  <Typography fontWeight="bold" color="primary" sx={{ textAlign: "center" }}>
                    #{index + 1}
                  </Typography>
                </Grid>
                
                <Grid size={{ xs: 12, md: 3 }}>
                  <Controller
                    name={`inspectionTeam.${index}.nombre`}
                    control={control}
                    rules={{ required: !readonly && "Requerido" }}
                    render={({ field, fieldState: { error } }) => (
                      <AutocompleteTrabajador
                        label={readonly ? "Nombre" : "Nombre *"}
                        value={field.value || null}
                        onChange={(nomina, trabajador) => {
                          field.onChange(nomina);
                          if (trabajador?.puesto)
                            setValue(
                              `inspectionTeam.${index}.cargo` as Path<InspectionFormData>,
                              trabajador.puesto
                            );
                        }}
                        error={!!error}
                        helperText={error?.message}
                        disabled={readonly}
                      />
                    )}
                  />
                </Grid>
                
                <Grid size={{ xs: 12, md: 3 }}>
                  <FormField
                    name={`inspectionTeam.${index}.cargo`}
                    control={control}
                    label={readonly ? "Cargo" : "Cargo *"}
                    rules={{ required: !readonly && "Requerido" }}
                    disabled={readonly}
                  />
                </Grid>
                
                <Grid size={{ xs: 12, md: 4 }}>
                  <Typography
                    variant="caption"
                    color={signatureError ? "error" : "text.secondary"}
                    sx={{ display: "block", mb: 0.5, fontWeight: "medium" }}
                  >
                    {readonly ? "Firma" : "Firma *"}
                  </Typography>
                  <Controller
                    name={`inspectionTeam.${index}.firma`}
                    control={control}
                    rules={{ required: !readonly && "La firma es obligatoria" }}
                    render={({ field, fieldState: { error } }) => (
                      <SignatureField<InspectionFormData>
                        fieldName={`inspectionTeam.${index}.firma`}
                        control={control}
                        setValue={setValue}
                        value={field.value}
                        onChange={field.onChange}
                        disabled={readonly}
                        heightPercentage={25}
                        error={!!error}
                        helperText={error?.message}
                      />
                    )}
                  />
                </Grid>
                
                {!readonly && teamMembers.length > 1 && (
                  <Grid size={{ xs: 12, md: 1 }} sx={{ textAlign: "center" }}>
                    <IconButton
                      color="error"
                      onClick={() => removeTeamMember(index)}
                      aria-label={`Eliminar miembro ${index + 1}`}
                    >
                      <Delete />
                    </IconButton>
                  </Grid>
                )}
              </Grid>
            </Paper>
          );
        })}
        {!readonly && (
          <Box display="flex" justifyContent="flex-end" sx={{ mt: 2 }}>
            <Button
              variant="outlined"
              startIcon={<Add />}
              onClick={addTeamMember}
            >
              Agregar Miembro
            </Button>
          </Box>
        )}
      </AccordionDetails>
    </Accordion>
  );
};
