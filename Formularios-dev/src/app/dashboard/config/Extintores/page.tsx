import React from 'react'

export default function page() {
  return (
    <div>aqui van el CRUD de los extintores</div>
  )
}


// "use client"

// import React, { useEffect, useState } from "react"
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
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   FormControlLabel,
//   Checkbox,
//   Alert,
//   Snackbar,
// } from "@mui/material"
// import {
//   Edit as EditIcon,
//   Delete as DeleteIcon,
//   Add as AddIcon,
//   Search as SearchIcon,
//   Clear as ClearIcon,
//   PowerOff as PowerOffIcon,
//   Power as PowerIcon,
//   Visibility as VisibilityIcon,
// } from "@mui/icons-material"
// import { activarExtintor, actualizarExtintor, crearExtintor, eliminarExtintor, obtenerExtintores, obtenerExtintorPorId } from "@/lib/actions/extintor-actions"
// import { desactivarExtintor } from "@/app/actions/inspeccion"
// import { ExtintorBackend } from "@/types/formTypes"



// interface ExtintorForm {
//   area: string
//   tag: string
//   CodigoExtintor: string
//   Ubicacion: string
//   inspeccionado: boolean
//   activo: boolean
// }

// const initialFormData: ExtintorForm = {
//   area: "",
//   tag: "",
//   CodigoExtintor: "",
//   Ubicacion: "",
//   inspeccionado: false,
//   activo: true,
// }

// export default function GestionExtintores() {
//   const [extintores, setExtintores] = useState<ExtintorBackend[]>([])
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState<string | null>(null)
//   const [page, setPage] = useState(0)
//   const [rowsPerPage, setRowsPerPage] = useState(10)
  
//   // Estados para el modal
//   const [openModal, setOpenModal] = useState(false)
//   const [editingExtintor, setEditingExtintor] = useState<ExtintorBackend | null>(null)
//   const [formData, setFormData] = useState<ExtintorForm>(initialFormData)
  
//   // Estados para filtros
//   const [areaFilter, setAreaFilter] = useState("")
//   const [tagFilter, setTagFilter] = useState("")
//   const [codigoFilter, setCodigoFilter] = useState("")
//   const [activoFilter, setActivoFilter] = useState("")
//   const [inspeccionadoFilter, setInspeccionadoFilter] = useState("")
  
//   // Estado para notificaciones
//   const [notification, setNotification] = useState<{
//     open: boolean
//     message: string
//     severity: "success" | "error" | "warning" | "info"
//   }>({
//     open: false,
//     message: "",
//     severity: "info",
//   })

//   useEffect(() => {
//     cargarExtintores()
//   }, [])

  


//    const cargarExtintores = async () => {
//   try {
//     setLoading(true)
//     setError(null)
    
//     // Siempre obtener todos los extintores
//     const data = await obtenerExtintores()
//     setExtintores(data)
//   } catch (error) {
//     console.error("Error al cargar extintores:", error)
//     setError("No se pudieron cargar los extintores")
//     mostrarNotificacion("Error al cargar los extintores", "error")
//   } finally {
//     setLoading(false)
//   }
// }

//   const aplicarFiltros = async () => {
//     setPage(0) // Reset página
//   }

  

//   const filtrarExtintores = () => {
//   let filtrados = extintores

//   // Filtro por área
//   if (areaFilter.trim()) {
//     filtrados = filtrados.filter(ext => 
//       ext.area.toLowerCase().includes(areaFilter.toLowerCase().trim())
//     )
//   }

//   // Filtro por tag
//   if (tagFilter.trim()) {
//     filtrados = filtrados.filter(ext => 
//       ext.tag.toLowerCase().includes(tagFilter.toLowerCase().trim())
//     )
//   }

//   // Filtro por código
//   if (codigoFilter.trim()) {
//     filtrados = filtrados.filter(ext => 
//       ext.CodigoExtintor.toLowerCase().includes(codigoFilter.toLowerCase().trim())
//     )
//   }

//   // Filtro por estado activo
//   if (activoFilter) {
//     const isActive = activoFilter === 'true'
//     filtrados = filtrados.filter(ext => ext.activo === isActive)
//   }

