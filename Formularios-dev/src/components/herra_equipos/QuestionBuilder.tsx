"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useForm, useFieldArray, type Control, type UseFormSetValue, type UseFormGetValues } from "react-hook-form"
import {
  Box,
  Typography,
  Grid,
  Fab,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button as MuiButton,
  Card,
  CardContent,
  CardActions,
  Chip,
  IconButton,
  Divider,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Paper,
  FormControlLabel,
  Checkbox,
  Radio,
  RadioGroup,
} from "@mui/material"
import {
  Add,
  Edit,
  Delete,
  Visibility,
  ArrowBack,
  ExpandMore,
  DragIndicator,
  Save,
  Image as ImageIcon,
  Close,
} from "@mui/icons-material"
import {
  createTemplateHerraEquipo,
  deleteTemplateHerraEquipo,
  getTemplatesHerraEquipos,
  updateTemplateHerraEquipo,
} from "@/lib/actions/template-herra-equipos"
import { uploadImageToCloudinary } from "@/lib/actions/cloudinary"

type ResponseType =
  | "si_no_na"
  | "text"
  | "number"
  | "boolean"
  | "date"
  | "textarea"
  | "bien_mal"
  | "bueno_malo_na"
  | "operativo_mantenimiento";

interface ResponseOptionHerraEquipos {
  label: string
  value: string | number | boolean
  color?: string
}

interface ResponseConfigHerraEquipos {
  type: ResponseType
  options?: ResponseOptionHerraEquipos[]
  placeholder?: string
  min?: number
  max?: number
}

interface QuestionHerraEquipos {
  _id?: string
  text: string
  obligatorio: boolean
  responseConfig: ResponseConfigHerraEquipos
  order?: number
  image?: {
    url: string
    caption: string
  }
}

interface SectionImageHerraEquipos {
  _id?: string
  url: string
  caption: string
  order?: number
}

interface SectionHerraEquipos {
  _id?: string
  title: string
  description?: string
  images?: SectionImageHerraEquipos[]
  questions: QuestionHerraEquipos[]
  order?: number
  isParent?: boolean
  parentId?: string | null
  subsections?: SectionHerraEquipos[]
}

type VerificationFieldType = "text" | "date" | "number" | "select" | "autocomplete" | "firma" | "time"

interface VerificationFieldHerraEquipos {
  label: string
  type: VerificationFieldType
  options?: string[]
  dataSource?: string
}

export interface FormBuilderDataHerraEquipos {
  name: string
  code: string
  revision: string
  type: "interna" | "externa"
  verificationFields: VerificationFieldHerraEquipos[]
  sections: SectionHerraEquipos[]
}

interface FormTemplateHerraEquipos extends FormBuilderDataHerraEquipos {
  _id: string
  createdAt: Date
  updatedAt: Date
}

const DEFAULT_SI_NO_NA_OPTIONS: ResponseOptionHerraEquipos[] = [
  { label: "SI", value: "si", color: "#4caf50" },
  { label: "NO", value: "no", color: "#f44336" },
  { label: "N/A", value: "na", color: "#ff9800" },
]

const DEFAULT_BIEN_MAL_OPTIONS: ResponseOptionHerraEquipos[] = [
  { label: "BIEN", value: "bien", color: "#4caf50" },
  { label: "MAL", value: "mal", color: "#f44336" },
]

const DEFAULT_BUENO_MALO_NA_OPTIONS: ResponseOptionHerraEquipos[] = [
  { label: "BUENO", value: "bueno", color: "#4caf50" },
  { label: "MALO", value: "malo", color: "#f44336" },
  { label: "N/A", value: "na", color: "#ff9800" },
]

const DEFAULT_OPIONS_MANTENIMIENTO: ResponseOptionHerraEquipos[] = [
  { label: "OPERATIVO", value: "operativo", color: "#4caf50" },
  { label: "MANTENIMIENTO", value: "mantenimiento", color: "#2196f3" },
]

