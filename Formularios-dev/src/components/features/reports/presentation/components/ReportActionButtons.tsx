// components/reports/common/ReportActionButtons.tsx
"use client";

import { Box, IconButton, Tooltip } from "@mui/material";
import {
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  PictureAsPdf as PdfIcon,
  TableChart as ExcelIcon,
  Delete as DeleteIcon,
  ContentCopy as CopyIcon,
} from "@mui/icons-material";
import { Can } from "@/components/layout/wrappers/Can";
import { Permission } from "@/lib/permissions";

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
  view: true,
  edit: true,
  pdf: true,
  excel: true,
  duplicate: false,
  delete: false,
};

export function ReportActionButtons({
  onView,
  onEdit,
  onDownloadPdf,
  onDownloadExcel,
  onDuplicate,
  onDelete,
  show = {},
}: ReportActionButtonsProps) {
  const config = { ...DEFAULT_SHOW, ...show };

  return (
    <Box display="flex" justifyContent="center">
      {config.view && onView && (
        <Can perform={Permission.READ_FORM}>
          <Tooltip title="Ver detalle">
            <IconButton onClick={onView} color="primary" size="small">
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Can>
      )}
      {config.edit && onEdit && (
        <Can perform={Permission.UPDATE_FORM}>
          <Tooltip title="Editar">
            <IconButton onClick={onEdit} color="primary" size="small">
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Can>
      )}
      {config.duplicate && onDuplicate && (
        <Can perform={Permission.DOUBLE_FORM}>
          <Tooltip title="Duplicar">
            <IconButton onClick={onDuplicate} color="secondary" size="small">
              <CopyIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Can>
      )}
      {config.pdf && onDownloadPdf && (
        <Can perform={Permission.DOWNLOAD_PDF}>
          <Tooltip title="Descargar PDF">
            <IconButton onClick={onDownloadPdf} color="secondary" size="small">
              <PdfIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Can>
      )}
      {config.excel && onDownloadExcel && (
        <Can perform={Permission.DOWNLOAD_EXCEL}>
          <Tooltip title="Descargar Excel">
            <IconButton onClick={onDownloadExcel} color="success" size="small">
              <ExcelIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Can>
      )}
      {config.delete && onDelete && (
        <Can perform={Permission.DELETE_FORM}>
          <Tooltip title="Eliminar">
            <IconButton onClick={onDelete} color="error" size="small">
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Can>
      )}
    </Box>
  );
}
