// "use client"

// import type React from "react"
// import { useEffect, useState } from "react"
// import {
//   Box,
//   Paper,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   IconButton,
//   Typography,
//   CircularProgress,
//   Tooltip,
//   TablePagination,
//   TextField,
//   Grid,
//   MenuItem,
//   FormControl,
//   InputLabel,
//   Select,
//   Button,
//   Container,
//   Chip,
// } from "@mui/material"
// import { 
//   Visibility as VisibilityIcon, 
//   PictureAsPdf as PdfIcon, 
//   TableChart as ExcelIcon, 
//   Edit as EditIcon,
//   Search as SearchIcon,
//   Clear as ClearIcon,
//   FireExtinguisher as ExtintorIcon,
//   ArrowBack as ArrowBackIcon,
// } from "@mui/icons-material"
// import { useRouter } from "next/navigation"
// import { 
//   descargarExcelInspeccionesEmergenciaCliente, 
//   descargarPdfInspeccionesEmergenciaCliente
// } from "@/lib/actions/client"
// import { buscarAreas, obtenerExtintoresPorArea, obtenerSistemasEmergenciaReport } from "@/app/actions/inspeccion"

// import type { ExtintorBackend, FiltrosInspeccion, InspeccionServiceExport } from "@/types/formTypes"

// // Interfaces para extintores
// // Lista de meses para el filtro
// const MESES = [
//   "ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO",
//   "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"
// ]

// // Lista de superintendencias predefinidas
// const SUPERINTENDENCIAS = [
//   "Superintendencia de Mantenimiento - Eléctrico e Instrumentación Planta",
//   "Superintendencia de Mantenimiento - Ingeniería de Confiabilidad",
//   "Superintendencia de Mantenimiento - Mec. Plta. Chancado, Molienda y Lubricación",
//   "Superintendencia de Mantenimiento - Mec. Plta. Flot., Filtros, Taller Gral. y RH",
//   "Superintendencia de Mantenimiento - Planificación",
// ]

// export default function ListaInspecciones() {
//   const [inspecciones, setInspecciones] = useState<InspeccionServiceExport[]>([])
//   const [loading, setLoading] = useState(false)
//   const [loadingAreas, setLoadingAreas] = useState(false)
//   const [error, setError] = useState<string | null>(null)
//   const [page, setPage] = useState(0)
//   const [rowsPerPage, setRowsPerPage] = useState(10)
  
//   // Estado para controlar la visibilidad de las tablas
//   const [mostrarResultados, setMostrarResultados] = useState(false)
//   const [mostrarExtintores, setMostrarExtintores] = useState(false)
  
//   // Estados para los filtros
//   const [areaFilter, setAreaFilter] = useState("")
//   const [superintendenciaFilter, setSuperintendenciaFilter] = useState("")
//   const [mesFilter, setMesFilter] = useState("")
//   const [documentCodeFilter, setDocumentCodeFilter] = useState("")
  
//   // Estados para extintores
//   const [extintores, setExtintores] = useState<ExtintorBackend[]>([])
//   const [loadingExtintores, setLoadingExtintores] = useState(false)
//   const [pageExtintores, setPageExtintores] = useState(0)
//   const [rowsPerPageExtintores, setRowsPerPageExtintores] = useState(10)
  
//   // Lista para el desplegable de áreas
//   const [areas, setAreas] = useState<string[]>([])
  
//   const router = useRouter()

//   useEffect(() => {
//     // Cargar áreas al iniciar el componente
//     cargarAreas()
//   }, [])

//   const cargarAreas = async () => {
//     try {
//       setLoadingAreas(true)
//       // Utilizamos el servicio de búsqueda de áreas existente
//       const areasData = await buscarAreas("")
//       setAreas(areasData)
//     } catch (error) {
//       console.error("Error al cargar la lista de áreas:", error)
//     } finally {
//       setLoadingAreas(false)
//     }
//   }

//   const filtrarInspecciones = async () => {
//     try {
//       setLoading(true)
//       setError(null)
      
//       // Crear el objeto de filtros con los valores de los campos
//       const filtros: FiltrosInspeccion = {}
      
//       if (areaFilter) filtros.area = areaFilter
//       if (superintendenciaFilter) filtros.superintendencia = superintendenciaFilter
//       if (mesFilter) filtros.mesActual = mesFilter
//       if (documentCodeFilter) filtros.documentCode = documentCodeFilter
      
//       // Realizar la consulta filtrada al backend
//       const data = await obtenerSistemasEmergenciaReport(filtros)
//       console.log(data)
//       setInspecciones(data)
//       setPage(0) // Resetear a la primera página cuando se filtran resultados
//       setMostrarResultados(true) // Mostrar resultados después de buscar
//       setMostrarExtintores(false) // Ocultar extintores si están visibles
//     } catch (error) {
//       console.error("Error al filtrar las inspecciones:", error)
//       setError("No se pudieron cargar las inspecciones con los filtros seleccionados")
//     } finally {
//       setLoading(false)
//     }
//   }

