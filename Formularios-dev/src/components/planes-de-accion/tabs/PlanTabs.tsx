'use client';

import { Tabs, Tab, Paper, Badge } from '@mui/material';
import { PlanDeAccion } from '../types/IProps';

type TabValue = 'abierto' | 'en-progreso' | 'cerrado' | 'aprobado';

interface PlanTabsProps {
  activeTab: TabValue;
  planes: PlanDeAccion[];
  onChange: (tab: TabValue) => void;
}

export function PlanTabs({ activeTab, planes, onChange }: PlanTabsProps) {
  const abiertosCount = planes.filter((p) => p.estado === 'abierto').length;
  const enProgresoCount = planes.filter((p) => p.estado === 'en-progreso').length;
  const cerradosCount = planes.filter((p) => p.estado === 'cerrado').length;
  
  // 🔥 Contar planes donde TODAS las tareas están aprobadas
  const aprobadosCount = planes.filter((p) => {
    if (p.tareas.length === 0) return false;
    return p.tareas.every((t) => t.aprobado === true);
  }).length;

  return (
    <Paper sx={{ mb: 3 }}>
      <Tabs
        value={activeTab}
        onChange={(_, value) => onChange(value as TabValue)}
        variant="fullWidth"
        sx={{
          '& .MuiTab-root': {
            fontWeight: 600,
            fontSize: '0.95rem',
          },
        }}
      >
        <Tab
          label={
            <Badge badgeContent={abiertosCount} color="error" max={999}>
              <span style={{ paddingRight: abiertosCount > 0 ? 16 : 0 }}>Abiertas</span>
            </Badge>
          }
          value="abierto"
        />
        <Tab
          label={
            <Badge badgeContent={enProgresoCount} color="warning" max={999}>
              <span style={{ paddingRight: enProgresoCount > 0 ? 16 : 0 }}>En Progreso</span>
            </Badge>
          }
          value="en-progreso"
        />
        <Tab
          label={
            <Badge badgeContent={cerradosCount} color="success" max={999}>
              <span style={{ paddingRight: cerradosCount > 0 ? 16 : 0 }}>Cerradas</span>
            </Badge>
          }
          value="cerrado"
        />
        <Tab
          label={
            <Badge badgeContent={aprobadosCount} color="primary" max={999}>
              <span style={{ paddingRight: aprobadosCount > 0 ? 16 : 0 }}>Aprobadas</span>
            </Badge>
          }
          value="aprobado"
        />
      </Tabs>
    </Paper>
  );
}