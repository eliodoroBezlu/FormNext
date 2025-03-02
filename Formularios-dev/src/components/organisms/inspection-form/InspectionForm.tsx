"use client";
import {
  Typography,
  Button,
  Box,
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@mui/material";
import { FormTextField } from "@/components/atoms/form-text-field/FormTextField";
import { InspectionSection } from "@/components/organisms/inspection-section/InspectionSection";
import SignatureCanvas from "react-signature-canvas";
import React, { useEffect, useRef, useState } from "react";
import type { IProps } from "./types/IProps";
import Image from "next/image";
import Grid from "@mui/material/Grid2";
import { OperativoOption } from "@/types/formTypes";
import { Controller } from "react-hook-form";

const DynamicSignatureCanvas = React.forwardRef<
  SignatureCanvas,
  {  onClear: () => void; heightPercentage?: number }
>(({  onClear, heightPercentage = 100 }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width } = containerRef.current.getBoundingClientRect()
        setDimensions({ width, height: width * (heightPercentage / 100) })
      }
    }

    updateDimensions()
    window.addEventListener("resize", updateDimensions)
    return () => window.removeEventListener("resize", updateDimensions)
  }, [heightPercentage])

  return (
    <div ref={containerRef} style={{ width: "100%"}}>
      <Box
        sx={{
          border: "1px solid #ccc",
          borderRadius: 2,
          width: "100%",
          height: "25%",
          mb: 2,
        }}
      >
        <SignatureCanvas
          ref={ref}
          canvasProps={{
            width: dimensions.width,
            height: dimensions.height,
            className: "sigCanvas",
          }}
        />
      </Box>
      <Button onClick={onClear} variant="outlined" color="secondary">
        Limpiar Firma
      </Button>
    </div>
  );
});
DynamicSignatureCanvas.displayName = "DynamicSignatureCanvas";