//   const mostrarExtintoresPorArea = async () => {
//     if (!areaFilter) {
//       setError("Por favor selecciona un área para ver los extintores")
//       return
//     }

//     try {
//       setLoadingExtintores(true)
//       setError(null)
//       const response = await obtenerExtintoresPorArea(areaFilter)
//       console.log("respuesta :", response)
//        if (response && response.extintores && Array.isArray(response.extintores)) {
//         setExtintores(response.extintores)
//       } else {
//         // Manejar el caso donde la respuesta no tiene la estructura esperada
//         console.error("Estructura de respuesta inesperada:", response)
//         setExtintores([])
//         setError("La respuesta del servidor no tiene el formato esperado")
//       }

      
//       setPageExtintores(0)
//       setMostrarExtintores(true)
//       setMostrarResultados(false) // Ocultar inspecciones si están visibles
//     } catch (error) {
//       console.error("Error al cargar extintores:", error)
//       setError("No se pudieron cargar los extintores del área seleccionada")
//     } finally {
//       setLoadingExtintores(false)
//     }
//   }

 

//   const limpiarTodo = () => {
//     // Limpiar filtros de inspecciones
//     setAreaFilter("")
//     setSuperintendenciaFilter("")
//     setMesFilter("")
//     setDocumentCodeFilter("")
//     setInspecciones([])
//     setMostrarResultados(false)
    
//     // Limpiar filtros de extintores
//     setExtintores([])
//     setMostrarExtintores(false)
    
//     // Limpiar errores
//     setError(null)
//   }

//   const volverAInspecciones = () => {
//     setMostrarExtintores(false)
//     setMostrarResultados(true)
//   }

//   const handleChangePage = (event: unknown, newPage: number) => {
//     setPage(newPage)
//   }

//   const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
//     setRowsPerPage(Number.parseInt(event.target.value, 10))
//     setPage(0)
//   }

//   const handleChangePageExtintores = (event: unknown, newPage: number) => {
//     setPageExtintores(newPage)
//   }

//   const handleChangeRowsPerPageExtintores = (event: React.ChangeEvent<HTMLInputElement>) => {
//     setRowsPerPageExtintores(Number.parseInt(event.target.value, 10))
//     setPageExtintores(0)
//   }

//   const handleVerDetalle = (id: string) => {
//     router.push(`/dashboard/inspecciones/${id}`)
//   }

//   const handleEditar = (inspeccion: InspeccionServiceExport) => {
//     router.push(`/dashboard/inspecciones/editar/${inspeccion._id}`)
//   }

//   const handleDescargarPdf = async (id: string) => {
//     try {
//       await descargarPdfInspeccionesEmergenciaCliente(id)
//     } catch (error) {
//       console.error("Error al descargar el PDF:", error)
//     }
//   }

//   const handleDescargarExcel = async (id: string) => {
//     try {
//       await descargarExcelInspeccionesEmergenciaCliente(id)
//     } catch (error) {
//       console.error("Error al descargar el Excel:", error)
//     }
//   }

//   // Manejar la tecla Enter en el campo de código de documento
//   const handleKeyPress = (e: React.KeyboardEvent) => {
//     if (e.key === 'Enter') {
//       filtrarInspecciones()
//     }
//   }

//   const obtenerMesesInspeccionados = (inspeccion: InspeccionServiceExport, mesFiltrando?: string): string => {
//     if (!inspeccion.meses || Object.keys(inspeccion.meses).length === 0) {
//       return 'Sin inspecciones';
//     }
    
//     // Si hay un filtro de mes activo, mostrar ese mes específicamente
//     if (mesFiltrando && inspeccion.meses[mesFiltrando]) {
//       return mesFiltrando;
//     }
    
//     // Si no hay filtro o es vacío, mostrar el último mes inspeccionado
//     const mesesConInspeccion = Object.keys(inspeccion.meses);
    
//     // Definir el orden de los meses para encontrar el más reciente
//     const ordenMeses = [
//       "ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO",
//       "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"
//     ];
    
//     // Encontrar el mes más reciente según el orden
//     let ultimoMes = mesesConInspeccion[0];
//     let ultimoIndice = ordenMeses.indexOf(ultimoMes);
    
//     for (const mes of mesesConInspeccion) {
//       const indiceMes = ordenMeses.indexOf(mes);
//       if (indiceMes > ultimoIndice) {
//         ultimoMes = mes;
//         ultimoIndice = indiceMes;
//       }
//     }
    
//     return ultimoMes;
//   };

