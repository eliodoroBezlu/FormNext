import type React from "react"
import {
  FormControl,
  InputLabel,
  Select as MuiSelect,
  MenuItem,
  FormHelperText,
  type SelectProps as MuiSelectProps,
} from "@mui/material"

export interface SelectOption {
  value: string | number
  label: string
}

export interface SelectProps extends Omit<MuiSelectProps, "children"> {
  label?: string
  options: SelectOption[]
  helperText?: string
  error?: boolean
  disabled?: boolean // ✅ Agregado soporte para disabled
}

export const Select: React.FC<SelectProps> = ({ 
  label, 
  options, 
  helperText, 
  error, 
  disabled = false,
  ...props 
}) => {
  return (
    <FormControl fullWidth error={error} disabled={disabled}>
      {label && <InputLabel>{label}</InputLabel>}
      <MuiSelect disabled={disabled} {...props}>
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </MuiSelect>
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  )
}