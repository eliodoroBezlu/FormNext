"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePgrList } from "@/components/features/pgr/application/hooks/usePgrList";
import { PgrListView } from "@/components/features/pgr/presentation/components/PgrListView";
import { Pgr, PgrEstado } from "@/components/features/pgr/domain/models/IProps";

export default function GestionPGR() {
  const router = useRouter();
  const {
    planesFiltrados,
    isLoading,
    error,
    loadPlanes,
    filters,
    setFilter,
    limpiarFiltros,
    toggleActivo,
    snackbar,
    closeSnackbar,
  } = usePgrList();

  useEffect(() => {
    loadPlanes();
  }, [loadPlanes]);

  const handleOpenView = (plan: Pgr) => router.push(`/dashboard/pgr/${plan._id}?mode=view`);

  const handleOpenEdit = (plan: Pgr) => {
    if (plan.estado === PgrEstado.BORRADOR) {
      router.push(`/dashboard/pgr/configuracion?id=${plan._id}`);
    } else {
      router.push(`/dashboard/pgr/${plan._id}?mode=edit`);
    }
  };

  const handleSeguimiento = (plan: Pgr) => router.push(`/dashboard/pgr/seguimiento/${plan._id}`);
  const handleAprobar = (plan: Pgr) => router.push(`/dashboard/pgr/aprobacion/${plan._id}`);
  const handleCorregir = (plan: Pgr) => router.push(`/dashboard/pgr/configuracion?id=${plan._id}`);
  const handleNuevo = () => router.push("/dashboard/pgr/configuracion");

  return (
    <PgrListView
      planes={planesFiltrados}
      isLoading={isLoading}
      error={error}
      filters={filters}
      onFilterChange={setFilter}
      onClearFilters={limpiarFiltros}
      onNuevo={handleNuevo}
      onView={handleOpenView}
      onEdit={handleOpenEdit}
      onToggleActivo={toggleActivo}
      onSeguimiento={handleSeguimiento}
      onAprobar={handleAprobar}
      onCorregir={handleCorregir}
      snackbar={snackbar}
      onCloseSnackbar={closeSnackbar}
    />
  );
}
