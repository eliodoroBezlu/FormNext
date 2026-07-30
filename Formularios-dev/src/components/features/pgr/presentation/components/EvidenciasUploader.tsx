"use client";

import { Box, Button, IconButton, Typography, useTheme } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import CloseIcon from "@mui/icons-material/Close";
import { PendingFile } from "../../domain/models/IProps";

export interface EvidenciasUploaderProps {
  actividadId: string;
  evidencias: string[] | undefined;
  pendingFiles: PendingFile[];
  saving: boolean;
  onFileUpload: (actId: string, event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemovePendingFile: (actId: string, index: number) => void;
  onRemoveSavedFile: (actId: string, index: number) => void;
}

/**
 * Carga y listado de evidencias (archivos pendientes de subir + ya
 * guardados) para una actividad de seguimiento. Extraído de
 * `ActividadSeguimientoRow` para mantener cada componente bajo ~300 líneas
 * (CLAUDE.md, regla 8).
 */
export function EvidenciasUploader({
  actividadId,
  evidencias,
  pendingFiles,
  saving,
  onFileUpload,
  onRemovePendingFile,
  onRemoveSavedFile,
}: EvidenciasUploaderProps) {
  const theme = useTheme();

  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom fontWeight="bold">
        Evidencias Anexadas
      </Typography>

      <Button
        variant="outlined"
        component="label"
        startIcon={<CloudUploadIcon />}
        size="small"
        disabled={saving}
        sx={{ mb: 2, borderRadius: 2 }}
      >
        Seleccionar Archivo
        <input type="file" multiple hidden onChange={(e) => onFileUpload(actividadId, e)} />
      </Button>

      {pendingFiles.length > 0 && (
        <Box mb={2}>
          <Typography variant="caption" color="primary" fontWeight="bold" display="block" gutterBottom>
            Nuevos (sin guardar):
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={1.5}>
            {pendingFiles.map((pf, idx) => (
              <Box
                key={idx}
                position="relative"
                display="inline-block"
                sx={{
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 1,
                  p: 0.5,
                  backgroundColor: theme.palette.background.paper,
                  textAlign: "center",
                }}
              >
                <IconButton
                  size="small"
                  type="button"
                  onClick={() => onRemovePendingFile(actividadId, idx)}
                  sx={{
                    position: "absolute",
                    top: -8,
                    right: -8,
                    backgroundColor: theme.palette.background.paper,
                    color: theme.palette.error.main,
                    border: `1px solid ${theme.palette.error.main}`,
                    width: 20,
                    height: 20,
                    "&:hover": { backgroundColor: theme.palette.error.light },
                    zIndex: 1,
                  }}
                >
                  <CloseIcon sx={{ fontSize: 14 }} />
                </IconButton>
                {pf.isImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={pf.previewUrl}
                    alt="preview"
                    style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 4 }}
                  />
                ) : (
                  <Box
                    width={60}
                    height={60}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    bgcolor={theme.palette.action.hover}
                    borderRadius={1}
                    flexDirection="column"
                  >
                    <InsertDriveFileIcon color="action" />
                  </Box>
                )}
                <Typography
                  variant="caption"
                  display="block"
                  sx={{
                    width: 60,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    fontSize: "0.65rem",
                    mt: 0.5,
                  }}
                  title={pf.name}
                >
                  {pf.name}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {!evidencias || evidencias.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          Sin evidencias guardadas
        </Typography>
      ) : (
        <Box>
          <Typography variant="caption" color="text.secondary" fontWeight="bold" display="block" gutterBottom>
            Ya guardados:
          </Typography>
          <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
            {evidencias.map((url: string, i: number) => (
              <Box component="li" key={i} sx={{ mb: 0.5 }}>
                <Typography
                  component="a"
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  variant="body2"
                  sx={{ color: theme.palette.primary.main, mr: 1 }}
                >
                  Evidencia {i + 1}
                </Typography>
                <IconButton
                  size="small"
                  type="button"
                  onClick={() => onRemoveSavedFile(actividadId, i)}
                  sx={{ padding: 0.2 }}
                >
                  <CloseIcon sx={{ fontSize: 14, color: theme.palette.error.main }} />
                </IconButton>
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
}
