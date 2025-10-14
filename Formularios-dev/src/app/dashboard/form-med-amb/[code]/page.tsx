"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box, CircularProgress, Alert, Button
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { getTemplatesHerraEquipos } from '@/lib/actions/template-herra-equipos';

import { FormFiller } from '@/components/herra_equipos/FormRenderer';
import ArnesInspeccionForm from '@/components/herra_equipos/ArnesInspeccionForm';
import { FormTemplate } from '@/components/herra_equipos/types/IProps';
import CilindrosInspeccionForm from '@/components/herra_equipos/CilindrosInspeccionForm';


// Mapeo de códigos a componentes especializados
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SPECIALIZED_FORMS: Record<string, React.ComponentType<any>> = {
  '1.02.P06.F19': ArnesInspeccionForm,
  '1.02.P06.F20': CilindrosInspeccionForm,
  // 'ESC-001': EscalerasInspeccionForm,  // Futuro
  // 'EXT-001': ExtintoresInspeccionForm, // Futuro
};

export default function FormularioDinamicoPage() {
  const params = useParams();
  const router = useRouter();
  const code = decodeURIComponent(params.code as string);
  
  const [template, setTemplate] = useState<FormTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
  const loadTemplate = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await getTemplatesHerraEquipos();
      
      if (result.success) {
        const found = result.data.find((t) => t.code === code);

        if (found) {
          setTemplate({
            ...found,
            createdAt: new Date(found.createdAt),
            updatedAt: new Date(found.updatedAt),
          });
        } else {
          setError(`No se encontró el template con codigo: ${code}`);
        }
      } else {
        setError(result.error);
      }
    } catch {
      setError('Error al cargar el template');
    } finally {
      setLoading(false);
    }
  };

  loadTemplate();
}, [code]);

  

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSaveDraft = (data: any) => {
    console.log('Guardando borrador:', data);
    setSaveMessage('Borrador guardado exitosamente');
    setTimeout(() => setSaveMessage(null), 3000);
    // TODO: Implementar guardado en backend
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleFinalSubmit = (data: any) => {
    console.log('Enviando formulario:', data);
    setSaveMessage('Formulario enviado exitosamente');
    // TODO: Implementar envío a backend
    setTimeout(() => {
      router.push('/inspecciones/llenar');
    }, 2000);
  };

  // ============================================
  // RENDERIZADO CONDICIONAL
  // ============================================

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !template) {
    return (
      <Box p={3}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || 'Template no encontrado'}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => router.push('/dashboard/form-med-amb')}
        >
          Volver a la lista
        </Button>
      </Box>
    );
  }

  // Verificar si el template tiene un componente especializado
  const SpecializedComponent = SPECIALIZED_FORMS[template.code];

  if (SpecializedComponent) {
    // RENDERIZAR FORMULARIO ESPECIALIZADO
    return (
      
      <Box>
        {saveMessage && (
      <Alert severity="success" sx={{ m: 2 }}>
        {saveMessage}
      </Alert>
    )}
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => router.push('/dashboard/form-med-amb')}
          sx={{ m: 2 }}
        >
          Volver a la lista
        </Button>
        
        <SpecializedComponent
          template={template}
          onSave={handleSaveDraft}
          onSubmit={handleFinalSubmit}
        />
      </Box>
    );
  }

  // RENDERIZAR FORMULARIO GENÉRICO (FormFiller estándar)
  return (
    <Box>
      <Button
        variant="outlined"
        startIcon={<ArrowBack />}
        onClick={() => router.push('/dashboard/form-med-amb')}
        sx={{ m: 2 }}
      >
        Volver a la lista
      </Button>
      
      <FormFiller
        template={template}
        onSave={handleSaveDraft}
        onSubmit={handleFinalSubmit}
      />
    </Box>
  );
}
