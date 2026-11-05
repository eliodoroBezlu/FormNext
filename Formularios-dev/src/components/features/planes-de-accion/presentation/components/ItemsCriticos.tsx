"use client";

import { useId, useState } from "react";
import { Box, Button, Collapse, Typography } from "@mui/material";
import { ExpandLess, ExpandMore } from "@mui/icons-material";

interface ItemsCriticosProps {
  /** «2. Ítems críticos / aspectos adicionales» de las conclusiones de la IRO. */
  texto?: string;
}

/**
 * Los ítems críticos que el inspector anotó en las conclusiones de la IRO o
 * ISOP. Solo para leer: se abren y se cierran en la tarjeta del plan.
 */
export function ItemsCriticos({ texto }: ItemsCriticosProps) {
  const [abierto, setAbierto] = useState(false);
  const idTexto = useId();

  return (
    <Box sx={{ mt: 1.25 }}>
      <Button
        type="button"
        size="small"
        onClick={() => setAbierto((a) => !a)}
        aria-expanded={abierto}
        aria-controls={idTexto}
        endIcon={abierto ? <ExpandLess /> : <ExpandMore />}
        sx={{ px: 0.5, fontSize: 12.5, textTransform: "none" }}
      >
        {abierto ? "Ocultar" : "Ver"} ítems críticos de la inspección
      </Button>
      <Collapse in={abierto} unmountOnExit>
        <Typography
          id={idTexto}
          sx={{
            mt: 0.75,
            px: 1.5,
            py: 1,
            borderRadius: 1,
            bgcolor: "action.hover",
            fontSize: 13,
            whiteSpace: "pre-wrap",
            color: texto ? "text.primary" : "text.secondary",
          }}
        >
          {texto || "La inspección no anotó ítems críticos."}
        </Typography>
      </Collapse>
    </Box>
  );
}
