import {
  Typography,
  Chip,
  Button,
  Box,
  Card,
  CardContent,
  Tooltip,
  Grid,
} from "@mui/material";
import { CalendarMonth } from "@mui/icons-material";
import { Formulario } from "../types/Iprops";
import {
  obtenerAreasUnicas,
  tieneInstancias,
  truncarTexto,
  obtenerArea,
  obtenerFechaInspeccion,
} from "../utils/InspectionForm.utils";
import { ListaInstanciasItem } from "./ListItems/ListaInstanciasItem";
import { BarChartArea } from "./Charts/BarChartArea";
import { PieChartInstancias } from "./Charts/PieChartArea";

interface TableRowMobileProps {
  formulario: Formulario;
  onAbrirInstancias: (formulario: Formulario) => void;
  onAbrirProgramaciones: (formulario: Formulario) => void;
  onAbrirProgramacionArea: (formulario: Formulario, area: string) => void;
  onProgramarDirecta: (
    formulario: Formulario,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    instancia: any,
    esSegundoSemestre: boolean,
    area?: string
  ) => void;
}

const esPrimerSemestre = (fecha: string) => {
  const mes = new Date(fecha).getMonth() + 1;
  return mes >= 1 && mes <= 6;
};

const AreaSemestres = ({
  area,
  formulario,
  onProgramarDirecta,
}: {
  area: string;
  formulario: Formulario;
  onProgramarDirecta: (
    formulario: Formulario,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    instancia: any,
    esSegundoSemestre: boolean,
    area: string
  ) => void;
}) => {
  const instanciasArea = formulario.instancias.filter(
    (inst) => obtenerArea(inst) === area
  );

  const instanciaPrimerSemestre = instanciasArea.find((inst) =>
    esPrimerSemestre(obtenerFechaInspeccion(inst))
  );

  const instanciaSegundoSemestre = instanciasArea.find(
    (inst) => !esPrimerSemestre(obtenerFechaInspeccion(inst))
  );

  return (
    <Box display="flex" sx={{ mb: 1, gap: 0.5 }}>
      <ListaInstanciasItem
        instancia={instanciaPrimerSemestre || null}
        formulario={formulario}
        onProgramarClick={(formulario, instancia) =>
          onProgramarDirecta(formulario, instancia, false, area)
        }
        esSegundoSemestre={false}
        area={area}
      />

      <ListaInstanciasItem
        instancia={instanciaSegundoSemestre || null}
        formulario={formulario}
        onProgramarClick={(formulario, instancia) =>
          onProgramarDirecta(formulario, instancia, true, area)
        }
        esSegundoSemestre={true}
        area={area}
      />
    </Box>
  );
};

export const TableRowMobile = ({
  formulario,
  onAbrirInstancias,
  onAbrirProgramaciones,
  onAbrirProgramacionArea,
  onProgramarDirecta,
}: TableRowMobileProps) => {
  const areasUnicas = obtenerAreasUnicas(formulario);
  const tieneInstanciasFlag = tieneInstancias(formulario);

  return (
    <Card sx={{ mb: 2, border: "1px solid #e0e0e0", borderRadius: 2 }}>
      <CardContent sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" component="div" fontWeight="bold" sx={{ fontSize: '1rem' }}>
              {formulario.nombreFormulario}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Año: {formulario.año}
            </Typography>
          </Box>
          
          <Tooltip title="Ver todas las instancias">
            <Chip
              label={`${formulario.totalInstancias} instancias`}
              color={formulario.totalInstancias > 0 ? "primary" : "default"}
              size="small"
              sx={{ ml: 1 }}
              onClick={
                formulario.totalInstancias > 0
                  ? () => onAbrirInstancias(formulario)
                  : undefined
              }
              clickable={formulario.totalInstancias > 0}
            />
          </Tooltip>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Button
            fullWidth
            variant="contained"
            startIcon={<CalendarMonth />}
            onClick={() => onAbrirProgramaciones(formulario)}
            color="primary"
            sx={{ mb: 1 }}
          >
            Todas las Programaciones
          </Button>

          {areasUnicas.length > 0 && (
            <Box>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                Programación por Áreas:
              </Typography>
              <Grid container spacing={1}>
                {areasUnicas.slice(0, 4).map((area) => (
                  <Grid size={{xs:6}} key={area}>
                    <Button
                      fullWidth
                      size="small"
                      variant="outlined"
                      onClick={() => onAbrirProgramacionArea(formulario, area)}
                      color="secondary"
                      sx={{ 
                        fontSize: "0.7rem",
                        textTransform: "none",
                        height: '32px'
                      }}
                      startIcon={<CalendarMonth sx={{ fontSize: "0.8rem" }} />}
                    >
                      {truncarTexto(area, 12)}
                    </Button>
                  </Grid>
                ))}
              </Grid>
              {areasUnicas.length > 4 && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  +{areasUnicas.length - 4} áreas más...
                </Typography>
              )}
            </Box>
          )}
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" component="div" fontWeight="bold" sx={{ mb: 1 }}>
            Instancias por Semestre
          </Typography>
          {tieneInstanciasFlag ? (
            <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
              {areasUnicas.slice(0, 2).map((area) => (
                <Box key={area} sx={{ mb: 1.5 }}>
                  <Typography variant="body2" color="primary" sx={{ mb: 0.5, fontWeight: 'medium' }}>
                    {area}
                  </Typography>
                  <AreaSemestres
                    area={area}
                    formulario={formulario}
                    onProgramarDirecta={onProgramarDirecta}
                  />
                </Box>
              ))}
              {areasUnicas.length > 2 && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', textAlign: 'center' }}>
                  +{areasUnicas.length - 2} áreas más...
                </Typography>
              )}
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ py: 1 }}>
              Sin instancias
            </Typography>
          )}
        </Box>

        <Box>
          <Typography variant="subtitle1" component="div" fontWeight="bold" sx={{ mb: 1 }}>
            Estadísticas
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{xs:12, sm:6}}>
              <Card variant="outlined" sx={{ p: 1 }}>
                <Typography variant="caption" component="div" textAlign="center" sx={{ mb: 0.5 }}>
                  Distribución por Área
                </Typography>
                <Box sx={{ width: "50%" }}>
                  <BarChartArea formulario={formulario} />
                </Box>
              </Card>
            </Grid>
            <Grid size={{xs:12, sm:6}}>
              <Card variant="outlined" sx={{ p: 1 }}>
                <Typography variant="caption" component="div" textAlign="center" sx={{ mb: 0.5 }}>
                  Instancias por Semestre
                </Typography>
                <Box sx={{ height: 150 }}>
                  <PieChartInstancias formulario={formulario} />
                </Box>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </CardContent>
    </Card>
  );
};