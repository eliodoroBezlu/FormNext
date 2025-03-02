import type { TextFieldProps } from "@mui/material"
import type { Control } from "react-hook-form"
import type { FormData, FormFieldName } from "../../../../types/formTypes"

export interface IProps extends Omit<TextFieldProps, "name"> {
    name: FormFieldName
    control: Control<FormData>
  }