const getDefaultOptions = (type: ResponseType): ResponseOptionHerraEquipos[] | undefined => {
  switch (type) {
    case "si_no_na":
      return DEFAULT_SI_NO_NA_OPTIONS
    case "bien_mal":
      return DEFAULT_BIEN_MAL_OPTIONS
    case "bueno_malo_na":
      return DEFAULT_BUENO_MALO_NA_OPTIONS
    case "operativo_mantenimiento":
      return DEFAULT_OPIONS_MANTENIMIENTO
    default:
      return undefined
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

const DATA_SOURCES: Array<{ value: string; label: string }> = [
  { value: "area", label: "Área" },
  { value: "superintendencia", label: "Superintendencia" },
  { value: "trabajador", label: "Trabajador" },
  { value: "gerencia", label: "Gerencia" },
  { value: "cargo", label: "Cargo" },
  { value: "equipo", label: "Equipo" },
  { value: "vicepresidencia", label: "Vicepresidencia" },
  { value: "supervisor", label: "Supervisor" },
]

interface QuestionBuilderProps {
  sectionPath: string
  questionIndex: number
  question: QuestionHerraEquipos
  setValue: UseFormSetValue<FormBuilderDataHerraEquipos>
  onRemove: () => void
  disabled?: boolean
}

const QuestionBuilder: React.FC<QuestionBuilderProps> = ({
  sectionPath,
  questionIndex,
  question,
  setValue,
  onRemove,
  disabled = false,
}) => {
  const [responseType, setResponseType] = useState<ResponseType>(question.responseConfig.type)
  const [showImageDialog, setShowImageDialog] = useState(false)
  const [imageUrl, setImageUrl] = useState("")
  const [uploadedFile, setUploadedFile] = useState<string | null>(null)
  const [imageCaption, setImageCaption] = useState("")
  const [imageError, setImageError] = useState<string | null>(null)

  const handleTypeChange = (newType: ResponseType) => {
    setResponseType(newType)
    const typeKey = `${sectionPath}.questions.${questionIndex}.responseConfig.type`
    setValue(typeKey as keyof FormBuilderDataHerraEquipos, newType as never)

    const defaultOptions = getDefaultOptions(newType)
    if (defaultOptions) {
      const optionsKey = `${sectionPath}.questions.${questionIndex}.responseConfig.options`
      setValue(optionsKey as keyof FormBuilderDataHerraEquipos, defaultOptions as never)
    }
  }

  const handleTextChange = (text: string) => {
    const textKey = `${sectionPath}.questions.${questionIndex}.text`
    setValue(textKey as keyof FormBuilderDataHerraEquipos, text as never)
  }

  const handleObligatorioChange = (checked: boolean) => {
    const obligatorioKey = `${sectionPath}.questions.${questionIndex}.obligatorio`
    setValue(obligatorioKey as keyof FormBuilderDataHerraEquipos, checked as never)
  }

  const handleAddImage = () => {
    setImageError(null)
    if (question.image) {
      setImageUrl(question.image.url)
      setImageCaption(question.image.caption)
    } else {
      setImageUrl("")
      setImageCaption("")
    }
    setUploadedFile(null)
    setShowImageDialog(true)
  }

  const handleSaveImage = () => {
    const finalUrl = uploadedFile || imageUrl

    if (!finalUrl || !finalUrl.trim()) {
      setImageError("Debes ingresar una URL o subir un archivo")
      return
    }

    if (!imageCaption || !imageCaption.trim()) {
      setImageError("La leyenda/descripción es obligatoria")
      return
    }

    const imageKey = `${sectionPath}.questions.${questionIndex}.image`
    setValue(imageKey as keyof FormBuilderDataHerraEquipos, { url: finalUrl, caption: imageCaption.trim() } as never)

    setShowImageDialog(false)
    setImageError(null)
    setUploadedFile(null)
    setImageUrl("")
  }

  const handleRemoveImage = () => {
    const imageKey = `${sectionPath}.questions.${questionIndex}.image`
    setValue(imageKey as keyof FormBuilderDataHerraEquipos, undefined as never)
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    setImageError(null)

    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setImageError("El archivo es demasiado grande (máximo 5MB)")
        event.target.value = ""
        return
      }

      if (!file.type.startsWith("image/")) {
        setImageError("El archivo debe ser una imagen")
        event.target.value = ""
        return
      }

      setImageUrl("")

      try {
        const formData = new FormData()
        formData.append("file", file)

        const { url } = await uploadImageToCloudinary(formData)

        setUploadedFile(url)
        setImageUrl(url)
      } catch (error) {
        setImageError("Error al subir el archivo a Cloudinary")
        setUploadedFile(null)
        event.target.value = ""
        console.error(error)
      }
    }
  }

  const handleCancelDialog = () => {
    setShowImageDialog(false)
    setImageError(null)
  }

  return (
    <Paper elevation={1} sx={{ p: 2, mb: 2, backgroundColor: "#fafafa" }}>
      <Box display="flex" alignItems="flex-start" gap={2}>
        <DragIndicator sx={{ color: "text.secondary", mt: 1 }} />
        <Box flex={1}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label={`Pregunta ${questionIndex + 1}`}
                placeholder="Escribe la pregunta aquí..."
                multiline
                rows={2}
                size="small"
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
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
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
                    onClick={handleAddImage}
                    size="small"
                    title={question.image ? "Editar imagen" : "Agregar imagen"}
                  >
                    <ImageIcon />
                  </IconButton>
                )}
                <IconButton color="error" onClick={onRemove} size="small" disabled={disabled}>
                  <Delete />
                </IconButton>
              </Box>
            </Grid>
            {question.image && (
              <Grid size={{ xs: 12 }}>
                <Card variant="outlined">
                  <Box display="flex" alignItems="center" gap={2} p={2}>
                    <Box
                      component="img"
                      src={question.image.url}
                      alt={question.image.caption}
                      sx={{
                        width: 100,
                        height: 100,
                        objectFit: "cover",
                        borderRadius: 1,
                      }}
                    />
                    <Box flex={1}>
                      <Typography variant="body2" fontWeight="medium">
                        {question.image.caption || "Sin leyenda"}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Imagen de referencia
                      </Typography>
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
            <Grid size={{ xs: 12 }}>
              <Box
                sx={{
                  p: 2,
                  backgroundColor: "white",
                  borderRadius: 1,
                  border: "1px dashed #ddd",
                }}
              >
                <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                  Vista previa de respuesta:
                </Typography>
                {responseType === "si_no_na" && (
                  <RadioGroup row>
                    <FormControlLabel value="si" control={<Radio size="small" />} label="SI" />
                    <FormControlLabel value="no" control={<Radio size="small" />} label="NO" />
                    <FormControlLabel value="na" control={<Radio size="small" />} label="N/A" />
                  </RadioGroup>
                )}
                {responseType === "text" && <TextField fullWidth size="small" placeholder="Texto corto..." disabled />}
                {responseType === "textarea" && (
                  <TextField fullWidth size="small" multiline rows={3} placeholder="Texto largo..." disabled />
                )}
                {responseType === "number" && <TextField type="number" size="small" placeholder="0" disabled />}
                {responseType === "boolean" && <FormControlLabel control={<Checkbox disabled />} label="Sí/No" />}
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Box>
      <Dialog open={showImageDialog} onClose={handleCancelDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{question.image ? "Editar Imagen" : "Agregar Imagen"}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            {imageError && (
              <Alert severity="error" sx={{ mb: 2 }} onClose={() => setImageError(null)}>
                {imageError}
              </Alert>
            )}
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="URL de la Imagen"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://ejemplo.com/imagen.jpg"
                  helperText="Ingresa la URL de la imagen O sube un archivo"
                  disabled={!!uploadedFile}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <MuiButton
                  variant="outlined"
                  component="label"
                  fullWidth
                  startIcon={<ImageIcon />}
                  disabled={!!imageUrl}
                >
                  Subir Archivo (máx 5MB)
                  <input type="file" hidden accept="image/*" onChange={handleFileChange} />
                </MuiButton>
              </Grid>
              {uploadedFile && (
                <>
                  <Grid size={{ xs: 12 }}>
                    <Alert severity="success" icon={<ImageIcon />}>
                      Archivo cargado correctamente
                    </Alert>
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <Box
                      sx={{
                        width: "100%",
                        height: 200,
                        backgroundColor: "#f5f5f5",
                        borderRadius: 1,
                        overflow: "hidden",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Box
                        component="img"
                        src={uploadedFile}
                        alt="Preview"
                        sx={{
                          maxWidth: "100%",
                          maxHeight: "100%",
                          objectFit: "contain",
                        }}
                      />
                    </Box>
                  </Grid>
                </>
              )}
              {imageUrl && !uploadedFile && (
                <Grid size={{ xs: 12 }}>
                  <Box
                    sx={{
                      width: "100%",
                      height: 200,
                      backgroundColor: "#f5f5f5",
                      borderRadius: 1,
                      overflow: "hidden",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Box
                      component="img"
                      src={imageUrl}
                      alt="Preview"
                      onError={() => setImageError("No se pudo cargar la imagen")}
                      sx={{
                        maxWidth: "100%",
                        maxHeight: "100%",
                        objectFit: "contain",
                      }}
                    />
                  </Box>
                </Grid>
              )}
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Leyenda / Descripción *"
                  value={imageCaption}
                  onChange={(e) => setImageCaption(e.target.value)}
                  placeholder="Descripción de la imagen"
                  multiline
                  rows={2}
                  required
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <MuiButton onClick={handleCancelDialog}>Cancelar</MuiButton>
          <MuiButton
            onClick={handleSaveImage}
            variant="contained"
            disabled={(!imageUrl.trim() && !uploadedFile) || !imageCaption.trim()}
          >
            {question.image ? "Actualizar" : "Agregar"}
          </MuiButton>
        </DialogActions>
      </Dialog>
    </Paper>
  )
}

interface ImageManagerProps {
  sectionPath: string
  images: SectionImageHerraEquipos[]
  setValue: UseFormSetValue<FormBuilderDataHerraEquipos>
  disabled?: boolean
}

const ImageManager: React.FC<ImageManagerProps> = ({ sectionPath, images, setValue, disabled = false }) => {
  const [imageDialogOpen, setImageDialogOpen] = useState(false)
  const [newImageUrl, setNewImageUrl] = useState("")
  const [newImageCaption, setNewImageCaption] = useState("")
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [uploadedFile, setUploadedFile] = useState<string | null>(null)
  const [imageError, setImageError] = useState<string | null>(null)

  const handleAddImage = () => {
    setEditingIndex(null)
    setNewImageUrl("")
    setNewImageCaption("")
    setUploadedFile(null)
    setImageError(null)
    setImageDialogOpen(true)
  }

  const handleEditImage = (index: number) => {
    setEditingIndex(index)
    setNewImageUrl(images[index].url)
    setNewImageCaption(images[index].caption)
    setUploadedFile(null)
    setImageError(null)
    setImageDialogOpen(true)
  }

  const handleSaveImage = () => {
    const finalUrl = uploadedFile || newImageUrl

    if (!finalUrl || !finalUrl.trim()) {
      setImageError("Debes ingresar una URL o subir un archivo")
      return
    }

    if (!newImageCaption || !newImageCaption.trim()) {
      setImageError("La leyenda/descripción es obligatoria")
      return
    }

    const currentImages = [...(images || [])]

    if (editingIndex !== null) {
      currentImages[editingIndex] = {
        ...currentImages[editingIndex],
        url: finalUrl,
        caption: newImageCaption.trim(),
      }
    } else {
      currentImages.push({
        url: finalUrl,
        caption: newImageCaption.trim(),
        order: currentImages.length,
      })
    }

    const imagesKey = `${sectionPath}.images`
    setValue(imagesKey as keyof FormBuilderDataHerraEquipos, currentImages as never)

    setImageDialogOpen(false)
    setImageError(null)
  }

  const handleDeleteImage = (index: number) => {
    const currentImages = [...(images || [])]
    currentImages.splice(index, 1)
    const imagesKey = `${sectionPath}.images`
    setValue(imagesKey as keyof FormBuilderDataHerraEquipos, currentImages as never)
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    setImageError(null)

    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setImageError("El archivo es demasiado grande (máximo 5MB)")
        event.target.value = ""
        return
      }

      if (!file.type.startsWith("image/")) {
        setImageError("El archivo debe ser una imagen")
        event.target.value = ""
        return
      }

      setNewImageUrl("")

      try {
        const formData = new FormData()
        formData.append("file", file)

        const { url } = await uploadImageToCloudinary(formData)

        setUploadedFile(url)
        setNewImageUrl(url)
      } catch (error) {
        setImageError("Error al subir el archivo a Cloudinary")
        setUploadedFile(null)
        event.target.value = ""
        console.error(error)
      }
    }
  }

  const handleCancelDialog = () => {
    setImageDialogOpen(false)
    setImageError(null)
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="subtitle2" fontWeight="medium">
          Imágenes ({images?.length || 0})
        </Typography>
        {!disabled && (
          <MuiButton variant="outlined" size="small" startIcon={<ImageIcon />} onClick={handleAddImage}>
            Agregar Imagen
          </MuiButton>
        )}
      </Box>
      {!images || images.length === 0 ? (
        <Box
          p={3}
          textAlign="center"
          sx={{
            border: "2px dashed #ddd",
            borderRadius: 2,
            backgroundColor: "#fafafa",
          }}
        >
          <ImageIcon sx={{ fontSize: 48, color: "text.secondary", mb: 1 }} />
          <Typography color="text.secondary" variant="body2">
            No hay imágenes agregadas
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {images.map((image, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={image._id || index}>
              <Card variant="outlined">
                <Box
                  sx={{
                    position: "relative",
                    paddingTop: "75%",
                    backgroundColor: "#f5f5f5",
                    overflow: "hidden",
                  }}
                >
                  <Box
                    component="img"
                    src={image.url}
                    alt={image.caption}
                    sx={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                  {!disabled && (
                    <Box
                      sx={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        display: "flex",
                        gap: 0.5,
                      }}
                    >
                      <IconButton size="small" sx={{ backgroundColor: "white" }} onClick={() => handleEditImage(index)}>
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        sx={{ backgroundColor: "white" }}
                        onClick={() => handleDeleteImage(index)}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Box>
                  )}
                </Box>
                <CardContent>
                  <Typography variant="body2" color="text.secondary">
                    {image.caption || "Sin leyenda"}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      <Dialog open={imageDialogOpen} onClose={handleCancelDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingIndex !== null ? "Editar Imagen" : "Agregar Imagen"}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            {imageError && (
              <Alert severity="error" sx={{ mb: 2 }} onClose={() => setImageError(null)}>
                {imageError}
              </Alert>
            )}
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="URL de la Imagen"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="https://ejemplo.com/imagen.jpg"
                  helperText="Ingresa la URL de la imagen o sube un archivo"
                  disabled={!!uploadedFile}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <MuiButton
                  variant="outlined"
                  component="label"
                  fullWidth
                  startIcon={<ImageIcon />}
                  disabled={!!newImageUrl}
                >
                  Subir Archivo (máx 5MB)
                  <input type="file" hidden accept="image/*" onChange={handleFileChange} />
                </MuiButton>
              </Grid>
              {uploadedFile && (
                <>
                  <Grid size={{ xs: 12 }}>
                    <Alert severity="success" icon={<ImageIcon />}>
                      Archivo cargado correctamente
                    </Alert>
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <Box
                      sx={{
                        width: "100%",
                        height: 200,
                        backgroundColor: "#f5f5f5",
                        borderRadius: 1,
                        overflow: "hidden",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Box
                        component="img"
                        src={uploadedFile}
                        alt="Preview"
                        sx={{
                          maxWidth: "100%",
                          maxHeight: "100%",
                          objectFit: "contain",
                        }}
                      />
                    </Box>
                  </Grid>
                </>
              )}
              {newImageUrl && !uploadedFile && (
                <Grid size={{ xs: 12 }}>
                  <Box
                    sx={{
                      width: "100%",
                      height: 200,
                      backgroundColor: "#f5f5f5",
                      borderRadius: 1,
                      overflow: "hidden",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Box
                      component="img"
                      src={newImageUrl}
                      alt="Preview"
                      onError={() => setImageError("No se pudo cargar la imagen")}
                      sx={{
                        maxWidth: "100%",
                        maxHeight: "100%",
                        objectFit: "contain",
                      }}
                    />
                  </Box>
                </Grid>
              )}
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Título / Leyenda *"
                  value={newImageCaption}
                  onChange={(e) => setNewImageCaption(e.target.value)}
                  placeholder="Descripción de la imagen"
                  multiline
                  rows={2}
                  required
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <MuiButton onClick={handleCancelDialog}>Cancelar</MuiButton>
          <MuiButton
            onClick={handleSaveImage}
            variant="contained"
            disabled={(!newImageUrl.trim() && !uploadedFile) || !newImageCaption.trim()}
          >
            {editingIndex !== null ? "Actualizar" : "Agregar"}
          </MuiButton>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

interface SectionBuilderProps {
  sectionIndex: number
  section: SectionHerraEquipos
  control: Control<FormBuilderDataHerraEquipos>
  setValue: UseFormSetValue<FormBuilderDataHerraEquipos>
  getValues: UseFormGetValues<FormBuilderDataHerraEquipos>
  onRemove: () => void
  disabled?: boolean
  isNested?: boolean
  parentPath?: string
}

const SectionBuilder: React.FC<SectionBuilderProps> = ({
  sectionIndex,
  section,
  control,
  setValue,
  getValues,
  onRemove,
  disabled = false,
  parentPath,
}) => {
  const basePath = parentPath ? `${parentPath}.subsections.${sectionIndex}` : `sections.${sectionIndex}`

  const questionsPath = `${basePath}.questions` as "sections"

  const { fields: questions, remove } = useFieldArray({
    control,
    name: questionsPath,
  })

  const addQuestion = () => {
    const newQuestion: QuestionHerraEquipos = {
      text: "",
      obligatorio: true,
      responseConfig: { type: "si_no_na", options: DEFAULT_SI_NO_NA_OPTIONS },
    }
    const currentQuestions = section.questions || []
    const updatedQuestions = [...currentQuestions, newQuestion]
    const questionsKey = `${basePath}.questions`
    setValue(questionsKey as keyof FormBuilderDataHerraEquipos, updatedQuestions as never)
  }

  const handleTitleChange = (title: string) => {
    const titleKey = `${basePath}.title`
    setValue(titleKey as keyof FormBuilderDataHerraEquipos, title as never)
  }

  const handleDescriptionChange = (description: string) => {
    const descriptionKey = `${basePath}.description`
    setValue(descriptionKey as keyof FormBuilderDataHerraEquipos, description as never)
  }

  const handleAddSubsection = (isParent: boolean) => {
    const currentSubsections = section.subsections || []
    const newSubsection: SectionHerraEquipos = {
      title: isParent ? "Nueva Subsección Padre" : "Nueva Subsección",
      isParent,
      parentId: section._id || null,
      questions: [],
      images: [],
      subsections: isParent ? [] : undefined,
    }

    const updatedSubsections = [...currentSubsections, newSubsection]
    const subsectionsKey = `${basePath}.subsections`
    setValue(subsectionsKey as keyof FormBuilderDataHerraEquipos, updatedSubsections as never)
  }

  const handleRemoveSubsection = (subIndex: number) => {
    const currentSubsections = [...(section.subsections || [])]
    currentSubsections.splice(subIndex, 1)
    const subsectionsKey = `${basePath}.subsections`
    setValue(subsectionsKey as keyof FormBuilderDataHerraEquipos, currentSubsections as never)
  }

  return (
    <Accordion defaultExpanded={!section.isParent} sx={{ mb: 2 }}>
      <Box display="flex" alignItems="flex-start">
        <AccordionSummary expandIcon={<ExpandMore />} sx={{ flexGrow: 1 }}>
          <Box>
            <Typography variant="h6" fontWeight="medium">
              {section.isParent ? "📁" : "📄"} {section.title || "Sin título"}
            </Typography>
            {section.description && (
              <Typography variant="caption" color="text.secondary">
                {section.description}
              </Typography>
            )}
            <Box mt={0.5}>
              <Chip label={`${questions.length} preguntas`} size="small" />
              {section.subsections && section.subsections.length > 0 && (
                <Chip
                  label={`${section.subsections.length} subsecciones`}
                  size="small"
                  color="primary"
                  variant="outlined"
                  sx={{ ml: 1 }}
                />
              )}
              {section.images && section.images.length > 0 && (
                <Chip
                  label={`${section.images.length} imágenes`}
                  size="small"
                  color="secondary"
                  variant="outlined"
                  sx={{ ml: 1 }}
                />
              )}
            </Box>
          </Box>
        </AccordionSummary>
        {!disabled && (
          <Box display="flex" alignItems="center" p={1}>
            <IconButton color="error" onClick={onRemove} size="small" title="Eliminar sección">
              <Delete />
            </IconButton>
          </Box>
        )}
      </Box>
      <AccordionDetails>
        <Box>
          <Grid container spacing={2} mb={3}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label={section.isParent ? "Título de la Sección Padre" : "Título de la Sección"}
                value={section.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                size="small"
                disabled={disabled}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Descripción (opcional)"
                value={section.description || ""}
                onChange={(e) => handleDescriptionChange(e.target.value)}
                size="small"
                multiline
                rows={2}
                disabled={disabled}
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />

          <ImageManager sectionPath={basePath} images={section.images || []} setValue={setValue} disabled={disabled} />

          {!section.isParent && (
            <>
              <Divider sx={{ my: 2 }} />
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="subtitle1" fontWeight="medium">
                  Preguntas ({questions.length})
                </Typography>
                {!disabled && (
                  <MuiButton variant="contained" size="small" startIcon={<Add />} onClick={addQuestion}>
                    Agregar Pregunta
                  </MuiButton>
                )}
              </Box>
              {questions.length === 0 ? (
                <Box
                  p={3}
                  textAlign="center"
                  sx={{
                    border: "2px dashed #ddd",
                    borderRadius: 2,
                    backgroundColor: "#fafafa",
                  }}
                >
                  <Typography color="text.secondary">
                    No hay preguntas. Haz clic en &quot;Agregar Pregunta&quot; para comenzar.
                  </Typography>
                </Box>
              ) : (
                questions.map((question, qIndex: number) => (
                  <QuestionBuilder
                    key={section.questions[qIndex]?._id || qIndex}
                    sectionPath={basePath}
                    questionIndex={qIndex}
                    question={section.questions[qIndex]}
                    setValue={setValue}
                    onRemove={() => remove(qIndex)}
                    disabled={disabled}
                  />
                ))
              )}
            </>
          )}

          {(section.isParent || section.subsections) && (
            <Box mt={3}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="subtitle1" fontWeight="medium">
                  Subsecciones ({section.subsections?.length || 0})
                </Typography>
                {!disabled && (
                  <Box display="flex" gap={1}>
                    <MuiButton
                      variant="contained"
                      size="small"
                      startIcon={<Add />}
                      onClick={() => handleAddSubsection(false)}
                      color="primary"
                    >
                      Subsección Simple
                    </MuiButton>
                    <MuiButton
                      variant="outlined"
                      size="small"
                      startIcon={<Add />}
                      onClick={() => handleAddSubsection(true)}
                      color="secondary"
                    >
                      Subsección Padre
                    </MuiButton>
                  </Box>
                )}
              </Box>

              {!section.subsections || section.subsections.length === 0 ? (
                <Box
                  p={3}
                  textAlign="center"
                  sx={{
                    border: "2px dashed #ddd",
                    borderRadius: 2,
                    backgroundColor: "#fafafa",
                  }}
                >
                  <Typography color="text.secondary">
                    No hay subsecciones. Haz clic en los botones de arriba para comenzar.
                  </Typography>
                </Box>
              ) : (
                section.subsections.map((subsection: SectionHerraEquipos, subIndex: number) => (
                  <Box key={subsection._id || `subsection-${subIndex}`} ml={2} mb={2}>
                    <SectionBuilder
                      sectionIndex={subIndex}
                      section={subsection}
                      control={control}
                      setValue={setValue}
                      getValues={getValues}
                      onRemove={() => handleRemoveSubsection(subIndex)}
                      disabled={disabled}
                      isNested={true}
                      parentPath={basePath}
                    />
                  </Box>
                ))
              )}
            </Box>
          )}
        </Box>
      </AccordionDetails>
    </Accordion>
  )
}

interface FormBuilderProps {
  template: FormTemplateHerraEquipos | null
  onSave: (data: FormBuilderDataHerraEquipos) => void
  onCancel: () => void
  mode?: "create" | "edit" | "view"
}

export const FormBuilder: React.FC<FormBuilderProps> = ({ template, onSave, onCancel, mode = "create" }) => {
  const isReadOnly = mode === "view"
  const { control, handleSubmit, watch, setValue, getValues } = useForm<FormBuilderDataHerraEquipos>({
    defaultValues: template || {
      name: "",
      code: "",
      revision: "Rev. 1",
      type: "interna",
      verificationFields: [
        { label: "Gerencia", type: "text" },
        { label: "Supervisor", type: "text" },
      ],
      sections: [],
    },
  })
  const {
    fields: verificationFields,
    append: appendVerificationField,
    remove: removeVerificationField,
  } = useFieldArray({ control, name: "verificationFields" })
  const { fields: sections, append, remove } = useFieldArray({ control, name: "sections" })
  const formData = watch()

  const addVerificationField = () => appendVerificationField({ label: "", type: "text" })

  const addSection = (isParent: boolean) =>
    append({
      title: isParent ? "Nueva Sección Padre" : "Nueva Sección",
      isParent,
      parentId: null,
      questions: [],
      images: [],
      subsections: isParent ? [] : undefined,
    })

  const handleVerificationFieldTypeChange = (index: number, newType: VerificationFieldType) => {
    setValue(`verificationFields.${index}.type`, newType)
    if (newType !== "autocomplete") setValue(`verificationFields.${index}.dataSource`, undefined)
  }

  return (
    <Box sx={{ maxWidth: 1400, mx: "auto" }}>
      <form onSubmit={handleSubmit(onSave)}>
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Información General
            </Typography>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Nombre del Formulario"
                  value={formData.name}
                  onChange={(e) => setValue("name", e.target.value)}
                  disabled={isReadOnly}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Código"
                  value={formData.code}
                  onChange={(e) => setValue("code", e.target.value)}
                  disabled={isReadOnly}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Número de Revisión"
                  value={formData.revision}
                  onChange={(e) => setValue("revision", e.target.value)}
                  disabled={isReadOnly}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth disabled={isReadOnly}>
                  <InputLabel>Tipo de Inspección</InputLabel>
                  <Select
                    value={formData.type}
                    onChange={(e) => setValue("type", e.target.value as "interna" | "externa")}
                    label="Tipo de Inspección"
                  >
                    <MenuItem value="interna">Interna</MenuItem>
                    <MenuItem value="externa">Externa</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Campos de Lista de Verificación ({verificationFields.length})</Typography>
              {!isReadOnly && (
                <MuiButton variant="outlined" startIcon={<Add />} onClick={addVerificationField} size="small">
                  Agregar Campo
                </MuiButton>
              )}
            </Box>
            {verificationFields.map((field, index: number) => (
              <Box key={field.id} mb={2}>
                <Grid container spacing={2} alignItems="center">
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <TextField
                      fullWidth
                      label="Etiqueta del Campo"
                      value={formData.verificationFields[index]?.label || ""}
                      size="small"
                      onChange={(e) => setValue(`verificationFields.${index}.label`, e.target.value)}
                      disabled={isReadOnly}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <FormControl fullWidth size="small" disabled={isReadOnly}>
                      <InputLabel>Tipo</InputLabel>
                      <Select
                        value={formData.verificationFields[index]?.type || "text"}
                        onChange={(e) =>
                          handleVerificationFieldTypeChange(index, e.target.value as VerificationFieldType)
                        }
                        label="Tipo"
                      >
                        <MenuItem value="text">Texto</MenuItem>
                        <MenuItem value="date">Fecha</MenuItem>
                        <MenuItem value="number">Número</MenuItem>
                        <MenuItem value="select">Selección</MenuItem>
                        <MenuItem value="autocomplete">Autocompletar</MenuItem>
                        <MenuItem value="time">Hora</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  {formData.verificationFields[index]?.type === "autocomplete" && (
                    <Grid size={{ xs: 12, sm: 2 }}>
                      <FormControl fullWidth size="small" disabled={isReadOnly}>
                        <InputLabel>Origen de Datos</InputLabel>
                        <Select
                          value={formData.verificationFields[index]?.dataSource || ""}
                          onChange={(e) => setValue(`verificationFields.${index}.dataSource`, e.target.value)}
                          label="Origen de Datos"
                        >
                          {DATA_SOURCES.map((source) => (
                            <MenuItem key={source.value} value={source.value}>
                              {source.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  )}
                  {!isReadOnly && (
                    <Grid size={{ xs: 12, sm: 2 }}>
                      <IconButton color="error" onClick={() => removeVerificationField(index)} size="small">
                        <Delete />
                      </IconButton>
                    </Grid>
                  )}
                </Grid>
              </Box>
            ))}
            {verificationFields.length === 0 && (
              <Box
                p={3}
                textAlign="center"
                sx={{
                  border: "2px dashed #ddd",
                  borderRadius: 2,
                  backgroundColor: "#fafafa",
                }}
              >
                <Typography color="text.secondary">No hay campos de verificación.</Typography>
              </Box>
            )}
          </CardContent>
        </Card>

        {!isReadOnly && (
          <Box display="flex" gap={2} mb={3}>
            <MuiButton variant="contained" startIcon={<Add />} onClick={() => addSection(false)}>
              Sección Simple
            </MuiButton>
            <MuiButton variant="outlined" startIcon={<Add />} onClick={() => addSection(true)}>
              Sección con Subsecciones
            </MuiButton>
          </Box>
        )}
        <Box>
          {sections.length === 0 ? (
            <Card>
              <CardContent sx={{ p: 5, textAlign: "center" }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No hay secciones
                </Typography>
                <Typography color="text.secondary">
                  {isReadOnly ? "Este template no tiene secciones definidas" : "Comienza agregando una sección"}
                </Typography>
              </CardContent>
            </Card>
          ) : (
            sections.map((section, index: number) => (
              <SectionBuilder
                key={section._id || index}
                sectionIndex={index}
                section={formData.sections[index]}
                control={control}
                setValue={setValue}
                getValues={getValues}
                onRemove={() => remove(index)}
                disabled={isReadOnly}
              />
            ))
          )}
        </Box>
        {!isReadOnly && (
          <Box display="flex" justifyContent="flex-end" gap={2} mt={3}>
            <MuiButton variant="outlined" onClick={onCancel}>
              Cancelar
            </MuiButton>
            <MuiButton type="submit" variant="contained" startIcon={<Save />}>
              Guardar Template
            </MuiButton>
          </Box>
        )}
      </form>
    </Box>
  )
}

interface TemplateBuilderProps {
  template: FormTemplateHerraEquipos | null
  onSave: (template: FormTemplateHerraEquipos) => void
  onCancel: () => void
  mode: "create" | "edit" | "view"
}

const TemplateBuilder: React.FC<TemplateBuilderProps> = ({ template, onSave, onCancel, mode }) => {
  const handleSave = (data: FormBuilderDataHerraEquipos) => {
    const now = new Date()
    onSave({
      _id: template?._id || Math.random().toString(36).substr(2, 9),
      ...data,
      createdAt: template?.createdAt || now,
      updatedAt: now,
    })
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <IconButton onClick={onCancel}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4">{mode === "view" ? "Ver" : mode === "edit" ? "Editar" : "Crear"} Template</Typography>
        {mode === "edit" && template && (
          <Chip label={`Editando: ${template.name}`} color="primary" variant="outlined" />
        )}
      </Box>
      <FormBuilder template={template} onSave={handleSave} onCancel={onCancel} mode={mode} />
    </Box>
  )
}

interface TemplateCardProps {
  template: FormTemplateHerraEquipos
  onEdit: () => void
  onDelete: () => void
  onView: () => void
}

const TemplateCard: React.FC<TemplateCardProps> = ({ template, onEdit, onDelete, onView }) => {
  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date)
  const getTotalQuestions = (): number => {
    let total = 0
    const countQuestions = (sections: SectionHerraEquipos[]) => {
      sections.forEach((section) => {
        total += section.questions.length
        if (section.subsections) {
          countQuestions(section.subsections)
        }
      })
    }
    countQuestions(template.sections)
    return total
  }
  const getAutocompleteFields = (): number =>
    template.verificationFields.filter((f) => f.type === "autocomplete").length

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Typography variant="h6" gutterBottom>
            {template.name}
          </Typography>
          <Chip
            label={template.type === "interna" ? "Interna" : "Externa"}
            size="small"
            color={template.type === "interna" ? "primary" : "secondary"}
          />
        </Box>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          <strong>Código:</strong> {template.code}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          <strong>Revisión:</strong> {template.revision}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          <strong>Creado:</strong> {formatDate(template.createdAt)}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          <strong>Actualizado:</strong> {formatDate(template.updatedAt)}
        </Typography>
        <Divider sx={{ my: 2 }} />
        <Box display="flex" flexWrap="wrap" gap={1}>
          <Chip label={`${template.sections.length} secciones`} size="small" variant="outlined" />
          <Chip label={`${getTotalQuestions()} preguntas`} size="small" variant="outlined" color="secondary" />
          <Chip label={`${template.verificationFields.length} campos`} size="small" variant="outlined" color="info" />
          {getAutocompleteFields() > 0 && (
            <Chip label={`${getAutocompleteFields()} autocomplete`} size="small" variant="outlined" color="success" />
          )}
        </Box>
      </CardContent>
      <CardActions sx={{ justifyContent: "flex-end", gap: 1 }}>
        <IconButton size="small" onClick={onView} title="Ver">
          <Visibility />
        </IconButton>
        <IconButton size="small" onClick={onEdit} title="Editar">
          <Edit />
        </IconButton>
        <IconButton size="small" color="error" onClick={onDelete} title="Eliminar">
          <Delete />
        </IconButton>
      </CardActions>
    </Card>
  )
}

const TemplateManagementApp: React.FC = () => {
  const [templates, setTemplates] = useState<FormTemplateHerraEquipos[]>([])
  const [currentView, setCurrentView] = useState<"list" | "create" | "edit" | "view">("list")
  const [selectedTemplate, setSelectedTemplate] = useState<FormTemplateHerraEquipos | null>(null)
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean
    templateId: string | null
  }>({ open: false, templateId: null })
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadTemplates = async () => {
      setLoading(true)
      setErrorMessage(null)
      const result = await getTemplatesHerraEquipos()
      if (result.success) {
        const templatesWithDates = result.data.map((template) => ({
          ...template,
          createdAt: new Date(template.createdAt),
          updatedAt: new Date(template.updatedAt),
        }))
        setTemplates(templatesWithDates)
      } else {
        setErrorMessage(result.error)
      }
      setLoading(false)
    }

    if (currentView === "list") {
      loadTemplates()
    }
  }, [currentView])

  const handleCreate = () => {
    setSelectedTemplate(null)
    setCurrentView("create")
  }

  const handleView = (template: FormTemplateHerraEquipos) => {
    setSelectedTemplate(template)
    setCurrentView("view")
  }

  const handleEdit = (template: FormTemplateHerraEquipos) => {
    setSelectedTemplate(template)
    setCurrentView("edit")
  }

  const handleSave = async (template: FormTemplateHerraEquipos) => {
    setErrorMessage(null)

    let result
    if (currentView === "create") {
      const { ...createData } = template
      console.log(createData)
      result = await createTemplateHerraEquipo(createData)
    } else if (currentView === "edit" && selectedTemplate) {
      const { ...updateData } = template
      console.log(updateData)
      result = await updateTemplateHerraEquipo(selectedTemplate._id, updateData)
    }

    if (result?.success) {
      setSuccessMessage(
        `Template "${template.name}" ${currentView === "create" ? "creado" : "actualizado"} exitosamente`,
      )
      setCurrentView("list")
      setSelectedTemplate(null)
      setTimeout(() => setSuccessMessage(null), 3000)
    } else {
      setErrorMessage(result?.error || "Error desconocido al guardar el template")
    }
  }

  const handleDeleteClick = (templateId: string) => {
    setDeleteDialog({ open: true, templateId })
  }

  const handleDeleteConfirm = async () => {
    if (deleteDialog.templateId) {
      const result = await deleteTemplateHerraEquipo(deleteDialog.templateId)

      if (result.success) {
        const deletedTemplate = templates.find((t) => t._id === deleteDialog.templateId)
        setSuccessMessage(`Template "${deletedTemplate?.name}" eliminado exitosamente`)
        setTemplates(templates.filter((t) => t._id !== deleteDialog.templateId))
        setTimeout(() => setSuccessMessage(null), 3000)
      } else {
        setErrorMessage(result.error)
      }
    }
    setDeleteDialog({ open: false, templateId: null })
  }

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, templateId: null })
  }

  const handleCancel = () => {
    setCurrentView("list")
    setSelectedTemplate(null)
  }

  if (currentView !== "list") {
    return (
      <TemplateBuilder template={selectedTemplate} onSave={handleSave} onCancel={handleCancel} mode={currentView} />
    )
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box mb={4}>
        <Typography variant="h3" gutterBottom>
          Gestión de Templates
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Crea, edita y gestiona tus plantillas de formularios
        </Typography>
      </Box>
      {successMessage && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccessMessage(null)}>
          {successMessage}
        </Alert>
      )}

      {errorMessage && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setErrorMessage(null)}>
          {errorMessage}
        </Alert>
      )}

      {loading ? (
        <Box textAlign="center" py={8}>
          <Typography variant="h6" color="text.secondary">
            Cargando templates...
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {templates.map((template) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={template._id}>
              <TemplateCard
                template={template}
                onView={() => handleView(template)}
                onEdit={() => handleEdit(template)}
                onDelete={() => handleDeleteClick(template._id)}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {templates.length === 0 && !loading && (
        <Box textAlign="center" py={8}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No hay templates disponibles
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Crea tu primer template para comenzar
          </Typography>
        </Box>
      )}

      <Fab
        color="primary"
        aria-label="crear template"
        sx={{ position: "fixed", bottom: 16, right: 16 }}
        onClick={handleCreate}
      >
        <Add />
      </Fab>

      <Dialog open={deleteDialog.open} onClose={handleDeleteCancel}>
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <Typography>¿Estás seguro de que deseas eliminar este template? Esta acción no se puede deshacer.</Typography>
        </DialogContent>
        <DialogActions>
          <MuiButton onClick={handleDeleteCancel}>Cancelar</MuiButton>
          <MuiButton onClick={handleDeleteConfirm} color="error" variant="contained">
            Eliminar
          </MuiButton>
        </DialogActions>
      </Dialog>

      <Box
        sx={{
          position: "fixed",
          bottom: 80,
          right: 16,
          backgroundColor: "background.paper",
          p: 2,
          borderRadius: 2,
          boxShadow: 3,
        }}
      >
        <Typography variant="caption" color="text.secondary">
          Total Templates: <strong>{templates.length}</strong>
        </Typography>
      </Box>
    </Box>
  )
}

export default TemplateManagementApp
