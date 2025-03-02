import type { FormData, InspectionTitle } from "../../../../types/formTypes"
import type { Control } from "react-hook-form"

export interface IProps {
  titleIndex: number
  title: InspectionTitle
  control: Control<FormData>
}