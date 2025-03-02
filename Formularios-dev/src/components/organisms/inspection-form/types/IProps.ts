import type { Control } from "react-hook-form";
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
  setValue: (name: keyof FormData, value: any) => void;
  isSubmitting?: boolean
  mode?: "create" | "edit"
}
