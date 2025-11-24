// // hooks/use-planes-accion.ts

// import { useState, useCallback } from 'react';
// import { PlanDeAccion, CreatePlanDeAccionDTO, UpdatePlanDeAccionDTO, TaskSummary } from '../types/IProps';

// const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// export function usePlanesAccion() {
//   const [planes, setPlanes] = useState<PlanDeAccion[]>([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const calculateTaskSummary = useCallback((): TaskSummary => {
//     const abiertas = planes.filter(p => p.estado === 'abierto').length;
//     const cerradas = planes.filter(p => p.estado === 'cerrado').length;
//     const total = planes.length;

//     return {
//       tareasAbiertas: abiertas,
//       tareasCerradas: cerradas,
//       totalTareas: total,
//       porcentajeCierre: total > 0 ? Math.round((cerradas / total) * 100) : 0,
//     };
//   }, [planes]);

//   /**
//    * 🔥 Generar planes automáticamente desde una inspección
//    */
//   const generarPlanesDesdeInstancia = useCallback(async (
//     instanceId: string,
//     opciones?: {
//       incluirPuntaje3?: boolean;
//       incluirSoloConComentario?: boolean;
//     }
//   ) => {
//     setIsLoading(true);
//     setError(null);

//     try {
//       const params = new URLSearchParams();
//       if (opciones?.incluirPuntaje3) params.append('incluirPuntaje3', 'true');
//       if (opciones?.incluirSoloConComentario) params.append('incluirSoloConComentario', 'true');

//       const response = await fetch(
//         `${API_URL}/planes-accion/generar-desde-instancia/${instanceId}?${params}`,
//         {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//         }
//       );

//       if (!response.ok) {
//         throw new Error('Error al generar planes de acción');
//       }

//       const planesGenerados = await response.json();
      
//       // Agregar los nuevos planes al estado
//       setPlanes(prev => [...planesGenerados, ...prev]);
      
//       return planesGenerados;
//     } catch (err) {
//       const message = err instanceof Error ? err.message : 'Error al generar planes';
//       setError(message);
//       throw err;
//     } finally {
//       setIsLoading(false);
//     }
//   }, []);

//   /**
//    * Cargar lista de inspecciones disponibles
//    */
//   const cargarInspecciones = useCallback(async () => {
//     try {
//       const response = await fetch(`${API_URL}/instances?limit=100`);
      
//       if (!response.ok) {
//         throw new Error('Error al cargar inspecciones');
//       }

//       const result = await response.json();
//       return result.data || [];
//     } catch (err) {
//       console.error('Error cargando inspecciones:', err);
//       return [];
//     }
//   }, []);

//   /**
//    * Cargar planes de acción (con filtros opcionales)
//    */
//   const loadPlanes = useCallback(async (filters?: {
//     instanceId?: string;
//     estado?: string;
//     empresa?: string;
//   }) => {
//     setIsLoading(true);
//     setError(null);

//     try {
//       const params = new URLSearchParams();
//       if (filters?.instanceId) params.append('instanceId', filters.instanceId);
//       if (filters?.estado) params.append('estado', filters.estado);
//       if (filters?.empresa) params.append('empresa', filters.empresa);

//       const response = await fetch(`${API_URL}/planes-accion?${params}`);

//       if (!response.ok) {
//         throw new Error('Error al cargar planes de acción');
//       }

//       const data = await response.json();
//       setPlanes(data);
//     } catch (err) {
//       const message = err instanceof Error ? err.message : 'Error al cargar planes';
//       setError(message);
//     } finally {
//       setIsLoading(false);
//     }
//   }, []);

//   const createPlan = useCallback(async (data: CreatePlanDeAccionDTO) => {
//     setIsLoading(true);
//     setError(null);

//     try {
//       const response = await fetch(`${API_URL}/planes-accion`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(data),
//       });

//       if (!response.ok) {
//         throw new Error('Error al crear plan');
//       }

//       const newPlan = await response.json();
//       setPlanes(prev => [newPlan, ...prev]);
//       return newPlan;
//     } catch (err) {
//       const message = err instanceof Error ? err.message : 'Error al crear plan';
//       setError(message);
//       throw err;
//     } finally {
//       setIsLoading(false);
//     }
//   }, []);

//   const updatePlan = useCallback(async (_id: string, data: UpdatePlanDeAccionDTO) => {
//     setIsLoading(true);
//     setError(null);

//     try {
//       const response = await fetch(`${API_URL}/planes-accion/${_id}`, {
//         method: 'PATCH',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(data),
//       });

//       if (!response.ok) {
//         throw new Error('Error al actualizar plan');
//       }

//       const updatedPlan = await response.json();
//       setPlanes(prev => prev.map(plan => plan._id === _id ? updatedPlan : plan));
//       return updatedPlan;
//     } catch (err) {
//       const message = err instanceof Error ? err.message : 'Error al actualizar plan';
//       setError(message);
//       throw err;
//     } finally {
//       setIsLoading(false);
//     }
//   }, []);

