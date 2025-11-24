"use client";

import { useState, useEffect } from "react";
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
import { FormInstance, FormTemplate } from "@/types/formTypes";
import { getTemplates } from "@/lib/actions/template-actions";
import { InspectionFormIroIsop } from "@/components/organisms/inspection-form-iro-isop/InspectionFormIroIsop";
import { BaseCard } from "@/components/molecules/base-card/BaseCard";
import { TemplateCard } from "@/components/molecules/template-card/TemplateCard";
import { InspeccionSistemasEmergencia } from "@/components/form-sistemas-emergencia/InspeccionSistemasEmergencia";
import LlenarFormulariosPage from "@/components/herra_equipos/FormHerraEquipos";

// Interfaz para formularios personalizados
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
const CUSTOM_FORM_COMPONENTS = {
  InspeccionSistemasEmergencia: InspeccionSistemasEmergencia,
  // 'InspeccionEPP': InspeccionEPP,
  // 'OtroFormulario': OtroFormulario,
} as const;

export default function HomePage() {
  const [templates, setTemplates] = useState<FormTemplate[]>([]);
  const [customForms, setCustomForms] = useState<CustomForm[]>([]);
  const [instances, setInstances] = useState<FormInstance[]>([]);
  const [currentView, setCurrentView] = useState<
    "list" | "form" | "customForm"
  >("list");
  const [selectedTemplate, setSelectedTemplate] = useState<FormTemplate | null>(
    null
  );
  const [selectedCustomForm, setSelectedCustomForm] =
    useState<CustomForm | null>(null); // Nuevo estado
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md")); // < 900px
  const isSmall = useMediaQuery(theme.breakpoints.down("sm"));

  // Cargar templates al montar el componente
  useEffect(() => {
    loadTemplates();
    loadCustomForms();
  }, []);

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
      setError(
        err instanceof Error ? err.message : "Error al cargar los templates"
      );
    } finally {
      setLoading(false);
    }
  };

  // Simular carga de formularios personalizados
  const loadCustomForms = async () => {
    const mockCustomForms: CustomForm[] = [
      {
        id: "CF-001",
        title:
          "INSPECCIÓN DE SISTEMAS DE EMERGENCIA (MENSUAL - ÁREAS EXTERNAS)",
        description:
          "Sistemas de emergencia (extintores, salidas de emergencia, etc.)",
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

  const handleCreateForm = (template: FormTemplate) => {
    setSelectedTemplate(template);
    setCurrentView("form");
  };

  const handleUseCustomForm = (customForm: CustomForm) => {
    console.log("Usando formulario personalizado:", customForm);
    setSelectedCustomForm(customForm);
    setCurrentView("customForm");
  };

  const renderCustomFormComponent = () => {
    if (!selectedCustomForm || !selectedCustomForm.component) {
      return (
        <Box p={3}>
          <Alert severity="error">
            No se pudo cargar el formulario personalizado
          </Alert>
        </Box>
      );
    }

    const ComponentToRender =
      CUSTOM_FORM_COMPONENTS[
        selectedCustomForm.component as keyof typeof CUSTOM_FORM_COMPONENTS
      ];

    if (!ComponentToRender) {
      return (
        <Box p={3}>
          <Alert severity="error">
            Componente de formulario no encontrado:{" "}
            {selectedCustomForm.component}
          </Alert>
        </Box>
      );
    }

    // Renderiza el componente tal como está (ya tiene todas sus acciones)
    return <ComponentToRender onCancel={() => setCurrentView("list")} />;
  };

  const handleSaveInstance = (instance: FormInstance) => {
    setInstances([...instances, instance]);
    setCurrentView("list");
    setSelectedTemplate(null);
    console.log("Formulario guardado:", instance);
  };

  // Función para generar las acciones de templates (solo crear formularios)
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

  // Función para generar las acciones de formularios personalizados (solo usar)
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
        case "published":
          return "success";
        case "draft":
          return "warning";
        case "archived":
          return "default";
        default:
          return "default";
      }
    };

    const getStatusLabel = (status: string) => {
      switch (status) {
        case "published":
          return "Publicado";
        case "draft":
          return "Borrador";
        case "archived":
          return "Archivado";
        default:
          return status;
      }
    };

    const getTypeLabel = (type: string) => {
      switch (type) {
        case "manual":
          return "Manual";
        case "imported":
          return "Importado";
        case "copied":
          return "Copia";
        default:
          return type;
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
          <Chip
            label={getStatusLabel(customForm.status)}
            size="small"
            color={getStatusColor(customForm.status)}
            variant="outlined"
          />

          <Chip
            label={getTypeLabel(customForm.type)}
            size="small"
            color="info"
            variant="outlined"
          />

          {customForm.tags?.map((tag, index) => (
            <Chip key={index} label={tag} size="small" variant="outlined" />
          ))}
        </Box>
      </>
    );
  };

  // Si está llenando un formulario, mostrar el componente de formulario
  if (currentView === "form" && selectedTemplate) {
    return (
      <InspectionFormIroIsop
        template={selectedTemplate}
        onSave={handleSaveInstance}
        onCancel={() => setCurrentView("list")}
      />
    );
  }
  if (currentView === "customForm" && selectedCustomForm) {
    return renderCustomFormComponent();
  }

  return (
    <Box p={3}>
      <Box mb={4}>
        <Typography variant="h3" gutterBottom>
          Formularios de Inspección
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Selecciona un formulario para completar
        </Typography>
      </Box>

      {/* Mostrar errores globales */}
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
              // Usa las mismas escalas de fontSize que tu tema
              fontSize: isSmall ? "0.8rem" : isMobile ? "0.9rem" : "1rem",
              minWidth: isSmall ? "unset" : 160,
              padding: isSmall ? theme.spacing(1, 1.5) : theme.spacing(1.5, 2), // Usa tu spacing
            },
            "& .MuiTabs-flexContainer": {
              flexWrap: "nowrap",
            },
          }}
        >
          <Tab
            label={
              isSmall
                ? "Sistemas de emergencia"
                : "Formularios de sistemas de emergencia"
            }
          />
          <Tab label={isSmall ? "IRO's - ISOP" : "Formularios IRO's - ISOP"} />

          <Tab
            label={
              isSmall
                ? "Herramientas y Equipos"
                : "Formularios de Inspección de herramientas y equipos"
            }
          />
        </Tabs>
      </Box>

      {loading ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="200px"
        >
          <CircularProgress />
          <Typography variant="body1" sx={{ ml: 2 }}>
            Cargando formularios...
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {/* Formularios personalizados - Segunda pestaña */}
          {/* Templates existentes - Primera pestaña */}
          {tabValue === 2 && (
            <Grid size={{ xs: 12 }}>
              <LlenarFormulariosPage/>
            </Grid>
          )}

          {tabValue === 1 &&
            templates.map((customForm) => (
              <Grid key={customForm._id} size={{ xs: 12, sm: 6, md: 4 }}>
                <TemplateCard
                  template={customForm}
                  variant="inspection"
                  actions={getTemplateActions(customForm)}
                />
              </Grid>
            ))}

          {/* Templates existentes - Primera pestaña */}
          {tabValue === 0 &&
            customForms.map((template) => (
              <Grid key={template.id} size={{ xs: 12, sm: 6, md: 4 }}>
                <BaseCard
                  title={template.title}
                  subtitle={`ID: ${template.id}`}
                  actions={getCustomFormActions(template)}
                >
                  {renderCustomFormContent(template)}
                </BaseCard>
              </Grid>
            ))}

          {/* Mensaje cuando no hay contenido */}
          {((tabValue === 0 && templates.length === 0) ||
            (tabValue === 1 && customForms.length === 0)) && (
            <Grid size={{ xs: 12 }}>
              <Box textAlign="center" py={8}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No hay formularios disponibles
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {tabValue === 0
                    ? "No se encontraron plantillas de formularios de inspección"
                    : "No se encontraron formularios IRO's - ISOP disponibles"}
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      )}
    </Box>
  );
}
