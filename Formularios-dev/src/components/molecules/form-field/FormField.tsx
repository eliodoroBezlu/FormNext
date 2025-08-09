import {
  Controller,
  type Control,
  type FieldPath,
  type FieldValues,
  type RegisterOptions,
} from "react-hook-form";
import { Input, type InputProps } from "../../atoms/input/Input";
import { Select, type SelectProps } from "../../atoms/select/Select";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { 
  FormControl, 
  FormControlLabel, 
  Checkbox,
  Typography
} from "@mui/material";
import dayjs from "dayjs";

export type FormFieldValue = string | number | Date | boolean | null | undefined;

export interface FormFieldProps<T extends FieldValues> {
  name: FieldPath<T>;
  control: Control<T>;
  type?: "text" | "number" | "date" | "select" | "checkbox";
  label: string;
  options?: SelectProps["options"];
  inputProps?: Partial<InputProps>;
  rules?: RegisterOptions<T, FieldPath<T>>;
  disabled?: boolean;
  onChange?: (value: FormFieldValue) => void;
}

export function FormField<T extends FieldValues>({
  name,
  control,
  type = "text",
  label,
  options = [],
  inputProps = {},
  rules = {},
  disabled = false,
  onChange,
}: FormFieldProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field, fieldState: { error } }) => {
        const handleChange = (value: FormFieldValue) => {
          field.onChange(value);
          if (onChange) {
            onChange(value);
          }
        };

        switch (type) {
          case "checkbox":
            return (
              <FormControl error={!!error}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={Boolean(field.value)}
                      onChange={(e) => handleChange(e.target.checked)}
                      disabled={disabled}
                    />
                  }
                  label={label}
                  sx={{
                    color: error ? 'error.main' : 'inherit',
                    '& .MuiFormControlLabel-label': {
                      fontSize: '0.875rem'
                    }
                  }}
                />
                {error && (
                  <Typography variant="caption" color="error" sx={{ ml: 2, mt: 0.5 }}>
                    {error.message}
                  </Typography>
                )}
              </FormControl>
            );

          case "select":
            return (
              <Select
                {...field}
                label={label}
                options={options}
                error={!!error}
                helperText={error?.message}
                disabled={disabled}
                onChange={(e) => handleChange(e.target.value as FormFieldValue)}
              />
            );

          case "date":
            return (
              <FormControl fullWidth error={!!error} disabled={disabled}>
                <DatePicker
                  value={field.value ? dayjs(field.value) : null}
                  onChange={(newValue) => {
                    if (newValue && newValue.isValid()) {
                      handleChange(newValue.toDate());
                    } else {
                      handleChange(null);
                    }
                  }}
                  label={label}
                  disabled={disabled}
                  slotProps={{
                    textField: {
                      error: !!error,
                      helperText: error?.message,
                      fullWidth: true,
                      disabled: disabled,
                    },
                  }}
                />
              </FormControl>
            );

          case "number":
            return (
              <Input
                {...field}
                type="number"
                label={label}
                error={!!error}
                helperText={error?.message}
                disabled={disabled}
                onChange={(e) => handleChange(e.target.value)}
                {...inputProps}
              />
            );

          default:
            return (
              <Input
                {...field}
                label={label}
                error={!!error}
                helperText={error?.message}
                disabled={disabled}
                onChange={(e) => handleChange(e.target.value)}
                {...inputProps}
              />
            );
        }
      }}
    />
  );
}