import { FormularioInspeccion, AreaStats, SistemasPasivos, SistemasActivos, SistemaInspeccion, Extintor, Tag } from '../types/IProps';

type SistemaType = SistemasPasivos | SistemasActivos;

// --- Exported helper functions ---

export const calcularCumplimientoSistema = (sistema: SistemaType): number => {
  const componentes = Object.values(sistema) as SistemaInspeccion[];
  const aprobados = componentes.filter((comp) => comp.estado === '✓').length;
  return componentes.length > 0 ? (aprobados / componentes.length) * 100 : 0;
};

export const calcularCumplimientoGeneral = (inspecciones: FormularioInspeccion[]): number => {
  if (inspecciones.length === 0) return 0;

  const totalCumplimiento = inspecciones.reduce((sum, ins) => {
    const mesData = ins.meses[ins.mesActual];
    if (!mesData) return sum;

    const pasivos = calcularCumplimientoSistema(mesData.inspeccionesActivos.sistemasPasivos);
    const activos = calcularCumplimientoSistema(mesData.inspeccionesActivos.sistemasActivos);

    return sum + (pasivos + activos) / 2;
  }, 0);

  return Math.round(totalCumplimiento / inspecciones.length);
};



// --- Exported utility functions ---

export function calcularEstadisticasPorArea(
  inspeccionesFiltradas: FormularioInspeccion[],
  tags: Tag[],
  extintores: Extintor[]
): AreaStats[] {
  // Obtener las áreas únicas a partir del listado completo de tags activos
  const areasUnicas = [...new Set(tags.filter(t => t.activo).map((t) => t.area))].sort();

  return areasUnicas.map((area) => {
    // Total de tags activos registrados para este área
    const totalTags = tags.filter((t) => t.area === area && t.activo === true).length;

    // Inspecciones de este área en la lista actual filtrada (ya deduplicada por tag)
    const inspeccionesArea = inspeccionesFiltradas.filter((ins) => ins.area === area);
    const inspeccionesRealizadas = inspeccionesArea.length;

    // Cobertura de tags: porcentaje de tags inspeccionados respecto al total
    const coberturaTags = totalTags > 0 ? Math.min(Math.round((inspeccionesRealizadas / totalTags) * 100), 100) : 0;

    // Extintores activos (Meta) en el área
    const extintoresActivos = extintores.filter(
      (e) => e.area === area && e.activo === true
    ).length;

    // Extintores inspeccionados en este área para el mes seleccionado
    const extintoresInspeccionados = inspeccionesArea.reduce((total, ins) => {
      const mesData = ins.meses[ins.mesActual];
      return total + (mesData?.inspeccionesExtintor?.length || 0);
    }, 0);

    const cumplimientoExt = extintoresActivos > 0 ? Math.min(Math.round((extintoresInspeccionados / extintoresActivos) * 100), 100) : 0;

    const ultimaInspeccion = inspeccionesArea.sort(
      (a, b) =>
        new Date(b.fechaUltimaModificacion).getTime() - new Date(a.fechaUltimaModificacion).getTime()
    )[0];

    const estado = determinarEstado(coberturaTags);

    return {
      area,
      tag: ultimaInspeccion?.tag || 'N/A',
      responsable: ultimaInspeccion?.responsableEdificio || 'N/A',
      ultimaInspeccion: ultimaInspeccion?.fechaUltimaModificacion || 'Nunca',
      cumplimiento: coberturaTags,
      estado,
      tendencia: 0,
      totalInspecciones: inspeccionesRealizadas,
      totalTags,
      superintendencia: tags.find((t) => t.area === area)?.superintendencia || 'N/A',
      extintoresInspeccionados,
      sistemasPasivosCumplimiento: cumplimientoExt,
      sistemasActivosCumplimiento: coberturaTags,
    };
  });
}

export function calcularPromedioCumplimiento(inspeccionesFiltradas: FormularioInspeccion[]): number {
  if (inspeccionesFiltradas.length === 0) return 0;
  return Math.round(calcularCumplimientoGeneral(inspeccionesFiltradas));
}

export function determinarEstado(cumplimiento: number): 'OPTIMO' | 'ADVERTENCIA' | 'CRITICO' {
  if (cumplimiento >= 90) return 'OPTIMO';
  if (cumplimiento >= 70) return 'ADVERTENCIA';
  return 'CRITICO';
}
