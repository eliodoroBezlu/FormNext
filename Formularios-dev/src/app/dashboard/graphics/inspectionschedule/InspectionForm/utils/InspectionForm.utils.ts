// utils.ts
import { getAuthHeaders } from "@/lib/actions/helpers";
import { Instancia, Formulario } from "../types/IProps";
import { Dayjs } from "dayjs";
import { API_BASE_URL } from "@/lib/constants";

export const formatearFecha = (fechaString: string | null): string | null => {
  if (!fechaString) return null;
  try {
    const fecha = new Date(fechaString);
    if (isNaN(fecha.getTime())) return null;
    return fecha.toLocaleDateString("es-ES");
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  catch (error) {
    return null;
  }
};

export const obtenerFechaInspeccion = (instancia: Instancia): string => {
  if (!instancia?.verificationList) return instancia?.createdAt || "";
  return (
    instancia.verificationList["Fecha inspección"] ||
    instancia.verificationList["Fecha Inspección"] ||
    instancia.verificationList["Fecha Inspector"] ||
    instancia.createdAt ||
    ""
  );
};

export const obtenerArea = (instancia: Instancia): string => {
  if (!instancia?.verificationList) return "N/A";
  return (
    instancia.verificationList["Area Física"] ||
    instancia.verificationList["Área"] ||
    instancia.verificationList["Lugar"] ||
    "N/A"
  );
};

export const generarDatosGrafica = (formulario: Formulario) => {
  if (!formulario.instancias || formulario.instancias.length === 0) {
    return [];
  }

  const areasMap = new Map();

  formulario.instancias.forEach((instancia: Instancia) => {
    const area = obtenerArea(instancia);
    const fechaInspeccion = new Date(
      obtenerFechaInspeccion(instancia) || instancia.createdAt || ""
    );
    const año = fechaInspeccion.getFullYear();
    const esPrimerSemestre = fechaInspeccion.getMonth() <= 5;

    if (!areasMap.has(area)) {
      areasMap.set(area, {
        area,
        primerSemestre: 0,
        segundoSemestre: 0,
        total: 0,
      });
    }

    const areaData = areasMap.get(area);
    if (año === formulario.año) {
      if (esPrimerSemestre) {
        areaData.primerSemestre++;
      } else {
        areaData.segundoSemestre++;
      }
      areaData.total++;
    }
  });

  return Array.from(areasMap.values());
};

export const obtenerAreasUnicas = (formulario: Formulario): string[] => {
  if (!formulario.instancias || formulario.instancias.length === 0) return [];

  const areas = new Set<string>();
  formulario.instancias.forEach((instancia: Instancia) => {
    const area = obtenerArea(instancia);
    if (area && area !== "N/A") {
      areas.add(area);
    }
  });

  return Array.from(areas);
};

export const getEstadoIcon = (estado: string) => {
  switch (estado) {
    case "CUMPLIDO":
      return "CheckCircle";
    case "FUERA_PLAZO":
      return "Warning";
    case "PENDIENTE":
      return "Schedule";
    case "CRITICO":
      return "Error";
    default:
      return "Schedule";
  }
};

export const getEstadoColor = (estado: string) => {
  switch (estado) {
    case "CUMPLIDO":
      return "success";
    case "FUERA_PLAZO":
      return "warning";
    case "PENDIENTE":
      return "info";
    case "CRITICO":
      return "error";
    default:
      return "default";
  }
};

export const verInstancia = (instanciaId: string) => {
  if (!instanciaId) return;
  window.open(`/instances/${instanciaId}`, "_blank");
};

export const abrirModalInstancias = (
  formulario: Formulario,
  setInstanciasSeleccionadas: (instancias: Instancia[]) => void,
  setNombreFormularioSeleccionado: (nombre: string) => void,
  setFormularioSeleccionado: (formulario: Formulario) => void,
  setModalAbierto: (abierto: boolean) => void
) => {
  setInstanciasSeleccionadas(formulario.instancias || []);
  setNombreFormularioSeleccionado(formulario.nombreFormulario);
  setFormularioSeleccionado(formulario);
  setModalAbierto(true);
};

export const abrirModalProgramacionArea = async (
  formulario: Formulario,
  area: string,
  setFormularioSeleccionado: (formulario: Formulario) => void,
  setAreaSeleccionada: (area: string) => void,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setProgramaciones: (programaciones: any[]) => void,
  setTieneProgramaciones: (tiene: boolean) => void,
  setModalProgramacionAreaAbierto: (abierto: boolean) => void
) => {
  try {
    setFormularioSeleccionado(formulario);
    setAreaSeleccionada(area);

    const headers = await getAuthHeaders();
    const response = await fetch(
      `${API_BASE_URL}/inspection-schedule/template/${formulario.formularioId}?year=${formulario.año}`,
      { headers }
    );
    
    if (response.ok) {
      const data = await response.json();
      const programacionesArea = data.filter((
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
        p: any
      ) => p.area === area);
      setProgramaciones(programacionesArea);
      setTieneProgramaciones(programacionesArea.length > 0);
    } else {
      setProgramaciones([]);
      setTieneProgramaciones(false);
    }

    setModalProgramacionAreaAbierto(true);
  } catch (error) {
    console.error("Error cargando programaciones:", error);
    setProgramaciones([]);
    setTieneProgramaciones(false);
    setModalProgramacionAreaAbierto(true);
  }
};

export const abrirModalProgramaciones = async (
  formulario: Formulario,
  setFormularioSeleccionado: (formulario: Formulario) => void,
  setProgramaciones: (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    programaciones: any[]) => void,
  setTieneProgramaciones: (tiene: boolean) => void,
  setModalProgramacionesAbierto: (abierto: boolean) => void
) => {
  try {
    setFormularioSeleccionado(formulario);

    const headers = await getAuthHeaders();
    const response = await fetch(
      `${API_BASE_URL}/inspection-schedule/template/${formulario.formularioId}?year=${formulario.año}`,
      { headers }
    );
    
    if (response.ok) {
      const data = await response.json();
      setProgramaciones(data);
      setTieneProgramaciones(data.length > 0);
    } else {
      setProgramaciones([]);
      setTieneProgramaciones(false);
    }

    setModalProgramacionesAbierto(true);
  } catch (error) {
    console.error("Error cargando programaciones:", error);
    setProgramaciones([]);
    setTieneProgramaciones(false);
    setModalProgramacionesAbierto(true);
  }
};

export const abrirModalProgramacionDirecta = (
  formulario: Formulario,
  instancia: Instancia | null,
  area: string,
  esSegundoSemestre: boolean,
  setFormularioSeleccionado: (formulario: Formulario) => void,
  setInstanciaSeleccionada: (instancia: Instancia | null) => void,
  setAreaSeleccionada: (area: string) => void,
  setEsSegundoSemestre: (esSegundoSemestre: boolean) => void,
  setFormDataDirecta?: (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any) => void,
  setErrorDirecta?: (error: string) => void,
  setModalProgramacionDirectaAbierto?: (abierto: boolean) => void
) => {
  setFormularioSeleccionado(formulario);
  setInstanciaSeleccionada(instancia);
  setAreaSeleccionada(area);
  setEsSegundoSemestre(esSegundoSemestre);

  if (setFormDataDirecta) {
    setFormDataDirecta({
      firstSemesterDueDate: null,
      secondSemesterDueDate: null,
    });
  }

  if (setErrorDirecta) {
    setErrorDirecta("");
  }

  if (setModalProgramacionDirectaAbierto) {
    setModalProgramacionDirectaAbierto(true);
  }
};

// ✅ FUNCIÓN ACTUALIZADA: Ahora acepta Date, Dayjs o string
export const convertirFechaAISO = (fecha: Date | Dayjs | string | null): string | undefined => {
  if (!fecha) return undefined;
  
  try {
    let fechaObj: Date;

    // ✅ Si es un objeto Dayjs (tiene el método .toDate())
    if (fecha && typeof fecha === 'object' && 'toDate' in fecha && typeof fecha.toDate === 'function') {
      fechaObj = fecha.toDate();
    }
    // ✅ Si es un string, convertirlo a Date
    else if (typeof fecha === 'string') {
      fechaObj = new Date(fecha);
    }
    // ✅ Si ya es un Date
    else if (fecha instanceof Date) {
      fechaObj = fecha;
    }
    // ✅ Si no es ninguno de los anteriores
    else {
      console.error("Tipo de fecha no reconocido:", fecha);
      return undefined;
    }

    // ✅ Validar que sea una fecha válida
    if (isNaN(fechaObj.getTime())) {
      console.error("Fecha inválida después de conversión:", fecha);
      return undefined;
    }

    const año = fechaObj.getFullYear();
    const mes = String(fechaObj.getMonth() + 1).padStart(2, '0');
    const dia = String(fechaObj.getDate()).padStart(2, '0');
    
    return `${año}-${mes}-${dia}`;
  } catch (error) {
    console.error("Error convirtiendo fecha:", error, "Valor recibido:", fecha);
    return undefined;
  }
};

// ✅ FUNCIÓN ACTUALIZADA: Validación que acepta Date o Dayjs
export const validarFechasProgramacion = (
  firstSemesterDueDate: Date | Dayjs | null,
  secondSemesterDueDate: Date | Dayjs | null,
  año: number
): string | null => {
  if (!firstSemesterDueDate && !secondSemesterDueDate) {
    return "Debe asignar al menos una fecha de programación";
  }

  if (firstSemesterDueDate) {
    // ✅ Convertir a Date si es Dayjs
    const fecha = (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      firstSemesterDueDate as any).toDate 
      ? (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        firstSemesterDueDate as any).toDate() 
      : new Date(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        firstSemesterDueDate as any);
      
    if (fecha.getFullYear() !== año) {
      return "La fecha del primer semestre debe ser del año seleccionado";
    }
    if (fecha.getMonth() > 5) {
      return "El primer semestre debe ser entre Enero y Junio";
    }
  }

  if (secondSemesterDueDate) {
    // ✅ Convertir a Date si es Dayjs
    const fecha = (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      secondSemesterDueDate as any).toDate 
      ? (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        secondSemesterDueDate as any).toDate() 
      : new Date(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        secondSemesterDueDate as any);
      
    if (fecha.getFullYear() !== año) {
      return "La fecha del segundo semestre debe ser del año seleccionado";
    }
    if (fecha.getMonth() < 6) {
      return "El segundo semestre debe ser entre Julio y Diciembre";
    }
  }

  return null;
};

export const guardarProgramacionDirecta = async (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formDataDirecta: any,
  formularioSeleccionado: Formulario,
  areaSeleccionada: string,
  setLoadingDirecta: (loading: boolean) => void,
  setErrorDirecta: (error: string) => void,
  onSuccess: () => void,
  mostrarSnackbar: (message: string, severity: 'success' | 'error') => void
) => {
  const { firstSemesterDueDate, secondSemesterDueDate } = formDataDirecta;

  // ✅ Debug: Ver qué valores llegan
  console.log("🔍 Fechas recibidas:", {
    first: firstSemesterDueDate,
    second: secondSemesterDueDate,
    firstType: firstSemesterDueDate?.constructor?.name,
    secondType: secondSemesterDueDate?.constructor?.name,
  });

  const errorValidacion = validarFechasProgramacion(
    firstSemesterDueDate,
    secondSemesterDueDate,
    formularioSeleccionado.año
  );
  
  if (errorValidacion) {
    setErrorDirecta(errorValidacion);
    return;
  }

  setLoadingDirecta(true);
  setErrorDirecta("");
  
  try {
    const firstDateISO = convertirFechaAISO(firstSemesterDueDate);
    const secondDateISO = convertirFechaAISO(secondSemesterDueDate);

    // ✅ Debug: Ver fechas convertidas
    console.log("📅 Fechas convertidas:", {
      firstDateISO,
      secondDateISO,
    });

    const payload = {
      templateId: formularioSeleccionado.formularioId,
      templateName: formularioSeleccionado.nombreFormulario,
      area: areaSeleccionada,
      managementYear: formularioSeleccionado.año,
      firstSemesterDueDate: firstDateISO,
      secondSemesterDueDate: secondDateISO,
    };

    console.log("📤 Enviando programación directa:", payload);

    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/inspection-schedule`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      let errorMessage = `Error ${response.status}: ${response.statusText}`;
      
      try {
        const errorData = await response.json();
        console.error("❌ Error del servidor:", errorData);
        errorMessage = errorData.message || errorMessage;
        
        if (response.status === 400) {
          errorMessage = `Datos inválidos: ${errorMessage}`;
        } else if (response.status === 500) {
          errorMessage = `Error interno del servidor: ${errorMessage}`;
        }
      } catch (parseError) {
        console.error("❌ Error parseando respuesta de error:", parseError);
        errorMessage = `Error ${response.status}: No se pudo leer la respuesta del servidor`;
      }
      
      throw new Error(errorMessage);
    }

    const responseData = await response.json();
    console.log("✅ Programación guardada exitosamente:", responseData);
    
    onSuccess();
    mostrarSnackbar("✅ Programación guardada exitosamente", 'success');
    
  } catch (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    error: any) {
    console.error("❌ Error completo:", error);
    setErrorDirecta(error.message || "Error de conexión con el servidor");
    mostrarSnackbar(`❌ Error: ${error.message || "Error al guardar la programación"}`, 'error');
  } finally {
    setLoadingDirecta(false);
  }
};

export const tieneInstancias = (formulario: Formulario): boolean => {
  return formulario.totalInstancias > 0;
};

export const truncarTexto = (texto: string, longitud: number): string => {
  if (texto.length <= longitud) return texto;
  return `${texto.substring(0, longitud)}...`;
};

export const getChipColorFromStatus = (status: string): "success" | "primary" | "default" => {
  switch (status) {
    case "completado":
      return "success";
    case "aprobado":
      return "primary";
    default:
      return "default";
  }
};

export const esPrimerSemestre = (fecha: string): boolean => {
  try {
    const mes = new Date(fecha).getMonth() + 1;
    return mes >= 1 && mes <= 6;
  } catch (error) {
    console.error("Error determinando semestre:", error);
    return false;
  }
};
