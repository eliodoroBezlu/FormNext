// src/components/organisms/inspection-form-iro-isop/types/IProps.ts

import type { Control, UseFormSetValue, UseFormTrigger, UseFormHandleSubmit, FieldErrors, FieldArrayWithId } from "react-hook-form";
import type {
  FormInstance,
  FormTemplate,
  InspectionTeamMember,
  VerificationList,
  SectionResponse,
  SimpleSection,
  Section,
  Question,
  QuestionResponse,
} from "@/types/formTypes";

export interface PersonalInvolucrado {
  nombre: string;
  ci: string;
}

export interface InspectionFormData {
  verificationList: VerificationList;
  inspectionTeam: InspectionTeamMember[];
  sections: SectionResponse[];
  simpleSections?: SimpleSection[];
  aspectosPositivos: string;
  aspectosAdicionales: string;
  personalInvolucrado?: PersonalInvolucrado[];
}

export interface InspectionFormProps {
  template: FormTemplate;
  onSave: (instance: FormInstance) => void;
  onCancel: () => void;
  readonly?: boolean;
  initialData?: FormInstance;
  isEditMode?: boolean;
}

export interface IroIsopInspectionFormProps {
  control: Control<InspectionFormData>;
  handleSubmit: UseFormHandleSubmit<InspectionFormData>;
  setValue: UseFormSetValue<InspectionFormData>;
  trigger: UseFormTrigger<InspectionFormData>;
  errors: FieldErrors<InspectionFormData>;
  isDirty: boolean;
  
  template: FormTemplate;
  readonly: boolean;
  isEditMode: boolean;
  onCancel: () => void;
  onSubmit: (data: InspectionFormData) => void;

  success: string | null;
  error: string | null;
  submitting: boolean;

  teamMembers: FieldArrayWithId<InspectionFormData, "inspectionTeam", "id">[];
  addTeamMember: () => void;
  removeTeamMember: (index: number) => void;

  previewMetrics: {
    totalObtained: string;
    totalApplicable: string;
    totalNA: number;
    compliance: string;
  };
  
  allFlatSections: Section[];
  calculateSectionMetrics: (questions: QuestionResponse[], maxPoints: number) => Record<string, string | number>;
  handleMarkSectionAsNotApplicable: (sectionIndex: number) => void;
  handleUpdateQuestionResponse: (sectionIndex: number, questionIndex: number, newResponse: string) => void;
}

export interface QuestionItemProps {
  section: Section;
  question: Question;
  questionIndex: number;
  flatIndex: number;
  control: Control<InspectionFormData>;
  onResponseChange: (
    sectionIndex: number,
    questionIndex: number,
    value: string
  ) => void;
  readonly?: boolean;
}

export interface SectionAccordionProps {
  section: Section;
  level: number;
  index: number;
  control: Control<InspectionFormData>;
  readonly: boolean;
  allFlatSections: Section[];
  handleMarkSectionAsNotApplicable: (sectionIndex: number) => void;
  handleUpdateQuestionResponse: (sectionIndex: number, questionIndex: number, newResponse: string) => void;
  calculateSectionMetrics: (questions: QuestionResponse[], maxPoints: number) => Record<string, string | number>;
  renderSections: (sections: Section[], level?: number) => React.ReactNode;
}
