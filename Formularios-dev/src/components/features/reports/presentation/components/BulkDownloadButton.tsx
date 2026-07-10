"use client";

import { useState } from "react";
import { Button, Menu, MenuItem, ListItemIcon, ListItemText, CircularProgress } from "@mui/material";
import {
  Download as DownloadIcon,
  PictureAsPdf as PdfIcon,
  TableChart as ExcelIcon,
} from "@mui/icons-material";

interface BulkDownloadButtonProps {
  count: number;
  onDownload: (format: "pdf" | "excel") => Promise<void> | void;
}

export function BulkDownloadButton({ count, onDownload }: BulkDownloadButtonProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [loading, setLoading] = useState(false);

  // Con 0 o 1 seleccionado no tiene sentido un .zip: para un solo archivo
  // se usa el ícono de descarga individual de la fila (PDF/Excel directo).
  if (count < 2) return null;

  const handleSelect = async (format: "pdf" | "excel") => {
    setAnchorEl(null);
    setLoading(true);
    try {
      await onDownload(format);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="outlined"
        type="button"
        startIcon={loading ? <CircularProgress size={16} /> : <DownloadIcon />}
        disabled={loading}
        onClick={(e) => setAnchorEl(e.currentTarget)}
      >
        Descargar seleccionados ({count})
      </Button>
      <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={() => setAnchorEl(null)}>
        <MenuItem onClick={() => handleSelect("pdf")}>
          <ListItemIcon><PdfIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Como PDF (.zip)</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleSelect("excel")}>
          <ListItemIcon><ExcelIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Como Excel (.zip)</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
}
