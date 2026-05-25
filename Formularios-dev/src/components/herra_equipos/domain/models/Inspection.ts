import { FieldErrors } from "react-hook-form";
import { QuestionResponseUnion } from "./Question";

export type DamageType = 'abollado' | 'raspado' | 'roto';

export interface DamageMarker {
  tempId?: number;
  type: DamageType;
  x: number;
  y: number;
  timestamp: string;
}

export type OutOfServiceResponse = "yes" | "no" | "na" | "nr";
export type OutOfServiceResponseType = "yes-no" | "yes-no-na" | "yes-no-na-nr";

export interface AccesorioConfig {
  cantidad: number;
  tipoServicio: string;
}

export interface AccesoriosConfig {
  [key: string]: AccesorioConfig;
}

export interface VehicleData {
  damages?: DamageMarker[];
  damageImageBase64?: string;
  damageObservations?: string;
  tipoInspeccion?: "inicial" | "periodica";
  certificacionMSC?: "si" | "no";
  fechaProximaInspeccion?: string;
  responsableProximaInspeccion?: string;
}

export enum InspectionStatus {
  DRAFT = 'draft',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  PENDING_APPROVAL = 'pending_approval',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export type ResponsesData = Record<string, Record<string, QuestionResponseUnion>>;

export interface ApprovalData {
  status: "pending" | "approved" | "rejected";
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  supervisorComments?: string;
}

export interface OutOfServiceData {
  status?: OutOfServiceResponse;
  date?: string;
  observations?: string;
  tag?: string;
  inspector?: string;
  capacidad?: string;
  tipo?: string;
  [key: string]: string | OutOfServiceResponse | undefined; 
}

export interface RoutineInspectionEntry {
  date: string;
  inspector: string;
  response: "si" | "no";
  observations?: string;
  signature?: string;
}

export interface ScaffoldData {
  routineInspections?: RoutineInspectionEntry[];
  finalConclusion?: "liberado" | "no_liberado";
}

export interface FormDataHerraEquipos {
  _id?: string;
  verification: Record<string, string | number>;
  generalObservations?: string;
  responses: ResponsesData;
  outOfService?: OutOfServiceData;
  accesoriosConfig?: AccesoriosConfig;
  vehicle?: VehicleData;
  scaffold?: ScaffoldData;
  selectedSubsections?: string[];
  selectedItems?: Record<string, string[]>;
  inspectorSignature?: Record<string, string | number>;
  supervisorSignature?: Record<string, string | number>;
  status?: InspectionStatus;
  approval?: ApprovalData;
  submittedBy?: string;
  submittedAt?: string;
  requiresApproval?: boolean;
}

export interface FormResponse {
  templateId: string;
  verificationData: Record<string, string | number>;
  responses: ResponsesData;
  submittedAt: Date;
  status: InspectionStatus;
}

export const getNestedError = (
  errors: FieldErrors,
  path: string
): { message?: string } | undefined => {
  const parts = path.split(".");
  let current: unknown = errors;

  for (const part of parts) {
    if (!current || typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[part];
  }

  return current as { message?: string } | undefined;
};
