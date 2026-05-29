"use client";

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Fab,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button as MuiButton,
  Card,
  CardContent,
  CardActions,
  Chip,
  IconButton,
  Divider
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Visibility,
  ArrowBack
} from '@mui/icons-material';

// ========== TIPOS ==========
type ResponseType = 'si_no_na' | 'text' | 'number' | 'boolean' | 'select' | 'multiselect' | 'date' | 'textarea';

interface ResponseOption {
  label: string;
  value: string | number | boolean;
  color?: string;
}

interface ResponseConfig {
  type: ResponseType;
  options?: ResponseOption[];
  placeholder?: string;
  min?: number;
  max?: number;
}

interface Question {
  id?: string;
  text: string;
  obligatorio: boolean;
  responseConfig: ResponseConfig;
  order?: number;
}

interface Section {
  id?: string;
  title: string;
  description?: string;
  questions: Question[];
  order?: number;
  isParent?: boolean;
  parentId?: string | null;
  subsections?: Section[];
}

interface VerificationField {
  label: string;
  type: 'text' | 'date' | 'number' | 'select' | 'autocomplete';
  options?: string[];
  dataSource?: string;
}

interface FormTemplate {
  _id: string;
  name: string;
  code: string;
  revision: string;
  type: 'interna' | 'externa';
  verificationFields: VerificationField[];
  sections: Section[];
  createdAt: Date;
  updatedAt: Date;
}

// ========== DATOS MOCK ==========
const INITIAL_TEMPLATES: FormTemplate[] = [
  {
    _id: '1',
    name: 'Inspección de Arnés',
    code: 'INS-ARN-001',
    revision: 'Rev. 1',
    type: 'interna',
    verificationFields: [
      { label: 'Gerencia', type: 'text' },
      { label: 'Supervisor', type: 'text' },
      { label: 'Superintendencia', type: 'autocomplete', dataSource: 'superintendencia' },
      { label: 'Fecha Inspección', type: 'date' }
    ],
    sections: [
      {
        id: '1',
        title: 'ARNES',
        isParent: true,
        questions: [],
        subsections: [
          {
            id: '1-1',
            title: 'HERRAJES',
            isParent: false,
            parentId: '1',
            questions: [
              {
                text: 'Argollas en "D" o anillos - Con deformaciones',
                obligatorio: true,
                responseConfig: {
                  type: 'si_no_na',
                  options: [
                    { label: 'SI', value: 'si', color: '#4caf50' },
                    { label: 'NO', value: 'no', color: '#f44336' },
                    { label: 'N/A', value: 'na', color: '#ff9800' }
                  ]
                }
              }
            ]
          }
        ]
      }
    ],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    _id: '2',
    name: 'Inspección de Vehículos',
    code: 'INS-VEH-002',
    revision: 'Rev. 2',
    type: 'externa',
    verificationFields: [
      { label: 'Inspector', type: 'text' },
      { label: 'Placa', type: 'text' },
      { label: 'Área', type: 'autocomplete', dataSource: 'area' }
    ],
    sections: [
      {
        id: '1',
        title: 'Estado General',
        questions: [
          {
            text: 'Estado de la carrocería',
            obligatorio: true,
            responseConfig: { type: 'textarea' }
          }
        ]
      }
    ],
    createdAt: new Date('2024-02-20'),
    updatedAt: new Date('2024-02-20')
  }
];

// ========== COMPONENTE TEMPLATE BUILDER ==========
interface TemplateBuilderProps {
  template: FormTemplate | null;
  onSave: (template: FormTemplate) => void;
  onCancel: () => void;
  mode: 'create' | 'edit' | 'view';
}

