// components/form-filler/specialized/CilindrosInspeccionForm.tsx
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
} from '@mui/material';
import { Save, Send, CheckCircle, Warning } from '@mui/icons-material';

// Importar solo componentes reutilizables
import { VerificationFields } from './VerificationsFields';
import { SectionRenderer } from './SectionRenderer';
import { FormTemplate, FormDataHerraEquipos, FormResponse } from './types/IProps';
import { SignatureField } from '../molecules/team-member-signature/SigantureField';

// ==================== TIPOS EXTENDIDOS ====================
interface CilindrosFormData extends FormDataHerraEquipos {
  firmaInspector: {
    realizadoPor: string;
    firma: string;
    fecha: string;
  };
  firmaSupervisor: {
    nombreSupervisor: string;
    firma: string;
    fecha: string;
  };
}

interface CilindrosFormResponse extends FormResponse {
  firmaInspector: {
    realizadoPor: string;
    firma: string;
    fecha: string;
  };
  firmaSupervisor: {
    nombreSupervisor: string;
    firma: string;
    fecha: string;
  };
}

// ==================== PROPS ====================
interface CilindrosInspeccionFormProps {
  template: FormTemplate;
  onSave?: (data: CilindrosFormResponse) => void;
  onSubmit?: (data: CilindrosFormResponse) => void;
  readonly?: boolean;
}

