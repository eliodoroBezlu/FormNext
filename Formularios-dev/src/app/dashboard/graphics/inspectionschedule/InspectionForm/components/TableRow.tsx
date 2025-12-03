import {
  TableRow as MuiTableRow,
  TableCell,
  Typography,
  Chip,
  Button,
  Box,
  Card,
  CardContent,
  Tooltip,
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

interface TableRowProps {
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
        onProgramarClick={
          (formulario, instancia) =>
            onProgramarDirecta(formulario, instancia, false, area)
        }
        esSegundoSemestre={false}
        area={area}
      />

      <ListaInstanciasItem
        instancia={instanciaSegundoSemestre || null}
        formulario={formulario}
        onProgramarClick={
          (formulario, instancia) =>
            onProgramarDirecta(formulario, instancia, true, area)
        }
        esSegundoSemestre={true}
        area={area}
      />
    </Box>
  );
};

export const TableRow = ({
  formulario,
  onAbrirInstancias,
  onAbrirProgramaciones,
  onAbrirProgramacionArea,
  onProgramarDirecta,
}: TableRowProps) => {
  const areasUnicas = obtenerAreasUnicas(formulario);
  const tieneInstanciasFlag = tieneInstancias(formulario);

  return (
    <MuiTableRow sx={{ height: "200px" }}>
      <TableCell>
        <Typography
          sx={{ fontSize: ".6rem" }}
          component="div"
          fontWeight="medium"
        >
          {formulario.nombreFormulario}
        </Typography>
        <Typography variant="caption" component="div" color="text.secondary">
          Año: {formulario.año}
        </Typography>

        <Tooltip title="Ver todas las instancias">
          <Chip
            label={`${formulario.totalInstancias} Inspecciones`}
            color={formulario.totalInstancias > 0 ? "primary" : "default"}
            size="small"
            sx={{
              mt: 1,
              cursor: formulario.totalInstancias > 0 ? "pointer" : "default",
            }}
            onClick={
              formulario.totalInstancias > 0
                ? () => onAbrirInstancias(formulario)
                : undefined
            }
            clickable={formulario.totalInstancias > 0}
          />
        </Tooltip>

        {areasUnicas.length > 0 && (
          <Box sx={{ mt: 1 }}>
            <Typography
              variant="caption"
              component="div"
              color="text.secondary"
              sx={{ mb: 0.5 }}
            >
              Programación Áreas
            </Typography>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 0.5,
                maxHeight: "100px",
                overflowY: "auto",
              }}
            >
              {areasUnicas.map((area) => (
                <Button
                  key={area}
                  size="small"
                  variant="outlined"
                  onClick={() => onAbrirProgramacionArea(formulario, area)}
                  color="secondary"
                  sx={{
                    fontSize: "0.6rem",
                    py: 0.2,
                    justifyContent: "flex-start",
                    textTransform: "none",
                  }}
                  startIcon={<CalendarMonth sx={{ fontSize: "0.8rem" }} />}
                >
                  {truncarTexto(area, 15)}
                </Button>
              ))}
            </Box>
          </Box>
        )}

        <Box sx={{ mt: 1 }}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<CalendarMonth />}
            onClick={() => onAbrirProgramaciones(formulario)}
            color="primary"
            sx={{ fontSize: "0.7rem" }}
          >
            Todas las Programaciones
          </Button>
        </Box>
      </TableCell>

      <TableCell align="center">
        {tieneInstanciasFlag ? (
          <Card variant="outlined" sx={{ maxHeight: 180, overflow: "auto" }}>
            <CardContent sx={{ p: 1 }}>
              <Typography
                variant="caption"
                component="div"
                fontWeight="bold"
                color="text.secondary"
              >
                INSTANCIAS POR SEMESTRE:
              </Typography>
              <Box sx={{ py: 0 }}>
                {areasUnicas.slice(0, 3).map((area) => (
                  <AreaSemestres
                    key={area}
                    area={area}
                    formulario={formulario}
                    onProgramarDirecta={onProgramarDirecta}
                  />
                ))}
              </Box>
              {areasUnicas.length > 3 && (
                <Typography
                  variant="caption"
                  component="div"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  +{areasUnicas.length - 3} áreas más...
                </Typography>
              )}
            </CardContent>
          </Card>
        ) : (
          <Typography variant="caption" component="div" color="text.secondary">
            Sin instancias
          </Typography>
        )}
      </TableCell>

      <TableCell align="center" sx={{ width: "35%" }}>
        <Box
          sx={{
            width: "100%",
            height: 180,
            minWidth: 200,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <BarChartArea formulario={formulario} />
        </Box>
      </TableCell>

      <TableCell align="center" sx={{ width: "800px", height: "350px" }}>
        <Box sx={{ width: "300px", height: "100px" }}>
          <PieChartInstancias formulario={formulario} />
        </Box>
      </TableCell>
    </MuiTableRow>
  );
};