//   const deletePlan = useCallback(async (_id: string) => {
//     setIsLoading(true);
//     setError(null);

//     try {
//       const response = await fetch(`${API_URL}/planes-accion/${_id}`, {
//         method: 'DELETE',
//       });

//       if (!response.ok) {
//         throw new Error('Error al eliminar plan');
//       }

//       setPlanes(prev => prev.filter(plan => plan._id !== _id));
//     } catch (err) {
//       const message = err instanceof Error ? err.message : 'Error al eliminar plan';
//       setError(message);
//       throw err;
//     } finally {
//       setIsLoading(false);
//     }
//   }, []);

//   return {
//     planes,
//     isLoading,
//     error,
//     createPlan,
//     updatePlan,
//     deletePlan,
//     calculateTaskSummary,
//     generarPlanesDesdeInstancia,
//     cargarInspecciones,
//     loadPlanes,
//   };
// }

// hooks/use-planes-accion.ts

// hooks/use-planes-accion.ts
'use client';

import { useState, useCallback } from 'react';
import { AddTareaDTO, CreatePlanDeAccionDTO, PlanDeAccion, TareaObservacion, UpdatePlanDeAccionDTO, UpdateTareaDTO } from '../types/IProps';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';




export interface GenerarPlanesOptions {
  incluirPuntaje3?: boolean;
  incluirSoloConComentario?: boolean;
}

export interface PlanSummary {
  totalPlanes: number;
  planesAbiertos: number;
  planesEnProgreso: number;
  planesCerrados: number;
  porcentajeCierre: number;
}

// ==========================================
// HOOK PRINCIPAL
// ==========================================

