// 'use client';

// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   Paper,
//   IconButton,
//   Chip,
//   Box,
//   Tooltip,
//   Link,
// } from '@mui/material';
// import { 
//   Edit, 
//   Delete, 
//   CheckCircle, 
//   AttachFile as AttachFileIcon,
//   Visibility as VisibilityIcon 
// } from '@mui/icons-material';
// import { TareaObservacion } from '../types/IProps';

// interface TareasTableProps {
//   tareas: TareaObservacion[];
//   onEdit: (tarea: TareaObservacion) => void;
//   onDelete: (tareaId: string) => void;
//   onApprove: (tareaId: string) => void;
// }

// export function TareasTable({ tareas, onEdit, onDelete, onApprove }: TareasTableProps) {
//   const getStatusColor = (estado: TareaObservacion['estado']) => {
//     switch (estado) {
//       case 'abierto':
//         return 'error';
//       case 'en-progreso':
//         return 'warning';
//       case 'cerrado':
//         return 'success';
//       default:
//         return 'default';
//     }
//   };

//   const getStatusLabel = (estado: TareaObservacion['estado']) => {
//     switch (estado) {
//       case 'abierto':
//         return 'Abierto';
//       case 'en-progreso':
//         return 'En Progreso';
//       case 'cerrado':
//         return 'Cerrado';
//       default:
//         return estado;
//     }
//   };

//   const formatDate = (date: Date | string): string => {
//     return new Date(date).toLocaleDateString('es-ES');
//   };

//   return (
//     <TableContainer component={Paper} sx={{ boxShadow: 1, mt: 3, overflow: 'auto' }}>
//       <Table sx={{ minWidth: 2600 }}>
//         <TableHead sx={{ backgroundColor: '#f5f5f5', position: 'sticky', top: 0 }}>
//           <TableRow>
//             <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem', minWidth: 40 }}>#</TableCell>
//             <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem', minWidth: 100 }}>Fecha Hallazgo</TableCell>
//             <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem', minWidth: 120 }}>Responsable Observación</TableCell>
//             <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem', minWidth: 100 }}>Empresa</TableCell>
//             <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem', minWidth: 130 }}>Lugar Físico</TableCell>
//             <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem', minWidth: 100 }}>Actividad</TableCell>
//             <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem', minWidth: 120 }}>Familia de Peligro</TableCell>
//             <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem', minWidth: 150 }}>Descripción Observación</TableCell>
//             <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem', minWidth: 150 }}>Acción Propuesta</TableCell>
//             <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem', minWidth: 120 }}>Responsable Área Cierre</TableCell>
//             <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem', minWidth: 130 }}>Fecha Cumplimiento Acordada</TableCell>
//             <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem', minWidth: 130 }}>Fecha Cumplimiento Efectiva</TableCell>
//             <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem', minWidth: 80 }}>Días Retraso</TableCell>
//             {/* 🔥 COLUMNA: Evidencias */}
//             <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem', minWidth: 120 }} align="center">
//               Evidencias
//             </TableCell>
//             <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem', minWidth: 100 }} align="center">
//               Estado
//             </TableCell>
//             <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem', minWidth: 90 }} align="center">
//               Aprobado
//             </TableCell>
//             <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem', minWidth: 100, textAlign: 'center' }}>
//               Acciones
//             </TableCell>
//           </TableRow>
//         </TableHead>
//         <TableBody>
//           {tareas.length === 0 ? (
//             <TableRow>
//               <TableCell colSpan={17} sx={{ textAlign: 'center', py: 3, color: '#666' }}>
//                 No hay tareas registradas en este plan
//               </TableCell>
//             </TableRow>
//           ) : (
//             tareas.map((tarea) => (
//               <TableRow 
//                 key={tarea._id} 
//                 hover 
//                 sx={{ '&:hover': { backgroundColor: '#fafafa' } }}
//               >
//                 <TableCell sx={{ fontWeight: 500, minWidth: 40 }}>{tarea.numeroItem}</TableCell>
//                 <TableCell sx={{ minWidth: 100 }}>{formatDate(tarea.fechaHallazgo)}</TableCell>
//                 <TableCell sx={{ minWidth: 120 }}>{tarea.responsableObservacion}</TableCell>
//                 <TableCell sx={{ minWidth: 100 }}>{tarea.empresa}</TableCell>
//                 <TableCell sx={{ minWidth: 130 }}>{tarea.lugarFisico}</TableCell>
//                 <TableCell sx={{ minWidth: 100 }}>{tarea.actividad}</TableCell>
//                 <TableCell sx={{ minWidth: 120 }}>{tarea.familiaPeligro}</TableCell>
//                 <TableCell
//                   sx={{
//                     minWidth: 150,
//                     maxWidth: 200,
//                     whiteSpace: 'normal',
//                     overflow: 'hidden',
//                     textOverflow: 'ellipsis',
//                     wordBreak: 'break-word',
//                   }}
//                 >
//                   {tarea.descripcionObservacion}
//                 </TableCell>
//                 <TableCell
//                   sx={{
//                     minWidth: 150,
//                     maxWidth: 200,
//                     whiteSpace: 'normal',
//                     overflow: 'hidden',
//                     textOverflow: 'ellipsis',
//                     wordBreak: 'break-word',
//                   }}
//                 >
//                   {tarea.accionPropuesta}
//                 </TableCell>
//                 <TableCell sx={{ minWidth: 120 }}>{tarea.responsableAreaCierre}</TableCell>
//                 <TableCell sx={{ minWidth: 130 }}>{formatDate(tarea.fechaCumplimientoAcordada)}</TableCell>
//                 <TableCell sx={{ minWidth: 130 }}>
//                   {tarea.fechaCumplimientoEfectiva ? formatDate(tarea.fechaCumplimientoEfectiva) : '-'}
//                 </TableCell>
//                 <TableCell sx={{ minWidth: 80, textAlign: 'center', fontWeight: 500 }}>
//                   {tarea.diasRetraso > 0 ? (
//                     <Chip
//                       label={`${tarea.diasRetraso}d`}
//                       size="small"
//                       color={tarea.diasRetraso > 7 ? 'error' : 'warning'}
//                     />
//                   ) : (
//                     '-'
//                   )}
//                 </TableCell>
                
