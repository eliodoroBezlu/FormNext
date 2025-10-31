"use client"

import { Button, Box } from "@mui/material"
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined"
import SendOutlinedIcon from "@mui/icons-material/SendOutlined"

interface SaveSubmitButtonsProps {
  onSaveDraft?: () => void
  onSubmit: () => void
  isSubmitting: boolean
  allowDraft: boolean
}

export function SaveSubmitButtons({ onSaveDraft, onSubmit, isSubmitting, allowDraft }: SaveSubmitButtonsProps) {
  return (
    <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 2, justifyContent: "flex-end" }}>
      {allowDraft && onSaveDraft && (
        <Button
          variant="outlined"
          onClick={onSaveDraft}
          disabled={isSubmitting}
          startIcon={<SaveOutlinedIcon />}
          sx={{ width: { xs: "100%", sm: "auto" } }}
        >
          Guardar Borrador
        </Button>
      )}

      <Button
        variant="contained"
        onClick={onSubmit}
        disabled={isSubmitting}
        startIcon={<SendOutlinedIcon />}
        sx={{ width: { xs: "100%", sm: "auto" } }}
      >
        {isSubmitting ? "Enviando..." : "Enviar Inspección"}
      </Button>
    </Box>
  )
}
