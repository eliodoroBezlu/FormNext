import { TextField, TextFieldProps } from "@mui/material";
import { Controller, Control } from "react-hook-form";
import type { FormData, FormFieldName } from "@/types/formTypes";

export interface FormTextFieldProps extends Omit<TextFieldProps, "name"> {
  name: FormFieldName;
  control: Control<FormData>;
}

export const FormTextField = ({ name, control, ...props }: FormTextFieldProps) => (
  <Controller
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    name={name as any}
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    control={control as any}
    defaultValue=""
    render={({ field }) => <TextField {...field} {...props} fullWidth margin="normal" />}
  />
);
