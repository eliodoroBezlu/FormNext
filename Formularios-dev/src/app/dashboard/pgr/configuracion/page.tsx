"use client";

import { useForm, useFieldArray, Controller } from "react-hook-form";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Alert,
  Autocomplete,
  Paper,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import SendIcon from "@mui/icons-material/Send";
import SaveIcon from "@mui/icons-material/Save";
import { obtenerAreasCompletas, AreaBackend } from "@/lib/actions/area-actions";
import { obtenerSuperintendencias, SuperintendenciaBackend } from "@/lib/actions/superintendecia-actions";

import { pgrService } from "@/services/pgrService";
import { useRouter, useSearchParams } from "next/navigation";
import { CreatePgrDto, Pgr } from "@/types/pgr";
import { Suspense, useEffect, useState } from "react";

function PgrConfigurationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");

  const { control, handleSubmit, register, reset, watch } = useForm({
    defaultValues: {
      empresa: "",
      vicepresidencia: "",
      gerencia: "",
      superintendencia: "",
      gestion: "2026",
      areas: [] as string[],
      actividades: [
        {
          verificador: "",
          descripcion: "",
          responsable: "",
          recurso: "",
          entregable: "",
          frecuencia: "1",
          mesesProgramados: [] as string[],
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "actividades",
  });

  const [estadoPlan, setEstadoPlan] = useState<"BORRADOR" | "CORREGIR">(
    "BORRADOR",
  );
  const [comentariosRechazo, setComentariosRechazo] = useState("");
  const [areasList, setAreasList] = useState<AreaBackend[]>([]);
  const [superintendenciasList, setSuperintendenciasList] = useState<SuperintendenciaBackend[]>([]);

  useEffect(() => {
    const fetchCatalogos = async () => {
      try {
        const dataArea = await obtenerAreasCompletas();
        if (Array.isArray(dataArea)) {
          setAreasList(dataArea);
        }

        const dataSup = await obtenerSuperintendencias();
        if (Array.isArray(dataSup)) {
          setSuperintendenciasList(dataSup);
        }
      } catch (err) {
        console.error("Error fetching catalogos", err);
      }
    };

    fetchCatalogos();
  }, []);
  useEffect(() => {
    if (editId) {
      pgrService
        .obtenerPorId(editId)
        .then((data: Pgr) => {
          if (data.estado === "CORREGIR") {
            setEstadoPlan("CORREGIR");
            const motivos = data.actividades
              .filter(
                (act) =>
                  act.estadoAprobacion === "RECHAZADO" && act.motivoRechazo,
              )
              .map((act) => `- ${act.descripcion}: ${act.motivoRechazo}`)
              .join("\n");
            setComentariosRechazo(motivos);
          } else if (data.estado === "BORRADOR") {
            setEstadoPlan("BORRADOR");
          }

          reset({
            empresa: data.empresa,
            vicepresidencia: data.vicepresidencia,
            gerencia: data.gerencia,
            superintendencia: data.superintendencia,
            gestion: data.gestion,
            areas: data.areas || [],
            actividades: data.actividades.map((act) => ({
              ...act,
              mesesProgramados: act.mesesProgramados || [],
            })),
          });
        })
        .catch((err) =>
          console.error("Error al cargar plan para edición", err),
        );
    }
  }, [editId, reset]);

  const onSubmit = async (
    data: Omit<CreatePgrDto, "estado">,
    action: string,
  ) => {
    try {
      const payload = {
        ...data,
        estado: action,
      };
      if (editId) {
        await pgrService.actualizar(editId, payload);
      } else {
        await pgrService.crear(payload);
      }
      alert("Plan guardado exitosamente");
      router.push("/dashboard/pgr");
    } catch (error) {
      console.error("Error al guardar el PGR:", error);
      alert("Error al guardar el plan");
    }
  };

  const meses = [
    "Ene",
    "Feb",
    "Mar",
    "Abr",
    "May",
    "Jun",
    "Jul",
    "Ago",
    "Sep",
    "Oct",
    "Nov",
    "Dic",
  ];

  return (
    <Box sx={{ p: 4, maxWidth: "1200px", margin: "0 auto" }}>
      <Typography variant="h4" gutterBottom>
        Configuración Inicial
      </Typography>
      <Typography
        variant="subtitle1"
        color="text.secondary"
        gutterBottom
        sx={{ mb: 4 }}
      >
        Matriz de Planificación de Actividades
      </Typography>

      {estadoPlan === "CORREGIR" && comentariosRechazo && (
        <Alert severity="error" sx={{ mb: 4, whiteSpace: "pre-wrap" }}>
          <strong>
            El plan requiere correcciones en las siguientes actividades:
          </strong>
          <br />
          {comentariosRechazo}
        </Alert>
      )}

      <form>
        {/* Encabezado General */}
        <Card elevation={2} sx={{ mb: 4, borderRadius: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Encabezado General
            </Typography>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 4 }}>
                <Controller
                  name="empresa"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Empresa"
                      placeholder="Nombre de la empresa"
                      fullWidth
                      size="small"
                      disabled={estadoPlan === "CORREGIR"}
                    />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Controller
                  name="vicepresidencia"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Vicepresidencia"
                      placeholder="VP"
                      fullWidth
                      size="small"
                      disabled={estadoPlan === "CORREGIR"}
                    />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Controller
                  name="gerencia"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Gerencia"
                      placeholder="Gerencia"
                      fullWidth
                      size="small"
                      disabled={estadoPlan === "CORREGIR"}
                    />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Controller
                  name="superintendencia"
                  control={control}
                  render={({ field }) => (
                    <Autocomplete
                      {...field}
                      options={superintendenciasList.map((s) => s.nombre)}
                      disabled={estadoPlan === "CORREGIR"}
                      onChange={(_, data) => field.onChange(data || "")}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Superintendencia"
                          placeholder="Seleccione o escriba"
                          size="small"
                        />
                      )}
                    />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Gestión</InputLabel>
                  <Controller
                    name="gestion"
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        label="Gestión"
                        disabled={estadoPlan === "CORREGIR"}
                      >
                        <MenuItem value="2025">2025</MenuItem>
                        <MenuItem value="2026">2026</MenuItem>
                        <MenuItem value="2027">2027</MenuItem>
                      </Select>
                    )}
                  />
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Áreas</InputLabel>
                  <Controller
                    name="areas"
                    control={control}
                    render={({ field }) => {
                      const selectedSuperintendencia =
                        watch("superintendencia");
                      const areasFiltradas = (
                        Array.isArray(areasList) ? areasList : []
                      ).filter(
                        (area) =>
                          !selectedSuperintendencia ||
                          area.superintendencia?.nombre ===
                            selectedSuperintendencia,
                      );
                      return (
                        <Select
                          {...field}
                          multiple
                          label="Áreas"
                          disabled={estadoPlan === "CORREGIR"}
                          renderValue={(selected: string[]) =>
                            selected.join(", ")
                          }
                        >
                          {areasFiltradas.map((area) => (
                            <MenuItem key={area._id} value={area.nombre}>
                              {area.nombre}
                            </MenuItem>
                          ))}
                        </Select>
                      );
                    }}
                  />
                </FormControl>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Actividades Planificadas */}
        <Card elevation={2} sx={{ borderRadius: 2, mb: 4 }}>
          <CardContent>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={3}
            >
              <Typography variant="h6" fontWeight="bold">
                Actividades Planificadas
              </Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => {
                  const selectedAreas = watch("areas") || [];
                  const areaText =
                    selectedAreas.length > 0
                      ? selectedAreas
                          .map((a: string) => `AREA ${a.toUpperCase()}`)
                          .join(", ")
                      : "";

                  append({
                    verificador: areaText ? `${areaText} - ` : "",
                    descripcion: areaText ? ` - ${areaText}` : "",
                    responsable: "",
                    recurso: "",
                    entregable: "",
                    frecuencia: "1",
                    mesesProgramados: [] as string[],
                  });
                }}
                sx={{
                  borderRadius: 4,
                  textTransform: "none",
                  backgroundColor: "#0A1929",
                }}
              >
                Agregar Actividad
              </Button>
            </Box>

            {fields.map((item, index) => (
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  mb: 2,
                  borderRadius: 2,
                  backgroundColor: "#FAFAFA",
                }}
                key={item.id}
              >
                <Grid container spacing={2} alignItems="center">
                  <Grid size={{ xs: 12, sm: 6, md: 1.5 }}>
                    <TextField
                      {...register(`actividades.${index}.verificador` as const)}
                      label="Verificador"
                      fullWidth
                      size="small"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
                    <TextField
                      {...register(`actividades.${index}.descripcion` as const)}
                      label="Actividad"
                      placeholder="Descripción de la actividad"
                      fullWidth
                      size="small"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 1.5 }}>
                    <TextField
                      {...register(`actividades.${index}.responsable` as const)}
                      label="Responsable"
                      fullWidth
                      size="small"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 1.5 }}>
                    <TextField
                      {...register(`actividades.${index}.recurso` as const)}
                      label="Recurso"
                      fullWidth
                      size="small"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 1.5 }}>
                    <TextField
                      {...register(`actividades.${index}.entregable` as const)}
                      label="Entregable"
                      fullWidth
                      size="small"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 1 }}>
                    <TextField
                      {...register(`actividades.${index}.frecuencia` as const)}
                      label="Frec."
                      fullWidth
                      size="small"
                      type="number"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 10, md: 2 }}>
                    <Controller
                      name={`actividades.${index}.mesesProgramados`}
                      control={control}
                      render={({ field }) => (
                        <Select
                          {...field}
                          multiple
                          displayEmpty
                          renderValue={(selected: string[]) =>
                            selected.length === 0
                              ? "Meses"
                              : (selected as string[]).join(", ")
                          }
                          fullWidth
                          size="small"
                        >
                          {meses.map((mes) => (
                            <MenuItem key={mes} value={mes}>
                              {mes}
                            </MenuItem>
                          ))}
                        </Select>
                      )}
                    />
                  </Grid>
                  <Grid
                    size={{ xs: 12, sm: 2, md: 0.5 }}
                    alignContent="center"
                    textAlign="center"
                  >
                    <IconButton color="error" onClick={() => remove(index)}>
                      <DeleteIcon />
                    </IconButton>
                  </Grid>
                </Grid>
              </Paper>
            ))}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <Box display="flex" justifyContent="flex-end" gap={2}>
          <Button
            variant="outlined"
            startIcon={<SaveIcon />}
            onClick={handleSubmit((data) =>
              onSubmit(data as Omit<CreatePgrDto, "estado">, "BORRADOR"),
            )}
            sx={{ borderRadius: 4, textTransform: "none", px: 4 }}
          >
            Guardar Borrador
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<SendIcon />}
            onClick={handleSubmit((data) =>
              onSubmit(data as Omit<CreatePgrDto, "estado">, "EN_REVISION"),
            )}
            sx={{
              borderRadius: 4,
              textTransform: "none",
              px: 4,
              backgroundColor: "#0A1929",
            }}
          >
            Enviar a Aprobación
          </Button>
        </Box>
      </form>
    </Box>
  );
}

export default function PgrConfiguration() {
  return (
    <Suspense fallback={<Box p={4}>Cargando...</Box>}>
      <PgrConfigurationContent />
    </Suspense>
  );
}
