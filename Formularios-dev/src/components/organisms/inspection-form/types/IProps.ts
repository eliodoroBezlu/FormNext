import type { Control,UseFormSetValue  } from "react-hook-form";
import type {
  FormData,
  InspectionTitle
} from "../../../../types/formTypes";

export interface IProps {
  control: Control<FormData>;
  onSubmit: () => void;
  titles: InspectionTitle[];
  documentCode: string;
  revisionNumber: number;
  setValue: UseFormSetValue<FormData>;
  isSubmitting?: boolean
  mode?: "create" | "edit"
}
