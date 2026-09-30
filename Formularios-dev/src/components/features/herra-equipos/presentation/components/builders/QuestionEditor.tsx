"use client"

import React, { memo, useState } from "react"
import {
  Box,
  Typography,
  Grid,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button as MuiButton,
  Card,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  FormControlLabel,
  Checkbox,
  Radio,
  RadioGroup,
  TextField,
  IconButton,
} from "@mui/material"
import {
  Delete,
  Image as ImageIcon,
  Close,
} from "@mui/icons-material"
import { useWatch, type Control, type UseFormSetValue } from "react-hook-form"
import { useImageUpload } from "../../../application/hooks/useImageUpload"
import { AsaArrastre, useOrdenable } from "@/components/ui/sortable/ListaOrdenable"
import {
  ResponseType,
  QuestionHerraEquipos,
  FormBuilderDataHerraEquipos,
} from "../../../domain/models/BuilderTypes"

// ─── Constantes de respuesta ───────────────────────────────────────────────

const DEFAULT_SI_NO_NA_OPTIONS = [
  { label: "SI", value: "si", color: "#4caf50" },
  { label: "NO", value: "no", color: "#f44336" },
  { label: "N/A", value: "na", color: "#ff9800" },
]

const DEFAULT_BIEN_MAL_OPTIONS = [
  { label: "BIEN", value: "bien", color: "#4caf50" },
  { label: "MAL", value: "mal", color: "#f44336" },
]

const DEFAULT_BUENO_MALO_NA_OPTIONS = [
  { label: "BUENO", value: "bueno", color: "#4caf50" },
  { label: "MALO", value: "malo", color: "#f44336" },
  { label: "N/A", value: "na", color: "#ff9800" },
]

const DEFAULT_OPIONS_MANTENIMIENTO = [
  { label: "OPERATIVO", value: "operativo", color: "#4caf50" },
  { label: "MANTENIMIENTO", value: "mantenimiento", color: "#2196f3" },
]

const getDefaultOptions = (type: ResponseType) => {
  switch (type) {
    case "si_no_na": return DEFAULT_SI_NO_NA_OPTIONS
    case "bien_mal": return DEFAULT_BIEN_MAL_OPTIONS
    case "bueno_malo_na": return DEFAULT_BUENO_MALO_NA_OPTIONS
    case "operativo_mantenimiento": return DEFAULT_OPIONS_MANTENIMIENTO
    default: return undefined
  }
}

const RESPONSE_TYPES: Array<{ value: ResponseType; label: string }> = [
  { value: "si_no_na", label: "SI / NO / N/A" },
  { value: "text", label: "Texto Corto" },
  { value: "textarea", label: "Texto Largo" },
  { value: "number", label: "Número" },
  { value: "boolean", label: "Sí/No" },
  { value: "date", label: "Fecha" },
  { value: "bien_mal", label: "Bien / Mal" },
  { value: "bueno_malo_na", label: "Bueno / Malo / N/A" },
  { value: "operativo_mantenimiento", label: "Operativo / Mantenimiento" },
]

// ─── Interfaces ────────────────────────────────────────────────────────────

export interface QuestionBuilderProps {
  /** `field.id` del field array: identidad estable para arrastrar. */
  id: string
  sectionPath: string
  questionIndex: number
  control: Control<FormBuilderDataHerraEquipos>
  setValue: UseFormSetValue<FormBuilderDataHerraEquipos>
  onRemove: (index: number) => void
  disabled?: boolean
}

const PREGUNTA_VACIA: QuestionHerraEquipos = {
  text: "",
  obligatorio: false,
  responseConfig: { type: "si_no_na" },
}

// ─── Componente ────────────────────────────────────────────────────────────

/**
 * Una pregunta del constructor de herramientas.
 *
 * Memoizada y leyendo **solo su propia pregunta** (`useWatch` por ruta): al
 * escribir aquí no se redibuja ninguna otra. Antes la raíz vigilaba el
 * formulario entero y le pasaba a cada pregunta su objeto, así que cada tecla
 * redibujaba todas, con sus selects y su vista previa.
 */
