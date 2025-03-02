"use client";

import { useForm, Controller } from "react-hook-form";
import {
  Box,
  Typography,
  TextField,
  Button,
  FormControlLabel,
  RadioGroup,
  Radio,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import Image from "next/image";
import SignatureCanvas from "react-signature-canvas";
import { useRef } from "react";

interface FormData {
  superintendencia: string;
  trabajador: string;
  supervisor: string;
  area: string;
  num_inspeccion: string;
  cod_conector: string;
  cod_arnes: string;
  fecha: string;
  observaciones: string;
  resultados: Record<string, string>;
  firma: string;
}

const sections = [
  {
    title: "ARGOLLAS EN 'D' O ANILLOS",
    items: [
      "Con deformaciones o desgaste excesivo (dobladura, etc.)",
      "Picaduras, grietas, trizaduras (que abarquen un 50% de una sección)",
      "Corrosión de la argolla (Corrosión de toda la argolla)",
    ],
  },
  {
    title: "PROTECTOR DE ESPALDA",
    items: [
      "Cortes (que pasan todo el grosor de la pieza)",
      "Deterioro por uso o calor (reseco)",
    ],
  },
  {
    title: "HEBILLAS",
    items: [
      "Desgaste excesivo o deformaciones (dobladuras, etc.)",
      "Picaduras, grietas, trizaduras, quemaduras (que abarquen un 50% de una sección)",
      "Corrosión de las hebillas (Corrosión de toda la hebilla)",
      "Defecto de funcionamiento (no enganchan o se traban)",
    ],
  },
  {
    title: "PASADORES",
    items: [
      "Cortes (que pasan todo el grosor de la pieza)",
      "Deterioro por uso o calor (reseco)",
    ],
  },
];

export default function page() {
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormData>();
  const sigCanvasRef = useRef<SignatureCanvas | null>(null);

  const onSubmit = (data: FormData) => {
    if (sigCanvasRef.current) {
      const signature = sigCanvasRef.current
        .getTrimmedCanvas()
        .toDataURL("image/png");
      data.firma = signature;
    }
    console.log("Datos enviados:", data);
  };

  const clearSignature = () => {
    sigCanvasRef.current?.clear();
  };
  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      sx={{
        maxWidth: "100%",
        borderRadius: 2,
        //flexGrow: "1 !important",
      }}
    >
      <Grid container spacing={0} >
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
              1.02.P06.F19 <br />
              Revisión: 4
            </Typography>
            <Typography
              align="center"
              sx={{ textTransform: "uppercase", borderTop: "2px solid" }}
            >
              interno
            </Typography>
          </Grid>
        </Grid>

        <Grid container spacing={2} direction={"row"} sx={{ width: "100%" }}>
          {/* Campos de identificación */}
          <Grid size={{ xs: 2, sm: 3, md: 3 }}>
            <Controller
              name="superintendencia"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <TextField
                  {...field}
                  label="SUPERINTENDENCIA:"
                  fullWidth
                  margin="normal"
                />
              )}
            />
          </Grid>
          <Grid size={{ xs: 2, sm: 3, md: 3 }}>
            <Controller
              name="area"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <TextField
                  {...field}
                  label="ÁREA/SECCIÓN:"
                  fullWidth
                  margin="normal"
                />
              )}
            />
          </Grid>
          <Grid size={{ xs: 2, sm: 3, md: 3 }}>
            <Controller
              name="trabajador"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Nombre trabajador:"
                  fullWidth
                  margin="normal"
                />
              )}
            />
          </Grid>
          <Grid size={{ xs: 2, sm: 3, md: 3 }}>
            <Controller
              name="fecha"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Fecha"
                  type="date"
                  fullWidth
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 2, sm: 3, md: 3 }}>
            <Controller
              name="num_inspeccion"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Nº Inspección"
                  fullWidth
                  margin="normal"
                />
              )}
            />
          </Grid>
          <Grid size={{ xs: 2, sm: 3, md: 3 }}>
            <Controller
              name="supervisor"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Nombre supervisor:"
                  fullWidth
                  margin="normal"
                />
              )}
            />
          </Grid>
          <Grid size={{ xs: 2, sm: 3, md: 3 }}>
            <Controller
              name="cod_arnes"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <TextField
                  {...field}
                  label="COD. ARNÉS"
                  fullWidth
                  margin="normal"
                />
              )}
            />
          </Grid>
          <Grid size={{ xs: 2, sm: 3, md: 3 }}>
            <Controller
              name="cod_conector"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <TextField
                  {...field}
                  label="COD. CONECTOR"
                  fullWidth
                  margin="normal"
                />
              )}
            />
          </Grid>

          {/* Preguntas del checklist */}
          <Box sx={{ width: "100%" }}>
            <Typography align="center" sx={{ textTransform: "uppercase" }}>
              arnes <br />
              HERRAJES(Componentes palsticos y metalicos integrales del arnes)
            </Typography>
            {sections.map((section, sectionIndex) => (
              <Box key={sectionIndex} sx={{ mt: 4, width: "100%" }}>
                <Typography variant="h6" gutterBottom>
                  {section.title}
                </Typography>
                {section.items.map((item, index) => (
                  <Grid
                    container
                    spacing={2}
                    alignItems="center"
                    key={index}
                    sx={{ mt: 2 }}
                  >
                    <Grid size={{ xs: 4 }}>
                      <Typography>{item}</Typography>
                    </Grid>
                    <Grid size={{ xs: 4 }}>
                      <Controller
                        name={
                          `resultados.${section.title}.${item}.respuesta` as const
                        }
                        control={control}
                        
                        render={({ field }) => (
                          <RadioGroup {...field} row>
                            <FormControlLabel
                              value="SI"
                              control={<Radio />}
                              label="Sí"
                            />
                            <FormControlLabel
                              value="NO"
                              control={<Radio />}
                              label="No"
                            />
                            <FormControlLabel
                              value="NA"
                              control={<Radio />}
                              label="No aplica"
                            />
                          </RadioGroup>
                        )}
                      />
                    </Grid>
                    <Grid size={{ xs: 4 }}>
                      <Controller
                        name={
                          `resultados.${section.title}.${item}.observacion` as const
                        }
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label="Observaciones"
                            fullWidth
                            size="small"
                          />
                        )}
                      />
                    </Grid>
                  </Grid>
                ))}
              </Box>
            ))}
          </Box>
        </Grid>
        {/* Campo de firma */}
        <Box sx={{ mt: 4 }} alignItems={"center"}>
          <Typography variant="h6" gutterBottom>
            Firma Digital
          </Typography>
          <Box
            sx={{
              border: "1px solid #ccc",
              borderRadius: 2,
              width: "100%",
              height: 200,
              mb: 2,
            }}
          >
            <SignatureCanvas
              ref={sigCanvasRef}
              canvasProps={{
                width: 760,
                height: 200,
                className: "sigCanvas",
              }}
            />
          </Box>
          <Button onClick={clearSignature} variant="outlined" color="secondary">
            Limpiar Firma
          </Button>
        </Box>
      </Grid>

      {/* Botón de enviar */}
      <center>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          sx={{ mt: 2, width: "25%" }}
        >
          Enviar
        </Button>
      </center>
    </Box>
  );
}
