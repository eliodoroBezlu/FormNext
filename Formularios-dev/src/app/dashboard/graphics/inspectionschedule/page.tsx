'use client';
import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Container,
  Alert as MuiAlert,
  Button,
} from '@mui/material';
import SemaforoFormularios from './InspectionForm/SemaforoFormularios';
import { API_BASE_URL } from '@/lib/constants';
import { getAuthHeaders } from '@/lib/actions/helpers';

interface AnimoControlSemestral {
  formularioId: string;
  nombreFormulario: string;
  año: number;
  primerSemestre: {
    llenado: boolean;
    fechaLlenado?: string;
    formularioId?: string;
    estado: 'CUMPLIDO' | 'FUERA_PLAZO' | 'PENDIENTE' | 'CRITICO';
    porcentaje: number;
  };
  segundoSemestre: {
    llenado: boolean;
    fechaLlenado?: string;
    formularioId?: string;
    estado: 'CUMPLIDO' | 'FUERA_PLAZO' | 'PENDIENTE' | 'CRITICO';
    porcentaje: number;
  };
  alerta: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  instancias: any[];
  totalInstancias: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ultimaInstancia?: any;
}

export default function DashboardControlSemestralr() {
  const [datosControl, setDatosControl] = useState<AnimoControlSemestral[]>([]);
  const [año, setAño] = useState<number>(new Date().getFullYear());
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    cargarDatosControl();
  }, [año]);

  const cargarDatosControl = async () => {
    try {
      setCargando(true);
      setError(null);
      const headers = await getAuthHeaders();
      const templatesResponse = await fetch(`${API_BASE_URL}/templates`,{
        headers
      });
      if (!templatesResponse.ok) {
        throw new Error('Error al cargar templates');
      }
      const templates = await templatesResponse.json();

      const instancesResponse = await fetch(`${API_BASE_URL}/instances?limit=1000&populate=templateId`,{
        headers
      });
      if (!instancesResponse.ok) {
        throw new Error('Error al cargar instancias');
      }
      const instancesData = await instancesResponse.json();
      const instances = instancesData.data || [];

      const controlData = await procesarDatosControl(templates, instances, año);
      setDatosControl(controlData);

    } catch (error) {
      console.error('Error cargando datos:', error);
      setError('Error al cargar los datos del dashboard');
    } finally {
      setCargando(false);
    }
  };

  const procesarDatosControl = async (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    templates: any[],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
     instances: any[], año: number): Promise<AnimoControlSemestral[]> => {
    const controlData: AnimoControlSemestral[] = [];

    for (const template of templates) {
      const instanciasTemplate = instances.filter((
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        instancia: any) => {
        if (!instancia.templateId) {
          return false;
        }
        
        const templateId = instancia.templateId._id || instancia.templateId;
        const templateIdStr = templateId.toString();
        const currentTemplateIdStr = template._id.toString();

        if (templateIdStr !== currentTemplateIdStr) {
          return false;
        }

        const fechaInstancia = new Date(instancia.createdAt);
        const añoInstancia = fechaInstancia.getFullYear();
        
        return añoInstancia === año;
      });

      const instanciasOrdenadas = [...instanciasTemplate].sort((
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        a: any, 
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        b: any) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      const { primerSemestre, segundoSemestre } = analizarSemestres(instanciasTemplate, año);

      const ultimaInstancia = instanciasOrdenadas.length > 0 ? instanciasOrdenadas[0] : null;

      controlData.push({
        formularioId: template._id,
        nombreFormulario: template.name,
        año,
        primerSemestre,
        segundoSemestre,
        alerta: primerSemestre.estado === 'CRITICO' || segundoSemestre.estado === 'CRITICO',
        instancias: instanciasTemplate,
        totalInstancias: instanciasTemplate.length,
        ultimaInstancia: ultimaInstancia
      });
    }

    return controlData;
  };

  const analizarSemestres = (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    instancias: any[],
     año: number) => {
    const fechaLimitePrimerSemestre = new Date(año, 5, 30); 
    const fechaLimiteSegundoSemestre = new Date(año, 11, 31); 
    const hoy = new Date();

    const instanciasCompletadas = instancias.filter((
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      inst: any) => 
      inst.status === 'completado' || 
      inst.status === 'aprobado' || 
      inst.status === 'completado' ||
      inst.status === 'revisado' ||
      (inst.status !== 'borrador' && inst.status !== 'cancelado')
    );

    instanciasCompletadas.sort((
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      a: any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      b: any) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const instanciasPrimerSemestre = instanciasCompletadas.filter((
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      inst: any) => {
      const fechaInstancia = new Date(inst.createdAt);
      return fechaInstancia <= fechaLimitePrimerSemestre;
    });

    const instanciasSegundoSemestre = instanciasCompletadas.filter((
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      inst: any) => {
      const fechaInstancia = new Date(inst.createdAt);
      return fechaInstancia > fechaLimitePrimerSemestre && fechaInstancia <= fechaLimiteSegundoSemestre;
    });

    let primerSemestre = {
      llenado: false,
      fechaLlenado: undefined as string | undefined,
      formularioId: undefined as string | undefined,
      estado: 'PENDIENTE' as 'CUMPLIDO' | 'FUERA_PLAZO' | 'PENDIENTE' | 'CRITICO',
      porcentaje: 0
    };

    if (instanciasPrimerSemestre.length > 0) {
      const ultimaInstancia = instanciasPrimerSemestre[0];
      const fechaInstancia = new Date(ultimaInstancia.createdAt);
      
      primerSemestre = {
        llenado: true,
        fechaLlenado: ultimaInstancia.createdAt,
        formularioId: ultimaInstancia._id,
        estado: fechaInstancia <= fechaLimitePrimerSemestre ? 'CUMPLIDO' : 'FUERA_PLAZO',
        porcentaje: ultimaInstancia.overallCompliancePercentage || 0
      };
    } else if (hoy > fechaLimitePrimerSemestre) {
      primerSemestre.estado = 'CRITICO';
    }

    let segundoSemestre = {
      llenado: false,
      fechaLlenado: undefined as string | undefined,
      formularioId: undefined as string | undefined,
      estado: 'PENDIENTE' as 'CUMPLIDO' | 'FUERA_PLAZO' | 'PENDIENTE' | 'CRITICO',
      porcentaje: 0
    };

    if (instanciasSegundoSemestre.length > 0) {
      const ultimaInstancia = instanciasSegundoSemestre[0];
      const fechaInstancia = new Date(ultimaInstancia.createdAt);
      
      segundoSemestre = {
        llenado: true,
        fechaLlenado: ultimaInstancia.createdAt,
        formularioId: ultimaInstancia._id,
        estado: fechaInstancia <= fechaLimiteSegundoSemestre ? 'CUMPLIDO' : 'FUERA_PLAZO',
        porcentaje: ultimaInstancia.overallCompliancePercentage || 0
      };
    } else if (hoy > fechaLimiteSegundoSemestre) {
      segundoSemestre.estado = 'CRITICO';
    }

    return { primerSemestre, segundoSemestre };
  };

  if (cargando) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>
          Cargando datos del dashboard...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <MuiAlert severity="error" sx={{ mb: 2 }}>
          {error}
        </MuiAlert>
        <Box display="flex" gap={2}>
          <Button variant="contained" onClick={cargarDatosControl}>
            Reintentar
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Control Semestral de Formularios
        </Typography>
        <FormControl sx={{ minWidth: 120 }} size="small">
          <InputLabel>Año</InputLabel>
          <Select
            value={año}
            label="Año"
            onChange={(e) => setAño(Number(e.target.value))}
          >
            {[2023, 2024, 2025, 2026].map(year => (
              <MenuItem key={year} value={year}>{year}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Mostrando {datosControl.length} formularios con {datosControl.reduce((acc, curr) => 
            acc + curr.totalInstancias, 0
          )} respuestas en {año}
        </Typography>
      </Box>

      <Grid size={{xs:12, sm:12}}>
        <Card elevation={3}>
          <CardContent>
            <Typography variant="h6" component="h2" gutterBottom>
              Semáforo de Estados
            </Typography>
            <SemaforoFormularios datos={datosControl} />
          </CardContent>
        </Card>
      </Grid>
    </Container>
  );
}