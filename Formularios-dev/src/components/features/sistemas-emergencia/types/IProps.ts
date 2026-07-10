// src/components/form-sistemas-emergencia/types/IProps.ts

import { type Control, type FieldErrors } from "react-hook-form";
import { type FormularioInspeccion, type ExtintorBackend } from "@/types/formTypes";

export interface InspectionFormProps {
  onCancel: () => void;
  initialData?: FormularioInspeccion;
  isEditMode?: boolean;
  readonly?: boolean;
  idInstancia?: string;
  onSaveUpdate?: (id: string, data: FormularioInspeccion) => Promise<void>;
  onTagSelected?: (tag: string, area: string, extintoresSeleccionados?: ExtintorBackend[]) => void;
  preselectedTag?: string;
  preselectedArea?: string;
  preselectedExtintores?: string;
}

export interface InformacionGeneralProps {
  control: Control<FormularioInspeccion>;
  errors: FieldErrors<FormularioInspeccion>;
  soloLectura?: boolean;
  areaOptions: string[];
}
