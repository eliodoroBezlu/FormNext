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
import { FormControl } from "@mui/material";
import dayjs from "dayjs";

export type FormFieldValue = string | number | Date | null | undefined;

export interface FormFieldProps<T extends FieldValues> {
  name: FieldPath<T>;
  control: Control<T>;
  type?: "text" | "number" | "date" | "select";
  label: string;
  options?: SelectProps["options"];
  inputProps?: Partial<InputProps>;
  rules?: RegisterOptions<T, FieldPath<T>>;
  disabled?: boolean; // ✅ Soporte para disabled
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
  disabled = false, // ✅ Valor por defecto
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
          case "select":
            return (
              <Select
                {...field}
                label={label}
                options={options}
                error={!!error}
                helperText={error?.message}
                disabled={disabled} // ✅ Pasar disabled al Select
                onChange={(e) => handleChange(e.target.value as FormFieldValue)}
              />
            );

          case "date":
            return (
              <FormControl fullWidth error={!!error} disabled={disabled}>
                <DatePicker
                  value={field.value ? dayjs(field.value) : null}
                  onChange={(newValue) => {
                    // ✅ Convertir Day.js a Date nativo para serialización
                    if (newValue && newValue.isValid()) {
                      handleChange(newValue.toDate()); // Convertir a Date nativo
                    } else {
                      handleChange(null); // Mantener null si no hay valor
                    }
                  }}
                  label={label}
                  disabled={disabled} // ✅ Pasar disabled al DatePicker
                  slotProps={{
                    textField: {
                      error: !!error,
                      helperText: error?.message,
                      fullWidth: true,
                      disabled: disabled, // ✅ También al TextField interno
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
                disabled={disabled} // ✅ Pasar disabled al Input
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
                disabled={disabled} // ✅ Pasar disabled al Input
                onChange={(e) => handleChange(e.target.value)}
                {...inputProps}
              />
            );
        }
      }}
    />
  );
}