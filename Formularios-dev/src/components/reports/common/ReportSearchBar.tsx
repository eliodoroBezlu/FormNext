// components/reports/common/ReportSearchBar.tsx
"use client";

import {
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Typography,
  Chip,
} from "@mui/material";
import { Search, Clear } from "@mui/icons-material";

interface ReportSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  totalItems: number; // total sin filtro
  filteredItems: number; // total con filtro aplicado
  placeholder?: string;
}

export function ReportSearchBar({
  value,
  onChange,
  onClear,
  totalItems,
  filteredItems,
  placeholder = "Buscar en formulario, área, equipo, inspector…",
}: ReportSearchBarProps) {
  const isFiltering = value.trim() !== "";
  const hasNoResults = isFiltering && filteredItems === 0;

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        mb: 2,
        p: 2,
        bgcolor: "background.paper",
        borderRadius: 2,
        border: "1px solid",
        borderColor: isFiltering ? "primary.main" : "divider",
        transition: "border-color 0.2s",
      }}
    >
      <TextField
        fullWidth
        size="small"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search
                fontSize="small"
                color={isFiltering ? "primary" : "disabled"}
              />
            </InputAdornment>
          ),
          endAdornment: isFiltering ? (
            <InputAdornment position="end">
              <IconButton size="small" onClick={onClear} edge="end">
                <Clear fontSize="small" />
              </IconButton>
            </InputAdornment>
          ) : null,
        }}
        sx={{ "& fieldset": { border: "none" } }}
      />

      {/* Contador de resultados */}
      {isFiltering && (
        <Box
          sx={{ display: "flex", alignItems: "center", gap: 1, flexShrink: 0 }}
        >
          <Chip
            label={
              hasNoResults
                ? "Sin resultados"
                : `${filteredItems} de ${totalItems}`
            }
            size="small"
            color={hasNoResults ? "error" : "primary"}
            variant="outlined"
          />
        </Box>
      )}

      {!isFiltering && (
        <Typography
          variant="body2"
          color="text.disabled"
          sx={{ flexShrink: 0 }}
        >
          {totalItems} registros
        </Typography>
      )}
    </Box>
  );
}
