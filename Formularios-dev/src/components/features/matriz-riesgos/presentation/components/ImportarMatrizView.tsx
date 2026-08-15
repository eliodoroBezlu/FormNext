"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  CircularProgress,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import {
  ArrowBack,
  CheckCircle,
  CloudUpload,
  Save,
  UploadFile,
} from "@mui/icons-material";
import { useImportarMatriz } from "../../application/hooks/useImportarMatriz";
import { ResumenAnalisis } from "./ResumenAnalisis";
import { TablaRiesgosAnalizados } from "./TablaRiesgosAnalizados";

const PASOS = ["Seleccionar archivo", "Revisar diferencias", "Importada"];

export function ImportarMatrizView() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [tab, setTab] = useState(0);

  const {
    paso,
    archivo,
    analisis,
    guardada,
    areaCodigo,
    setAreaCodigo,
    anio,
    setAnio,
    nuevaVersion,
    setNuevaVersion,
    cargando,
    error,
    impedimentos,
    puedeConfirmar,
    analizar,
    confirmar,
    reiniciar,
    volverAArchivo,
  } = useImportarMatriz();

  const indicePaso = paso === "archivo" ? 0 : paso === "revision" ? 1 : 2;
  const candidatas = analisis?.areasCandidatas ?? [];

  return (
    <Box>
      <Stepper activeStep={indicePaso} sx={{ mb: 3 }}>
        {PASOS.map((p) => (
          <Step key={p}>
            <StepLabel>{p}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* ── Paso 1: archivo ─────────────────────────────────────────────── */}
      {paso === "archivo" && (
        <Paper
          variant="outlined"
          sx={{ p: 6, textAlign: "center", borderStyle: "dashed" }}
        >
          <CloudUpload sx={{ fontSize: 56, color: "text.disabled", mb: 1 }} />
          <Typography variant="h6" gutterBottom>
            Subí la matriz de riesgos
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Formulario 1.02.P06.F01 en Excel. El archivo no se guarda todavía:
            primero vas a ver qué leyó el sistema y si los cálculos coinciden.
          </Typography>

          <input
            ref={inputRef}
            type="file"
            accept=".xlsx,.xls"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void analizar(f);
            }}
          />
          <Button
            variant="contained"
            size="large"
            startIcon={cargando ? <CircularProgress size={18} /> : <UploadFile />}
            onClick={() => inputRef.current?.click()}
            disabled={cargando}
          >
            {cargando ? "Analizando…" : "Elegir archivo"}
          </Button>
        </Paper>
      )}

      {/* ── Paso 2: revisión ────────────────────────────────────────────── */}
      {paso === "revision" && analisis && (
        <Stack spacing={2}>
          <ResumenAnalisis analisis={analisis} />

          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle2" gutterBottom>
                ¿A qué área pertenece esta matriz?
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                El archivo dice <strong>{analisis.cabecera.area || "—"}</strong>.
                Los nombres del maestro no siempre coinciden literalmente, así
                que conviene confirmarlo: de esta área sale la superintendencia,
                y de ella depende a qué PGR se consolidará después.
              </Typography>

              <FormControl fullWidth size="small" sx={{ maxWidth: 560 }}>
                <InputLabel>Área del maestro</InputLabel>
                <Select
                  label="Área del maestro"
                  value={areaCodigo}
                  onChange={(e) => setAreaCodigo(e.target.value)}
                >
                  {candidatas.length === 0 && (
                    <MenuItem value="" disabled>
                      No se encontraron áreas compatibles
                    </MenuItem>
                  )}
                  {candidatas.map((c) => (
                    <MenuItem key={c.codigo ?? c.nombre} value={c.codigo ?? ""}>
                      <Box>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="body2">
                            {c.codigo ? `[${c.codigo}] ` : ""}
                            {c.nombre}
                          </Typography>
                          <Chip
                            size="small"
                            label={c.coincidencia}
                            color={
                              c.coincidencia === "exacta" ? "success" : "default"
                            }
                            variant="outlined"
                          />
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          {c.superintendencia}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Box mt={2}>
                <Typography variant="subtitle2" gutterBottom>
                  ¿De qué año es?
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 1.5 }}
                >
                  {analisis.cabecera.anio
                    ? "Se dedujo del archivo. Corregilo si no es el correcto."
                    : "El archivo no lo trae: hay que indicarlo. Junto con el área forma el código de la matriz."}
                </Typography>
                <TextField
                  label="Año"
                  type="number"
                  size="small"
                  value={anio}
                  onChange={(e) => setAnio(e.target.value)}
                  slotProps={{ htmlInput: { min: 2000, max: 2100 } }}
                  sx={{ width: 160 }}
                />
              </Box>

              <FormControlLabel
                sx={{ mt: 1.5, display: "block" }}
                control={
                  <Checkbox
                    checked={nuevaVersion}
                    onChange={(e) => setNuevaVersion(e.target.checked)}
                  />
                }
                label="Crear una versión nueva si ya existe una matriz para esta área y año"
              />
            </CardContent>
          </Card>

          <Box>
            <Tabs value={tab} onChange={(_, v: number) => setTab(v)}>
              <Tab label={`Todos los riesgos (${analisis.riesgos.length})`} />
              <Tab
                label={`Solo diferencias (${analisis.resumen.riesgosConDiscrepancias})`}
              />
            </Tabs>
            <Box mt={1.5}>
              <TablaRiesgosAnalizados
                riesgos={analisis.riesgos}
                soloConDiscrepancias={tab === 1}
              />
            </Box>
          </Box>

          {impedimentos.length > 0 && (
            <Alert severity="info">
              <AlertTitle>Todavía no se puede importar</AlertTitle>
              <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
                {impedimentos.map((m, i) => (
                  <li key={i}>
                    <Typography variant="body2">{m}</Typography>
                  </li>
                ))}
              </Box>
            </Alert>
          )}

          <Stack direction="row" spacing={1.5} justifyContent="flex-end">
            <Button
              startIcon={<ArrowBack />}
              onClick={volverAArchivo}
              disabled={cargando}
            >
              Cambiar archivo
            </Button>
            <Button
              variant="contained"
              startIcon={cargando ? <CircularProgress size={18} /> : <Save />}
              onClick={() => void confirmar()}
              disabled={!puedeConfirmar || cargando}
            >
              {cargando ? "Importando…" : "Importar matriz"}
            </Button>
          </Stack>
        </Stack>
      )}

      {/* ── Paso 3: listo ───────────────────────────────────────────────── */}
      {paso === "listo" && guardada && (
        <Stack spacing={2}>
          <Alert severity="success" icon={<CheckCircle />}>
            <AlertTitle>Matriz {guardada.codigo} importada</AlertTitle>
            {guardada.riesgosImportados} riesgos y{" "}
            {guardada.controlesImportados} controles. Quedó en{" "}
            <strong>borrador</strong>: hay que revisarla y aprobarla antes de
            poder consolidarla en el PGR.
          </Alert>

          {guardada.requierenPgr > 0 && (
            <Alert severity="warning">
              <strong>{guardada.requierenPgr}</strong> riesgos quedaron en nivel
              SUSTANCIAL o INACEPTABLE y van a generar actividades en el PGR de
              la superintendencia.
            </Alert>
          )}

          {guardada.advertencias.length > 0 && (
            <Alert severity="info">
              <AlertTitle>Advertencias</AlertTitle>
              <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
                {guardada.advertencias.map((a, i) => (
                  <li key={i}>
                    <Typography variant="body2">{a}</Typography>
                  </li>
                ))}
              </Box>
            </Alert>
          )}

          <Stack direction="row" spacing={1.5} justifyContent="flex-end">
            <Button onClick={reiniciar}>Importar otra</Button>
            <Button
              variant="contained"
              onClick={() =>
                router.push(`/dashboard/matriz-riesgos/${guardada.matrizId}`)
              }
            >
              Ver la matriz
            </Button>
          </Stack>
        </Stack>
      )}

      {archivo && paso !== "listo" && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: "block" }}>
          Archivo: {archivo.name}
        </Typography>
      )}
    </Box>
  );
}
