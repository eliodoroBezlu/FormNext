import { useState, useCallback } from "react";
import { Programacion, ProgramacionFormData } from "../types/IProps";
import { programacionUtils } from "../utils/programacion.utils";
import dayjs from "dayjs";

interface UseProgramacionFormReturn {
  formData: ProgramacionFormData;
  programacionEditando: Programacion | null;
  modalAbierto: boolean;
  error: string;
  setFormData: (data: ProgramacionFormData) => void;
  setProgramacionEditando: (programacion: Programacion | null) => void;
  setModalAbierto: (abierto: boolean) => void;
  setError: (error: string) => void;
  resetForm: () => void;
  abrirModalNuevo: () => void;
  abrirModalEditar: (programacion: Programacion) => void;
  cerrarModal: () => void;
  validarFechas: (año: number) => boolean;
}

export const useProgramacionForm = (): UseProgramacionFormReturn => {
  const [formData, setFormData] = useState<ProgramacionFormData>({
    area: "",
    firstSemesterDueDate: null,
    secondSemesterDueDate: null,
  });
  
  const [programacionEditando, setProgramacionEditando] = useState<Programacion | null>(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [error, setError] = useState("");

  const resetForm = useCallback(() => {
    setFormData({
      area: "",
      firstSemesterDueDate: null,
      secondSemesterDueDate: null,
    });
    setProgramacionEditando(null);
    setError("");
  }, []);

  const abrirModalNuevo = useCallback(() => {
    resetForm();
    setModalAbierto(true);
  }, [resetForm]);

  const abrirModalEditar = useCallback((programacion: Programacion) => {
    setFormData({
    area: programacion.area,
    firstSemesterDueDate: programacion.firstSemesterDueDate ? dayjs(programacion.firstSemesterDueDate) : null,
    secondSemesterDueDate: programacion.secondSemesterDueDate ? dayjs(programacion.secondSemesterDueDate) : null,
  });
    setProgramacionEditando(programacion);
    setModalAbierto(true);
  }, []);

  const cerrarModal = useCallback(() => {
    setModalAbierto(false);
    resetForm();
  }, [resetForm]);

  const validarFechas = useCallback((año: number): boolean => {
    const error = programacionUtils.validarFechas(formData, año);
    if (error) {
      setError(error);
      return false;
    }
    setError("");
    return true;
  }, [formData]);

  return {
    formData,
    programacionEditando,
    modalAbierto,
    error,
    setFormData,
    setProgramacionEditando,
    setModalAbierto,
    setError,
    resetForm,
    abrirModalNuevo,
    abrirModalEditar,
    cerrarModal,
    validarFechas,
  };
};