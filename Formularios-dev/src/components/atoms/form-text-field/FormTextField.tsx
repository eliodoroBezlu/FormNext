import { TextField } from "@mui/material"
import { Controller } from "react-hook-form"
import type { IProps } from "./types/IProps"

export const FormTextField = ({ name, control, ...props }: IProps) => (
  <Controller
    name={name}
    control={control}
    defaultValue=""
    render={({ field }) => <TextField {...field} {...props} fullWidth margin="normal" />}
  />
)