const TemplateBuilder: React.FC<TemplateBuilderProps> = ({ template, onSave, onCancel, mode }) => {
  const isReadOnly = mode === 'view';
  
  const handleSave = () => {
    const now = new Date();
    const savedTemplate: FormTemplate = {
      _id: template?._id || Math.random().toString(36).substr(2, 9),
      name: template?.name || 'Nuevo Template',
      code: template?.code || 'TEMP-' + Date.now(),
      revision: template?.revision || 'Rev. 1',
      type: template?.type || 'interna',
      verificationFields: template?.verificationFields || [],
      sections: template?.sections || [],
      createdAt: template?.createdAt || now,
      updatedAt: now
    };
    
    onSave(savedTemplate);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <IconButton onClick={onCancel}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h4">
            {mode === 'view' ? 'Ver' : mode === 'edit' ? 'Editar' : 'Crear'} Template
          </Typography>
          {mode === 'edit' && template && (
            <Chip label={`Editando: ${template.name}`} color="primary" variant="outlined" />
          )}
        </Box>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        Aquí va el FormBuilder completo que creamos anteriormente.
        Este es solo el contenedor con navegación.
      </Alert>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {template?.name || 'Nuevo Template'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Código: {template?.code || 'Pendiente'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Revisión: {template?.revision || 'Rev. 1'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Tipo: {template?.type || 'interna'}
          </Typography>
        </CardContent>
      </Card>

      {!isReadOnly && (
        <Box display="flex" justifyContent="flex-end" gap={2} mt={3}>
          <MuiButton variant="outlined" onClick={onCancel}>
            Cancelar
          </MuiButton>
          <MuiButton variant="contained" onClick={handleSave}>
            Guardar Template
          </MuiButton>
        </Box>
      )}
    </Box>
  );
};

// ========== COMPONENTE TEMPLATE CARD ==========
interface TemplateCardProps {
  template: FormTemplate;
  onEdit: () => void;
  onDelete: () => void;
  onView: () => void;
}

const TemplateCard: React.FC<TemplateCardProps> = ({ template, onEdit, onDelete, onView }) => {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  const getTotalQuestions = () => {
    let total = 0;
    template.sections.forEach(section => {
      total += section.questions.length;
      section.subsections?.forEach(sub => {
        total += sub.questions.length;
      });
    });
    return total;
  };

  const getAutocompleteFields = () => {
    return template.verificationFields.filter(f => f.type === 'autocomplete').length;
  };

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Typography variant="h6" gutterBottom>
            {template.name}
          </Typography>
          <Chip 
            label={template.type === 'interna' ? 'Interna' : 'Externa'} 
            size="small"
            color={template.type === 'interna' ? 'primary' : 'secondary'}
          />
        </Box>

        <Typography variant="body2" color="text.secondary" gutterBottom>
          <strong>Código:</strong> {template.code}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          <strong>Revisión:</strong> {template.revision}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          <strong>Creado:</strong> {formatDate(template.createdAt)}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          <strong>Actualizado:</strong> {formatDate(template.updatedAt)}
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Box display="flex" flexWrap="wrap" gap={1}>
          <Chip 
            label={`${template.sections.length} secciones`} 
            size="small" 
            variant="outlined"
          />
          <Chip 
            label={`${getTotalQuestions()} preguntas`} 
            size="small" 
            variant="outlined"
            color="secondary"
          />
          <Chip 
            label={`${template.verificationFields.length} campos`} 
            size="small" 
            variant="outlined"
            color="info"
          />
          {getAutocompleteFields() > 0 && (
            <Chip 
              label={`${getAutocompleteFields()} autocomplete`} 
              size="small" 
              variant="outlined"
              color="success"
            />
          )}
        </Box>
      </CardContent>

      <CardActions sx={{ justifyContent: 'flex-end', gap: 1 }}>
        <IconButton size="small" onClick={onView} title="Ver">
          <Visibility />
        </IconButton>
        <IconButton size="small" onClick={onEdit} title="Editar">
          <Edit />
        </IconButton>
        <IconButton size="small" color="error" onClick={onDelete} title="Eliminar">
          <Delete />
        </IconButton>
      </CardActions>
    </Card>
  );
};

// ========== COMPONENTE PRINCIPAL CRUD ==========
const TemplateManagementApp: React.FC = () => {
  const [templates, setTemplates] = useState<FormTemplate[]>(INITIAL_TEMPLATES);
  const [currentView, setCurrentView] = useState<'list' | 'create' | 'edit' | 'view'>('list');
  const [selectedTemplate, setSelectedTemplate] = useState<FormTemplate | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; templateId: string | null }>({
    open: false,
    templateId: null
  });
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // CREATE
  const handleCreate = () => {
    setSelectedTemplate(null);
    setCurrentView('create');
  };

  // READ (View)
  const handleView = (template: FormTemplate) => {
    setSelectedTemplate(template);
    setCurrentView('view');
  };

  // UPDATE
  const handleEdit = (template: FormTemplate) => {
    setSelectedTemplate(template);
    setCurrentView('edit');
  };

  const handleSave = (template: FormTemplate) => {
    if (currentView === 'create') {
      // CREATE
      setTemplates([...templates, template]);
      setSuccessMessage(`Template "${template.name}" creado exitosamente`);
    } else if (currentView === 'edit') {
      // UPDATE
      setTemplates(templates.map(t => t._id === template._id ? template : t));
      setSuccessMessage(`Template "${template.name}" actualizado exitosamente`);
    }
    
    setCurrentView('list');
    setSelectedTemplate(null);
    
    // Limpiar mensaje después de 3 segundos
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // DELETE
  const handleDeleteClick = (templateId: string) => {
    setDeleteDialog({ open: true, templateId });
  };

  const handleDeleteConfirm = () => {
    if (deleteDialog.templateId) {
      const template = templates.find(t => t._id === deleteDialog.templateId);
      setTemplates(templates.filter(t => t._id !== deleteDialog.templateId));
      setSuccessMessage(`Template "${template?.name}" eliminado exitosamente`);
      setTimeout(() => setSuccessMessage(null), 3000);
    }
    setDeleteDialog({ open: false, templateId: null });
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, templateId: null });
  };

  const handleCancel = () => {
    setCurrentView('list');
    setSelectedTemplate(null);
  };

  // Vista de formulario
  if (currentView !== 'list') {
    return (
      <TemplateBuilder
        template={selectedTemplate}
        onSave={handleSave}
        onCancel={handleCancel}
        mode={currentView}
      />
    );
  }

  // Vista de lista
  return (
    <Box sx={{ p: 3 }}>
      <Box mb={4}>
        <Typography variant="h3" gutterBottom>
          Gestión de Templates
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Crea, edita y gestiona tus plantillas de formularios
        </Typography>
      </Box>

      {successMessage && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccessMessage(null)}>
          {successMessage}
        </Alert>
      )}

      <Grid container spacing={3}>
        {templates.map((template) => (
          <Grid sx={{xs:12, sm:6, md:4}} key={template._id}>
            <TemplateCard
              template={template}
              onView={() => handleView(template)}
              onEdit={() => handleEdit(template)}
              onDelete={() => handleDeleteClick(template._id)}
            />
          </Grid>
        ))}
      </Grid>

      {templates.length === 0 && (
        <Box textAlign="center" py={8}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No hay templates disponibles
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Crea tu primer template para comenzar
          </Typography>
        </Box>
      )}

      {/* FAB para crear */}
      <Fab
        color="primary"
        aria-label="crear template"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={handleCreate}
      >
        <Add />
      </Fab>

      {/* Dialog de confirmación de eliminación */}
      <Dialog open={deleteDialog.open} onClose={handleDeleteCancel}>
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que deseas eliminar este template? Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions>
          <MuiButton onClick={handleDeleteCancel}>Cancelar</MuiButton>
          <MuiButton onClick={handleDeleteConfirm} color="error" variant="contained">
            Eliminar
          </MuiButton>
        </DialogActions>
      </Dialog>

      {/* Estadísticas */}
      <Box 
        sx={{ 
          position: 'fixed', 
          bottom: 80, 
          right: 16,
          backgroundColor: 'background.paper',
          p: 2,
          borderRadius: 2,
          boxShadow: 3
        }}
      >
        <Typography variant="caption" color="text.secondary">
          Total Templates: <strong>{templates.length}</strong>
        </Typography>
      </Box>
    </Box>
  );
};

export default TemplateManagementApp;