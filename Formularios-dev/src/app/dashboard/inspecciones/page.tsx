"use client"

import type React from "react"
import { useEffect, useState } from "react"
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
} from "@mui/material"
import { Visibility as VisibilityIcon, PictureAsPdf as PdfIcon, TableChart as ExcelIcon, Edit as EditIcon, } from "@mui/icons-material"
import { useRouter } from "next/navigation"
import type { FormDataExport } from "@/types/formTypes"
import { obtenerTodasInspecciones } from "@/app/actions/inspeccion"
import { descargarExcelCliente, descargarPdfCliente } from "@/app/actions/client"

export default function ListaInspecciones (){
  const [inspecciones, setInspecciones] = useState<FormDataExport[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const router = useRouter()

  useEffect(() => {
    cargarInspecciones()
  }, [])

  const cargarInspecciones = async () => {
    try {
      setLoading(true)
      const data = await obtenerTodasInspecciones()
      setInspecciones(data)
    } catch (error) {
      console.error("Error al cargar las inspecciones:", error)
      setError("No se pudieron cargar las inspecciones")
    } finally {
      setLoading(false)
    }
  }

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(Number.parseInt(event.target.value, 10))
    setPage(0)
  }

  // Modificamos esta función para usar la navegación del App Router
  const handleVerDetalle = (id: string) => {
    router.push(`/dashboard/inspecciones/${id}`)
  }

  const handleEditar = (inspeccion: FormDataExport) => {
    router.push(`/dashboard/inspecciones/editar/${inspeccion._id}`)
  }

  const handleDescargarPdf = async (id: string) => {
    try {
      await descargarPdfCliente(id)
    } catch (error) {
      console.error("Error al descargar el PDF:", error)
    }
  }

  const handleDescargarExcel = async (id: string) => {
    try {
      await descargarExcelCliente(id)
    } catch (error) {
      console.error("Error al descargar el Excel:", error)
    }
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography color="error">{error}</Typography>
      </Box>
    )
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Lista de Inspecciones
      </Typography>
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>N° Inspección</TableCell>
                <TableCell>Fecha</TableCell>
                <TableCell>Superintendencia</TableCell>
                <TableCell>Trabajador</TableCell>
                <TableCell>Supervisor</TableCell>
                <TableCell>Área</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {inspecciones.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((inspeccion, index) => (
                <TableRow key={`${new Date(inspeccion.informacionGeneral.fecha).toISOString()}-${page * rowsPerPage + index}`}>
                  <TableCell>{inspeccion.informacionGeneral.numInspeccion}</TableCell>
                  <TableCell>{new Date(inspeccion.informacionGeneral.fecha).toLocaleDateString()}</TableCell>
                  <TableCell>{inspeccion.informacionGeneral.superintendencia}</TableCell>
                  <TableCell>{inspeccion.informacionGeneral.trabajador}</TableCell>
                  <TableCell>{inspeccion.informacionGeneral.supervisor}</TableCell>
                  <TableCell>{inspeccion.informacionGeneral.area}</TableCell>
                  <TableCell>
                    <Typography color={inspeccion.operativo === "SI" ? "success" : "error"}>
                      {inspeccion.operativo === "SI" ? "Operativo" : "No Operativo"}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Ver detalle">
                      <IconButton
                        onClick={() => handleVerDetalle(inspeccion._id)}
                        color="primary"
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Editar">
                      <IconButton onClick={() => handleEditar(inspeccion)} color="primary">
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Descargar PDF">
                      <IconButton
                        onClick={() => handleDescargarPdf(inspeccion.informacionGeneral.numInspeccion)}
                        color="secondary"
                      >
                        <PdfIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Descargar Excel">
                      <IconButton
                        onClick={() => handleDescargarExcel(inspeccion._id)}
                        color="success"
                      >
                        <ExcelIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
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
    </Box>
  )
}

