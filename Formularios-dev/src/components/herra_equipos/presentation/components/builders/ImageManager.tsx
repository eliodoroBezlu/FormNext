import React, { useState } from "react"
import { UseFormSetValue } from "react-hook-form"
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
  CardContent,
  IconButton,
  TextField,
} from "@mui/material"
import { Image as ImageIcon, Edit, Delete } from "@mui/icons-material"
import { useImageUpload } from "../../../application/hooks/useImageUpload"
import { FormBuilderDataHerraEquipos, SectionImageHerraEquipos } from "../../../domain/models/BuilderTypes"

interface ImageManagerProps {
  sectionPath: string
  images: SectionImageHerraEquipos[]
  setValue: UseFormSetValue<FormBuilderDataHerraEquipos>
  disabled?: boolean
}

export const ImageManager: React.FC<ImageManagerProps> = ({ sectionPath, images, setValue, disabled = false }) => {
  const [imageDialogOpen, setImageDialogOpen] = useState(false)
  const [newImageUrl, setNewImageUrl] = useState("")
  const [newImageCaption, setNewImageCaption] = useState("")
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [uploadedFile, setUploadedFile] = useState<string | null>(null)
  const [imageError, setImageError] = useState<string | null>(null)
  const { upload, isUploading } = useImageUpload()

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
      setNewImageUrl("")
      const url = await upload(file)
      
      if (url) {
        setUploadedFile(url)
        setNewImageUrl(url)
      } else {
        setImageError("Error al subir el archivo")
        setUploadedFile(null)
      }
      
      event.target.value = ""
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
            disabled={(!newImageUrl.trim() && !uploadedFile) || !newImageCaption.trim() || isUploading}
          >
            {editingIndex !== null ? "Actualizar" : "Agregar"}
          </MuiButton>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
