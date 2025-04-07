// import { 
//     FormControl, 
//     InputLabel, 
//     Select, 
//     MenuItem, 
//     Typography, 
//     Box 
//   } from "@mui/material";
//   import { useEffect, useState } from "react";
//   import { ExtintorBackend } from "../../types/formTypes";
//   import { inspeccionService } from "../../services/inspeccionService";
  
//   interface ExtintorSelectorProps {
//     area: string;
//     onExtintorSelect: (extintor: ExtintorBackend) => void;
//   }
  
//   const ExtintorSelector = ({ area, onExtintorSelect }: ExtintorSelectorProps) => {
//     const [extintores, setExtintores] = useState<ExtintorBackend[]>([]);
//     const [selectedExtintorId, setSelectedExtintorId] = useState<string>("");
//     const [loading, setLoading] = useState<boolean>(false);
  
//     useEffect(() => {
//       const fetchExtintores = async () => {
//         if (!area) return;
        
//         setLoading(true);
//         try {
//           // Suponiendo que tienes un servicio para obtener extintores por área
//           const response = await inspeccionService.obtenerExtintoresPorArea(area);
//           setExtintores(response || []);
//         } catch (error) {
//           console.error("Error al cargar extintores:", error);
//         } finally {
//           setLoading(false);
//         }
//       };
  
//       fetchExtintores();
//     }, [area]);
  
//     const handleExtintorChange = (event: React.ChangeEvent<{ value: unknown }>) => {
//       const extintorId = event.target.value as string;
//       setSelectedExtintorId(extintorId);
      
//       // Buscar el extintor seleccionado y enviar al componente padre
//       const selectedExtintor = extintores.find(extintor => extintor._id === extintorId);
//       if (selectedExtintor) {
//         onExtintorSelect(selectedExtintor);
//       }
//     };
  
//     return (
//       <Box sx={{ width: '100%' }}>
//         <FormControl fullWidth disabled={!area || loading}>
//           <InputLabel id="extintor-label">Seleccionar Extintor</InputLabel>
//           <Select
//             labelId="extintor-label"
//             id="extintor-select"
//             value={selectedExtintorId}
//             label="Seleccionar Extintor"
//             onChange={handleExtintorChange}
//           >
//             {extintores.length > 0 ? (
//               extintores.map((extintor) => (
//                 <MenuItem key={extintor._id} value={extintor._id}>
//                   {extintor.CodigoExtintor} - {extintor.Ubicacion}
//                 </MenuItem>
//               ))
//             ) : (
//               <MenuItem disabled value="">
//                 {loading ? "Cargando extintores..." : "No hay extintores disponibles"}
//               </MenuItem>
//             )}
//           </Select>
//         </FormControl>
        
//         {extintores.length > 0 && (
//           <Typography variant="body2" sx={{ mt: 1 }}>
//             {extintores.length} extintores disponibles en esta área
//           </Typography>
//         )}
//       </Box>
//     );
//   };
  
//   export default ExtintorSelector;