//   return (
//     <Container maxWidth="lg">
//       <Typography variant="h5" gutterBottom sx={{ mt: 3, mb: 3 }}>
//         Lista de Inspecciones
//       </Typography>
      
//       {/* PANEL DE FILTROS */}
//       <Paper elevation={3} sx={{ mb: 4, p: 3, borderRadius: '8px' }}>
//         <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
//           Filtros de búsqueda
//         </Typography>
        
//         <Grid container spacing={3}>
//           <Grid size={{ xs: 12, md: 3}}>
//             <FormControl fullWidth size="small">
//               <InputLabel id="area-filter-label">Área</InputLabel>
//               <Select
//                 labelId="area-filter-label"
//                 value={areaFilter}
//                 onChange={(e) => setAreaFilter(e.target.value)}
//                 label="Área"
//                 disabled={loadingAreas}
//               >
//                 <MenuItem value="">Todas</MenuItem>
//                 {areas.map((area) => (
//                   <MenuItem key={area} value={area}>
//                     {area}
//                   </MenuItem>
//                 ))}
//               </Select>
//             </FormControl>
//           </Grid>
          
//           <Grid size={{ xs: 12, md: 3}}>
//             <FormControl fullWidth size="small">
//               <InputLabel id="superintendencia-filter-label">Superintendencia</InputLabel>
//               <Select
//                 labelId="superintendencia-filter-label"
//                 value={superintendenciaFilter}
//                 onChange={(e) => setSuperintendenciaFilter(e.target.value)}
//                 label="Superintendencia"
//               >
//                 <MenuItem value="">Todas</MenuItem>
//                 {SUPERINTENDENCIAS.map((superintendencia) => (
//                   <MenuItem key={superintendencia} value={superintendencia}>
//                     {superintendencia}
//                   </MenuItem>
//                 ))}
//               </Select>
//             </FormControl>
//           </Grid>
          
//           <Grid size={{ xs: 12, md: 3}}>
//             <FormControl fullWidth size="small">
//               <InputLabel id="mes-filter-label">Mes de inspección</InputLabel>
//               <Select
//                 labelId="mes-filter-label"
//                 value={mesFilter}
//                 onChange={(e) => setMesFilter(e.target.value)}
//                 label="Mes de inspección"
//               >
//                 <MenuItem value="">Todos</MenuItem>
//                 {MESES.map((mes) => (
//                   <MenuItem key={mes} value={mes}>
//                     {mes}
//                   </MenuItem>
//                 ))}
//               </Select>
//             </FormControl>
//           </Grid>
          
//           <Grid size={{ xs: 12, md: 3}}>
//             <TextField
//               fullWidth
//               label="Código de documento"
//               variant="outlined"
//               size="small"
//               value={documentCodeFilter}
//               onChange={(e) => setDocumentCodeFilter(e.target.value)}
//               onKeyPress={handleKeyPress}
//             />
//           </Grid>
          
//           <Grid size={{ xs: 12}} display="flex" justifyContent="flex-end" sx={{ mt: 1 }}>
//             <Button 
//               variant="outlined" 
//               startIcon={<ClearIcon />} 
//               onClick={limpiarTodo}
//               sx={{ mr: 1 }}
//             >
//               Limpiar Todo
//             </Button>
//             <Button 
//               variant="contained" 
//               startIcon={<SearchIcon />} 
//               onClick={filtrarInspecciones}
//               color="primary"
//               disabled={loading}
//               sx={{ mr: 1 }}
//             >
//               {loading ? "Buscando..." : "Buscar Inspecciones"}
//             </Button>
//             <Button 
//               variant="contained" 
//               startIcon={<ExtintorIcon />} 
//               onClick={mostrarExtintoresPorArea}
//               color="secondary"
//               disabled={loadingExtintores || !areaFilter}
//             >
//               {loadingExtintores ? "Cargando..." : "Mostrar Extintores"}
//             </Button>
//           </Grid>
//         </Grid>
//       </Paper>
      
//       {/* Estado de carga */}
//       {(loading || loadingExtintores) && (
//         <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
//           <CircularProgress />
//         </Box>
//       )}
      
//       {/* Estado de error */}
//       {error && (
//         <Box display="flex" justifyContent="center" alignItems="center" minHeight="100px">
//           <Typography color="error">{error}</Typography>
//         </Box>
//       )}
      
//       {/* TABLA DE EXTINTORES */}
//       {mostrarExtintores && !loadingExtintores && (
//         <Paper elevation={2} sx={{ borderRadius: '8px', mb: 4 }}>
//           <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//             <Typography variant="h6">
//               Extintores del Área: {areaFilter} ({extintores?.length || 0})
//             </Typography>
//             {mostrarResultados && (
//               <Button
//                 variant="outlined"
//                 startIcon={<ArrowBackIcon />}
//                 onClick={volverAInspecciones}
//                 size="small"
//               >
//                 Volver a Inspecciones
//               </Button>
//             )}
//           </Box>
          