//                 {/* 🔥 CELDA: Mostrar evidencias (ahora type-safe) */}
//                 <TableCell sx={{ minWidth: 120 }} align="center">
//                   {tarea.evidencias && tarea.evidencias.length > 0 ? (
//                     <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, alignItems: 'center' }}>
//                       <Chip
//                         icon={<AttachFileIcon />}
//                         label={`${tarea.evidencias.length} archivo${tarea.evidencias.length > 1 ? 's' : ''}`}
//                         size="small"
//                         color="primary"
//                         variant="outlined"
//                       />
//                       {tarea.evidencias.map((evidencia, idx) => (
//                         <Tooltip key={idx} title={evidencia.nombre} arrow>
//                           <Link
//                             href={`http://localhost:3002${evidencia.url}`}
//                             target="_blank"
//                             rel="noopener noreferrer"
//                             sx={{
//                               fontSize: '0.75rem',
//                               display: 'flex',
//                               alignItems: 'center',
//                               gap: 0.5,
//                               textDecoration: 'none',
//                               '&:hover': {
//                                 textDecoration: 'underline',
//                               },
//                             }}
//                           >
//                             <VisibilityIcon sx={{ fontSize: '0.875rem' }} />
//                             {evidencia.nombre.length > 15
//                               ? `${evidencia.nombre.substring(0, 15)}...`
//                               : evidencia.nombre}
//                           </Link>
//                         </Tooltip>
//                       ))}
//                     </Box>
//                   ) : (
//                     <Box sx={{ color: '#bbb', fontSize: '0.875rem' }}>Sin evidencias</Box>
//                   )}
//                 </TableCell>

//                 <TableCell sx={{ minWidth: 100 }} align="center">
//                   <Chip label={getStatusLabel(tarea.estado)} color={getStatusColor(tarea.estado)} size="small" />
//                 </TableCell>
//                 <TableCell sx={{ minWidth: 90 }} align="center">
//                   {tarea.aprobado ? (
//                     <CheckCircle sx={{ color: '#4caf50', fontSize: '1.5rem' }} />
//                   ) : (
//                     <Box sx={{ color: '#bbb', fontSize: '1.5rem' }}>-</Box>
//                   )}
//                 </TableCell>
//                 <TableCell sx={{ minWidth: 100, textAlign: 'center' }}>
//                   <IconButton size="small" onClick={() => onEdit(tarea)} title="Editar">
//                     <Edit fontSize="small" />
//                   </IconButton>
//                   <IconButton size="small" onClick={() => onDelete(tarea._id!)} title="Eliminar">
//                     <Delete fontSize="small" />
//                   </IconButton>
//                   {!tarea.aprobado && tarea.estado === 'cerrado' && (
//                     <IconButton size="small" onClick={() => onApprove(tarea._id!)} title="Aprobar">
//                       <CheckCircle fontSize="small" sx={{ color: '#4caf50' }} />
//                     </IconButton>
//                   )}
//                 </TableCell>
//               </TableRow>
//             ))
//           )}
//         </TableBody>
//       </Table>
//     </TableContainer>
//   );
// }

