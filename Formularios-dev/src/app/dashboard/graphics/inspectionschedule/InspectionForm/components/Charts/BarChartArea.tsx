import { Box, Typography } from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Formulario } from "../../types/Iprops";
import { generarDatosGrafica } from "../../utils/InspectionForm.utils";

interface BarChartAreaProps {
  formulario: Formulario;
}

export const BarChartArea = ({ formulario }: BarChartAreaProps) => {
  if (!formulario || typeof formulario !== 'object') {
    return (
      <Typography variant="caption" component="div" color="error">
        Datos inválidos
      </Typography>
    );
  }

  const datosGrafica = generarDatosGrafica(formulario);
  const tieneInstancias = formulario.totalInstancias > 0;

  if (!Array.isArray(datosGrafica)) {
    return (
      <Typography variant="caption" component="div" color="error">
        Error en datos de gráfica
      </Typography>
    );
  }

  if (!tieneInstancias || datosGrafica.length === 0) {
    return (
      <Typography variant="caption" component="div" color="text.secondary">
        Sin datos para gráfica
      </Typography>
    );
  }

  const datosValidos = datosGrafica.every(item => 
    item && 
    typeof item === 'object' && 
    'area' in item &&
    'primerSemestre' in item &&
    'segundoSemestre' in item
  );

  if (!datosValidos) {
    return (
      <Typography variant="caption" component="div" color="error">
        Estructura de datos incorrecta
      </Typography>
    );
  }

  const datosConCumplimiento = datosGrafica.map(item => {
    const total = item.primerSemestre + item.segundoSemestre;
    const porcentajePrimer = total > 0 ? (item.primerSemestre / total) * 100 : 0;
    const porcentajeSegundo = total > 0 ? (item.segundoSemestre / total) * 100 : 0;
    const cumplimiento = (porcentajePrimer + porcentajeSegundo) / 2;

    return {
      ...item,
      porcentajePrimer: Math.round(porcentajePrimer),
      porcentajeSegundo: Math.round(porcentajeSegundo),
      cumplimiento: Math.round(cumplimiento)
    };
  });

  const COLORS = {
    primerSemestre: "#1f77b4",
    segundoSemestre: "#ff7f0e",
    cumplimiento: "#2ca02c"
  };

  return (
    <Box sx={{ width: "400px", height: "400px", paddingRight:"50px"}}>
      <ResponsiveContainer width="100%" height="90%" >
        <BarChart
          data={datosConCumplimiento}
          layout="vertical"
          barGap={2}
          barCategoryGap={15}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
          <XAxis 
            type="number"
            domain={[0, 100]}
            tickFormatter={(value) => `${value}%`}
            tick={{ fontSize: 12, fontWeight: 'bold' }}
          />
          <YAxis 
            type="category"
            dataKey="area"
            tick={{ fontSize: 10, fontWeight: 'bold' }}
            width={200}
            interval={0}
          />
          <RechartsTooltip
            formatter={(value, name) => {
              const formattedValue = typeof value === 'number' ? `${value}%` : value;
              let label = '';
              switch(name) {
                case "porcentajePrimer":
                  label = "Ene-Jun";
                  break;
                case "porcentajeSegundo":
                  label = "Jul-Dic";
                  break;
                case "cumplimiento":
                  label = "Cumplimiento Total";
                  break;
                default:
                  label = name.toString();
              }
              return [formattedValue, label];
            }}
            labelFormatter={(label) => `Área: ${label}`}
          />
          <Legend 
            formatter={(value) => {
              switch(value) {
                case "porcentajePrimer":
                  return "Ene-Jun";
                case "porcentajeSegundo":
                  return "Jul-Dic";
                case "cumplimiento":
                  return "Cumplimiento Total";
                default:
                  return value;
              }
            }}
          />
          
          <Bar
            dataKey="porcentajePrimer"
            name="porcentajePrimer"
            fill={COLORS.primerSemestre}
            barSize={10}
          >
            {datosConCumplimiento.map((entry, index) => (
              <Cell key={`cell-primer-${index}`} fill={COLORS.primerSemestre} />
            ))}
          </Bar>
          
          <Bar
            dataKey="porcentajeSegundo"
            name="porcentajeSegundo"
            fill={COLORS.segundoSemestre}
            barSize={10}
          >
            {datosConCumplimiento.map((entry, index) => (
              <Cell key={`cell-segundo-${index}`} fill={COLORS.segundoSemestre} />
            ))}
          </Bar>
          
          <Bar
            dataKey="cumplimiento"
            name="cumplimiento"
            fill={COLORS.cumplimiento}
            barSize={10}
          >
            {datosConCumplimiento.map((entry, index) => (
              <Cell 
                key={`cell-cumplimiento-${index}`} 
                fill={COLORS.cumplimiento}
                strokeWidth={1}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <Typography variant="caption" component="div"  align="center" sx={{ mt: 1 }}>
        Total: {formulario.totalInstancias} inspecciones | Gráfica en porcentajes
      </Typography>
    </Box>
  );
};