"use client"
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import "dayjs/locale/es";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Snackbar,
  Alert,
  Box,
  useMediaQuery,
  useTheme,
} from "@mui/material";

import { useSemaforoFormularios } from "./hook/InspectionForm";
import { TableRow as FormularioTableRow } from "./components/TableRow";
import { TableRowMobile } from "./components/TableRowMobile";
import { InstanciasModal } from "./components/Modals/InstanciasModal";
import { ProgramacionDirectaModal } from "./components/Modals/ProgramacionDirectaModal";
import { ProgramacionesModal } from "./components/Modals/ProgramacionesModal";
import { ProgramacionAreaModal } from "./components/Modals/ProgramacionAreaModal";
import { TABLE_COLUMNS } from "./constants/constants-config";
import { Formulario } from "./types/Iprops";
import {
  abrirModalInstancias,
  abrirModalProgramacionArea,
  abrirModalProgramaciones,
  abrirModalProgramacionDirecta,
  guardarProgramacionDirecta,
  obtenerArea,
} from "./utils/InspectionForm.utils";

interface SemaforoFormulariosProps {
  datos: Formulario[];
}

export default function SemaforoFormularios({ datos }: SemaforoFormulariosProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md')); // 👈 Detecta mobile
  
  const {
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
    snackbar,
    formDataDirecta,
    loadingDirecta,
    errorDirecta,
    esSegundoSemestre,
    programaciones,

    // Setters
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
    setFormDataDirecta,
    setLoadingDirecta,
    setErrorDirecta,
    setEsSegundoSemestre,

    // Funciones
    mostrarSnackbar,
    cerrarSnackbar,
  } = useSemaforoFormularios();

  // Handler para abrir modal de instancias
  const handleAbrirModalInstancias = (formulario: Formulario) => {
    abrirModalInstancias(
      formulario,
      setInstanciasSeleccionadas,
      setNombreFormularioSeleccionado,
      setFormularioSeleccionado,
      setModalAbierto
    );
  };

  // Handler para abrir modal de programación por área
  const handleAbrirProgramacionArea = (
    formulario: Formulario,
    area: string
  ) => {
    abrirModalProgramacionArea(
      formulario,
      area,
      setFormularioSeleccionado,
      setAreaSeleccionada,
      setProgramaciones,
      () => {},
      setModalProgramacionAreaAbierto
    );
  };

  // Handler para abrir modal de programaciones general
  const handleAbrirProgramaciones = (formulario: Formulario) => {
    abrirModalProgramaciones(
      formulario,
      setFormularioSeleccionado,
      setProgramaciones,
      () => {},
      setModalProgramacionesAbierto
    );
  };

  const handleAbrirProgramacionDirecta = (
    formulario: Formulario,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    instancia: any,
    esSegundoSemestreParam: boolean = false,
    areaEspecifica?: string
  ) => {
    const area =
      areaEspecifica ||
      (instancia ? obtenerArea(instancia) : "Área no especificada");

    abrirModalProgramacionDirecta(
      formulario,
      instancia,
      area,
      esSegundoSemestreParam,
      setFormularioSeleccionado,
      setInstanciaSeleccionada,
      setAreaSeleccionada,
      setEsSegundoSemestre,
      setFormDataDirecta,
      setErrorDirecta,
      setModalProgramacionDirectaAbierto
    );
  };

  const handleGuardarProgramacionDirecta = async () => {
    if (!formularioSeleccionado) return;

    await guardarProgramacionDirecta(
      formDataDirecta,
      formularioSeleccionado,
      areaSeleccionada,
      setLoadingDirecta,
      setErrorDirecta,
      () => setModalProgramacionDirectaAbierto(false),
      mostrarSnackbar
    );
  };

  const handleProgramacionesChange = () => {
    if (formularioSeleccionado) {
      if (modalProgramacionAreaAbierto) {
        abrirModalProgramacionArea(
          formularioSeleccionado,
          areaSeleccionada,
          setFormularioSeleccionado,
          setAreaSeleccionada,
          setProgramaciones,
          () => {},
          setModalProgramacionAreaAbierto
        );
      } else {
        abrirModalProgramaciones(
          formularioSeleccionado,
          setFormularioSeleccionado,
          setProgramaciones,
          () => {},
          setModalProgramacionesAbierto
        );
      }
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
      {/* 👇 VERSIÓN MOBILE */}
      {isMobile && (
        <Box sx={{ p: 1 }}>
          {datos.map((formulario) => (
            <TableRowMobile
              key={formulario.formularioId}
              formulario={formulario}
              onAbrirInstancias={handleAbrirModalInstancias}
              onAbrirProgramaciones={handleAbrirProgramaciones}
              onAbrirProgramacionArea={handleAbrirProgramacionArea}
              onProgramarDirecta={handleAbrirProgramacionDirecta}
            />
          ))}
        </Box>
      )}

      {/* 👇 VERSIÓN DESKTOP */}
      {!isMobile && (
        <TableContainer component={Paper} elevation={2}>
          <Table sx={{ minWidth: 1400 }} aria-label="semáforo de formularios">
            <TableHead>
              <TableRow>
                {TABLE_COLUMNS.map((columna) => (
                  <TableCell key={columna} align="center">
                    {columna}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {datos.map((formulario) => (
                <FormularioTableRow
                  key={formulario.formularioId}
                  formulario={formulario}
                  onAbrirInstancias={handleAbrirModalInstancias}
                  onAbrirProgramaciones={handleAbrirProgramaciones}
                  onAbrirProgramacionArea={handleAbrirProgramacionArea}
                  onProgramarDirecta={handleAbrirProgramacionDirecta}
                />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Los modales se mantienen igual */}
      <InstanciasModal
        open={modalAbierto}
        onClose={() => setModalAbierto(false)}
        instancias={instanciasSeleccionadas}
        nombreFormulario={nombreFormularioSeleccionado}
        formularioSeleccionado={formularioSeleccionado!}
        onProgramarClick={handleAbrirProgramacionDirecta}
      />

      <ProgramacionDirectaModal
        open={modalProgramacionDirectaAbierto}
        onClose={() => setModalProgramacionDirectaAbierto(false)}
        formularioSeleccionado={formularioSeleccionado!}
        areaSeleccionada={areaSeleccionada}
        instanciaSeleccionada={instanciaSeleccionada}
        formData={formDataDirecta}
        loading={loadingDirecta}
        error={errorDirecta}
        onFormDataChange={setFormDataDirecta}
        onGuardar={handleGuardarProgramacionDirecta}
        esSegundoSemestre={esSegundoSemestre}
      />

      <ProgramacionesModal
        open={modalProgramacionesAbierto}
        onClose={() => setModalProgramacionesAbierto(false)}
        formularioSeleccionado={formularioSeleccionado!}
        programaciones={programaciones}
        onProgramacionesChange={handleProgramacionesChange}
      />

      <ProgramacionAreaModal
        open={modalProgramacionAreaAbierto}
        onClose={() => setModalProgramacionAreaAbierto(false)}
        formularioSeleccionado={formularioSeleccionado!}
        areaSeleccionada={areaSeleccionada}
        programaciones={programaciones}
        onProgramacionesChange={handleProgramacionesChange}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={cerrarSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snackbar.severity} onClose={cerrarSnackbar}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </LocalizationProvider>
  );
}

