// components/reports/common/ReportActionButtons.tsx
"use client";

import { Box, IconButton, Tooltip } from "@mui/material";
import {
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  PictureAsPdf as PdfIcon,
  TableChart as ExcelIcon,
  Lock as LockIcon,
  Delete as DeleteIcon,
  ContentCopy as CopyIcon,
} from "@mui/icons-material";

interface ReportActionButtonsProps {
  hasPermission?: boolean; // undefined = sin restricción de rol
  onView?: () => void;
  onEdit?: () => void;
  onDownloadPdf?: () => void;
  onDownloadExcel?: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
  show?: {
    view?: boolean;
    edit?: boolean;
    pdf?: boolean;
    excel?: boolean;
    duplicate?: boolean;
    delete?: boolean;
  };
}

const DEFAULT_SHOW = {
  view: true, edit: true, pdf: true, excel: true,
  duplicate: false, delete: false,
};

export function ReportActionButtons({
  hasPermission = true, // por defecto sin restricción
  onView, onEdit, onDownloadPdf, onDownloadExcel, onDuplicate, onDelete,
  show = {},
}: ReportActionButtonsProps) {
  const config = { ...DEFAULT_SHOW, ...show };

  if (!hasPermission) {
    return (
      <Tooltip title="Sin permisos">
        <LockIcon color="disabled" fontSize="small" />
      </Tooltip>
    );
  }

  return (
    <Box display="flex" justifyContent="center">
      {config.view && onView && (
        <Tooltip title="Ver detalle">
          <IconButton onClick={onView} color="primary" size="small">
            <VisibilityIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
      {config.edit && onEdit && (
        <Tooltip title="Editar">
          <IconButton onClick={onEdit} color="primary" size="small">
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
      {config.duplicate && onDuplicate && (
        <Tooltip title="Duplicar">
          <IconButton onClick={onDuplicate} color="secondary" size="small">
            <CopyIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
      {config.pdf && onDownloadPdf && (
        <Tooltip title="Descargar PDF">
          <IconButton onClick={onDownloadPdf} color="secondary" size="small">
            <PdfIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
      {config.excel && onDownloadExcel && (
        <Tooltip title="Descargar Excel">
          <IconButton onClick={onDownloadExcel} color="success" size="small">
            <ExcelIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
      {config.delete && onDelete && (
        <Tooltip title="Eliminar">
          <IconButton onClick={onDelete} color="error" size="small">
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
}