//           <TableContainer>
//             <Table>
//               <TableHead>
//                 <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
//                   <TableCell>Área</TableCell>
//                   <TableCell>Tag</TableCell>
//                   <TableCell>Código Extintor</TableCell>
//                   <TableCell>Ubicación</TableCell>
//                   <TableCell align="center">Estado Inspección</TableCell>
//                   <TableCell align="center">Estado Activo</TableCell>
//                 </TableRow>
//               </TableHead>
//               <TableBody>
//                 {extintores?.length === 0 ? (
//                   <TableRow>
//                     <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
//                       <Typography variant="body1" color="textSecondary">
//                         No se encontraron extintores en el área seleccionada
//                       </Typography>
//                     </TableCell>
//                   </TableRow>
//                 ) : (
//                   extintores
//                     .slice(pageExtintores * rowsPerPageExtintores, pageExtintores * rowsPerPageExtintores + rowsPerPageExtintores)
//                     .map((extintor, index) => (
//                       <TableRow 
//                         key={`${extintor._id}-${pageExtintores * rowsPerPageExtintores + index}`}
//                         sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}
//                       >
//                         <TableCell>{extintor.area}</TableCell>
//                         <TableCell>{extintor.tag}</TableCell>
//                         <TableCell>{extintor.CodigoExtintor}</TableCell>
//                         <TableCell>{extintor.Ubicacion}</TableCell>
//                         <TableCell align="center">
//                           <Chip 
//                             label={extintor.inspeccionado ? "Inspeccionado" : "No Inspeccionado"} 
//                             color={extintor.inspeccionado ? "success" : "error"}
//                             size="small"
//                           />
//                         </TableCell>
//                         <TableCell align="center">
//                           <Chip 
//                             label={extintor.activo ? "Activo" : "Inactivo"} 
//                             color={extintor.activo ? "primary" : "default"}
//                             size="small"
//                           />
//                         </TableCell>
//                       </TableRow>
//                     ))
//                 )}
//               </TableBody>
//             </Table>
//           </TableContainer>
//           <TablePagination
//             rowsPerPageOptions={[5, 10, 25]}
//             component="div"
//             count={extintores.length}
//             rowsPerPage={rowsPerPageExtintores}
//             page={pageExtintores}
//             onPageChange={handleChangePageExtintores}
//             onRowsPerPageChange={handleChangeRowsPerPageExtintores}
//             labelRowsPerPage="Filas por página"
//           />
//         </Paper>
//       )}
      
//       {/* RESULTADOS DE BÚSQUEDA - Solo se muestra cuando mostrarResultados es true y no hay loading */}
//       {mostrarResultados && !loading && (
//         <Paper elevation={2} sx={{ borderRadius: '8px' }}>
//           <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//             <Typography variant="h6">
//               Resultados ({inspecciones.length})
//             </Typography>
//           </Box>
          
//           <TableContainer>
//             <Table>
//               <TableHead>
//                 <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
//                   <TableCell>Fecha de Inspección</TableCell>
//                   <TableCell>Superintendencia</TableCell>
//                   <TableCell>Área</TableCell>
//                   <TableCell>Tag</TableCell>
//                   <TableCell>Responsable Edificio</TableCell>
//                   <TableCell>Código Documento</TableCell>
//                   <TableCell>Mes Actual</TableCell>
//                   <TableCell align="center">Acciones</TableCell>
//                 </TableRow>
//               </TableHead>
//               <TableBody>
//                 {inspecciones.length === 0 ? (
//                   <TableRow>
//                     <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
//                       <Typography variant="body1" color="textSecondary">
//                         No se encontraron inspecciones con los criterios de búsqueda
//                       </Typography>
//                     </TableCell>
//                   </TableRow>
//                 ) : (
//                   inspecciones
//                     .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
//                     .map((inspeccion, index) => (
//                       <TableRow 
//                         key={`${inspeccion._id}-${page * rowsPerPage + index}`}
//                         sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}
//                       >
                        
