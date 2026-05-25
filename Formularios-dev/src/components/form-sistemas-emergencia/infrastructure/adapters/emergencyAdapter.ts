// src/components/form-sistemas-emergencia/infrastructure/adapters/emergencyAdapter.ts

import {
  actualizarExtintoresPorTag,
  obtenerTagsPorArea,
  obtenerExtintoresPorTag,
  verificarTag,
  actualizarMesPorTag,
  crearFormSistemasEmergencia,
  verificarInspecciones,
  desactivarExtintor,
  obtenerExtintoresPorArea,
} from "@/app/actions/inspeccion";
import { obtenerAreas } from "@/lib/actions/area-actions";
import type {
  ExtintorBackend,
  FormularioInspeccion,
  Mes,
  DatosMes,
  InspeccionExtintor,
  VerificarTagData,
  ExtintorAreaResponse,
} from "@/types/formTypes";

export const emergencyAdapter = {
  /**
   * Obtiene la lista completa de áreas de trabajo disponibles.
   */
  async getAreas(): Promise<string[]> {
    return obtenerAreas();
  },

  /**
   * Obtiene los TAGs configurados para un área específica.
   */
  async getTagsByArea(area: string): Promise<string[]> {
    return obtenerTagsPorArea(area);
  },

  /**
   * Verifica el estado de inspecciones de los tags pertenecientes a un área en un mes.
   */
  async verifyInspections(area: string, mes: Mes): Promise<{ tag: string; inspeccionado: boolean }[]> {
    return verificarInspecciones(area, mes) as Promise<{ tag: string; inspeccionado: boolean }[]>;
  },

  /**
   * Obtiene la lista completa de extintores y estadísticas de un área.
   */
  async getExtintoresByArea(area: string): Promise<ExtintorAreaResponse> {
    return obtenerExtintoresPorArea(area);
  },

  /**
   * Obtiene la lista de extintores y estadísticas asociadas a un TAG específico.
   */
  async getExtintoresByTag(tag: string): Promise<{
    extintores: ExtintorBackend[];
    totalExtintoresActivosArea: number;
  }> {
    const response = await obtenerExtintoresPorTag(tag);
    return {
      extintores: response.extintores || [],
      totalExtintoresActivosArea: response.totalExtintoresActivosArea || 0,
    };
  },

  /**
   * Valida si un TAG ya tiene un formulario o datos iniciales en la base de datos.
   */
  async verifyTag(datos: VerificarTagData): Promise<{
    existe: boolean;
    formulario?: FormularioInspeccion;
    extintores?: { extintores: ExtintorBackend[]; totalExtintoresActivosArea?: number };
    superintendencia?: string;
  }> {
    return verificarTag(datos);
  },

  /**
   * Desactiva temporal o permanentemente un extintor mediante su código único.
   */
  async deactivateExtintor(codigo: string): Promise<{ exito: boolean; mensaje?: string }> {
    return desactivarExtintor(codigo);
  },

  /**
   * Crea un nuevo registro de formulario de sistemas de emergencia.
   */
  async createForm(data: FormularioInspeccion): Promise<FormularioInspeccion> {
    return crearFormSistemasEmergencia(data);
  },

  /**
   * Actualiza los datos de inspección mensuales para un TAG específico.
   */
  async updateMesByTag(
    tag: string,
    mes: Mes,
    mesData: DatosMes,
    area: string
  ): Promise<FormularioInspeccion> {
    return actualizarMesPorTag(tag, mes, mesData, area);
  },

  /**
   * Actualiza el listado de inspección de extintores para un TAG específico.
   */
  async updateExtintoresByTag(
    tag: string,
    payload: { tag: string; extintores: InspeccionExtintor[]; area: string }
  ): Promise<{ success: boolean; message: string }> {
    return actualizarExtintoresPorTag(tag, payload);
  },
};
