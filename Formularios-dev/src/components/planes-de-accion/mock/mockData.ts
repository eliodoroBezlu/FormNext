// mock/mockData.ts - Datos mock para desarrollo

import { PlanDeAccion, TareaObservacion } from '../types/IProps';

// Helper para generar IDs únicos
//const generateId = () => Math.random().toString(36).substr(2, 9);

// Datos de ejemplo para tareas
export const MOCK_TAREAS: TareaObservacion[] = [
  {
    _id: 'tarea_1',
    numeroItem: 1,
    fechaHallazgo: new Date('2025-01-10'),
    responsableObservacion: 'Juan Pérez',
    empresa: 'Minera Los Andes',
    lugarFisico: 'Galería 340',
    actividad: 'Fortificación',
    familiaPeligro: 'Caída de Rocas',
    descripcionObservacion: 'Pernos de anclaje sin tensión adecuada en sector norte',
    accionPropuesta: 'Reajustar todos los pernos según protocolo de fortificación',
    responsableAreaCierre: 'Carlos Rojas',
    fechaCumplimientoAcordada: new Date('2025-01-20'),
    fechaCumplimientoEfectiva: new Date('2025-01-18'),
    diasRetraso: 0,
    estado: 'cerrado',
    aprobado: true,
    instanceId: 'inst_001',
    sectionId: 'sec_001',
    sectionTitle: 'Fortificación y Sostenimiento',
    questionText: '¿Los pernos de anclaje tienen tensión adecuada?',
    puntajeObtenido: 1,
    puntajeMaximo: 3,
  },
  {
    _id: 'tarea_2',
    numeroItem: 2,
    fechaHallazgo: new Date('2025-01-10'),
    responsableObservacion: 'María González',
    empresa: 'Minera Los Andes',
    lugarFisico: 'Rampa Principal',
    actividad: 'Transporte de Material',
    familiaPeligro: 'Atropello',
    descripcionObservacion: 'Camión operando sin luces traseras funcionando',
    accionPropuesta: 'Reemplazar sistema de iluminación posterior del camión',
    responsableAreaCierre: 'Pedro Soto',
    fechaCumplimientoAcordada: new Date('2025-01-22'),
    diasRetraso: 0,
    estado: 'en-progreso',
    aprobado: false,
    instanceId: 'inst_001',
    sectionId: 'sec_002',
    sectionTitle: 'Vehículos y Equipos Móviles',
    questionText: '¿Los vehículos tienen todas las luces funcionando?',
    puntajeObtenido: 0,
    puntajeMaximo: 3,
  },
  {
    _id: 'tarea_3',
    numeroItem: 3,
    fechaHallazgo: new Date('2025-01-12'),
    responsableObservacion: 'Luis Vargas',
    empresa: 'Minera Los Andes',
    lugarFisico: 'Taller Mecánico',
    actividad: 'Mantenimiento',
    familiaPeligro: 'Orden y Limpieza',
    descripcionObservacion: 'Herramientas sin guardas de seguridad, aceite derramado en piso',
    accionPropuesta: 'Implementar guardas en esmeriles, limpiar derrames, capacitar personal',
    responsableAreaCierre: 'Ana Torres',
    fechaCumplimientoAcordada: new Date('2025-01-15'),
    diasRetraso: 6,
    estado: 'abierto',
    aprobado: false,
    instanceId: 'inst_001',
    sectionId: 'sec_003',
    sectionTitle: 'Instalaciones y Talleres',
    questionText: '¿El área de trabajo está limpia y ordenada?',
    puntajeObtenido: 1,
    puntajeMaximo: 3,
  },
];

