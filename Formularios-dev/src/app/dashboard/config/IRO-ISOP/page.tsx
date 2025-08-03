"use client"

import { useState, useEffect } from "react"
import { Box, Typography, Grid, Fab, Tabs, Tab, Alert, CircularProgress, Chip, Button } from "@mui/material"
import { Add, Edit, Delete, Description } from "@mui/icons-material"
import { FormInstance, FormTemplate } from "@/types/formTypes"
import { deleteTemplate, getTemplates } from "@/lib/actions/template-actions"
import { FormBuilder } from "@/components/organisms/form-builder/FormBuilder"
import { InspectionFormIroIsop } from "@/components/organisms/inspection-form-iro-isop/InspectionFormIroIsop"
import { TemplateCard } from "@/components/molecules/template-card/TemplateCard"
import { BaseCard } from "@/components/molecules/base-card/BaseCard"

// Interfaz para formularios personalizados
interface CustomForm {
  id: string
  title: string
  description?: string
  category: string
  createdBy: string
  createdAt: Date
  status: 'draft' | 'published' | 'archived'
  tags?: string[]
  type: 'manual' | 'imported' | 'copied'
}

export default function HomePage() {
  const [templates, setTemplates] = useState<FormTemplate[]>([])
  const [customForms, setCustomForms] = useState<CustomForm[]>([])
  const [instances, setInstances] = useState<FormInstance[]>([])
  const [currentView, setCurrentView] = useState<"list" | "create" | "edit" | "form" | "create-custom">("list")
  const [selectedTemplate, setSelectedTemplate] = useState<FormTemplate | null>(null)
  const [selectedCustomForm, setSelectedCustomForm] = useState<CustomForm | null>(null)
  const [tabValue, setTabValue] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Cargar templates al montar el componente
  useEffect(() => {
    loadTemplates()
    loadCustomForms()
  }, [])

  const loadTemplates = async () => {
    setLoading(true)
    setError(null)

    try {
      const result = await getTemplates({ isActive: true })

      if (result.success) {
        setTemplates(result.data)
      } else {
        setError(result.error || "Error al cargar los templates")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar los templates")
    } finally {
      setLoading(false)
    }
  }

  // Simular carga de formularios personalizados (reemplaza con tu lógica real)
  const loadCustomForms = async () => {
    // Datos de ejemplo - reemplaza con tu API call
    const mockCustomForms: CustomForm[] = [
      // {
      //   id: "CF-001",
      //   title: "Evaluación de Desempeño Anual",
      //   description: "Formulario personalizado para evaluaciones anuales",
      //   category: "Recursos Humanos",
      //   createdBy: "María García",
      //   createdAt: new Date("2024-01-15"),
      //   status: "published",
      //   tags: ["HR", "Anual", "Evaluación"],
      //   type: "manual"
      // },
      // {
      //   id: "CF-002", 
      //   title: "Checklist de Seguridad",
      //   description: "Lista de verificación personalizada para auditorías",
      //   category: "Seguridad",
      //   createdBy: "Carlos López",
      //   createdAt: new Date("2024-02-20"),
      //   status: "draft",
      //   tags: ["Seguridad", "Checklist"],
      //   type: "manual"
      // }
    ]
    
    setCustomForms(mockCustomForms)
  }

  const handleCreateTemplate = () => {
    setSelectedTemplate(null)
    setCurrentView("create")
  }

  const handleCreateCustomForm = () => {
    setSelectedCustomForm(null)
    setCurrentView("create-custom")
  }

  const handleEditTemplate = (template: FormTemplate) => {
    setSelectedTemplate(template)
    setCurrentView("edit")
  }

  const handleEditCustomForm = (customForm: CustomForm) => {
    setSelectedCustomForm(customForm)
    setCurrentView("create-custom")
    // Aquí podrías abrir un editor diferente para formularios personalizados
  }

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este template?")) {
      return
    }

    try {
      const result = await deleteTemplate(templateId)

      if (result.success) {
        await loadTemplates()
      } else {
        setError(result.error || "Error al eliminar el template")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar el template")
    }
  }

  const handleDeleteCustomForm = async (customFormId: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este formulario personalizado?")) {
      return
    }

    try {
      // Aquí iría tu lógica para eliminar formulario personalizado
      setCustomForms(prev => prev.filter(form => form.id !== customFormId))
      console.log("Eliminando formulario personalizado:", customFormId)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar el formulario personalizado")
    }
  }



  const handleSaveTemplate = async () => {
    await loadTemplates()
    setCurrentView("list")
    setSelectedTemplate(null)
  }

  const handleCreateForm = (template: FormTemplate) => {
    setSelectedTemplate(template)
    setCurrentView("form")
  }

  const handleUseCustomForm = (customForm: CustomForm) => {
    console.log("Usando formulario personalizado:", customForm)
    // Aquí podrías abrir el formulario personalizado para ser llenado
  }

  const handleSaveInstance = (instance: FormInstance) => {
    setInstances([...instances, instance])
    setCurrentView("list")
    setSelectedTemplate(null)
    console.log("Formulario guardado:", instance)
  }

  // Función para generar las acciones de templates según el contexto
  const getTemplateActions = (template: FormTemplate) => {
    if (tabValue === 0) {
      // Tab de "Gestionar Plantillas" - acciones de administración
      return [
        {
          label: "Editar",
          icon: <Edit />,
          onClick: () => handleEditTemplate(template),
          variant: "outlined" as const,
          size: "small" as const
        },
        {
          label: "Eliminar",
          icon: <Delete />,
          onClick: () => handleDeleteTemplate(template._id),
          variant: "outlined" as const,
          color: "error" as const,
          size: "small" as const
        }
      ]
    } else {
      // Tab de "Crear Formularios" - acción de creación
      return [
        {
          label: "Crear Formulario",
          icon: <Add />,
          onClick: () => handleCreateForm(template),
          variant: "contained" as const,
          fullWidth: true
        }
      ]
    }
  }

  // Función para generar las acciones de formularios personalizados
  const getCustomFormActions = (customForm: CustomForm) => {
    if (tabValue === 0) {
      // Tab de "Gestionar Plantillas" - acciones de administración
      return [
        {
          label: "Editar",
          icon: <Edit />,
          onClick: () => handleEditCustomForm(customForm),
          variant: "outlined" as const,
          size: "small" as const
        },
        {
          label: "Eliminar",
          icon: <Delete />,
          onClick: () => handleDeleteCustomForm(customForm.id),
          variant: "outlined" as const,
          color: "error" as const,
          size: "small" as const
        }
      ]
    } else {
      // Tab de "Crear Formularios" - acción de uso
      return [
        {
          label: "Usar Formulario",
          icon: <Description />,
          onClick: () => handleUseCustomForm(customForm),
          variant: "contained" as const,
          fullWidth: true
        }
      ]
    }
  }

  const renderCustomFormContent = (customForm: CustomForm) => {
    const formatDate = (date: Date) => {
      return new Intl.DateTimeFormat('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }).format(date)
    }

    const getStatusColor = (status: string) => {
      switch (status) {
        case 'published': return 'success'
        case 'draft': return 'warning'
        case 'archived': return 'default'
        default: return 'default'
      }
    }

    const getStatusLabel = (status: string) => {
      switch (status) {
        case 'published': return 'Publicado'
        case 'draft': return 'Borrador'
        case 'archived': return 'Archivado'
        default: return status
      }
    }

    const getTypeLabel = (type: string) => {
      switch (type) {
        case 'manual': return 'Manual'
        case 'imported': return 'Importado'
        case 'copied': return 'Copia'
        default: return type
      }
    }

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
          <strong>Creado por:</strong> {customForm.createdBy}
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
            <Chip 
              key={index} 
              label={tag} 
              size="small" 
              variant="outlined" 
            />
          ))}
        </Box>
      </>
    )
  }

  if (currentView === "create" || currentView === "edit") {
    return (
      <FormBuilder 
        template={selectedTemplate} 
        onSave={handleSaveTemplate} 
        onCancel={() => setCurrentView("list")} 
      />
    )
  }

  if (currentView === "create-custom") {
    return (
      <Box p={3}>
        <Typography variant="h4" gutterBottom>
          {selectedCustomForm ? 'Editar' : 'Crear'} Formulario Personalizado
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Aquí iría tu editor de formularios personalizados
        </Typography>
        <Button 
          variant="outlined" 
          onClick={() => setCurrentView("list")}
        >
          Volver
        </Button>
      </Box>
    )
  }

  if (currentView === "form" && selectedTemplate) {
    return (
      <InspectionFormIroIsop 
        template={selectedTemplate} 
        onSave={handleSaveInstance} 
        onCancel={() => setCurrentView("list")} 
      />
    )
  }

  return (
    <Box p={3}>
      <Box mb={4}>
        <Typography variant="h3" gutterBottom>
          Sistema de Formularios de Inspección
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Gestiona plantillas y formularios personalizados
        </Typography>
      </Box>

      {/* Mostrar errores globales */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box mb={3}>
        <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
          <Tab label="Gestionar Plantillas" />
          <Tab label="Crear Formularios" />
        </Tabs>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
          <Typography variant="body1" sx={{ ml: 2 }}>
            Cargando contenido...
          </Typography>
        </Box>
      ) : (
        <>
          <Grid container spacing={3}>
            {/* Templates existentes */}
            {templates.map((template) => (
              <Grid key={template._id} size={{ xs: 12, sm: 6, md: 4 }}>
                <TemplateCard
                  template={template}
                  variant={tabValue === 1 ? "inspection" : "default"}
                  actions={getTemplateActions(template)}
                />
              </Grid>
            ))}

            {/* Formularios personalizados */}
            {customForms.map((customForm) => (
              <Grid key={customForm.id} size={{ xs: 12, sm: 6, md: 4 }}>
                <BaseCard
                  title={customForm.title}
                  subtitle={`ID: ${customForm.id}`}
                  actions={getCustomFormActions(customForm)}
                >
                  {renderCustomFormContent(customForm)}
                </BaseCard>
              </Grid>
            ))}
          </Grid>

          {/* Mensaje cuando no hay contenido */}
          {templates.length === 0 && customForms.length === 0 && (
            <Box textAlign="center" py={8}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No hay contenido disponible
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {tabValue === 0 
                  ? "Crea tu primera plantilla o formulario personalizado para comenzar"
                  : 'Crea contenido en la pestaña "Gestionar Plantillas" para poder crear formularios'
                }
              </Typography>
            </Box>
          )}

          {/* FABs para crear contenido - Solo en tab de gestión */}
          {tabValue === 0 && (
            <>
              <Fab
                color="primary"
                aria-label="add template"
                sx={{ position: "fixed", bottom: 80, right: 16 }}
                onClick={handleCreateTemplate}
              >
                <Add />
              </Fab>
              
              {/* <Fab
                color="secondary"
                aria-label="add custom form"
                sx={{ position: "fixed", bottom: 16, right: 16 }}
                onClick={handleCreateCustomForm}
              >
                <Description />
              </Fab> */}
            </>
          )}
        </>
      )}
    </Box>
  )
}