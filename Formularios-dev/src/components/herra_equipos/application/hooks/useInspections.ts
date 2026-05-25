'use client';
import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  deleteInspection as deleteInspectionAction,
  getInspectionById,
  getInspectionsHerraEquipos,
  InspectionResponse,
} from '@/lib/actions/inspection-herra-equipos';

export type Inspection = InspectionResponse;

export type NotificationState = {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'warning' | 'info';
};

export type InspectionFilters = {
  templateCode?: string;
  status?: string;
  submittedBy?: string;
  startDate?: string;
  endDate?: string;
};

export const useInspections = () => {
  const router = useRouter();
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDetailModal, setOpenDetailModal] = useState(false);
  const [selectedInspection, setSelectedInspection] = useState<Inspection | null>(null);
  const [notification, setNotification] = useState<NotificationState>({
    open: false,
    message: '',
    severity: 'info',
  });

  const notify = useCallback(
    (message: string, severity: NotificationState['severity']) => {
      setNotification({ open: true, message, severity });
    },
    [],
  );

  const closeNotification = useCallback(() => {
    setNotification((prev) => ({ ...prev, open: false }));
  }, []);

  const loadInspections = useCallback(
    async (filters?: InspectionFilters) => {
      try {
        setLoading(true);
        setError(null);
        const result = await getInspectionsHerraEquipos(filters);
        if (result.success && result.data) {
          setInspections(result.data);
        } else {
          throw new Error(result.error || 'Error al cargar inspecciones');
        }
      } catch {
        setError('No se pudieron cargar las inspecciones');
        notify('Error al cargar las inspecciones', 'error');
      } finally {
        setLoading(false);
      }
    },
    [notify],
  );

  useEffect(() => {
    loadInspections();
  }, [loadInspections]);

  const deleteInspection = useCallback(
    async (id: string) => {
      try {
        setLoading(true);
        const result = await deleteInspectionAction(id);
        if (result.success) {
          notify('Inspección eliminada correctamente', 'success');
          await loadInspections();
        } else {
          throw new Error(result.error || 'Error al eliminar');
        }
      } catch (err) {
        notify(
          err instanceof Error ? err.message : 'Error al eliminar la inspección',
          'error',
        );
      } finally {
        setLoading(false);
      }
    },
    [loadInspections, notify],
  );

  const viewDetail = useCallback(
    async (inspection: Inspection) => {
      try {
        setLoading(true);
        const result = await getInspectionById(inspection._id);
        if (result.success && result.data) {
          setSelectedInspection(result.data);
          setOpenDetailModal(true);
        } else {
          throw new Error(result.error || 'Error al cargar detalle');
        }
      } catch {
        notify('Error al cargar el detalle de la inspección', 'error');
      } finally {
        setLoading(false);
      }
    },
    [notify],
  );

  const closeDetailModal = useCallback(() => setOpenDetailModal(false), []);

  const editInspection = useCallback(
    (inspection: Inspection) => {
      router.push(`/dashboard/config/inspecciones/editar/${inspection._id}`);
    },
    [router],
  );

  const duplicateInspection = useCallback(
    async (inspection: Inspection) => {
      try {
        setLoading(true);
        const result = await getInspectionById(inspection._id);
        if (result.success && result.data) {
          const draftData = {
            ...result.data,
            status: 'draft',
            submittedAt: new Date().toISOString(),
          };
          localStorage.setItem(
            `draft_duplicate_${inspection.templateCode}`,
            JSON.stringify(draftData),
          );
          notify('Inspección duplicada, redirigiendo...', 'info');
          setTimeout(() => {
            router.push(`/dashboard/form-herra-equipos/${inspection.templateCode}`);
          }, 1000);
        }
      } catch {
        notify('Error al duplicar la inspección', 'error');
      } finally {
        setLoading(false);
      }
    },
    [router, notify],
  );

  const filterByLocation = useCallback(
    (locationFilter: string): Inspection[] =>
      locationFilter.trim()
        ? inspections.filter((i) =>
            i.location?.toLowerCase().includes(locationFilter.toLowerCase().trim()),
          )
        : inspections,
    [inspections],
  );

  return {
    inspections,
    loading,
    error,
    page,
    rowsPerPage,
    openDetailModal,
    selectedInspection,
    notification,
    setPage,
    setRowsPerPage,
    closeDetailModal,
    closeNotification,
    loadInspections,
    deleteInspection,
    viewDetail,
    editInspection,
    duplicateInspection,
    filterByLocation,
    notify,
  };
};
