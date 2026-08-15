"use client";

import {
  Alert,
  Box,
  Button,
  Container,
  Snackbar,
  Typography,
} from "@mui/material";
import TuneIcon from "@mui/icons-material/Tune";
import Link from "next/link";
import { Can } from "@/components/layout/wrappers/Can";
import { Permission } from "@/lib/permissions";
import { Pgr, PgrFilters } from "../../domain/models/IProps";
import { PgrFiltersPanel } from "./PgrFiltersPanel";
import { PgrTable } from "./PgrTable";

interface SnackbarState {
  open: boolean;
  message: string;
  severity: "success" | "error" | "warning" | "info";
}

export interface PgrListViewProps {
  planes: Pgr[];
  isLoading: boolean;
  error: string | null;
  filters: PgrFilters;
  onFilterChange: <K extends keyof PgrFilters>(key: K, value: PgrFilters[K]) => void;
  onClearFilters: () => void;
  onNuevo: () => void;
  onView: (plan: Pgr) => void;
  onEdit: (plan: Pgr) => void;
  onToggleActivo: (plan: Pgr) => void;
  onSeguimiento: (plan: Pgr) => void;
  onAprobar: (plan: Pgr) => void;
  onCorregir: (plan: Pgr) => void;
  snackbar: SnackbarState;
  onCloseSnackbar: () => void;
}

export function PgrListView({
  planes,
  isLoading,
  error,
  filters,
  onFilterChange,
  onClearFilters,
  onNuevo,
  onView,
  onEdit,
  onToggleActivo,
  onSeguimiento,
  onAprobar,
  onCorregir,
  snackbar,
  onCloseSnackbar,
}: PgrListViewProps) {
  return (
    <Container maxWidth="xl">
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mt: 3, mb: 3 }}
        gap={2}
      >
        <Typography variant="h4">Gestión de Planes PGR</Typography>
        {/* Solo administración: el backend exige ADMIN para escribir los
            catálogos, así que mostrarlo a otros roles sería ofrecer una
            pantalla donde todo botón falla. */}
        <Can perform={Permission.MANAGE_SETTINGS}>
          <Button
            variant="outlined"
            startIcon={<TuneIcon />}
            component={Link}
            href="/dashboard/pgr/catalogos"
            sx={{ whiteSpace: "nowrap" }}
          >
            Catálogos
          </Button>
        </Can>
      </Box>

      <PgrFiltersPanel
        filters={filters}
        onFilterChange={onFilterChange}
        onClear={onClearFilters}
        onNuevo={onNuevo}
        disabled={isLoading}
      />

      <PgrTable
        planes={planes}
        isLoading={isLoading}
        error={error}
        onView={onView}
        onEdit={onEdit}
        onToggleActivo={onToggleActivo}
        onSeguimiento={onSeguimiento}
        onAprobar={onAprobar}
        onCorregir={onCorregir}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={onCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={onCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