export function usePlanesAccion() {
  const [planes, setPlanes] = useState<PlanDeAccion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ==========================================
  // LLAMADAS A LA API
  // ==========================================

  /**
   * 🔥 Generar plan desde una inspección
   */
  const generarPlanDesdeInstancia = useCallback(
    async (instanceId: string, opciones: GenerarPlanesOptions = {}) => {
      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        
        if (opciones.incluirPuntaje3 !== undefined) {
          params.append('incluirPuntaje3', String(opciones.incluirPuntaje3));
        }
        
        if (opciones.incluirSoloConComentario !== undefined) {
          params.append('incluirSoloConComentario', String(opciones.incluirSoloConComentario));
        }

        const url = `${API_URL}/planes-accion/generar-desde-instancia/${instanceId}?${params.toString()}`;

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Error al generar plan');
        }

        const plan = await response.json();
        
        // Actualizar lista local
        setPlanes((prev) => [plan, ...prev]);
        
        return plan;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error al generar plan';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Cargar lista de planes
   */
  const loadPlanes = useCallback(async (filters?: {
    estado?: string;
    vicepresidencia?: string;
    superintendencia?: string;
    areaFisica?: string;
  }) => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      
      if (filters?.estado) params.append('estado', filters.estado);
      if (filters?.vicepresidencia) params.append('vicepresidencia', filters.vicepresidencia);
      if (filters?.superintendencia) params.append('superintendencia', filters.superintendencia);
      if (filters?.areaFisica) params.append('areaFisica', filters.areaFisica);

      const url = `${API_URL}/planes-accion?${params.toString()}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al cargar planes');
      }

      const planesData = await response.json();
      setPlanes(planesData);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar planes';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Crear un nuevo plan vacío
   */
  const createPlan = useCallback(async (data: CreatePlanDeAccionDTO) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/planes-accion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear plan');
      }

      const newPlan = await response.json();
      
      setPlanes((prev) => [newPlan, ...prev]);
      
      return newPlan;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al crear plan';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Actualizar datos organizacionales del plan
   */
  const updatePlan = useCallback(async (planId: string, data: UpdatePlanDeAccionDTO) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/planes-accion/${planId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al actualizar plan');
      }

      const updatedPlan = await response.json();
      
      setPlanes((prev) =>
        prev.map((plan) => (plan._id === planId ? updatedPlan : plan))
      );

      return updatedPlan;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al actualizar plan';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Eliminar un plan completo
   */
  const deletePlan = useCallback(async (planId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/planes-accion/${planId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al eliminar plan');
      }

      setPlanes((prev) => prev.filter((plan) => plan._id !== planId));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al eliminar plan';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * 🆕 Agregar tarea a un plan existente
   */
  const addTarea = useCallback(async (planId: string, tarea: AddTareaDTO) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/planes-accion/${planId}/tareas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tarea),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al agregar tarea');
      }

      const updatedPlan = await response.json();
      
      setPlanes((prev) =>
        prev.map((plan) => (plan._id === planId ? updatedPlan : plan))
      );

      return updatedPlan;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al agregar tarea';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * 🆕 Actualizar una tarea específica
   */
  const updateTarea = useCallback(
  async (planId: string, tareaId: string, data: UpdateTareaDTO) => {
    console.log('🎯 [HOOK] updateTarea llamado');
    console.log('  📋 planId:', planId);
    console.log('  📋 tareaId:', tareaId);
    console.log('  📦 data original:', data);
    console.log('  📎 evidencias en data:', data.evidencias);
    
    // 🔥 Verificar el tipo y contenido de evidencias
    if (data.evidencias) {
      console.log('  🔍 Detalles de evidencias:');
      console.log('    - Tipo:', typeof data.evidencias);
      console.log('    - Es array?:', Array.isArray(data.evidencias));
      console.log('    - Longitud:', data.evidencias.length);
      data.evidencias.forEach((ev, i) => {
        console.log(`    - [${i}]:`, {
          nombre: ev.nombre,
          url: ev.url,
          nombreTipo: typeof ev.nombre,
          urlTipo: typeof ev.url,
          objeto: ev
        });
      });
    }

    setIsLoading(true);
    setError(null);

    try {
      // 🔥 Crear payload limpio
      const payload = JSON.stringify(data);
      console.log('  📤 Payload stringified:', payload);
      console.log('  📤 Payload parseado:', JSON.parse(payload));

      const response = await fetch(`${API_URL}/planes-accion/${planId}/tareas/${tareaId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: payload,
      });

      console.log('  📡 Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('  ❌ Error response:', errorData);
        throw new Error(errorData.message || 'Error al actualizar tarea');
      }

      const updatedPlan = await response.json();
      console.log('  ✅ Plan actualizado recibido');
      console.log('  📊 Tareas en plan:', updatedPlan.tareas?.length);
      
      // Verificar que las evidencias se guardaron
      const tareaActualizada = updatedPlan.tareas?.find((t: TareaObservacion) => t._id === tareaId);
      if (tareaActualizada) {
        console.log('  ✅ Tarea actualizada encontrada');
        console.log('  📎 Evidencias guardadas:', tareaActualizada.evidencias);
      }

      setPlanes((prev) =>
        prev.map((plan) => (plan._id === planId ? updatedPlan : plan))
      );

      return updatedPlan;
    } catch (err) {
      console.error('  ❌ Error en updateTarea:', err);
      const message = err instanceof Error ? err.message : 'Error al actualizar tarea';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  },
  []
);

  /**
   * 🆕 Eliminar una tarea
   */
  const deleteTarea = useCallback(async (planId: string, tareaId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/planes-accion/${planId}/tareas/${tareaId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al eliminar tarea');
      }

      const updatedPlan = await response.json();
      
      setPlanes((prev) =>
        prev.map((plan) => (plan._id === planId ? updatedPlan : plan))
      );

      return updatedPlan;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al eliminar tarea';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * 🆕 Aprobar una tarea
   */
  const approveTarea = useCallback(async (planId: string, tareaId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/planes-accion/${planId}/tareas/${tareaId}/aprobar`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al aprobar tarea');
      }

      const updatedPlan = await response.json();
      
      setPlanes((prev) =>
        prev.map((plan) => (plan._id === planId ? updatedPlan : plan))
      );

      return updatedPlan;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al aprobar tarea';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Obtener estadísticas del servidor
   */
  const getStats = useCallback(async (): Promise<PlanSummary> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/planes-accion/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al obtener estadísticas');
      }

      return await response.json();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al obtener estadísticas';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadInspecciones = useCallback(async () => {
  try {
    const response = await fetch(`${API_URL}/instances?limit=100`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Error al cargar inspecciones');
    }

    const result = await response.json();
    
    // 🔥 CORRECCIÓN: Tu API retorna { data: Array, total, page, limit }
    // Entonces debemos acceder directamente a result.data
    if (result?.data && Array.isArray(result.data)) {
      return result.data;
    } else if (Array.isArray(result)) {
      return result;
    }
    
    console.warn('⚠️ Estructura inesperada:', result);
    return [];
    
  } catch (err) {
    console.error('❌ Error cargando inspecciones:', err);
    return [];
  }
}, []);

  /**
   * Calcular resumen global de PLANES (desde estado local)
   */
  const calculateGlobalSummary = useCallback((): PlanSummary => {
    const planesAbiertos = planes.filter((p) => p.estado === 'abierto').length;
    const planesEnProgreso = planes.filter((p) => p.estado === 'en-progreso').length;
    const planesCerrados = planes.filter((p) => p.estado === 'cerrado').length;
    const totalPlanes = planes.length;

    const sumaPorcentajes = planes.reduce((acc, plan) => acc + plan.porcentajeCierre, 0);
    const porcentajeCierre = totalPlanes > 0 ? Math.round(sumaPorcentajes / totalPlanes) : 0;

    return {
      totalPlanes,
      planesAbiertos,
      planesEnProgreso,
      planesCerrados,
      porcentajeCierre,
    };
  }, [planes]);

  return {
    // Estado
    planes,
    isLoading,
    error,
    
    // Operaciones de planes
    loadPlanes,
    createPlan,
    updatePlan,
    deletePlan,
    
    // Operaciones de tareas
    addTarea,
    updateTarea,
    deleteTarea,
    approveTarea,
    
    // Generación automática
    generarPlanDesdeInstancia,
    
    // Estadísticas
    calculateGlobalSummary,
    getStats,

    loadInspecciones,
  };
}