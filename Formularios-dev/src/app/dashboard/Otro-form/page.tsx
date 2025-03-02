"use client";

import { useForm } from "react-hook-form";
import { Box } from "@mui/material";
import { InspectionForm } from "@/components/organisms/inspection-form/InspectionForm";
import type { FormData, InspectionSection } from "../../../types/formTypes";
import { inspeccionService } from "../../../services/inspeccionService";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {titles} from "../../../types/titles-data"

const sections: InspectionSection[] = [
  {
    id: "1",
    category: "ARGOLLAS EN 'D' O ANILLOS",
    items: [
      {
        id: "1.1",
        description: "Con deformaciones o desgaste excesivo (dobladura, etc.)",
        response: null,
        observation: "",
      },
      {
        id: "1.2",
        description:
          "Picaduras, grietas, trizaduras (que abarquen un 50% de una sección)",
        response: null,
        observation: "",
      },
      {
        id: "1.3",
        description: "Corrosión de la argolla (Corrosión de toda la argolla)",
        response: null,
        observation: "",
      },
    ],
  },
  {
    id: "2",
    category: "PROTECTOR DE ESPALDA",
    items: [
      {
        id: "2.1",
        description: "Cortes (que pasan todo el grosor de la pieza)",
        response: null,
        observation: "",
      },
      {
        id: "2.2",
        description: "Deterioro por uso o calor (reseco)",
        response: null,
        observation: "",
      },
    ],
  },
  {
    id: "3",
    category: "HEBILLAS",
    items: [
      {
        id: "3.1",
        description: "Desgaste excesivo o deformaciones (dobladuras, etc.)",
        response: null,
        observation: "",
      },
      {
        id: "3.2",
        description:
          "Picaduras, grietas, trizaduras, quemaduras (que abarquen un 50% de una sección)",
        response: null,
        observation: "",
      },
      {
        id: "3.3",
        description: "Corrosión de las hebillas (Corrosión de toda la hebilla)",
        response: null,
        observation: "",
      },
      {
        id: "3.4",
        description: "Defecto de funcionamiento (no enganchan o se traban)",
        response: null,
        observation: "",
      },
    ],
  },
  {
    id: "4",
    category: "PASADORES",
    items: [
      {
        id: "4.1",
        description: "Cortes (que pasan todo el grosor de la pieza)",
        response: null,
        observation: "",
      },
      {
        id: "4.2",
        description: "Deterioro por uso o calor (reseco)",
        response: null,
        observation: "",
      },
    ],
  },
  {
    id: "tejidoTrenzado1",
    category: "TEJIDO TRENZADO (Correas de fibra sintética)",
    items: [
      {
        id: "5.1",
        description: "Presenta partes deshilachadas",
        response: null,
        observation: "",
      },
      {
        id: "5.2",
        description: "Tiene cortes",
        response: null,
        observation: "",
      },
      {
        id: "5.3",
        description: "Tiene fibras rotas",
        response: null,
        observation: "",
      },
      {
        id: "5.4",
        description: "Presenta rasgaduras",
        response: null,
        observation: "",
      },
      {
        id: "5.5",
        description:
          "Presenta daños por calor o productos químicos: manchas marrones, zonas decoloradas, áreas quebradizas",
        response: null,
        observation: "",
      },
      {
        id: "5.6",
        description:
          "Presenta daños por radiación ultravioleta: decoloración y presencia de astillas en la superficie del tejido trenzado (desintegración polvorienta)",
        response: null,
        observation: "",
      },
    ],
  },
  {
    id: "conector",
    category: "GANCHOS DE SEGURIDAD, AJUSTADORES, GUARDACABOS, BARRA EXPANSORA",
    items: [
      {
        id: "6.1",
        description: "Presentan daños (que afecten su cierre o funcionalidad)",
        response: null,
        observation: "",
      },
      {
        id: "6.2",
        description: "Están rotos o rajados (cualquier daño)",
        response: null,
        observation: "",
      },
      {
        id: "6.3",
        description:
          "Presentan deformación (que afecte su cierre o funcionalidad)",
        response: null,
        observation: "",
      },
    ],
  },
  {
    id: "amortiguadorDeCaidas",
    category: "AMORTIGUADOR DE CAIDAS",
    items: [
      {
        id: "7.1",
        description: "Desgaste del protector, deformación, quemaduras",
        response: null,
        observation: "",
      },
      {
        id: "7.2",
        description: "Testigo activado",
        response: null,
        observation: "",
      },
    ],
  },
];

export default function InspeccionArnesPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
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
      setIsSubmitting(true);
      if (!data.firmaInspector || !data.firmaSupervisor) {
        alert("Por favor, complete ambas firmas antes de enviar el formulario");
        return;
      }
      await inspeccionService.crear(data);
      router.push("/dashboard/Otro-form");
      console.log("Datos enviados:", data);
    } catch (error) {
      console.error("Error al enviar el formulario:", error);
      // Aquí podrías mostrar un mensaje de error al usuario
    } finally {
      setIsSubmitting(false);
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