//                         <TableCell>{new Date(inspeccion.fechaCreacion).toLocaleDateString()}</TableCell>                     
//                         <TableCell>{inspeccion.superintendencia}</TableCell>
//                         <TableCell>{inspeccion.area}</TableCell>
//                         <TableCell>{inspeccion.tag}</TableCell>
//                         <TableCell>{inspeccion.responsableEdificio}</TableCell>
//                         <TableCell>{inspeccion.documentCode}</TableCell>
//                         <TableCell>{obtenerMesesInspeccionados(inspeccion, mesFilter)}</TableCell>
//                         <TableCell align="center">
//                           <Tooltip title="Ver detalle">
//                             <IconButton
//                               onClick={() => handleVerDetalle(inspeccion._id)}
//                               color="primary"
//                               size="small"
//                             >
//                               <VisibilityIcon />
//                             </IconButton>
//                           </Tooltip>
//                           <Tooltip title="Editar">
//                             <IconButton 
//                               onClick={() => handleEditar(inspeccion)} 
//                               color="primary"
//                               size="small"
//                             >
//                               <EditIcon />
//                             </IconButton>
//                           </Tooltip>
//                           <Tooltip title="Descargar PDF">
//                             <IconButton
//                               onClick={() => handleDescargarPdf(inspeccion._id)}
//                               color="secondary"
//                               size="small"
//                             >
//                               <PdfIcon />
//                             </IconButton>
//                           </Tooltip>
//                           <Tooltip title="Descargar Excel">
//                             <IconButton
//                               onClick={() => handleDescargarExcel(inspeccion._id)}
//                               color="success"
//                               size="small"
//                             >
//                               <ExcelIcon />
//                             </IconButton>
//                           </Tooltip>
//                         </TableCell>
//                       </TableRow>
//                     ))
//                 )}
//               </TableBody>
//             </Table>
//           </TableContainer>
//           <TablePagination
//             rowsPerPageOptions={[5, 10, 25]}
//             component="div"
//             count={inspecciones.length}
//             rowsPerPage={rowsPerPage}
//             page={page}
//             onPageChange={handleChangePage}
//             onRowsPerPageChange={handleChangeRowsPerPage}
//             labelRowsPerPage="Filas por página"
//           />
//         </Paper>
//       )}
//     </Container>
//   )
// }

"use client";