// ==================== COMPONENTE PRINCIPAL ====================
export const CilindrosInspeccionForm: React.FC<CilindrosInspeccionFormProps> = ({
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
  } = useForm<CilindrosFormData>({
    defaultValues: {
      verification: {},
      responses: {},
      firmaInspector: {
        realizadoPor: '',
        firma: '',
        fecha: new Date().toISOString().split('T')[0],
      },
      firmaSupervisor: {
        nombreSupervisor: '',
        firma: '',
        fecha: new Date().toISOString().split('T')[0],
      },
    },
  });


  const handleSaveDraft = (data: CilindrosFormData) => {
    const formResponse: CilindrosFormResponse = {
      templateId: template._id,
      verificationData: data.verification,
      responses: data.responses,
      firmaInspector: data.firmaInspector,
      firmaSupervisor: data.firmaSupervisor,
      submittedAt: new Date(),
      status: "draft",
    };

    console.log("Guardando borrador:", formResponse);
    setSaveMessage("Borrador guardado exitosamente");
    setTimeout(() => setSaveMessage(null), 3000);

    if (onSave) onSave(formResponse);
  };

  const handleFinalSubmit = (data: CilindrosFormData) => {
    const formResponse: CilindrosFormResponse = {
      templateId: template._id,
      verificationData: data.verification,
      responses: data.responses,
      firmaInspector: data.firmaInspector,
      firmaSupervisor: data.firmaSupervisor,
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
              label="Cilindros para Gases Comprimidos"
              color="secondary"
              sx={{ backgroundColor: 'white', color: '#ff6f00' }}
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

        {/* ==================== SECCIÓN ESPECÍFICA DE CILINDROS ==================== */}
        <Paper 
          elevation={3} 
          sx={{ 
            p: 3, 
            mb: 3, 
            border: '3px solid #f44336',
          }}
        >
          {/* Alerta de instrucciones */}
          <Alert severity="error" sx={{ mb: 3 }} icon={<Warning />}>
            <Typography variant="body1" fontWeight="bold" gutterBottom>
              QUE DEBE HACER SI MARCÓ ALGUNA CASILLA ROJA &quot;NO LO USE&quot;
            </Typography>
            <Typography variant="body2">
              Si luego de la inspección algún ítem no cumple con el estándar (cuando marca en cualquier 
              casilla roja) <strong>NO LO USE</strong>, estos deben ser removidos del lugar de trabajo, 
              señalizados y dados de baja si corresponde. Adicionalmente debe avisar inmediatamente a su 
              Supervisor o Responsable del área para su corrección.
            </Typography>
          </Alert>

         
        </Paper>

        {/* ==================== SECCIÓN DE FIRMAS CON SUPERVISOR ==================== */}
        <Paper 
          sx={{ 
            p: 3, 
            mb: 3,
            border: '2px solid #ff6f00'
          }}
        >
          <Typography variant="h6" gutterBottom>
            Firmas y Validación
          </Typography>

          {/* Firma del Inspector */}
          <Box sx={{ mb: 4 }}>
            <Typography 
              variant="subtitle1" 
              gutterBottom 
              sx={{ 
                backgroundColor: '#e3f2fd', 
                p: 1, 
                borderRadius: 1,
                fontWeight: 'bold'
              }}
            >
              Inspector
            </Typography>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 4 }}>
                <Controller
                  name="firmaInspector.realizadoPor"
                  control={control}
                  rules={{ required: "Campo obligatorio" }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Inspección Realizada Por"
                      placeholder="Nombre completo del inspector"
                      error={!!errors?.firmaInspector?.realizadoPor}
                      helperText={errors?.firmaInspector?.realizadoPor?.message}
                      disabled={readonly}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Firma Digital (Use el mouse o su dedo para firmar)
                  </Typography>
                  {readonly ? (
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
                        name="firmaInspector.firma"
                        control={control}
                        render={({ field }) => (
                          field.value ? (
                            <Box
                              component="img"
                              src={field.value}
                              alt="Firma Inspector"
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
                  ) : (
                    <SignatureField<CilindrosFormData>
                      fieldName="firmaInspector.firma"
                      control={control}
                      setValue={setValue}
                      heightPercentage={30}
                      format="png"
                      error={!!errors?.firmaInspector?.firma}
                      helperText={errors?.firmaInspector?.firma?.message || "Firme en el recuadro arriba"}
                    />
                  )}
                </Box>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <Controller
                  name="firmaInspector.fecha"
                  control={control}
                  rules={{ required: "Campo obligatorio" }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      type="date"
                      label="Fecha de Inspección"
                      InputLabelProps={{ shrink: true }}
                      error={!!errors?.firmaInspector?.fecha}
                      helperText={errors?.firmaInspector?.fecha?.message}
                      disabled={readonly}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </Box>

          {/* Firma del Supervisor */}
          <Box>
            <Typography 
              variant="subtitle1" 
              gutterBottom 
              sx={{ 
                backgroundColor: '#ffebee', 
                p: 1, 
                borderRadius: 1,
                fontWeight: 'bold'
              }}
            >
              Supervisor / Responsable del Área
            </Typography>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 4 }}>
                 <Controller
                name="firmaSupervisor.nombreSupervisor"
                control={control}
                rules={{ required: "El nombre del supervisor es obligatorio" }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Nombre del Supervisor"
                    placeholder="Nombre completo del supervisor"
                    error={!!errors?.firmaSupervisor?.nombreSupervisor}
                    helperText={errors?.firmaSupervisor?.nombreSupervisor?.message}
                    disabled={readonly}
                    sx={{ backgroundColor: 'white' }}
                  />
                )}
              />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Firma Digital del Supervisor
                  </Typography>
                  {readonly ? (
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
                        name="firmaSupervisor.firma"
                        control={control}
                        render={({ field }) => (
                          field.value ? (
                            <Box
                              component="img"
                              src={field.value}
                              alt="Firma Supervisor"
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
                  ) : (
                    <SignatureField<CilindrosFormData>
                    fieldName="firmaSupervisor.firma"
                    control={control}
                    setValue={setValue}
                    heightPercentage={30}
                    format="png"
                    error={!!errors?.firmaSupervisor?.firma}
                    helperText={errors?.firmaSupervisor?.firma?.message || "Firme en el recuadro arriba"}
                  />
                  )}
                </Box>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <Controller
                  name="firmaSupervisor.fecha"
                  control={control}
                 rules={{ required: "La fecha es obligatoria" }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      type="date"
                      label="Fecha de Aprobación"
                      InputLabelProps={{ shrink: true }}
                      error={!!errors?.firmaSupervisor?.fecha}
                      helperText={errors?.firmaSupervisor?.fecha?.message}
                      disabled={readonly}
                      sx={{ backgroundColor: 'white' }}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </Box>

          
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

export default CilindrosInspeccionForm;