export const QuestionBuilder = memo(function QuestionBuilder({
  id,
  sectionPath,
  questionIndex,
  control,
  setValue,
  onRemove,
  disabled = false,
}: QuestionBuilderProps) {
  const question =
    (useWatch({ control, name: `${sectionPath}.questions.${questionIndex}` as never }) as QuestionHerraEquipos | undefined) ??
    PREGUNTA_VACIA
  const responseType: ResponseType = question.responseConfig?.type ?? "si_no_na"
  const [showImageDialog, setShowImageDialog] = useState(false)
  const [imageUrl, setImageUrl] = useState("")
  const [uploadedFile, setUploadedFile] = useState<string | null>(null)
  const [imageCaption, setImageCaption] = useState("")
  const [imageError, setImageError] = useState<string | null>(null)
  const { upload } = useImageUpload()
  const { nodoRef, estilo, arrastrando, asa } = useOrdenable(id, disabled)

  const setField = (path: string, value: unknown) =>
    setValue(path as keyof FormBuilderDataHerraEquipos, value as never)

  const handleTypeChange = (newType: ResponseType) => {
    setField(`${sectionPath}.questions.${questionIndex}.responseConfig.type`, newType)
    const defaultOptions = getDefaultOptions(newType)
    if (defaultOptions) {
      setField(`${sectionPath}.questions.${questionIndex}.responseConfig.options`, defaultOptions)
    }
  }

  const handleTextChange = (text: string) =>
    setField(`${sectionPath}.questions.${questionIndex}.text`, text)

  const handleObligatorioChange = (checked: boolean) =>
    setField(`${sectionPath}.questions.${questionIndex}.obligatorio`, checked)

  const handleAddImage = () => {
    setImageError(null)
    setImageUrl(question.image?.url ?? "")
    setImageCaption(question.image?.caption ?? "")
    setUploadedFile(null)
    setShowImageDialog(true)
  }

  const handleSaveImage = () => {
    const finalUrl = uploadedFile || imageUrl
    if (!finalUrl?.trim()) { setImageError("Debes ingresar una URL o subir un archivo"); return }
    if (!imageCaption?.trim()) { setImageError("La leyenda/descripción es obligatoria"); return }
    setField(`${sectionPath}.questions.${questionIndex}.image`, { url: finalUrl, caption: imageCaption.trim() })
    setShowImageDialog(false)
    setImageError(null)
    setUploadedFile(null)
    setImageUrl("")
  }

  const handleRemoveImage = () =>
    setField(`${sectionPath}.questions.${questionIndex}.image`, undefined)

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    setImageError(null)
    if (file) {
      setImageUrl("")
      const url = await upload(file)
      if (url) { setUploadedFile(url); setImageUrl(url) }
      else { setImageError("Error al subir el archivo"); setUploadedFile(null) }
      event.target.value = ""
    }
  }

  return (
    <Paper
      ref={nodoRef}
      style={estilo}
      elevation={arrastrando ? 6 : 1}
      sx={{ p: 2, mb: 2, backgroundColor: theme => theme.palette.mode === 'dark' ? 'background.paper' : '#fafafa' }}
    >
      <Box display="flex" alignItems="flex-start" gap={2}>
        <Box mt={0.5}>
          <AsaArrastre asa={asa} arrastrando={arrastrando} deshabilitado={disabled} />
        </Box>
        <Box flex={1}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label={`Pregunta ${questionIndex + 1}`}
                placeholder="Escribe la pregunta aquí..."
                multiline rows={2} size="small"
                value={question.text}
                onChange={(e) => handleTextChange(e.target.value)}
                disabled={disabled}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth size="small" disabled={disabled}>
                <InputLabel>Tipo de Respuesta</InputLabel>
                <Select
                  value={responseType}
                  onChange={(e) => handleTypeChange(e.target.value as ResponseType)}
                  label="Tipo de Respuesta"
                >
                  {RESPONSE_TYPES.map((type) => (
                    <MenuItem key={type.value} value={type.value}>{type.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={question.obligatorio}
                    onChange={(e) => handleObligatorioChange(e.target.checked)}
                    disabled={disabled}
                  />
                }
                label="Obligatorio"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <Box display="flex" justifyContent="flex-end" gap={1}>
                {!disabled && (
                  <IconButton
                    color={question.image ? "primary" : "default"}
                    onClick={handleAddImage} size="small"
                    title={question.image ? "Editar imagen" : "Agregar imagen"}
                  >
                    <ImageIcon />
                  </IconButton>
                )}
                <IconButton color="error" onClick={() => onRemove(questionIndex)} size="small" disabled={disabled} aria-label="Eliminar pregunta">
                  <Delete />
                </IconButton>
              </Box>
            </Grid>

            {question.image && (
              <Grid size={{ xs: 12 }}>
                <Card variant="outlined">
                  <Box display="flex" alignItems="center" gap={2} p={2}>
                    <Box
                      component="img" src={question.image.url} alt={question.image.caption}
                      sx={{ width: 100, height: 100, objectFit: "cover", borderRadius: 1 }}
                    />
                    <Box flex={1}>
                      <Typography variant="body2" fontWeight="medium">
                        {question.image.caption || "Sin leyenda"}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">Imagen de referencia</Typography>
                    </Box>
                    {!disabled && (
                      <IconButton size="small" color="error" onClick={handleRemoveImage} title="Eliminar imagen">
                        <Close />
                      </IconButton>
                    )}
                  </Box>
                </Card>
              </Grid>
            )}

            {/* Vista previa del tipo de respuesta */}
            <Grid size={{ xs: 12 }}>
              <Box sx={{ p: 2, backgroundColor: "white", borderRadius: 1, border: "1px dashed #ddd" }}>
                <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                  Vista previa de respuesta:
                </Typography>
                {responseType === "si_no_na" && (
                  <RadioGroup row>
                    {["SI", "NO", "N/A"].map(v => (
                      <FormControlLabel key={v} value={v.toLowerCase()} control={<Radio size="small" />} label={v} />
                    ))}
                  </RadioGroup>
                )}
                {responseType === "text" && <TextField fullWidth size="small" placeholder="Texto corto..." disabled />}
                {responseType === "textarea" && <TextField fullWidth size="small" multiline rows={3} placeholder="Texto largo..." disabled />}
                {responseType === "number" && <TextField type="number" size="small" placeholder="0" disabled />}
                {responseType === "boolean" && <FormControlLabel control={<Checkbox disabled />} label="Sí/No" />}
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Box>

      {/* Diálogo de imagen */}
      <Dialog open={showImageDialog} onClose={() => setShowImageDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{question.image ? "Editar Imagen" : "Agregar Imagen"}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            {imageError && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setImageError(null)}>{imageError}</Alert>}
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth label="URL de la Imagen" value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://ejemplo.com/imagen.jpg"
                  helperText="Ingresa la URL de la imagen O sube un archivo"
                  disabled={!!uploadedFile}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <MuiButton variant="outlined" component="label" fullWidth startIcon={<ImageIcon />} disabled={!!imageUrl}>
                  Subir Archivo (máx 5MB)
                  <input type="file" hidden accept="image/*" onChange={handleFileChange} />
                </MuiButton>
              </Grid>
              {(uploadedFile || (imageUrl && !uploadedFile)) && (
                <Grid size={{ xs: 12 }}>
                  <Box sx={{ width: "100%", height: 200, backgroundColor: "#f5f5f5", borderRadius: 1, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Box
                      component="img" src={uploadedFile || imageUrl} alt="Preview"
                      onError={() => setImageError("No se pudo cargar la imagen")}
                      sx={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
                    />
                  </Box>
                </Grid>
              )}
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth label="Leyenda / Descripción *" value={imageCaption}
                  onChange={(e) => setImageCaption(e.target.value)}
                  placeholder="Descripción de la imagen" multiline rows={2} required
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <MuiButton onClick={() => setShowImageDialog(false)}>Cancelar</MuiButton>
          <MuiButton
            onClick={handleSaveImage} variant="contained"
            disabled={(!imageUrl.trim() && !uploadedFile) || !imageCaption.trim()}
          >
            {question.image ? "Actualizar" : "Agregar"}
          </MuiButton>
        </DialogActions>
      </Dialog>
    </Paper>
  )
})