export const InspectionForm = ({
  control,
  onSubmit,
  titles,
  setValue,
  documentCode,
  revisionNumber,
  isSubmitting = false,
  mode= "create" 
}: IProps) => {
  const inspectorSigCanvasRef = useRef<SignatureCanvas | null>(null);
  const supervisorSigCanvasRef = useRef<SignatureCanvas | null>(null);

  const clearSignature = (ref: React.RefObject<SignatureCanvas | null>) => {
    if (ref.current) {
      ref.current.clear();
    }
  };

  const handleSubmit = () => {
    if (inspectorSigCanvasRef.current && supervisorSigCanvasRef.current) {
      const inspectorSignature = inspectorSigCanvasRef.current
        .getTrimmedCanvas()
        .toDataURL("image/png");
      const supervisorSignature = supervisorSigCanvasRef.current
        .getTrimmedCanvas()
        .toDataURL("image/png");

      setValue("firmaInspector", inspectorSignature);
      setValue("firmaSupervisor", supervisorSignature);
    }
    onSubmit();
  };

  return (
    <Grid container spacing={2}>
      <Grid container spacing={0} direction={"row"} sx={{ width: "100%" }}>
        <Grid
          size={{ xs: 2, sm: 3, md: 2 }}
          sx={{
            backgroundColor: "#f0f0f0",
            border: "2px solid #000",
          }}
          alignItems={"center"}
          justifyContent={"center"}
          display={"flex"}
        >
          <Image
            src="/MSC.png"
            width={100}
            height={50}
            alt="Picture of the MSC"
          />
        </Grid>
        <Grid
          size={{ xs: 8, sm: 6, md: 8 }}
          sx={{
            backgroundColor: "#f0f0f0",
            border: "2px solid #000",
          }}
        >
          <Typography
            variant="h5"
            mb={2}
            align="center"
            sx={{ textTransform: "uppercase" }}
          >
            Lista de Chequeo - Arnés y Conectores <br />
            Sistema de Protección personal contra caidas
          </Typography>
        </Grid>
        <Grid
          size={{ xs: 2, sm: 3, md: 2 }}
          sx={{
            backgroundColor: "#f0f0f0",
            border: "2px solid #000",
          }}
        >
          <Typography align="center">
            {documentCode} <br />
            Revisión: {revisionNumber}
          </Typography>
          <Typography
            align="center"
            sx={{ textTransform: "uppercase", borderTop: "2px solid" }}
          >
            interno
          </Typography>
        </Grid>
      </Grid>

      <Grid size={{ xs: 12 }} container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <FormTextField
            name="informacionGeneral.superintendencia"
            control={control}
            label="SUPERINTENDENCIA:"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <FormTextField
            name="informacionGeneral.trabajador"
            control={control}
            label="Nombre Trabajador:"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <FormTextField
            name="informacionGeneral.supervisor"
            control={control}
            label="Nombre Supervisor:"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <FormTextField
            name="informacionGeneral.area"
            control={control}
            label="ÁREA/SECCIÓN:"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <FormTextField
            name="informacionGeneral.numInspeccion"
            control={control}
            label="Nº INSPECCIÓN:"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <FormTextField
            name="informacionGeneral.codConector"
            control={control}
            label="COD. CONECTOR:"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <FormTextField
            name="informacionGeneral.codArnes"
            control={control}
            label="COD. ARNÉS:"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <FormTextField
            name="informacionGeneral.fecha"
            control={control}
            label="FECHA:"
            type="date"
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
      </Grid>

      <Grid size={{ xs: 12 }}>
        {titles.map((title, titleIndex) => (
          <Box key={title.id}>
            <Typography
              variant="h5"
              gutterBottom
              sx={{ fontWeight: "bold", mt: 4 }}
            >
              {title.title}
            </Typography>
            {title.items.map((section, sectionIndex) => (
              <InspectionSection
                key={section.id}
                titleIndex={titleIndex}
                sectionIndex={sectionIndex}
                section={section}
                control={control}
              />
            ))}
          </Box>
        ))}
      </Grid>

      <Grid container sx={{ width: "100%" }}>
        <Grid size={{ xs: 6 }}>
          <Typography variant="h6" gutterBottom>
            OPERATIVO
          </Typography>
          <Controller
            name="operativo"
            control={control}
            render={({ field }) => (
              <RadioGroup
                {...field}
                row
                onChange={(e) =>
                  field.onChange(e.target.value as OperativoOption)
                }
              >
                <FormControlLabel value="SI" control={<Radio />} label="SI" />
                <FormControlLabel value="NO" control={<Radio />} label="NO" />
              </RadioGroup>
            )}
          />
        </Grid>

        <Grid size={{ xs: 6 }}>
          <FormTextField
            name="observacionesComplementarias"
            control={control}
            label="OBSERVACIONES COMPLEMENTARIAS:"
          />
        </Grid>

        <Grid size={{ xs: 6, sm: 6, md: 6 }}>
          <FormTextField
            name="inspectionConductedBy"
            control={control}
            label="Inspeccion realizada por:"
          />
        </Grid>

        <Grid size={{ xs: 6, sm: 6, md: 6 }}>
          <FormTextField
            name="inspectionApprovedBy"
            control={control}
            label="Inspeccion aprobada por (supervisor de area):"
          />
        </Grid>

        <Grid size={{ xs: 6 }} >
          <DynamicSignatureCanvas
            ref={inspectorSigCanvasRef}
            onClear={() => inspectorSigCanvasRef.current?.clear()}
            heightPercentage={10}
          />
        </Grid>

        <Grid size={{ xs: 6 }}>
          <DynamicSignatureCanvas
            ref={supervisorSigCanvasRef}
            onClear={() => supervisorSigCanvasRef.current?.clear()}
            heightPercentage={10}
          />
        </Grid>

        <Grid size={{ xs: 12, xl: 6 }}>
          <FormTextField
            name="reviewDate"
            control={control}
            label="Fecha de revisión:"
            type="date"
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
      </Grid>

      <Grid size={{ xs: 12 }}>
        <Box display="flex" justifyContent="center">
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            sx={{ mt: 2, width: "25%" }}
          >
            Enviar
          </Button>
        </Box>
      </Grid>
    </Grid>
  );
};
