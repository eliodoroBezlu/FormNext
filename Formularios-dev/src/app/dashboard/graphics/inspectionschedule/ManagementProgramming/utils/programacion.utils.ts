import { getAuthHeaders } from "@/lib/actions/helpers";
import { Programacion, ProgramacionFormData } from "../types/IProps";

const API_BASE = `${API_BASE_URL}/inspection-schedule`;

import dayjs, { Dayjs } from "dayjs";
import { API_BASE_URL } from "@/lib/constants";

export const programacionUtils = {
  convertirFechaAISO(fecha: Dayjs | null): string | undefined {
    if (!fecha) return undefined;
    
    try {
      return fecha.format('YYYY-MM-DD');
    } catch {
      return undefined;
    }
  },

  convertirDateADayjs(fecha: Date | string | null): Dayjs | null {
    if (!fecha) return null;
    return dayjs(fecha);
  },

  formatearFecha(fecha: Date | null): string {
    if (!fecha) return "No programado";
    return new Date(fecha).toLocaleDateString("es-ES");
  },

  getEstadoSemestre(
    dueDate: Date | undefined,
    completionDate: Date | undefined,
    esPrimerSemestre: boolean = true
  ): { 
    texto: string; 
    color: "default" | "success" | "error" | "warning";
    fechaLimite?: string;
    descripcion: string;
  } {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    if (!dueDate) {
      return { 
        texto: "No programado", 
        color: "default",
        descripcion: "No hay fecha programada"
      };
    }

    if (completionDate) {
      return { 
        texto: "Completado", 
        color: "success",
        descripcion: "Inspección realizada correctamente"
      };
    }

    const fechaVencimiento = new Date(dueDate);
    fechaVencimiento.setHours(0, 0, 0, 0);
    
    const fechaLimite = new Date(fechaVencimiento);
    fechaLimite.setDate(fechaLimite.getDate() + 30);
    
    const fechaLimiteFormateada = this.formatearFecha(fechaLimite);
    const diasRestantes = Math.ceil((fechaVencimiento.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));

    if (hoy < fechaVencimiento) {
      if (diasRestantes <= 30) {
        return { 
          texto: "Pendiente", 
          color: "warning",
          fechaLimite: fechaLimiteFormateada,
          descripcion: `Pendiente llenar hasta antes del ${fechaLimiteFormateada}`
        };
      } else {
        return { 
          texto: "Programado", 
          color: "success",
          descripcion: `Inspección programada para el ${this.formatearFecha(dueDate)}`
        };
      }
    }

    if (hoy >= fechaVencimiento && hoy <= fechaLimite) {
      return { 
        texto: "Crítico", 
        color: "error",
        fechaLimite: fechaLimiteFormateada,
        descripcion: `¡Crítico! Ya va a expirar. Llenar antes del ${fechaLimiteFormateada}`
      };
    }

    if (hoy > fechaLimite) {
      const semestre = esPrimerSemestre ? "primer" : "segundo";
      return { 
        texto: "Caducado", 
        color: "default",
        descripcion: `La inspección del ${semestre} semestre ya caducó`
      };
    }

    return { 
      texto: "Programado", 
      color: "success",
      descripcion: `Inspección programada para el ${this.formatearFecha(dueDate)}`
    };
  },

  validarFechas(formData: ProgramacionFormData, año: number): string | null {
    const { firstSemesterDueDate, secondSemesterDueDate } = formData;

    if (!firstSemesterDueDate && !secondSemesterDueDate) {
      return "Debe asignar al menos una fecha de programación";
    }

    if (firstSemesterDueDate) {
      if (firstSemesterDueDate.year() !== año) {
        return "La fecha del primer semestre debe ser del año seleccionado";
      }
      if (firstSemesterDueDate.month() > 5) {
        return "El primer semestre debe ser entre Enero y Junio";
      }
    }

    if (secondSemesterDueDate) {
      if (secondSemesterDueDate.year() !== año) {
        return "La fecha del segundo semestre debe ser del año seleccionado";
      }
      if (secondSemesterDueDate.month() < 6) {
        return "El segundo semestre debe ser entre Julio y Diciembre";
      }
    }

    return null;
  }
};

export const programacionAPI = {
  async crear(payload: Omit<Programacion, "_id" | "status">): Promise<Programacion> {
    const headers = await getAuthHeaders();
    
    const response = await fetch(API_BASE, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Error al crear programación");
    }

    return response.json();
  },

  async actualizar(id: string, payload: Partial<Programacion>): Promise<Programacion> {
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${API_BASE}/${id}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Error al actualizar programación");
    }

    return response.json();
  },

  async eliminar(id: string): Promise<void> {
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${API_BASE}/${id}`, {
      method: "DELETE",
      headers,
    });

    if (!response.ok) {
      throw new Error("Error al eliminar programación");
    }
  }
};