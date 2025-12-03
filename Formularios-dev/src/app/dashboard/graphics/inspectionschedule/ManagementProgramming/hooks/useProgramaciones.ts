import { useState, useCallback } from "react";
import { Programacion, ProgramacionFormData } from "../types/IProps";
import { programacionAPI } from "../utils/programacion.utils";

interface UseProgramacionesReturn {
  programaciones: Programacion[];
  areasDisponibles: string[];
  loading: boolean;
  error: string;
  extraerAreasUnicas: (programaciones: Programacion[]) => void;
  crearProgramacion: (
    templateId: string,
    templateName: string,
    año: number,
    formData: ProgramacionFormData
  ) => Promise<void>;
  actualizarProgramacion: (
    id: string,
    templateId: string,
    templateName: string,
    año: number,
    formData: ProgramacionFormData
  ) => Promise<void>;
  eliminarProgramacion: (id: string) => Promise<void>;
  setError: (error: string) => void;
}

export const useProgramaciones = (initialProgramaciones: Programacion[]): UseProgramacionesReturn => {
  const [programaciones, setProgramaciones] = useState<Programacion[]>(initialProgramaciones);
  const [areasDisponibles, setAreasDisponibles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const extraerAreasUnicas = useCallback((progs: Programacion[]) => {
    const areas = [...new Set(progs.map((p) => p.area))];
    setAreasDisponibles(areas);
  }, []);

  const crearProgramacion = async (
    templateId: string,
    templateName: string,
    año: number,
    formData: ProgramacionFormData
  ): Promise<void> => {
    setLoading(true);
    setError("");

    try {
      const payload = {
        templateId,
        templateName: templateName || "Sin nombre",
        area: formData.area,
        managementYear: año,
        firstSemesterDueDate: formData.firstSemesterDueDate?.toDate(),
        secondSemesterDueDate: formData.secondSemesterDueDate?.toDate(),
      };

      await programacionAPI.crear(payload);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Error al crear programación";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const actualizarProgramacion = async (
    id: string,
    templateId: string,
    templateName: string,
    año: number,
    formData: ProgramacionFormData
  ): Promise<void> => {
    setLoading(true);
    setError("");

    try {
      const payload = {
        templateId,
        templateName: templateName || "Sin nombre",
        area: formData.area,
        managementYear: año,
        firstSemesterDueDate: formData.firstSemesterDueDate?.toDate(),
        secondSemesterDueDate: formData.secondSemesterDueDate?.toDate(),
      };

      await programacionAPI.actualizar(id, payload);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Error al actualizar programación";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const eliminarProgramacion = async (id: string): Promise<void> => {
    setLoading(true);
    setError("");
    
    try {
      await programacionAPI.eliminar(id);
      setProgramaciones(prev => prev.filter(p => p._id !== id));
      setAreasDisponibles(() => {
        const updatedProgramaciones = programaciones.filter(p => p._id !== id);
        return [...new Set(updatedProgramaciones.map(p => p.area))];
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Error al eliminar programación";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    programaciones,
    areasDisponibles,
    loading,
    error,
    extraerAreasUnicas,
    crearProgramacion,
    actualizarProgramacion,
    eliminarProgramacion,
    setError,
  };
};