//   // Filtro por inspección
//   if (inspeccionadoFilter) {
//     const isInspected = inspeccionadoFilter === 'true'
//     filtrados = filtrados.filter(ext => ext.inspeccionado === isInspected)
//   }

//   return filtrados
// }

//   const limpiarFiltros = async () => {
//     setAreaFilter("")
//     setTagFilter("")
//     setCodigoFilter("")
//     setActivoFilter("")
//     setInspeccionadoFilter("")
//     setPage(0)
//   }

  

//   const handleChangePage = (event: unknown, newPage: number) => {
//     setPage(newPage)
//   }

//   const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
//     setRowsPerPage(Number.parseInt(event.target.value, 10))
//     setPage(0)
//   }

//   const abrirModal = async (extintor?: ExtintorBackend) => {
//     if (extintor) {
//       // CAMBIO 4: Si necesitas datos frescos del servidor, puedes obtenerlos aquí
//       try {
//         const extintorActualizado = await obtenerExtintorPorId(extintor._id)
//         setEditingExtintor(extintorActualizado)
//         setFormData({
//           area: extintorActualizado.area,
//           tag: extintorActualizado.tag,
//           CodigoExtintor: extintorActualizado.CodigoExtintor,
//           Ubicacion: extintorActualizado.Ubicacion,
//           inspeccionado: extintorActualizado.inspeccionado,
//           activo: extintorActualizado.activo,
//         })
//       } catch (error) {
//         console.error("Error al cargar extintores:", error)
//         // Si falla, usar los datos que ya tenemos
//         setEditingExtintor(extintor)
//         setFormData({
//           area: extintor.area,
//           tag: extintor.tag,
//           CodigoExtintor: extintor.CodigoExtintor,
//           Ubicacion: extintor.Ubicacion,
//           inspeccionado: extintor.inspeccionado,
//           activo: extintor.activo,
//         })
//       }
//     } else {
//       setEditingExtintor(null)
//       setFormData(initialFormData)
//     }
//     setOpenModal(true)
//   }

//   const cerrarModal = () => {
//     setOpenModal(false)
//     setEditingExtintor(null)
//     setFormData(initialFormData)
//   }

//    const guardarExtintor = async () => {
//     try {
//       setLoading(true)
      
//       if (editingExtintor) {
//         // Actualizar extintor existente
//         await actualizarExtintor(editingExtintor._id, formData)
//         mostrarNotificacion("Extintor actualizado correctamente", "success")
//       } else {
//         // Crear nuevo extintor
//         await crearExtintor(formData)
//         mostrarNotificacion("Extintor creado correctamente", "success")
//       }
      