import type React from "react";
import { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Typography,
  CircularProgress,
  Tooltip,
  TablePagination,
  TextField,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Button,
  Container,
  Chip,
} from "@mui/material";
import {
  Visibility as VisibilityIcon,
  PictureAsPdf as PdfIcon,
  TableChart as ExcelIcon,
  Edit as EditIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  FireExtinguisher as ExtintorIcon,
  ArrowBack as ArrowBackIcon,
  Lock as LockIcon, // 🔥 Icono para bloqueo
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import {
  descargarExcelInspeccionesEmergenciaCliente,
  descargarPdfInspeccionesEmergenciaCliente,
} from "@/lib/actions/client";
import {
  buscarAreas,
  obtenerExtintoresPorArea,
  obtenerSistemasEmergenciaReport,
} from "@/app/actions/inspeccion";

import type {
  ExtintorBackend,
  FiltrosInspeccion,
  InspeccionServiceExport,
} from "@/types/formTypes";
import { useUserRole } from "@/hooks/useUserRole";

// Lista de meses para el filtro
const MESES = [
  "ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO",
  "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE",
];

// Lista de superintendencias predefinidas
const SUPERINTENDENCIAS = [
  "Superintendencia de Mantenimiento - Eléctrico e Instrumentación Planta",
  "Superintendencia de Mantenimiento - Ingeniería de Confiabilidad",
  "Superintendencia de Mantenimiento - Mec. Plta. Chancado, Molienda y Lubricación",
  "Superintendencia de Mantenimiento - Mec. Plta. Flot., Filtros, Taller Gral. y RH",
  "Superintendencia de Mantenimiento - Planificación",
];

export default function ListaInspecciones() {
  const { user, isLoading: authLoading } = useUserRole()
  const router = useRouter();

  // Estados de datos
  const [inspecciones, setInspecciones] = useState<InspeccionServiceExport[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingAreas, setLoadingAreas] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Paginación Inspecciones
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Estado para controlar la visibilidad de las tablas
  const [mostrarResultados, setMostrarResultados] = useState(false);
  const [mostrarExtintores, setMostrarExtintores] = useState(false);

  // Estados para los filtros
  const [areaFilter, setAreaFilter] = useState("");
  const [superintendenciaFilter, setSuperintendenciaFilter] = useState("");
  const [mesFilter, setMesFilter] = useState("");
  const [documentCodeFilter, setDocumentCodeFilter] = useState("");

  // Estados para extintores (Vista secundaria)
  const [extintores, setExtintores] = useState<ExtintorBackend[]>([]);
  const [loadingExtintores, setLoadingExtintores] = useState(false);
  const [pageExtintores, setPageExtintores] = useState(0);
  const [rowsPerPageExtintores, setRowsPerPageExtintores] = useState(10);

  // Lista para el desplegable de áreas
  const [areas, setAreas] = useState<string[]>([]);

  // 🔥 LÓGICA DE PERMISOS
  const puedeGestionar = () => {
    if (!user || authLoading) return false;

    const rolesPermitidos = ["admin", "supervisor", "superintendente"];
    // Casteo seguro para acceder a roles
    // eslint-disable-next-line @typescript-eslint/no-explicit-any

    if (Array.isArray(user.roles)) {
      return user.roles.some((rol: string) => rolesPermitidos.includes(rol));
    }
    return rolesPermitidos.includes(user.roles as string);
  };

  const tienePermisos = puedeGestionar();

  // Cargar áreas al montar el componente
  useEffect(() => {
    cargarAreas();
  }, []);

  const cargarAreas = async () => {
    try {
      setLoadingAreas(true);
      // Utilizamos el servicio de búsqueda de áreas existente
      const areasData = await buscarAreas("");
      setAreas(areasData);
    } catch (error) {
      console.error("Error al cargar la lista de áreas:", error);
    } finally {
      setLoadingAreas(false);
    }
  };

  const filtrarInspecciones = async () => {
    try {
      setLoading(true);
      setError(null);

      // Crear el objeto de filtros con los valores de los campos
      const filtros: FiltrosInspeccion = {};

      if (areaFilter) filtros.area = areaFilter;
      if (superintendenciaFilter) filtros.superintendencia = superintendenciaFilter;
      if (mesFilter) filtros.mesActual = mesFilter;
      if (documentCodeFilter) filtros.documentCode = documentCodeFilter;

      // Realizar la consulta filtrada al backend
      const data = await obtenerSistemasEmergenciaReport(filtros);
      console.log(data);
      setInspecciones(data);
      setPage(0); // Resetear a la primera página cuando se filtran resultados
      setMostrarResultados(true); // Mostrar resultados después de buscar
      setMostrarExtintores(false); // Ocultar extintores si están visibles
    } catch (error) {
      console.error("Error al filtrar las inspecciones:", error);
      setError(
        "No se pudieron cargar las inspecciones con los filtros seleccionados"
      );
    } finally {
      setLoading(false);
    }
  };

  const mostrarExtintoresPorArea = async () => {
    if (!areaFilter) {
      setError("Por favor selecciona un área para ver los extintores");
      return;
    }

    try {
      setLoadingExtintores(true);
      setError(null);
      const response = await obtenerExtintoresPorArea(areaFilter);
      console.log("respuesta :", response);
      if (
        response &&
        response.extintores &&
        Array.isArray(response.extintores)
      ) {
        setExtintores(response.extintores);
      } else {
        // Manejar el caso donde la respuesta no tiene la estructura esperada
        console.error("Estructura de respuesta inesperada:", response);
        setExtintores([]);
        setError("La respuesta del servidor no tiene el formato esperado");
      }

      setPageExtintores(0);
      setMostrarExtintores(true);
      setMostrarResultados(false); // Ocultar inspecciones si están visibles
    } catch (error) {
      console.error("Error al cargar extintores:", error);
      setError("No se pudieron cargar los extintores del área seleccionada");
    } finally {
      setLoadingExtintores(false);
    }
  };

  const limpiarTodo = () => {
    // Limpiar filtros de inspecciones
    setAreaFilter("");
    setSuperintendenciaFilter("");
    setMesFilter("");
    setDocumentCodeFilter("");
    setInspecciones([]);
    setMostrarResultados(false);

    // Limpiar filtros de extintores
    setExtintores([]);
    setMostrarExtintores(false);

    // Limpiar errores
    setError(null);
  };

  const volverAInspecciones = () => {
    setMostrarExtintores(false);
    setMostrarResultados(true);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(Number.parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleChangePageExtintores = (event: unknown, newPage: number) => {
    setPageExtintores(newPage);
  };

  const handleChangeRowsPerPageExtintores = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPageExtintores(Number.parseInt(event.target.value, 10));
    setPageExtintores(0);
  };

  // 🔥 RUTAS DE NAVEGACIÓN ACTUALIZADAS
  const handleVerDetalle = (id: string) => {
    router.push(`/dashboard/reports/sistemas-de-emergencia/editar/${id}?mode=view`);
  };

  const handleEditar = (inspeccion: InspeccionServiceExport) => {
    router.push(`/dashboard/reports/sistemas-de-emergencia/editar/${inspeccion._id}`);
  };

  const handleDescargarPdf = async (id: string) => {
    try {
      await descargarPdfInspeccionesEmergenciaCliente(id);
    } catch (error) {
      console.error("Error al descargar el PDF:", error);
    }
  };

  const handleDescargarExcel = async (id: string) => {
    try {
      await descargarExcelInspeccionesEmergenciaCliente(id);
    } catch (error) {
      console.error("Error al descargar el Excel:", error);
    }
  };

  // Manejar la tecla Enter en el campo de código de documento
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      filtrarInspecciones();
    }
  };

  const obtenerMesesInspeccionados = (
    inspeccion: InspeccionServiceExport,
    mesFiltrando?: string
  ): string => {
    if (!inspeccion.meses || Object.keys(inspeccion.meses).length === 0) {
      return "Sin inspecciones";
    }

    // Si hay un filtro de mes activo, mostrar ese mes específicamente
    if (mesFiltrando && inspeccion.meses[mesFiltrando]) {
      return mesFiltrando;
    }

    // Si no hay filtro o es vacío, mostrar el último mes inspeccionado
    const mesesConInspeccion = Object.keys(inspeccion.meses);

    // Definir el orden de los meses para encontrar el más reciente
    const ordenMeses = [
      "ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO",
      "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE",
    ];

    // Encontrar el mes más reciente según el orden
    let ultimoMes = mesesConInspeccion[0];
    let ultimoIndice = ordenMeses.indexOf(ultimoMes);

    for (const mes of mesesConInspeccion) {
      const indiceMes = ordenMeses.indexOf(mes);
      if (indiceMes > ultimoIndice) {
        ultimoMes = mes;
        ultimoIndice = indiceMes;
      }
    }

    return ultimoMes;
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h5" gutterBottom sx={{ mt: 3, mb: 3 }}>
        Lista de Inspecciones
      </Typography>

      {/* PANEL DE FILTROS */}
      <Paper elevation={3} sx={{ mb: 4, p: 3, borderRadius: "8px" }}>
        <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
          Filtros de búsqueda
        </Typography>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel id="area-filter-label">Área</InputLabel>
              <Select
                labelId="area-filter-label"
                value={areaFilter}
                onChange={(e) => setAreaFilter(e.target.value)}
                label="Área"
                disabled={loadingAreas}
              >
                <MenuItem value="">Todas</MenuItem>
                {areas.map((area) => (
                  <MenuItem key={area} value={area}>
                    {area}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel id="superintendencia-filter-label">
                Superintendencia
              </InputLabel>
              <Select
                labelId="superintendencia-filter-label"
                value={superintendenciaFilter}
                onChange={(e) => setSuperintendenciaFilter(e.target.value)}
                label="Superintendencia"
              >
                <MenuItem value="">Todas</MenuItem>
                {SUPERINTENDENCIAS.map((superintendencia) => (
                  <MenuItem key={superintendencia} value={superintendencia}>
                    {superintendencia}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel id="mes-filter-label">Mes de inspección</InputLabel>
              <Select
                labelId="mes-filter-label"
                value={mesFilter}
                onChange={(e) => setMesFilter(e.target.value)}
                label="Mes de inspección"
              >
                <MenuItem value="">Todas</MenuItem>
                {MESES.map((mes) => (
                  <MenuItem key={mes} value={mes}>
                    {mes}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <TextField
              fullWidth
              label="Código de documento"
              variant="outlined"
              size="small"
              value={documentCodeFilter}
              onChange={(e) => setDocumentCodeFilter(e.target.value)}
              onKeyPress={handleKeyPress}
            />
          </Grid>

          <Grid
            size={{ xs: 12 }}
            display="flex"
            justifyContent="flex-end"
            sx={{ mt: 1 }}
          >
            <Button
              variant="outlined"
              startIcon={<ClearIcon />}
              onClick={limpiarTodo}
              sx={{ mr: 1 }}
            >
              Limpiar Todo
            </Button>
            <Button
              variant="contained"
              startIcon={<SearchIcon />}
              onClick={filtrarInspecciones}
              color="primary"
              disabled={loading}
              sx={{ mr: 1 }}
            >
              {loading ? "Buscando..." : "Buscar Inspecciones"}
            </Button>
            <Button
              variant="contained"
              startIcon={<ExtintorIcon />}
              onClick={mostrarExtintoresPorArea}
              color="secondary"
              disabled={loadingExtintores || !areaFilter}
            >
              {loadingExtintores ? "Cargando..." : "Mostrar Extintores"}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Estado de carga */}
      {(loading || loadingExtintores) && (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="200px"
        >
          <CircularProgress />
        </Box>
      )}

      {/* Estado de error */}
      {error && (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="100px"
        >
          <Typography color="error">{error}</Typography>
        </Box>
      )}

      {/* TABLA DE EXTINTORES */}
      {mostrarExtintores && !loadingExtintores && (
        <Paper elevation={2} sx={{ borderRadius: "8px", mb: 4 }}>
          <Box
            sx={{
              p: 2,
              borderBottom: "1px solid #e0e0e0",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="h6">
              Extintores del Área: {areaFilter} ({extintores?.length || 0})
            </Typography>
            {mostrarResultados && (
              <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                onClick={volverAInspecciones}
                size="small"
              >
                Volver a Inspecciones
              </Button>
            )}
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                  <TableCell>Área</TableCell>
                  <TableCell>Tag</TableCell>
                  <TableCell>Código Extintor</TableCell>
                  <TableCell>Ubicación</TableCell>
                  <TableCell align="center">Estado Inspección</TableCell>
                  <TableCell align="center">Estado Activo</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {extintores?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      <Typography variant="body1" color="textSecondary">
                        No se encontraron extintores en el área seleccionada
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  extintores
                    .slice(
                      pageExtintores * rowsPerPageExtintores,
                      pageExtintores * rowsPerPageExtintores +
                        rowsPerPageExtintores
                    )
                    .map((extintor, index) => (
                      <TableRow
                        key={`${extintor._id}-${
                          pageExtintores * rowsPerPageExtintores + index
                        }`}
                        sx={{ "&:hover": { backgroundColor: "#f9f9f9" } }}
                      >
                        <TableCell>{extintor.area}</TableCell>
                        <TableCell>{extintor.tag}</TableCell>
                        <TableCell>{extintor.CodigoExtintor}</TableCell>
                        <TableCell>{extintor.Ubicacion}</TableCell>
                        <TableCell align="center">
                          <Chip
                            label={
                              extintor.inspeccionado
                                ? "Inspeccionado"
                                : "No Inspeccionado"
                            }
                            color={
                              extintor.inspeccionado ? "success" : "error"
                            }
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={extintor.activo ? "Activo" : "Inactivo"}
                            color={extintor.activo ? "primary" : "default"}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={extintores.length}
            rowsPerPage={rowsPerPageExtintores}
            page={pageExtintores}
            onPageChange={handleChangePageExtintores}
            onRowsPerPageChange={handleChangeRowsPerPageExtintores}
            labelRowsPerPage="Filas por página"
          />
        </Paper>
      )}

      {/* RESULTADOS DE BÚSQUEDA */}
      {mostrarResultados && !loading && (
        <Paper elevation={2} sx={{ borderRadius: "8px" }}>
          <Box
            sx={{
              p: 2,
              borderBottom: "1px solid #e0e0e0",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="h6">
              Resultados ({inspecciones.length})
            </Typography>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                  <TableCell>Fecha de Inspección</TableCell>
                  <TableCell>Superintendencia</TableCell>
                  <TableCell>Área</TableCell>
                  <TableCell>Tag</TableCell>
                  <TableCell>Responsable Edificio</TableCell>
                  <TableCell>Código Documento</TableCell>
                  <TableCell>Mes Actual</TableCell>
                  <TableCell align="center">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {inspecciones.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                      <Typography variant="body1" color="textSecondary">
                        No se encontraron inspecciones con los criterios de
                        búsqueda
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  inspecciones
                    .slice(
                      page * rowsPerPage,
                      page * rowsPerPage + rowsPerPage
                    )
                    .map((inspeccion, index) => (
                      <TableRow
                        key={`${inspeccion._id}-${
                          page * rowsPerPage + index
                        }`}
                        sx={{ "&:hover": { backgroundColor: "#f9f9f9" } }}
                      >
                        <TableCell>
                          {new Date(
                            inspeccion.fechaCreacion
                          ).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{inspeccion.superintendencia}</TableCell>
                        <TableCell>{inspeccion.area}</TableCell>
                        <TableCell>{inspeccion.tag}</TableCell>
                        <TableCell>{inspeccion.responsableEdificio}</TableCell>
                        <TableCell>{inspeccion.documentCode}</TableCell>
                        <TableCell>
                          {obtenerMesesInspeccionados(
                            inspeccion,
                            mesFilter
                          )}
                        </TableCell>
                        
                        {/* 🔥 COLUMNA PROTEGIDA CON ROLES */}
                        <TableCell align="center">
                          {tienePermisos ? (
                            <Box display="flex" justifyContent="center">
                              <Tooltip title="Ver detalle">
                                <IconButton
                                  onClick={() =>
                                    handleVerDetalle(inspeccion._id)
                                  }
                                  color="primary"
                                  size="small"
                                >
                                  <VisibilityIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Editar">
                                <IconButton
                                  onClick={() => handleEditar(inspeccion)}
                                  color="primary"
                                  size="small"
                                >
                                  <EditIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Descargar PDF">
                                <IconButton
                                  onClick={() =>
                                    handleDescargarPdf(inspeccion._id)
                                  }
                                  color="secondary"
                                  size="small"
                                >
                                  <PdfIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Descargar Excel">
                                <IconButton
                                  onClick={() =>
                                    handleDescargarExcel(inspeccion._id)
                                  }
                                  color="success"
                                  size="small"
                                >
                                  <ExcelIcon />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          ) : (
                            <Tooltip title="Sin permisos">
                              <LockIcon color="disabled" fontSize="small" />
                            </Tooltip>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={inspecciones.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Filas por página"
          />
        </Paper>
      )}
    </Container>
  );
}