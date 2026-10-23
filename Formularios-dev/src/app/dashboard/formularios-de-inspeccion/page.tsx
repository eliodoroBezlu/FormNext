"use client";

import { Suspense, useCallback, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Box,
  Typography,
  Grid,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  Chip,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { Description, Add } from "@mui/icons-material";
import { FormTemplate } from "@/types/formTypes";
import { rutaDelFormularioIro } from "@/components/features/iro-isop/domain/models/rutas";
import { getTemplates } from "@/lib/actions/template-actions";
import { BaseCard } from "@/components/ui/cards/BaseCard";
import { TemplateCard } from "@/components/ui/cards/TemplateCard";
import { InspeccionSistemasEmergencia } from "@/components/features/sistemas-emergencia/InspeccionSistemasEmergencia";
import NewInspectionTemplates from "@/components/features/herra-equipos/presentation/components/management/NewInspectionTemplates";

import PageHeader from "@/components/layout/page-header/PageHeader";

// Interfaz para formularios personalizados (Hardcoded por ahora)
interface CustomForm {
  id: string;
  title: string;
  description?: string;
  category: string;
  createdBy: string;
  createdAt: Date;
  status: "draft" | "published" | "archived";
  tags?: string[];
  type: "manual" | "imported" | "copied";
  component?: string;
}

// Mapa de componentes para formularios personalizados
const CUSTOM_FORM_COMPONENTS = {
  InspeccionSistemasEmergencia: InspeccionSistemasEmergencia,
  // 'InspeccionEPP': InspeccionEPP, // Futuros formularios
} as const;

/**
 * Formularios que no vienen del backend: estan escritos aqui.
 *
 * Antes se "cargaban" con una funcion `async` llamada desde un efecto,
 * pero no hay nada que esperar: son una constante. Como tal, sirven
 * directamente de estado inicial.
 */
const FORMULARIOS_FIJOS: CustomForm[] = [
      {
        id: "CF-001",
        title: "INSPECCIÓN DE SISTEMAS DE EMERGENCIA (MENSUAL - ÁREAS EXTERNAS)",
        description: "Sistemas de emergencia (extintores, salidas de emergencia, etc.)",
        category: "Seguridad",
        createdBy: "Sistema",
        createdAt: new Date("2024-01-15"),
        status: "published",
        tags: ["Mensual", "Evaluación"],
        type: "manual",
        component: "InspeccionSistemasEmergencia",
      },
    ];

/**
 * La pestaña vive en la dirección (`?tab=iro`): al volver de un formulario,
 * con «atrás» o al recargar, se cae en la misma pestaña y no en la primera.
 */
const PESTANAS = ["emergencia", "iro", "herramientas"] as const;

const pestanaDeLaUrl = (valor: string | null): number => {
  const i = PESTANAS.indexOf(valor as (typeof PESTANAS)[number]);
  return i >= 0 ? i : 0;
};

// `useSearchParams` exige un límite de Suspense en una página que se
// prerenderiza.
export default function FormulariosDeInspeccionPage() {
  return (
    <Suspense fallback={null}>
      <HomePage />
    </Suspense>
  );
}

function HomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // --- ESTADOS DE DATOS ---
  const [templates, setTemplates] = useState<FormTemplate[]>([]);
  // No es estado: nadie modifica la lista, es la constante de modulo.
  const customForms = FORMULARIOS_FIJOS;
  
  // --- ESTADOS DE NAVEGACIÓN Y VISTA ---
  // 'list': Muestra las tarjetas
  // 'customForm': Muestra componentes hardcoded (Sistemas Emergencia)
  // Los formularios IRO/ISOP tienen su propia ruta (`rutaDelFormularioIro`).
  const [currentView, setCurrentView] = useState<"list" | "customForm">("list");

  const [selectedCustomForm, setSelectedCustomForm] = useState<CustomForm | null>(null);
  // 0: Emergencia, 1: IRO ISOP, 2: Herramientas (ver `PESTANAS`)
  const tabValue = pestanaDeLaUrl(searchParams.get("tab"));
  const setTabValue = (indice: number) =>
    // `replace`: cambiar de pestaña no llena el historial de «atrás».
    router.replace(`/dashboard/formularios-de-inspeccion?tab=${PESTANAS[indice]}`, {
      scroll: false,
    });
  
  // --- ESTADOS DE UI ---
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  // Responsive
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md")); 
  const isSmall = useMediaQuery(theme.breakpoints.down("sm"));

  const aplicarTemplates = useCallback(
    (result: Awaited<ReturnType<typeof getTemplates>>) => {
      if (result.success) {
        setTemplates(result.data as FormTemplate[]);
        setError(null);
        return;
      }
      setError(result.error || "Error al cargar los templates");
    },
    [],
  );

  const avisarFallo = useCallback((err: unknown) => {
    setError(
      err instanceof Error ? err.message : "Error al cargar los templates",
    );
  }, []);

  // --- EFECTOS ---
  useEffect(() => {
    // La promesa se encadena aqui: llamar a la funcion `async` haria que el
    // analizador viera su `setLoading(true)` como setState sincrono.
    // (`loadCustomForms` desaparecio: su lista es una constante de modulo.)
    let vigente = true;

    getTemplates({ isActive: true })
      .then((result) => {
        if (vigente) aplicarTemplates(result);
      })
      .catch((err: unknown) => {
        if (vigente) avisarFallo(err);
      })
      .finally(() => {
        if (vigente) setLoading(false);
      });

    return () => {
      vigente = false;
    };
  }, [aplicarTemplates, avisarFallo]);


  // --- HANDLERS ---

  // Iniciar formulario IRO ISOP
  const handleCreateForm = (template: FormTemplate) => {
    router.push(rutaDelFormularioIro(template.code));
  };

  // Iniciar formulario Custom (Sistemas Emergencia)
  const handleUseCustomForm = (customForm: CustomForm) => {
    console.log("Usando formulario personalizado:", customForm);
    if (customForm.component === "InspeccionSistemasEmergencia") {
      router.push("/dashboard/formularios-de-inspeccion/sistemas-emergencia");
    } else {
      setSelectedCustomForm(customForm);
      setCurrentView("customForm");
    }
  };

  // --- RENDERIZADO DE COMPONENTES ---

  const renderCustomFormComponent = () => {
    if (!selectedCustomForm || !selectedCustomForm.component) {
      return (
        <Box p={3}>
          <Alert severity="error">No se pudo cargar el formulario personalizado</Alert>
        </Box>
      );
    }

    const ComponentToRender = CUSTOM_FORM_COMPONENTS[selectedCustomForm.component as keyof typeof CUSTOM_FORM_COMPONENTS];

    if (!ComponentToRender) {
      return (
        <Box p={3}>
          <Alert severity="error">
            Componente no encontrado: {selectedCustomForm.component}
          </Alert>
        </Box>
      );
    }

    // Nota: InspeccionSistemasEmergencia maneja su propio éxito internamente por ahora.
    // Simplemente le pasamos el callback de cancelar para volver a la lista.
    return <ComponentToRender onCancel={() => setCurrentView("list")} />;
  };

  const getTemplateActions = (template: FormTemplate) => {
    return [
      {
        label: "Llenar Formulario",
        icon: <Add />,
        onClick: () => handleCreateForm(template),
        variant: "contained" as const,
        fullWidth: true,
      },
    ];
  };

  const getCustomFormActions = (customForm: CustomForm) => {
    return [
      {
        label: "Usar Formulario",
        icon: <Description />,
        onClick: () => handleUseCustomForm(customForm),
        variant: "contained" as const,
        fullWidth: true,
      },
    ];
  };

  const renderCustomFormContent = (customForm: CustomForm) => {
    const formatDate = (date: Date) => {
      return new Intl.DateTimeFormat("es-ES", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }).format(date);
    };

    const getStatusColor = (status: string) => {
      switch (status) {
        case "published": return "success";
        case "draft": return "warning";
        case "archived": return "default";
        default: return "default";
      }
    };

    const getTypeLabel = (type: string) => {
      switch (type) {
        case "manual": return "Manual";
        case "imported": return "Importado";
        case "copied": return "Copia";
        default: return type;
      }
    };

    return (
      <>
        {customForm.description && (
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {customForm.description}
          </Typography>
        )}
        <Typography variant="body2" color="text.secondary" gutterBottom>
          <strong>Categoría:</strong> {customForm.category}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          <strong>Fecha:</strong> {formatDate(customForm.createdAt)}
        </Typography>
        <Box mt={1} display="flex" flexWrap="wrap" gap={0.5}>
          <Chip label={customForm.status} size="small" color={getStatusColor(customForm.status)} variant="outlined" />
          <Chip label={getTypeLabel(customForm.type)} size="small" color="info" variant="outlined" />
          {customForm.tags?.map((tag, index) => (
            <Chip key={index} label={tag} size="small" variant="outlined" />
          ))}
        </Box>
      </>
    );
  };

  // --- VISTAS ---

  // 3. FORMULARIO PERSONALIZADO (Sistemas Emergencia)
  if (currentView === "customForm" && selectedCustomForm) {
    return renderCustomFormComponent();
  }

  // 4. VISTA DE LISTADO (Default)
  return (
    <Box p={3}>
      <PageHeader
        title="Formularios de Inspección"
        description="Selecciona un formulario para completar"
      />

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box mb={3}>
        <Tabs
          value={tabValue}
          onChange={(_, newValue) => setTabValue(newValue)}
          variant={isMobile ? "scrollable" : "standard"}
          scrollButtons={isMobile ? "auto" : false}
          allowScrollButtonsMobile={true}
          sx={{
            "& .MuiTab-root": {
              fontSize: isSmall ? "0.8rem" : isMobile ? "0.9rem" : "1rem",
              minWidth: isSmall ? "unset" : 160,
              padding: isSmall ? theme.spacing(1, 1.5) : theme.spacing(1.5, 2),
            },
          }}
        >
          <Tab label={isSmall ? "Sist. Emergencia" : "Sistemas de emergencia"} />
          <Tab label="IRO's - ISOP" />
          <Tab label={isSmall ? "Herramientas" : "Herramientas y Equipos"} />
        </Tabs>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
          <Typography variant="body1" sx={{ ml: 2 }}>Cargando formularios...</Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          
          {/* TAB 0: SISTEMAS DE EMERGENCIA */}
          {tabValue === 0 &&
            customForms.map((form) => (
              <Grid key={form.id} size={{ xs: 12, sm: 6, md: 4 }}>
                <BaseCard
                  title={form.title}
                  subtitle={`ID: ${form.id}`}
                  actions={getCustomFormActions(form)}
                >
                  {renderCustomFormContent(form)}
                </BaseCard>
              </Grid>
            ))}

          {/* TAB 1: IRO ISOP */}
          {tabValue === 1 &&
            templates.map((template) => (
              <Grid key={template._id} size={{ xs: 12, sm: 6, md: 4 }}>
                <TemplateCard
                  template={template}
                  variant="inspection"
                  actions={getTemplateActions(template)}
                />
              </Grid>
            ))}

          {/* TAB 2: HERRAMIENTAS Y EQUIPOS */}
          {tabValue === 2 && (
            <Grid size={{ xs: 12 }}>
              <NewInspectionTemplates />
            </Grid>
          )}

          {/* ESTADO VACÍO */}
          {((tabValue === 0 && customForms.length === 0) || 
            (tabValue === 1 && templates.length === 0)) && (
            <Grid size={{ xs: 12 }}>
              <Box textAlign="center" py={8}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No hay formularios disponibles
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {tabValue === 1
                    ? "No se encontraron plantillas de formularios de inspección"
                    : "No se encontraron formularios disponibles en esta categoría"}
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      )}
    </Box>
  );
}