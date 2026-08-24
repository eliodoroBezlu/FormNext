"use server";

import { API_BASE_URL } from "../constants";
import { getAuthHeaders, handleApiResponse } from "./helpers";
import type {
  FiltrosAuditoria,
  OpcionesFiltro,
  PaginaAuditoria,
} from "@/components/features/auditoria/domain/models/Auditoria";

export async function obtenerAuditoria(
  filtros: FiltrosAuditoria = {},
): Promise<PaginaAuditoria> {
  const params = new URLSearchParams();
  if (filtros.usuario) params.set("usuario", filtros.usuario);
  if (filtros.recurso) params.set("recurso", filtros.recurso);
  if (filtros.metodo) params.set("metodo", filtros.metodo);
  if (filtros.soloFallos) params.set("soloFallos", "true");
  if (filtros.desde) params.set("desde", filtros.desde);
  if (filtros.hasta) params.set("hasta", filtros.hasta);
  if (filtros.pagina) params.set("pagina", String(filtros.pagina));
  if (filtros.porPagina) params.set("porPagina", String(filtros.porPagina));

  const res = await fetch(`${API_BASE_URL}/auditoria?${params.toString()}`, {
    headers: await getAuthHeaders(),
    cache: "no-store",
  });
  return handleApiResponse<PaginaAuditoria>(res);
}

export async function obtenerFiltrosAuditoria(): Promise<OpcionesFiltro> {
  const res = await fetch(`${API_BASE_URL}/auditoria/filtros`, {
    headers: await getAuthHeaders(),
    cache: "no-store",
  });
  return handleApiResponse<OpcionesFiltro>(res);
}
