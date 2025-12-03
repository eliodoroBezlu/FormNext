import { SxProps, Theme } from "@mui/material";

export const tableStyles = {
  table: {
    minWidth: 1400
  } as SxProps<Theme>,
  tableRow: {
    height: "200px"
  } as SxProps<Theme>,
  formularioCell: {
    width: "150px"
  } as SxProps<Theme>,
  instanciasCard: {
    maxHeight: 180,
    overflow: "auto"
  } as SxProps<Theme>,
  areasContainer: {
    display: "flex",
    flexDirection: "column",
    gap: 0.5,
    maxHeight: "100px",
    overflowY: "auto"
  } as SxProps<Theme>,
  areaButton: {
    fontSize: "0.6rem",
    py: 0.2,
    justifyContent: "flex-start",
    textTransform: "none"
  } as SxProps<Theme>,
  programacionButton: {
    fontSize: "0.7rem"
  } as SxProps<Theme>,
  instanciaButton: {
    fontSize: "0.6rem",
    py: 0.2,
    minWidth: "auto"
  } as SxProps<Theme>,
  modalInstanciaItem: {
    width: "100%"
  } as SxProps<Theme>,
  infoBox: {
    mb: 3,
    p: 2,
    backgroundColor: "grey.50",
    borderRadius: 1
  } as SxProps<Theme>,
  chartContainer: {
    width: "100%",
    height: 180
  } as SxProps<Theme>
};

export const chipColors = {
  completado: "success",
  aprobado: "primary",
  default: "default"
} as const;

export const estadoColors = {
  CUMPLIDO: "success",
  FUERA_PLAZO: "warning",
  PENDIENTE: "info",
  CRITICO: "error",
  default: "default"
} as const;