// components/form-filler/specialized/ArnesInspeccionForm.tsx
"use client";

import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Alert,
  Grid,
  Paper,
  Chip,
  FormControlLabel,
  Checkbox,
  Divider,
} from '@mui/material';
import { Save, Send, CheckCircle } from '@mui/icons-material';

// Importar solo componentes reutilizables
import { VerificationFields } from './VerificationsFields';
import { SectionRenderer } from './SectionRenderer';
import { FormTemplate, FormDataHerraEquipos, FormResponse } from './types/IProps';
import { SignatureField } from '../molecules/team-member-signature/SigantureField';

// ==================== TIPOS EXTENDIDOS ====================
interface ArnesFormData extends FormDataHerraEquipos {
  arnesInspeccion: {
    operativo: 'si' | 'no' | null;
    observaciones: string;
  };
  firmas: {
    realizadoPor: string;
    firma: string;
    fecha: string;
  };
}

interface ArnesFormResponse extends FormResponse {
  arnesInspeccion: {
    operativo: 'si' | 'no' | null;
    observaciones: string;
  };
  firmas: {
    realizadoPor: string;
    firma: string;
    fecha: string;
  };
}

// ==================== PROPS ====================
interface ArnesInspeccionFormProps {
  template: FormTemplate;
  onSave?: (data: ArnesFormResponse) => void;
  onSubmit?: (data: ArnesFormResponse) => void;
  readonly?: boolean;
}