// Planes de ejemplo
export const MOCK_PLANES: PlanDeAccion[] = [
  {
    _id: 'plan_001',
    vicepresidencia: 'Vicepresidencia de Operaciones',
    superintendenciaSenior: 'Superintendencia Senior de Mina',
    superintendencia: 'Superintendencia de Seguridad',
    areaFisica: 'Mina Subterránea - Nivel 3',
    tareas: MOCK_TAREAS,
    totalTareas: 3,
    tareasAbiertas: 1,
    tareasEnProgreso: 1,
    tareasCerradas: 1,
    porcentajeCierre: 33,
    estado: 'en-progreso',
    fechaCreacion: new Date('2025-01-10'),
    fechaUltimaActualizacion: new Date('2025-01-18'),
    createdAt: new Date('2025-01-10'),
    updatedAt: new Date('2025-01-18'),
  },
  {
    _id: 'plan_002',
    vicepresidencia: 'Vicepresidencia de Mantención',
    superintendenciaSenior: 'Superintendencia de Mantención de Equipos',
    superintendencia: 'Superintendencia de Talleres',
    areaFisica: 'Taller Central - Planta Concentradora',
    tareas: [
      {
        _id: 'tarea_4',
        numeroItem: 1,
        fechaHallazgo: new Date('2025-01-08'),
        responsableObservacion: 'Roberto Díaz',
        empresa: 'Contratista ABC',
        lugarFisico: 'Taller Eléctrico',
        actividad: 'Reparación de Motores',
        familiaPeligro: 'Energía Eléctrica',
        descripcionObservacion: 'Cables expuestos sin aislamiento en banco de trabajo',
        accionPropuesta: 'Reemplazar cables dañados e instalar protecciones',
        responsableAreaCierre: 'Javier Ruiz',
        fechaCumplimientoAcordada: new Date('2025-01-12'),
        diasRetraso: 10,
        estado: 'abierto',
        aprobado: false,
        instanceId: 'inst_002',
        sectionId: 'sec_004',
        sectionTitle: 'Instalaciones Eléctricas',
        questionText: '¿Los cables eléctricos están en buen estado?',
        puntajeObtenido: 0,
        puntajeMaximo: 3,
      },
      {
        _id: 'tarea_5',
        numeroItem: 2,
        fechaHallazgo: new Date('2025-01-09'),
        responsableObservacion: 'Sofía Mendoza',
        empresa: 'Contratista ABC',
        lugarFisico: 'Bodega de Repuestos',
        actividad: 'Almacenamiento',
        familiaPeligro: 'Orden y Limpieza',
        descripcionObservacion: 'Estanterías sobrecargadas sin señalización de peso máximo',
        accionPropuesta: 'Redistribuir carga y señalizar capacidad de estanterías',
        responsableAreaCierre: 'Carmen Silva',
        fechaCumplimientoAcordada: new Date('2025-01-16'),
        diasRetraso: 0,
        estado: 'abierto',
        aprobado: false,
        instanceId: 'inst_002',
        sectionId: 'sec_005',
        sectionTitle: 'Almacenamiento',
        questionText: '¿Las estanterías están correctamente señalizadas?',
        puntajeObtenido: 1,
        puntajeMaximo: 3,
      },
    ],
    totalTareas: 2,
    tareasAbiertas: 2,
    tareasEnProgreso: 0,
    tareasCerradas: 0,
    porcentajeCierre: 0,
    estado: 'abierto',
    fechaCreacion: new Date('2025-01-08'),
    fechaUltimaActualizacion: new Date('2025-01-09'),
    createdAt: new Date('2025-01-08'),
    updatedAt: new Date('2025-01-09'),
  },
  {
    _id: 'plan_003',
    vicepresidencia: 'Vicepresidencia de Logística',
    superintendenciaSenior: 'Superintendencia de Abastecimiento',
    superintendencia: 'Superintendencia de Bodegas',
    areaFisica: 'Bodega Central - Campamento',
    tareas: [
      {
        _id: 'tarea_6',
        numeroItem: 1,
        fechaHallazgo: new Date('2024-12-20'),
        responsableObservacion: 'Fernando Castro',
        empresa: 'Minera Los Andes',
        lugarFisico: 'Bodega de Químicos',
        actividad: 'Almacenamiento de Sustancias',
        familiaPeligro: 'Sustancias Peligrosas',
        descripcionObservacion: 'Hojas de seguridad (HDS) desactualizadas y no visibles',
        accionPropuesta: 'Actualizar HDS y ubicar en lugar visible cerca de productos',
        responsableAreaCierre: 'Daniela Flores',
        fechaCumplimientoAcordada: new Date('2024-12-28'),
        fechaCumplimientoEfectiva: new Date('2024-12-27'),
        diasRetraso: 0,
        estado: 'cerrado',
        aprobado: true,
        instanceId: 'inst_003',
        sectionId: 'sec_006',
        sectionTitle: 'Manejo de Sustancias Peligrosas',
        questionText: '¿Las HDS están actualizadas y visibles?',
        puntajeObtenido: 2,
        puntajeMaximo: 3,
      },
      {
        _id: 'tarea_7',
        numeroItem: 2,
        fechaHallazgo: new Date('2024-12-20'),
        responsableObservacion: 'Patricia Ramírez',
        empresa: 'Minera Los Andes',
        lugarFisico: 'Área de Carga',
        actividad: 'Operación de Grúa',
        familiaPeligro: 'Equipos de Izaje',
        descripcionObservacion: 'Grúa horquilla sin certificación vigente de mantención',
        accionPropuesta: 'Realizar mantención y certificación antes de operar',
        responsableAreaCierre: 'Rodrigo Paz',
        fechaCumplimientoAcordada: new Date('2024-12-30'),
        fechaCumplimientoEfectiva: new Date('2024-12-29'),
        diasRetraso: 0,
        estado: 'cerrado',
        aprobado: true,
        instanceId: 'inst_003',
        sectionId: 'sec_007',
        sectionTitle: 'Equipos de Izaje',
        questionText: '¿Los equipos tienen certificación vigente?',
        puntajeObtenido: 1,
        puntajeMaximo: 3,
      },
    ],
    totalTareas: 2,
    tareasAbiertas: 0,
    tareasEnProgreso: 0,
    tareasCerradas: 2,
    porcentajeCierre: 100,
    estado: 'cerrado',
    fechaCreacion: new Date('2024-12-20'),
    fechaUltimaActualizacion: new Date('2024-12-29'),
    createdAt: new Date('2024-12-20'),
    updatedAt: new Date('2024-12-29'),
  },
];

