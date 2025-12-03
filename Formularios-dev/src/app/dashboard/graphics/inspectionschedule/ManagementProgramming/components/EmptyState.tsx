import { Paper, Typography } from "@mui/material";
import { CalendarMonth } from "@mui/icons-material";

interface EmptyStateProps {
  año: number;
}

export const EmptyState = ({ año }: EmptyStateProps) => {
  return (
    <Paper sx={{py:4, textAlign: "center" }}>
      <CalendarMonth sx={{ fontSize: 48, color: "text.secondary", mb: 2 }} />
      <Typography variant="h6"  gutterBottom>
        No hay programaciones
      </Typography>
      <Typography variant="body2"  sx={{ mb: 3 }}>
        No se han creado programaciones para este template en el año {año}
      </Typography>
    </Paper>
  );
};