// ==================== COMPONENTE PRINCIPAL ====================
export const ArnesInspeccionForm: React.FC<ArnesInspeccionFormProps> = ({
  template,
  onSave,
  onSubmit,
  readonly = false,
}) => {
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ArnesFormData>({
    defaultValues: {
      verification: {},
      responses: {},
      arnesInspeccion: {
        operativo: null,
        observaciones: '',
      },
      firmas: {
        realizadoPor: '',
        firma: '',
        fecha: new Date().toISOString().split('T')[0],
      },
    },
  });


  

  const handleSaveDraft = (data: ArnesFormData) => {
    const formResponse: ArnesFormResponse = {
      templateId: template._id,
      verificationData: data.verification,
      responses: data.responses,
      arnesInspeccion: data.arnesInspeccion,
      firmas: data.firmas,
      submittedAt: new Date(),
      status: "draft",
    };

    console.log("Guardando borrador:", formResponse);
    setSaveMessage("Borrador guardado exitosamente");
    setTimeout(() => setSaveMessage(null), 3000);

    if (onSave) onSave(formResponse);
  };

  const handleFinalSubmit = (data: ArnesFormData) => {
    const formResponse: ArnesFormResponse = {
      templateId: template._id,
      verificationData: data.verification,
      responses: data.responses,
      arnesInspeccion: data.arnesInspeccion,
      firmas: data.firmas,
      submittedAt: new Date(),
      status: "completed",
    };

    console.log("Enviando formulario:", formResponse);
    setSaveMessage("Formulario enviado exitosamente");

    if (onSubmit) onSubmit(formResponse);
  };
  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto', p: 3 }}>
      {/* ==================== HEADER ==================== */}
      <Card sx={{ mb: 3, backgroundColor: '#1976d2', color: 'white' }}>
        <CardContent>
          <Typography variant="h4" gutterBottom>
            {template.name}
          </Typography>
          <Box display="flex" gap={2} flexWrap="wrap">
            <Chip 
              label={`Código: ${template.code}`} 
              sx={{ backgroundColor: 'white' }} 
            />
            <Chip 
              label={template.revision} 
              sx={{ backgroundColor: 'white' }} 
            />
            <Chip
              label={template.type === 'interna' ? 'Inspección Interna' : 'Inspección Externa'}
              sx={{ backgroundColor: 'white' }}
            />
            <Chip
              label="Arnés y Conector"
              color="secondary"
              sx={{ backgroundColor: 'white', color: '#e91e63' }}
            />
          </Box>
        </CardContent>
      </Card>

      {saveMessage && (
        <Alert severity="success" sx={{ mb: 3 }} icon={<CheckCircle />}>
          {saveMessage}
        </Alert>
      )}

      <form onSubmit={handleSubmit(handleFinalSubmit)}>
        {/* ==================== CAMPOS DE VERIFICACIÓN ==================== */}
        <VerificationFields
          fields={template.verificationFields}
          control={control}
          errors={errors}
          readonly={readonly}
        />

        

        {/* ==================== SECCIONES NORMALES ==================== */}
        {template.sections && template.sections.length > 0 && (
          <Box mb={3}>
            <Typography variant="h6" gutterBottom sx={{ px: 2 }}>
              Preguntas de Inspección Adicionales
            </Typography>
            {template.sections.map((section, sIdx) => (
              <SectionRenderer
                key={section._id || sIdx}
                section={section}
                sectionPath={`responses.s${sIdx}`}
                control={control}
                errors={errors}
                readonly={readonly}
              />
            ))}
          </Box>
        )}

        {/* ==================== SECCIÓN ESPECÍFICA DEL ARNÉS ==================== */}
        <Paper 
          elevation={3} 
          sx={{ 
            p: 3, 
            mb: 3, 
            border: '3px solid #f44336',
          }}
        >
          {/* Alerta de instrucciones */}
          <Alert severity="error" sx={{ mb: 3 }}>
            <Typography variant="body1" fontWeight="bold" gutterBottom>
              QUE DEBE HACER SI MARCÓ ALGUNA CASILLA ROJA &quot;NO LO USE&quot;
            </Typography>
            <Typography variant="body2">
              Si usted nota que el arnés, conector u otro de los dispositivos inspeccionados 
              se encuentra <strong>EN MAL ESTADO O DEFECTUOSO</strong>, estos deben ser removidos 
              cuanto antes del lugar de trabajo y dados de baja cortándolos (coordine con su Supervisor). 
              <strong>&quot;NO LO USE&quot;</strong>
            </Typography>
          </Alert>

          <Grid container spacing={3}>
            

            {/* Columna derecha: OPERATIVO */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper 
                elevation={2}
                sx={{ 
                  p: 3, 
                  backgroundColor: '#fff9c4',
                  border: '2px solid #fbc02d',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <Typography 
                  variant="h5" 
                  align="center" 
                  gutterBottom
                  sx={{ 
                    fontWeight: 'bold',
                    color: '#f57f17'
                  }}
                >
                  OPERATIVO
                </Typography>

                <Divider sx={{ my: 2 }} />

                {/* Checkboxes SI/NO */}
                <Controller
                  name="arnesInspeccion.operativo"
                  control={control}
                  rules={{ required: "Debe indicar si el equipo es operativo" }}
                  render={({ field }) => (
                    <Box>
                      <Box 
                        display="flex" 
                        justifyContent="space-around" 
                        mb={2}
                        sx={{ 
                          backgroundColor: 'white',
                          p: 2,
                          borderRadius: 1
                        }}
                      >
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={field.value === 'si'}
                              onChange={() => field.onChange('si')}
                              disabled={readonly}
                              sx={{ 
                                '& .MuiSvgIcon-root': { fontSize: 32 },
                                color: '#4caf50',
                                '&.Mui-checked': { color: '#4caf50' }
                              }}
                            />
                          }
                          label={
                            <Typography variant="h6" fontWeight="bold" color="#4caf50">
                              SI
                            </Typography>
                          }
                        />
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={field.value === 'no'}
                              onChange={() => field.onChange('no')}
                              disabled={readonly}
                              sx={{ 
                                '& .MuiSvgIcon-root': { fontSize: 32 },
                                color: '#f44336',
                                '&.Mui-checked': { color: '#f44336' }
                              }}
                            />
                          }
                          label={
                            <Typography variant="h6" fontWeight="bold" color="#f44336">
                              NO
                            </Typography>
                          }
                        />
                      </Box>
                      
                      {errors?.arnesInspeccion?.operativo && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                          <Typography variant="caption">
                            {errors.arnesInspeccion.operativo.message}
                          </Typography>
                        </Alert>
                      )}
                    </Box>
                  )}
                />

                <Divider sx={{ my: 2 }} />

                {/* Observaciones complementarias */}
                <Box flexGrow={1}>
                  <Typography 
                    variant="subtitle1" 
                    gutterBottom 
                    fontWeight="bold"
                    align="center"
                  >
                    Observaciones Complementarias
                  </Typography>
                  <Controller
                    name="arnesInspeccion.observaciones"
                    control={control}
                    rules={{
                      validate: (value, formValues) => {
                        // Validación: Si marcó NO, las observaciones son obligatorias
                        if (formValues.arnesInspeccion?.operativo === 'no' && !value?.trim()) {
                          return 'Las observaciones son obligatorias cuando el equipo NO es operativo';
                        }
                        return true;
                      }
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        value={field.value || ''}
                        fullWidth
                        multiline
                        rows={8}
                        placeholder="Escriba sus observaciones aquí..."
                        disabled={readonly}
                        error={!!errors?.arnesInspeccion?.observaciones}
                        helperText={errors?.arnesInspeccion?.observaciones?.message}
                        sx={{ 
                          backgroundColor: 'white',
                          '& .MuiOutlinedInput-root': {
                            '& textarea': {
                              height: '100% !important'
                            }
                          }
                        }}
                      />
                    )}
                  />
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Paper>
        {/* ==================== SECCIÓN DE FIRMAS ==================== */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Firmas y Validación
          </Typography>
          <Grid container spacing={3}>
            {/* Nombre del Inspector */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Controller
                name="firmas.realizadoPor"
                control={control}
                rules={{ required: "Campo obligatorio" }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Inspección Realizada Por"
                    placeholder="Nombre completo"
                    error={!!errors?.firmas?.realizadoPor}
                    helperText={errors?.firmas?.realizadoPor?.message}
                    disabled={readonly}
                  />
                )}
              />
            </Grid>

            {/* Campo de Firma con Canvas */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Firma Digital (Use el mouse o su dedo para firmar)
                </Typography>
                {readonly && (
                  // Mostrar firma existente en modo readonly
                  <Box
                    sx={{
                      border: '2px solid #ddd',
                      borderRadius: 1,
                      p: 2,
                      backgroundColor: '#f5f5f5',
                      minHeight: 150,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Controller
                      name="firmas.firma"
                      control={control}
                      render={({ field }) => (
                        field.value ? (
                          <Box
                            component="img"
                            src={field.value}
                            alt="Firma"
                            sx={{
                              maxWidth: '100%',
                              maxHeight: 150,
                              objectFit: 'contain',
                            }}
                          />
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                            Sin firma
                          </Typography>
                        )
                      )}
                    />
                  </Box>
                )}
                {!readonly && (
                  <SignatureField<ArnesFormData>
                    fieldName="firmas.firma"
                    control={control}
                    setValue={setValue}
                    heightPercentage={30}
                    format="png"
                    error={!!errors?.firmas?.firma}
                    helperText={errors?.firmas?.firma?.message || "Firme en el recuadro arriba"}
                  />
                )}
              </Box>
            </Grid>

            {/* Fecha */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Controller
                name="firmas.fecha"
                control={control}
                rules={{ required: "Campo obligatorio" }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type="date"
                    label="Fecha"
                    InputLabelProps={{ shrink: true }}
                    error={!!errors?.firmas?.fecha}
                    helperText={errors?.firmas?.fecha?.message}
                    disabled={readonly}
                  />
                )}
              />
            </Grid>
          </Grid>
        </Paper>

        {/* ==================== BOTONES DE ACCIÓN ==================== */}
        {!readonly && (
          <Box display="flex" gap={2} justifyContent="flex-end">
            <Button
              variant="outlined"
              startIcon={<Save />}
              onClick={handleSubmit(handleSaveDraft)}
            >
              Guardar Borrador
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={<Send />}
            >
              Enviar Formulario
            </Button>
          </Box>
        )}
      </form>
    </Box>
  );
};

export default ArnesInspeccionForm;