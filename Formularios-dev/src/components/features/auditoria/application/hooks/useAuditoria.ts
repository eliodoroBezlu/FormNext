"use client";

import { useCallback, useEffect, useState } from "react";
import { auditoriaAdapter } from "../../infrastructure/adapters/auditoriaAdapter";
import type {
  FiltrosAuditoria,
  OpcionesFiltro,
  PaginaAuditoria,
} from "../../domain/models/Auditoria";

const POR_PAGINA = 50;

export function useAuditoria() {
  const [pagina, setPagina] = useState<PaginaAuditoria>({
    filas: [],
    total: 0,
    pagina: 1,
    porPagina: POR_PAGINA,
  });
  const [opciones, setOpciones] = useState<OpcionesFiltro>({
    recursos: [],
    usuarios: [],
  });
  const [filtros, setFiltros] = useState<FiltrosAuditoria>({
    pagina: 1,
    porPagina: POR_PAGINA,
  });
  /**
   * Filtros cuya respuesta ya está pintada. El indicador de carga se deriva de
   * aquí: mientras lo pintado no corresponda a los filtros actuales, se está
   * cargando.
   *
   * Antes era un `setCargando(true)` síncrono dentro del efecto. Derivarlo
   * evita ese render de más y no hay forma de que los dos valores se
   * desincronicen.
   */
  const [filtrosPintados, setFiltrosPintados] =
    useState<FiltrosAuditoria | null>(null);
  const cargando = filtrosPintados !== filtros;

  useEffect(() => {
    let vigente = true;
    void auditoriaAdapter.buscar(filtros).then((r) => {
      // Un filtro cambiado mientras la consulta viajaba deja obsoleta esta
      // respuesta; pintarla mostraría datos que no corresponden al filtro.
      if (vigente) {
        setPagina(r);
        setFiltrosPintados(filtros);
      }
    });
    return () => {
      vigente = false;
    };
  }, [filtros]);

  useEffect(() => {
    void auditoriaAdapter.opciones().then(setOpciones);
  }, []);

  /** Cambiar un filtro vuelve a la primera página: la actual ya no aplica. */
  const filtrar = useCallback((cambios: Partial<FiltrosAuditoria>) => {
    setFiltros((previos) => ({ ...previos, ...cambios, pagina: 1 }));
  }, []);

  const irAPagina = useCallback((n: number) => {
    setFiltros((previos) => ({ ...previos, pagina: n }));
  }, []);

  return { pagina, opciones, filtros, cargando, filtrar, irAPagina };
}
