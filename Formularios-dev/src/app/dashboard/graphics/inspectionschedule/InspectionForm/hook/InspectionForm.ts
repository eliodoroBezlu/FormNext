import { useState, useCallback } from "react";
import { SnackbarState, FormDataDirecta } from "../types/Iprops";

export const useSemaforoFormularios = () => {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modalProgramacionesAbierto, setModalProgramacionesAbierto] = useState(false);
  const [modalProgramacionAreaAbierto, setModalProgramacionAreaAbierto] = useState(false);
  const [modalProgramacionDirectaAbierto, setModalProgramacionDirectaAbierto] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [instanciasSeleccionadas, setInstanciasSeleccionadas] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [formularioSeleccionado, setFormularioSeleccionado] = useState<any>(null);
  const [areaSeleccionada, setAreaSeleccionada] = useState<string>("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [instanciaSeleccionada, setInstanciaSeleccionada] = useState<any>(null);
  const [nombreFormularioSeleccionado, setNombreFormularioSeleccionado] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [programaciones, setProgramaciones] = useState<any[]>([]);
  const [esSegundoSemestre, setEsSegundoSemestre] = useState(false);
  const [tieneProgramaciones, setTieneProgramaciones] = useState(false);
  const [snackbar, setSnackbar] = useState<SnackbarState>({ 
    open: false, 
    message: "", 
    severity: 'success' 
  });
  const [formDataDirecta, setFormDataDirecta] = useState<FormDataDirecta>({
    firstSemesterDueDate: null,
    secondSemesterDueDate: null,
  });
  const [loadingDirecta, setLoadingDirecta] = useState(false);
  const [errorDirecta, setErrorDirecta] = useState("");

  const mostrarSnackbar = useCallback((message: string, severity: 'success' | 'error' = 'success') => {
    setSnackbar({ open: true, message, severity });
  }, []);

  const cerrarSnackbar = useCallback(() => {
    setSnackbar(prev => ({ ...prev, open: false }));
  }, []);

  return {
    // Estados
    modalAbierto,
    modalProgramacionesAbierto,
    modalProgramacionAreaAbierto,
    modalProgramacionDirectaAbierto,
    instanciasSeleccionadas,
    formularioSeleccionado,
    areaSeleccionada,
    instanciaSeleccionada,
    nombreFormularioSeleccionado,
    programaciones,
    tieneProgramaciones,
    snackbar,
    formDataDirecta,
    loadingDirecta,
    errorDirecta,
    esSegundoSemestre,

    // Setters
    setEsSegundoSemestre,
    setModalAbierto,
    setModalProgramacionesAbierto,
    setModalProgramacionAreaAbierto,
    setModalProgramacionDirectaAbierto,
    setInstanciasSeleccionadas,
    setFormularioSeleccionado,
    setAreaSeleccionada,
    setInstanciaSeleccionada,
    setNombreFormularioSeleccionado,
    setProgramaciones,
    setTieneProgramaciones,
    setFormDataDirecta,
    setLoadingDirecta,
    setErrorDirecta,
    
    // Funciones
    mostrarSnackbar,
    cerrarSnackbar,
  };
};