// Mock de inspecciones disponibles
export const MOCK_INSPECCIONES = [
  {
    _id: 'inst_001',
    templateId: {
      _id: 'template_001',
      name: 'IPERC - Inspección Planeada de Riesgos Críticos',
    },
    verificationList: {
      Área: 'Mina Subterránea',
      Empresa: 'Minera Los Andes',
      'Responsable Inspección': 'Juan Pérez',
    },
    overallCompliancePercentage: 68.5,
    sections: [
      {
        _id: 'sec_001',
        title: 'Fortificación y Sostenimiento',
        questions: [
          {
            _id: 'q_001',
            text: '¿Los pernos de anclaje tienen tensión adecuada?',
            answer: { score: 1, comment: 'Pernos sin tensión en sector norte' },
          },
        ],
      },
    ],
    createdAt: new Date('2025-01-10T08:30:00'),
    updatedAt: new Date('2025-01-10T10:45:00'),
  },
  {
    _id: 'inst_002',
    templateId: {
      _id: 'template_002',
      name: 'Inspección de Talleres y Mantención',
    },
    verificationList: {
      Área: 'Talleres',
      Empresa: 'Contratista ABC',
      'Responsable Inspección': 'Roberto Díaz',
    },
    overallCompliancePercentage: 45.2,
    sections: [
      {
        _id: 'sec_004',
        title: 'Instalaciones Eléctricas',
        questions: [
          {
            _id: 'q_004',
            text: '¿Los cables eléctricos están en buen estado?',
            answer: { score: 0, comment: 'Cables expuestos sin aislamiento' },
          },
        ],
      },
    ],
    createdAt: new Date('2025-01-08T14:20:00'),
    updatedAt: new Date('2025-01-08T16:10:00'),
  },
  {
    _id: 'inst_003',
    templateId: {
      _id: 'template_003',
      name: 'Inspección de Bodegas y Almacenamiento',
    },
    verificationList: {
      Área: 'Logística',
      Empresa: 'Minera Los Andes',
      'Responsable Inspección': 'Fernando Castro',
    },
    overallCompliancePercentage: 82.3,
    sections: [
      {
        _id: 'sec_006',
        title: 'Manejo de Sustancias Peligrosas',
        questions: [
          {
            _id: 'q_006',
            text: '¿Las HDS están actualizadas y visibles?',
            answer: { score: 2, comment: 'HDS desactualizadas' },
          },
        ],
      },
    ],
    createdAt: new Date('2024-12-20T09:00:00'),
    updatedAt: new Date('2024-12-20T11:30:00'),
  },
  {
    _id: 'inst_004',
    templateId: {
      _id: 'template_001',
      name: 'IPERC - Inspección Planeada de Riesgos Críticos',
    },
    verificationList: {
      Área: 'Planta Concentradora',
      Empresa: 'Minera Los Andes',
      'Responsable Inspección': 'María González',
    },
    overallCompliancePercentage: 91.7,
    sections: [],
    createdAt: new Date('2025-01-15T10:00:00'),
    updatedAt: new Date('2025-01-15T12:30:00'),
  },
  {
    _id: 'inst_005',
    templateId: {
      _id: 'template_004',
      name: 'Inspección de Seguridad General',
    },
    verificationList: {
      Área: 'Campamento',
      Empresa: 'Servicios Generales SA',
      'Responsable Inspección': 'Carlos Muñoz',
    },
    overallCompliancePercentage: 55.8,
    sections: [],
    createdAt: new Date('2025-01-12T08:00:00'),
    updatedAt: new Date('2025-01-12T09:45:00'),
  },
];

