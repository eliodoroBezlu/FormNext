import { FormularioInspeccion, AreaStats, SistemasPasivos, SistemasActivos } from '../types/IProps';
import { SistemaInspeccionType } from '../types/IProps';

type SistemaType = SistemasPasivos | SistemasActivos;

export const useDashboardCalculations = () => {
  const calcularCumplimientoSistema = (sistema: SistemaType): number => {
    const componentes = Object.values(sistema) as SistemaInspeccionType[];
    const aprobados = componentes.filter((comp) => comp.estado === '✓').length;
    return componentes.length > 0 ? (aprobados / componentes.length) * 100 : 0;
  };

  const calcularCumplimientoGeneral = (inspecciones: FormularioInspeccion[]): number => {
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

  const calcularCumplimientoSistemasPasivos = (inspecciones: FormularioInspeccion[]): number => {
    if (inspecciones.length === 0) return 0;

    const total = inspecciones.reduce((sum, ins) => {
      const mesData = ins.meses[ins.mesActual];
      return sum + (mesData ? calcularCumplimientoSistema(mesData.inspeccionesActivos.sistemasPasivos) : 0);
    }, 0);

    return Math.round(total / inspecciones.length);
  };

  const calcularCumplimientoSistemasActivos = (inspecciones: FormularioInspeccion[]): number => {
    if (inspecciones.length === 0) return 0;

    const total = inspecciones.reduce((sum, ins) => {
      const mesData = ins.meses[ins.mesActual];
      return sum + (mesData ? calcularCumplimientoSistema(mesData.inspeccionesActivos.sistemasActivos) : 0);
    }, 0);

    return Math.round(total / inspecciones.length);
  };

  const determinarEstado = (cumplimiento: number): string => {
    if (cumplimiento >= 90) return 'OPTIMO';
    if (cumplimiento >= 70) return 'ADVERTENCIA';
    return 'CRITICO';
  };

  const calcularTendencia = (inspecciones: FormularioInspeccion[]): number => {
    if (inspecciones.length < 2) return 0;

    const ultimas = inspecciones
      .sort((a, b) => new Date(b.fechaUltimaModificacion).getTime() - new Date(a.fechaUltimaModificacion).getTime())
      .slice(0, 2);

    const cumplimientoActual = calcularCumplimientoGeneral([ultimas[0]]);
    const cumplimientoAnterior = calcularCumplimientoGeneral([ultimas[1]]);

    return Math.round(cumplimientoActual - cumplimientoAnterior);
  };

  const calcularEstadisticasPorArea = (inspeccionesFiltradas: FormularioInspeccion[]): AreaStats[] => {
    const areasUnicas = [...new Set(inspeccionesFiltradas.map((ins) => ins.area))];

    return areasUnicas.map((area) => {
      const inspeccionesArea = inspeccionesFiltradas.filter((ins) => ins.area === area);
      const ultimaInspeccion = inspeccionesArea.sort(
        (a, b) =>
          new Date(b.fechaUltimaModificacion).getTime() - new Date(a.fechaUltimaModificacion).getTime()
      )[0];

      const cumplimiento = calcularCumplimientoGeneral(inspeccionesArea);
      const estado = determinarEstado(cumplimiento);
      const tendencia = calcularTendencia(inspeccionesArea);

      const extintoresInspeccionados = inspeccionesArea.reduce((total, ins) => {
        const mesData = ins.meses[ins.mesActual];
        return total + (mesData?.inspeccionesExtintor?.length || 0);
      }, 0);

      return {
        area,
        tag: ultimaInspeccion?.tag || 'N/A',
        responsable: ultimaInspeccion?.responsableEdificio || 'N/A',
        ultimaInspeccion: ultimaInspeccion?.fechaUltimaModificacion || 'Nunca',
        cumplimiento,
        estado,
        tendencia,
        totalInspecciones: inspeccionesArea.length,
        superintendencia: ultimaInspeccion?.superintendencia || 'N/A',
        extintoresInspeccionados,
        sistemasPasivosCumplimiento: calcularCumplimientoSistemasPasivos(inspeccionesArea),
        sistemasActivosCumplimiento: calcularCumplimientoSistemasActivos(inspeccionesArea),
      };
    });
  };

  const calcularPromedioCumplimiento = (inspeccionesFiltradas: FormularioInspeccion[]): number => {
    if (inspeccionesFiltradas.length === 0) return 0;
    return Math.round(calcularCumplimientoGeneral(inspeccionesFiltradas));
  };

  return {
    calcularEstadisticasPorArea,
    calcularPromedioCumplimiento,
    determinarEstado,
  };
};