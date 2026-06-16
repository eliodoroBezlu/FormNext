"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import {  FormTemplate } from "@/types/formTypes";
import { getTemplates } from "@/lib/actions/template-actions";
import { InspectionFormIroIsop } from "@/components/features/iro-isop/InspectionFormIroIsop";
import { BaseCard } from "@/components/ui/cards/BaseCard";
import { TemplateCard } from "@/components/ui/cards/TemplateCard";
import { InspeccionSistemasEmergencia } from "@/components/features/sistemas-emergencia/InspeccionSistemasEmergencia";
import NewInspectionTemplates from "@/components/features/herra-equipos/NewInspectionTemplates";
import { SuccessScreen } from "@/components/ui/feedback/SuccessScreen"; 

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

export default function HomePage() {
  const router = useRouter();

  // --- ESTADOS DE DATOS ---
  const [templates, setTemplates] = useState<FormTemplate[]>([]);
  const [customForms, setCustomForms] = useState<CustomForm[]>([]);
  
  // --- ESTADOS DE NAVEGACIÓN Y VISTA ---
  // 'list': Muestra las tarjetas
  // 'form': Muestra el formulario dinámico (IRO ISOP)
  // 'customForm': Muestra componentes hardcoded (Sistemas Emergencia)
  // 'success': Muestra la pantalla de éxito
  const [currentView, setCurrentView] = useState<"list" | "form" | "customForm" | "success">("list");
  
  const [selectedTemplate, setSelectedTemplate] = useState<FormTemplate | null>(null);
  const [selectedCustomForm, setSelectedCustomForm] = useState<CustomForm | null>(null);
  const [tabValue, setTabValue] = useState(0); // 0: Emergencia, 1: IRO ISOP, 2: Herramientas
  
  // --- ESTADOS DE UI ---
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Configuración para la pantalla de éxito dinámica
  const [successInfo, setSuccessInfo] = useState({
    title: "¡Formulario Guardado!",
    subtitle: "",
    redirectPath: "/dashboard/formularios-de-inspeccion"
  });

  // Responsive
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md")); 
  const isSmall = useMediaQuery(theme.breakpoints.down("sm"));

  // --- EFECTOS ---
  useEffect(() => {
    loadTemplates();
    loadCustomForms();
  }, []);

  // Carga de Templates del Backend (IRO ISOP)
  const loadTemplates = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getTemplates({ isActive: true });
      if (result.success) {
        setTemplates(result.data as FormTemplate[]);
      } else {
        setError(result.error || "Error al cargar los templates");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar los templates");
    } finally {
      setLoading(false);
    }
  };

  // Carga de Formularios Hardcoded (Sistemas Emergencia)
  const loadCustomForms = async () => {
    const mockCustomForms: CustomForm[] = [
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
    setCustomForms(mockCustomForms);
  };

  // --- HANDLERS ---

  // Iniciar formulario IRO ISOP
  const handleCreateForm = (template: FormTemplate) => {
    setSelectedTemplate(template);
    setCurrentView("form");
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

  // Función centralizada para mostrar éxito
  const handleSuccess = (title: string, subtitle: string) => {
    setSuccessInfo({
        title,
        subtitle,
        redirectPath: "/dashboard/formularios-de-inspeccion"
    });
    setCurrentView("success");
  };

  // Callback cuando IRO ISOP se guarda correctamente
  const handleSaveInstanceIroIsop = () => {
    handleSuccess(
        "¡Inspección IRO - ISOP Guardada!",
        `Se ha registrado correctamente el formulario: ${selectedTemplate?.name}`
    );
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

  // 1. PANTALLA DE ÉXITO (Global)
  if (currentView === "success") {
    return (
      <SuccessScreen 
        title={successInfo.title}
        subtitle={successInfo.subtitle}
        autoRedirect={true}
        redirectDelay={3000}
        onBackToList={() => setCurrentView("list")}
        onViewDetails={() => console.log("Detalles no implementado aquí")}
        redirectPath={successInfo.redirectPath}
      />
    );
  }

  // 2. FORMULARIO IRO ISOP
  if (currentView === "form" && selectedTemplate) {
    return (
      <InspectionFormIroIsop
        template={selectedTemplate}
        onSave={handleSaveInstanceIroIsop} // Llama a nuestra función de éxito
        onCancel={() => setCurrentView("list")}
      />
    );  
  }

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