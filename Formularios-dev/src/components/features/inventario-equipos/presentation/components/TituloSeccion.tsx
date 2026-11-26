import { Box, Typography } from "@mui/material";

/** «1  ¿Qué equipo es?»: el orden de carga, visible. */
export function TituloSeccion({ numero, titulo, detalle }: { numero: number; titulo: string; detalle?: string }) {
  return (
    <Box display="flex" alignItems="baseline" gap={1.25} mb={1.5}>
      <Box
        component="span"
        aria-hidden
        sx={{
          width: 24,
          height: 24,
          borderRadius: "50%",
          bgcolor: "primary.main",
          color: "primary.contrastText",
          fontSize: 13,
          fontWeight: 700,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          alignSelf: "center",
        }}
      >
        {numero}
      </Box>
      <Typography component="h3" variant="subtitle1" fontWeight={700}>
        {titulo}
      </Typography>
      {detalle && (
        <Typography variant="caption" color="text.secondary">
          {detalle}
        </Typography>
      )}
    </Box>
  );
}