'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Box,
  Tooltip,
  Link,
} from '@mui/material';
import { 
  Edit, 
  Delete, 
  CheckCircle, 
  AttachFile as AttachFileIcon,
  Visibility as VisibilityIcon 
} from '@mui/icons-material';
import { TareaObservacion } from '../types/IProps';

// 🔥 Importamos el hook de roles (o useSession si prefieres)
// Asegúrate de que esta ruta sea correcta en tu proyecto
import { useUserRole } from '@/hooks/useUserRole'; 

interface TareasTableProps {
  tareas: TareaObservacion[];
  onEdit: (tarea: TareaObservacion) => void;
  onDelete: (tareaId: string) => void;
  onApprove: (tareaId: string) => void;
}

export function TareasTable({ tareas, onEdit, onDelete, onApprove }: TareasTableProps) {
  // 🔥 Verificamos si el usuario tiene permisos para aprobar
  const { hasRole } = useUserRole();
  const canApprove = hasRole('superintendente') || hasRole('admin');

  const getStatusColor = (estado: TareaObservacion['estado']) => {
    switch (estado) {
      case 'abierto':
        return 'error';
      case 'en-progreso':
        return 'warning';
      case 'cerrado':
        return 'success';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (estado: TareaObservacion['estado']) => {
    switch (estado) {
      case 'abierto':
        return 'Abierto';
      case 'en-progreso':
        return 'En Progreso';
      case 'cerrado':
        return 'Cerrado';
      default:
        return estado;
    }
  };

  const formatDate = (date: Date | string): string => {
    return new Date(date).toLocaleDateString('es-ES');
  };

  return (
    <TableContainer component={Paper} sx={{ boxShadow: 1, mt: 3, overflow: 'auto' }}>
      <Table sx={{ minWidth: 2600 }}>
        <TableHead sx={{ backgroundColor: '#f5f5f5', position: 'sticky', top: 0 }}>
          <TableRow>
            <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem', minWidth: 40 }}>#</TableCell>
            <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem', minWidth: 100 }}>Fecha Hallazgo</TableCell>
            <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem', minWidth: 120 }}>Responsable Observación</TableCell>
            <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem', minWidth: 100 }}>Empresa</TableCell>
            <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem', minWidth: 130 }}>Lugar Físico</TableCell>
            <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem', minWidth: 100 }}>Actividad</TableCell>
            <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem', minWidth: 120 }}>Familia de Peligro</TableCell>
            <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem', minWidth: 150 }}>Descripción Observación</TableCell>
            <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem', minWidth: 150 }}>Acción Propuesta</TableCell>
            <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem', minWidth: 120 }}>Responsable Área Cierre</TableCell>
            <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem', minWidth: 130 }}>Fecha Cumplimiento Acordada</TableCell>
            <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem', minWidth: 130 }}>Fecha Cumplimiento Efectiva</TableCell>
            <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem', minWidth: 80 }}>Días Retraso</TableCell>
            {/* 🔥 COLUMNA: Evidencias */}
            <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem', minWidth: 120 }} align="center">
              Evidencias
            </TableCell>
            <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem', minWidth: 100 }} align="center">
              Estado
            </TableCell>
            <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem', minWidth: 90 }} align="center">
              Aprobado
            </TableCell>
            <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem', minWidth: 100, textAlign: 'center' }}>
              Acciones
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {tareas.length === 0 ? (
            <TableRow>
              <TableCell colSpan={17} sx={{ textAlign: 'center', py: 3, color: '#666' }}>
                No hay tareas registradas en este plan
              </TableCell>
            </TableRow>
          ) : (
            tareas.map((tarea) => (
              <TableRow 
                key={tarea._id} 
                hover 
                sx={{ '&:hover': { backgroundColor: '#fafafa' } }}
              >
                <TableCell sx={{ fontWeight: 500, minWidth: 40 }}>{tarea.numeroItem}</TableCell>
                <TableCell sx={{ minWidth: 100 }}>{formatDate(tarea.fechaHallazgo)}</TableCell>
                <TableCell sx={{ minWidth: 120 }}>{tarea.responsableObservacion}</TableCell>
                <TableCell sx={{ minWidth: 100 }}>{tarea.empresa}</TableCell>
                <TableCell sx={{ minWidth: 130 }}>{tarea.lugarFisico}</TableCell>
                <TableCell sx={{ minWidth: 100 }}>{tarea.actividad}</TableCell>
                <TableCell sx={{ minWidth: 120 }}>{tarea.familiaPeligro}</TableCell>
                <TableCell
                  sx={{
                    minWidth: 150,
                    maxWidth: 200,
                    whiteSpace: 'normal',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    wordBreak: 'break-word',
                  }}
                >
                  {tarea.descripcionObservacion}
                </TableCell>
                <TableCell
                  sx={{
                    minWidth: 150,
                    maxWidth: 200,
                    whiteSpace: 'normal',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    wordBreak: 'break-word',
                  }}
                >
                  {tarea.accionPropuesta}
                </TableCell>
                <TableCell sx={{ minWidth: 120 }}>{tarea.responsableAreaCierre}</TableCell>
                <TableCell sx={{ minWidth: 130 }}>{formatDate(tarea.fechaCumplimientoAcordada)}</TableCell>
                <TableCell sx={{ minWidth: 130 }}>
                  {tarea.fechaCumplimientoEfectiva ? formatDate(tarea.fechaCumplimientoEfectiva) : '-'}
                </TableCell>
                <TableCell sx={{ minWidth: 80, textAlign: 'center', fontWeight: 500 }}>
                  {tarea.diasRetraso > 0 ? (
                    <Chip
                      label={`${tarea.diasRetraso}d`}
                      size="small"
                      color={tarea.diasRetraso > 7 ? 'error' : 'warning'}
                    />
                  ) : (
                    '-'
                  )}
                </TableCell>
                
                {/* 🔥 CELDA: Mostrar evidencias (ahora type-safe) */}
                <TableCell sx={{ minWidth: 120 }} align="center">
                  {tarea.evidencias && tarea.evidencias.length > 0 ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, alignItems: 'center' }}>
                      <Chip
                        icon={<AttachFileIcon />}
                        label={`${tarea.evidencias.length} archivo${tarea.evidencias.length > 1 ? 's' : ''}`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                      {tarea.evidencias.map((evidencia, idx) => (
                        <Tooltip key={idx} title={evidencia.nombre} arrow>
                          <Link
                            href={`http://localhost:3002${evidencia.url}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{
                              fontSize: '0.75rem',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.5,
                              textDecoration: 'none',
                              '&:hover': {
                                textDecoration: 'underline',
                              },
                            }}
                          >
                            <VisibilityIcon sx={{ fontSize: '0.875rem' }} />
                            {evidencia.nombre.length > 15
                              ? `${evidencia.nombre.substring(0, 15)}...`
                              : evidencia.nombre}
                          </Link>
                        </Tooltip>
                      ))}
                    </Box>
                  ) : (
                    <Box sx={{ color: '#bbb', fontSize: '0.875rem' }}>Sin evidencias</Box>
                  )}
                </TableCell>

                <TableCell sx={{ minWidth: 100 }} align="center">
                  <Chip label={getStatusLabel(tarea.estado)} color={getStatusColor(tarea.estado)} size="small" />
                </TableCell>
                <TableCell sx={{ minWidth: 90 }} align="center">
                  {tarea.aprobado ? (
                    <CheckCircle sx={{ color: '#4caf50', fontSize: '1.5rem' }} />
                  ) : (
                    <Box sx={{ color: '#bbb', fontSize: '1.5rem' }}>-</Box>
                  )}
                </TableCell>
                <TableCell sx={{ minWidth: 100, textAlign: 'center' }}>
                  <IconButton size="small" onClick={() => onEdit(tarea)} title="Editar">
                    <Edit fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={() => onDelete(tarea._id!)} title="Eliminar">
                    <Delete fontSize="small" />
                  </IconButton>
                  
                  {/* 🔥 Lógica de Aprobación Condicional por Rol */}
                  {canApprove && !tarea.aprobado && tarea.estado === 'cerrado' && (
                    <Tooltip title="Aprobar (Solo Admin/Superintendente)">
                      <IconButton size="small" onClick={() => onApprove(tarea._id!)}>
                        <CheckCircle fontSize="small" sx={{ color: '#4caf50' }} />
                      </IconButton>
                    </Tooltip>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}