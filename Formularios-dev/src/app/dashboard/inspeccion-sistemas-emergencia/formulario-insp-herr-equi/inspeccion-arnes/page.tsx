"use client";

import { useForm } from "react-hook-form";
import { Box } from "@mui/material";
import { InspectionForm } from "@/components/organisms/inspection-form/InspectionForm";
import { useRouter } from "next/navigation";
import { crearInspeccion} from "@/app/actions/inspeccion";
import { FormData } from "@/types/formTypes";
import { titles } from "@/types/titles-data";



export default function InspeccionArnesPage() {
  const router = useRouter();
  const defaultValues: FormData = {
    documentCode: "1.02.P06.F19",
    revisionNumber: 4,
    informacionGeneral: {
      superintendencia: "",
      trabajador: "",
      supervisor: "",
      area: "",
      numInspeccion: "",
      codConector: "",
      codArnes: "",
      fecha: new Date(),
    },
    resultados: titles,
    operativo: null,
    observacionesComplementarias: "",
    reviewDate: new Date(),
    inspectionConductedBy:"",
    firmaInspector: "",
    inspectionApprovedBy:"",
    firmaSupervisor: "",
  };

  const { handleSubmit, control, setValue } = useForm<FormData>({
    defaultValues,
    mode: "onChange",
  });

  const onSubmit = async (data: FormData) => {
    try {
      console.log("Datos enviados:", data);
      
      await crearInspeccion(data);
      router.push("/dashboard");
      console.log("Datos enviados:", data);
    } catch (error) {
      console.error("Error al enviar el formulario:", error);
      // Aquí podrías mostrar un mensaje de error al usuario
    } 
  };

  return (
    <Box component="form" noValidate sx={{ maxWidth: "100%", borderRadius: 2 }}>
      <InspectionForm
        control={control}
        onSubmit={handleSubmit(onSubmit)}
        titles={titles}
        documentCode={defaultValues.documentCode}
        revisionNumber={defaultValues.revisionNumber}
        setValue={setValue}
      />
    </Box>
  );
}
