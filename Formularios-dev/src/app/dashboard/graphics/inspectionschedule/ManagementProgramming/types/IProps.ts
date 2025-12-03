import { Dayjs } from "dayjs";

export interface Programacion {
  _id?: string;
  templateId: string;
  templateName: string;
  area: string;
  managementYear: number;
  firstSemesterDueDate?: Date;
  firstSemesterCompletionDate?: Date;
  secondSemesterDueDate?: Date;
  secondSemesterCompletionDate?: Date;
  status: string;
}

export interface ProgramacionFormData {
  area: string;
  firstSemesterDueDate: Dayjs | null;  // ✅ Cambiar de Date a Dayjs
  secondSemesterDueDate: Dayjs | null; // ✅ Cambiar de Date a Dayjs
}

export interface EstadoSemestre {
  texto: string;
  color: "default" | "success" | "error" | "warning";
}

export interface GestionProgramacionesProps {
  templateId: string;
  templateName: string;
  año: number;
  programaciones: Programacion[];
  onProgramacionesChange: () => void;
}