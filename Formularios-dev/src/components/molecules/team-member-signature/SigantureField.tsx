import { useRef } from "react";
import { Control, UseFormSetValue, Path, FieldValues } from "react-hook-form";
import SignatureCanvas from "react-signature-canvas";
import DynamicSignatureCanvas from "../signature-canvas/SigantureCanvas";

// Componente simple y reutilizable solo para firmas
export interface SignatureFieldProps<T extends Record<string, unknown>> {
  fieldName: Path<T>; // El path completo del campo (ej: "inspectionTeam.0.firma")
  control: Control<T>;
  setValue: UseFormSetValue<T>;
  heightPercentage?: number;
  format?: "png" | "jpeg";
  error?: boolean;
  helperText?: string;
}

export const SignatureField = <T extends FieldValues>({
  fieldName,
  setValue,
  heightPercentage = 60,
  format = "png",
  error = false,
  helperText
}: SignatureFieldProps<T>) => {
  const sigCanvasRef = useRef<SignatureCanvas | null>(null);

  const saveSignature = () => {
    if (sigCanvasRef.current) {
      const signature = sigCanvasRef.current
        .getTrimmedCanvas()
        .toDataURL(`image/${format}`);
      setValue(fieldName, signature as T[Path<T>]);
    }
  };

  const clearSignature = () => {
    if (sigCanvasRef.current) {
      sigCanvasRef.current.clear();
      setValue(fieldName, "" as T[Path<T>]);
    }
  };

  return (
    <DynamicSignatureCanvas
      ref={sigCanvasRef}
      onClear={clearSignature}
      onSave={saveSignature}
      heightPercentage={heightPercentage}
      error={error}
      helperText={helperText}
    />
  );
};