// Helper para calcular días de retraso
export const calcularDiasRetraso = (
  fechaCumplimientoAcordada: Date,
  fechaCumplimientoEfectiva?: Date,
  estado?: string
): number => {
  if (estado === 'cerrado' && fechaCumplimientoEfectiva) {
    const diff = new Date(fechaCumplimientoEfectiva).getTime() - new Date(fechaCumplimientoAcordada).getTime();
    return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
  }

  if (estado !== 'cerrado') {
    const diff = new Date().getTime() - new Date(fechaCumplimientoAcordada).getTime();
    return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
  }

  return 0;
};

// Helper para calcular metadatos del plan
export const calcularMetadatosPlan = (tareas: TareaObservacion[]) => {
  const totalTareas = tareas.length;
  const tareasAbiertas = tareas.filter((t) => t.estado === 'abierto').length;
  const tareasEnProgreso = tareas.filter((t) => t.estado === 'en-progreso').length;
  const tareasCerradas = tareas.filter((t) => t.estado === 'cerrado').length;
  const porcentajeCierre = totalTareas > 0 ? Math.round((tareasCerradas / totalTareas) * 100) : 0;

  let estado: 'abierto' | 'en-progreso' | 'cerrado' = 'abierto';
  if (tareasCerradas === totalTareas && totalTareas > 0) {
    estado = 'cerrado';
  } else if (tareasEnProgreso > 0 || tareasCerradas > 0) {
    estado = 'en-progreso';
  }

  return {
    totalTareas,
    tareasAbiertas,
    tareasEnProgreso,
    tareasCerradas,
    porcentajeCierre,
    estado,
  };
};