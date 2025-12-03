import { Dayjs } from "dayjs";

export interface Instancia {
  _id: string;
  status: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  verificationList?: any;
  createdAt?: string;
}

export interface Formulario {
  formularioId: string;
  nombreFormulario: string;
  año: number;
  totalInstancias: number;
  instancias: Instancia[];
  primerSemestre: {
    estado: string;
    fechaLlenado?: string;
    porcentaje: number;
  };
  segundoSemestre: {
    estado: string;
    fechaLlenado?: string;
    porcentaje: number;
  };
  ultimaInstancia?: Instancia;
}

export interface SnackbarState {
  open: boolean;
  message: string;
  severity: 'success' | 'error';
}

export interface FormDataDirecta {
  firstSemesterDueDate: Dayjs | null;       // ✅
  secondSemesterDueDate: Dayjs | null;      // ✅
}