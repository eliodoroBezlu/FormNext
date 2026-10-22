'use client';

import { Tabs, Tab, Paper, Badge } from '@mui/material';
import { PlanDeAccion } from '../../domain/models/IProps';
import { estaEnPestana, type TabValue } from '../../domain/pestanasPlan';

interface PlanTabsProps {
  activeTab: TabValue;
  planes: PlanDeAccion[];
  onChange: (tab: TabValue) => void;
}

const PESTANAS: {
  valor: TabValue;
  texto: string;
  color: 'error' | 'warning' | 'success' | 'primary' | 'default';
}[] = [
  { valor: 'abierto', texto: 'Abiertas', color: 'error' },
  { valor: 'en-progreso', texto: 'En Progreso', color: 'warning' },
  { valor: 'cerrado', texto: 'Cerradas', color: 'success' },
  { valor: 'aprobado', texto: 'Aprobadas', color: 'primary' },
  // IRO terminadas sin observaciones que cumplan el criterio: cerradas sin
  // plan, con el motivo en cada tarjeta.
  { valor: 'sin-observaciones', texto: 'Sin observaciones', color: 'default' },
];

export function PlanTabs({ activeTab, planes, onChange }: PlanTabsProps) {
  return (
    <Paper sx={{ mb: 3 }}>
      <Tabs
        value={activeTab}
        onChange={(_, value) => onChange(value as TabValue)}
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
        sx={{
          '& .MuiTabs-flexContainer': { justifyContent: { md: 'space-around' } },
          '& .MuiTab-root': {
            fontWeight: 600,
            fontSize: '0.95rem',
          },
        }}
      >
        {PESTANAS.map(({ valor, texto, color }) => {
          const cuantos = planes.filter((p) => estaEnPestana(p, valor)).length;
          return (
            <Tab
              key={valor}
              value={valor}
              label={
                <Badge badgeContent={cuantos} color={color} max={999}>
                  <span style={{ paddingRight: cuantos > 0 ? 16 : 0 }}>{texto}</span>
                </Badge>
              }
            />
          );
        })}
      </Tabs>
    </Paper>
  );
}