//       cerrarModal()
//       await cargarExtintores() // Recargar lista
//     } catch (error) {
//       console.error("Error al guardar extintor:", error)
//       mostrarNotificacion(
//         error instanceof Error ? error.message : "Error al guardar el extintor", 
//         "error"
//       )
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleEliminarExtintor = async (id: string) => {
//     if (!confirm("¿Estás seguro de que quieres eliminar este extintor?")) return
    
//     try {
//       setLoading(true)
      
//       await eliminarExtintor(id)
//       mostrarNotificacion("Extintor eliminado correctamente", "success")
//       await cargarExtintores() // Recargar lista
//     } catch (error) {
//       console.error("Error al eliminar extintor:", error)
//       mostrarNotificacion(
//         error instanceof Error ? error.message : "Error al eliminar el extintor", 
//         "error"
//       )
//     } finally {
//       setLoading(false)
//     }
//   }

//   const cambiarEstadoActivo = async (extintor: ExtintorBackend) => {
//     try {
//       setLoading(true)
      
//       if (extintor.activo) {
//         // Desactivar extintor
//         const resultado = await desactivarExtintor(extintor.CodigoExtintor)
//         if (resultado.exito) {
//           mostrarNotificacion("Extintor desactivado correctamente", "success")
//         } else {
//           mostrarNotificacion(resultado.mensaje, "error")
//           return
//         }
//       } else {
//         // Activar extintor
//         await activarExtintor(extintor._id)
//         mostrarNotificacion("Extintor activado correctamente", "success")
//       }
      
//       await cargarExtintores() // Recargar lista
//     } catch (error) {
//       console.error("Error al cambiar estado:", error)
//       mostrarNotificacion(
//         error instanceof Error ? error.message : "Error al cambiar el estado del extintor", 
//         "error"
//       )
//     } finally {
//       setLoading(false)
//     }
//   }

//   const mostrarNotificacion = (message: string, severity: "success" | "error" | "warning" | "info") => {
//     setNotification({
//       open: true,
//       message,
//       severity,
//     })
//   }

//   const cerrarNotificacion = () => {
//     setNotification(prev => ({ ...prev, open: false }))
//   }

//   const handleKeyPress = (e: React.KeyboardEvent) => {
//     if (e.key === 'Enter') {
//       aplicarFiltros()
//     }
//   }

//   const extintoresMostrados = filtrarExtintores()

//   return (
//     <Container maxWidth="xl">
//       <Typography variant="h4" gutterBottom sx={{ mt: 3, mb: 3 }}>
//         Gestión de Extintores
//       </Typography>

//       {/* PANEL DE FILTROS Y CONTROLES */}
//       <Paper elevation={3} sx={{ mb: 4, p: 3, borderRadius: '8px' }}>
//         <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
//           Filtros y Controles
//         </Typography>
        
//         <Grid container spacing={3} sx={{ mb: 3 }}>
//           <Grid sx={{xs:12 , md: 2.4}}>
//             <TextField
//               fullWidth
//               label="Área"
//               variant="outlined"
//               size="small"
//               value={areaFilter}
//               onChange={(e) => setAreaFilter(e.target.value)}
//               onKeyPress={handleKeyPress}
//             />
//           </Grid>
          
//           <Grid sx={{xs:12 , md: 2.4}}>
//             <TextField
//               fullWidth
//               label="Tag"
//               variant="outlined"
//               size="small"
//               value={tagFilter}
//               onChange={(e) => setTagFilter(e.target.value)}
//               onKeyPress={handleKeyPress}
//             />
//           </Grid>
          
//           <Grid sx={{xs:12 , md: 2.4}}>
//             <TextField
//               fullWidth
//               label="Código Extintor"
//               variant="outlined"
//               size="small"
//               value={codigoFilter}
//               onChange={(e) => setCodigoFilter(e.target.value)}
//               onKeyPress={handleKeyPress}
//             />
//           </Grid>
          
//           <Grid sx={{xs:12 , md: 2.4}}>
//             <FormControl fullWidth size="small">
//               <InputLabel>Estado</InputLabel>
//               <Select
//                 value={activoFilter}
//                 onChange={(e) => setActivoFilter(e.target.value)}
//                 label="Estado"
//               >
//                 <MenuItem value="">Todos</MenuItem>
//                 <MenuItem value="true">Activo</MenuItem>
//                 <MenuItem value="false">Inactivo</MenuItem>
//               </Select>
//             </FormControl>
//           </Grid>
          
//           <Grid sx={{xs:12 , md: 2.4}}>
//             <FormControl fullWidth size="small">
//               <InputLabel>Inspección</InputLabel>
//               <Select
//                 value={inspeccionadoFilter}
//                 onChange={(e) => setInspeccionadoFilter(e.target.value)}
//                 label="Inspección"
//               >
//                 <MenuItem value="">Todos</MenuItem>
//                 <MenuItem value="true">Inspeccionado</MenuItem>
//                 <MenuItem value="false">No Inspeccionado</MenuItem>
//               </Select>
//             </FormControl>
//           </Grid>
//         </Grid>

//         <Box display="flex" justifyContent="space-between" alignItems="center">
//           <Box display="flex" gap={1}>
//             <Button 
//               variant="outlined" 
//               startIcon={<ClearIcon />} 
//               onClick={limpiarFiltros}
//             >
//               Limpiar Filtros
//             </Button>
//             <Button 
//               variant="contained" 
//               startIcon={<SearchIcon />} 
//               onClick={aplicarFiltros} // Reset página cuando se busca
//               color="secondary"
//             >
//               Buscar
//             </Button>
//           </Box>
          
//           <Button 
//             variant="contained" 
//             startIcon={<AddIcon />} 
//             onClick={() => abrirModal()}
//             color="primary"
//           >
//             Nuevo Extintor
//           </Button>
//         </Box>
//       </Paper>

//       {/* TABLA DE EXTINTORES */}
//       <Paper elevation={2} sx={{ borderRadius: '8px' }}>
//         <Box sx={{ 
//           p: 2, 
//           borderBottom: '1px solid #e0e0e0', 
//           display: 'flex', 
//           justifyContent: 'space-between', 
//           alignItems: 'center' 
//         }}>
//           <Typography variant="h6">
//             Extintores ({extintoresMostrados.length})
//           </Typography>
//         </Box>
        
//         {loading && (
//           <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
//             <CircularProgress />
//           </Box>
//         )}
        
//         {error && (
//           <Box display="flex" justifyContent="center" alignItems="center" minHeight="100px">
//             <Typography color="error">{error}</Typography>
//           </Box>
//         )}
        
//         {!loading && !error && (
//           <>
//             <TableContainer>
//               <Table>
//                 <TableHead>
//                   <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
//                     <TableCell>Área</TableCell>
//                     <TableCell>Tag</TableCell>
//                     <TableCell>Código Extintor</TableCell>
//                     <TableCell>Ubicación</TableCell>
//                     <TableCell align="center">Estado</TableCell>
//                     <TableCell align="center">Inspección</TableCell>
//                     <TableCell align="center">Fecha Creación</TableCell>
//                     <TableCell align="center">Acciones</TableCell>
//                   </TableRow>
//                 </TableHead>
//                 <TableBody>
//                   {extintoresMostrados.length === 0 ? (
//                     <TableRow>
//                       <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
//                         <Typography variant="body1" color="textSecondary">
//                           No se encontraron extintores con los filtros aplicados
//                         </Typography>
//                       </TableCell>
//                     </TableRow>
//                   ) : (
//                     extintoresMostrados
//                       .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
//                       .map((extintor, index) => (
//                         <TableRow 
//                           key={`${extintor._id}-${page * rowsPerPage + index}`}
//                           sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}
//                         >
//                           <TableCell>{extintor.area}</TableCell>
//                           <TableCell>{extintor.tag}</TableCell>
//                           <TableCell>
//                             <Typography variant="body2" fontWeight="medium">
//                               {extintor.CodigoExtintor}
//                             </Typography>
//                           </TableCell>
//                           <TableCell>{extintor.Ubicacion}</TableCell>
//                           <TableCell align="center">
//                             <Chip 
//                               label={extintor.activo ? "Activo" : "Inactivo"} 
//                               color={extintor.activo ? "success" : "error"}
//                               size="small"
//                             />
//                           </TableCell>
//                           <TableCell align="center">
//                             <Chip 
//                               label={extintor.inspeccionado ? "Inspeccionado" : "Pendiente"} 
//                               color={extintor.inspeccionado ? "primary" : "warning"}
//                               size="small"
//                             />
//                           </TableCell>
//                           <TableCell align="center">
//                             {extintor.createdAt ? new Date(extintor.createdAt).toLocaleDateString() : 'N/A'}
//                           </TableCell>
//                           <TableCell align="center">
//                             <Tooltip title="Ver detalle">
//                               <IconButton 
//                                 color="info"
//                                 size="small"
//                               >
//                                 <VisibilityIcon />
//                               </IconButton>
//                             </Tooltip>
                            
//                             <Tooltip title="Editar">
//                               <IconButton 
//                                 onClick={() => abrirModal(extintor)} 
//                                 color="primary"
//                                 size="small"
//                               >
//                                 <EditIcon />
//                               </IconButton>
//                             </Tooltip>
                            
//                             <Tooltip title={extintor.activo ? "Desactivar" : "Activar"}>
//                               <IconButton
//                                 onClick={() => cambiarEstadoActivo(extintor)}
//                                 color={extintor.activo ? "error" : "success"}
//                                 size="small"
//                               >
//                                 {extintor.activo ? <PowerOffIcon /> : <PowerIcon />}
//                               </IconButton>
//                             </Tooltip>
                            
//                             <Tooltip title="Eliminar">
//                               <IconButton
//                                 onClick={() => handleEliminarExtintor(extintor._id)}
//                                 color="error"
//                                 size="small"
//                               >
//                                 <DeleteIcon />
//                               </IconButton>
//                             </Tooltip>
//                           </TableCell>
//                         </TableRow>
//                       ))
//                   )}
//                 </TableBody>
//               </Table>
//             </TableContainer>
            
//             <TablePagination
//               rowsPerPageOptions={[5, 10, 25, 50]}
//               component="div"
//               count={extintoresMostrados.length}
//               rowsPerPage={rowsPerPage}
//               page={page}
//               onPageChange={handleChangePage}
//               onRowsPerPageChange={handleChangeRowsPerPage}
//               labelRowsPerPage="Filas por página"
//               labelDisplayedRows={({ from, to, count }) => 
//                 `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
//               }
//             />
//           </>
//         )}
//       </Paper>

//       {/* MODAL PARA CREAR/EDITAR EXTINTOR */}
//       <Dialog open={openModal} onClose={cerrarModal} maxWidth="md" fullWidth>
//         <DialogTitle>
//             {editingExtintor ? 'Editar Extintor' : 'Nuevo Extintor'}
//         </DialogTitle>
//         <DialogContent>
//           <Grid container spacing={3} sx={{ mt: 1 }}>
//             <Grid sx={{xs:12 , md: 6}}>
//               <TextField
//                 fullWidth
//                 label="Área *"
//                 value={formData.area}
//                 onChange={(e) => setFormData({ ...formData, area: e.target.value })}
//                 required
//                 error={!formData.area}
//                 helperText={!formData.area ? "Campo requerido" : ""}
//               />
//             </Grid>
            
//             <Grid  sx={{xs:12 , md: 6}}>
//               <TextField
//                 fullWidth
//                 label="Tag *"
//                 value={formData.tag}
//                 onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
//                 required
//                 error={!formData.tag}
//                 helperText={!formData.tag ? "Campo requerido" : ""}
//               />
//             </Grid>
            
//             <Grid  sx={{xs:12 , md: 6}}>
//               <TextField
//                 fullWidth
//                 label="Código Extintor *"
//                 value={formData.CodigoExtintor}
//                 onChange={(e) => setFormData({ ...formData, CodigoExtintor: e.target.value })}
//                 required
//                 error={!formData.CodigoExtintor}
//                 helperText={!formData.CodigoExtintor ? "Campo requerido" : ""}
//               />
//             </Grid>
            
//             <Grid  sx={{xs:12 , md: 6}}>
//               <TextField
//                 fullWidth
//                 label="Ubicación *"
//                 value={formData.Ubicacion}
//                 onChange={(e) => setFormData({ ...formData, Ubicacion: e.target.value })}
//                 required
//                 error={!formData.Ubicacion}
//                 helperText={!formData.Ubicacion ? "Campo requerido" : ""}
//               />
//             </Grid>
            
//             <Grid  sx={{xs:12 }}>
//               <Box display="flex" gap={3}>
//                 <FormControlLabel
//                   control={
//                     <Checkbox
//                       checked={formData.activo}
//                       onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
//                       color="primary"
//                     />
//                   }
//                   label="Activo"
//                 />
                
//                 <FormControlLabel
//                   control={
//                     <Checkbox
//                       checked={formData.inspeccionado}
//                       onChange={(e) => setFormData({ ...formData, inspeccionado: e.target.checked })}
//                       color="primary"
//                     />
//                   }
//                   label="Inspeccionado"
//                 />
//               </Box>
//             </Grid>
//           </Grid>
//         </DialogContent>
//         <DialogActions sx={{ p: 3 }}>
//           <Button onClick={cerrarModal} variant="outlined">
//             Cancelar
//           </Button>
//           <Button 
//             onClick={guardarExtintor} 
//             variant="contained"
//             disabled={loading || !formData.area || !formData.tag || !formData.CodigoExtintor || !formData.Ubicacion}
//           >
//             {loading ? "Guardando..." : (editingExtintor ? "Actualizar" : "Crear")}
//           </Button>
//         </DialogActions>
//       </Dialog>

//       {/* NOTIFICACIONES */}
//       <Snackbar
//         open={notification.open}
//         autoHideDuration={6000}
//         onClose={cerrarNotificacion}
//         anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
//       >
//         <Alert 
//           onClose={cerrarNotificacion} 
//           severity={notification.severity}
//           variant="filled"
//           sx={{ width: '100%' }}
//         >
//           {notification.message}
//         </Alert>
//       </Snackbar>
//     </Container>
//   )
// }