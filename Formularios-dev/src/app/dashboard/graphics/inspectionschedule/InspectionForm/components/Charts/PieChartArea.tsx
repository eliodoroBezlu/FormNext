import { Box, Typography } from "@mui/material";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  Legend,
} from "recharts";
import { Formulario } from "../../types/Iprops";
import { generarDatosGrafica } from "../../utils/InspectionForm.utils";

interface PieChartInstanciasProps {
  formulario: Formulario | null | undefined;
}

interface PieDataItem {
  name: string;
  value: number;
  desc: string;
  primerSemestre: number;
  segundoSemestre: number;
  [key: string]: string | number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: PieDataItem;
    name: string;
    value: number;
    dataKey: string;
    color: string;
  }>;
}

export const PieChartInstancias = ({ formulario }: PieChartInstanciasProps) => {
  if (!formulario) {
    return (
      <Box
        sx={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography variant="caption" color="text.secondary">
          Sin datos
        </Typography>
      </Box>
    );
  }

  const datosGrafica = generarDatosGrafica(formulario);
  const tieneInstancias = formulario.totalInstancias > 0;

  if (
    !tieneInstancias ||
    !Array.isArray(datosGrafica) ||
    datosGrafica.length === 0
  ) {
    return (
      <Box
        sx={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
        }}
      >
        <Typography variant="caption" color="text.secondary">
          Sin instancias
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {formulario.totalInstancias || 0} total
        </Typography>
      </Box>
    );
  }

  const procesarDatosTorta = (): PieDataItem[] => {
    return datosGrafica
      .map((areaData) => {
        const totalInstanciasArea =
          areaData.primerSemestre + areaData.segundoSemestre;
        return {
          name: areaData.area,
          value: totalInstanciasArea,
          desc: `${totalInstanciasArea} instancia${totalInstanciasArea > 1 ? "s" : ""}`,
          primerSemestre: areaData.primerSemestre,
          segundoSemestre: areaData.segundoSemestre,
        };
      })
      .filter((item) => item.value > 0);
  };

  const datosTorta = procesarDatosTorta();

  if (datosTorta.length === 0) {
    return (
      <Box
        sx={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography variant="caption" color="text.secondary">
          Sin datos
        </Typography>
      </Box>
    );
  }

  const COLORS = [
    "#1f77b4",
    "#ff7f0e",
    "#2ca02c",
    "#d62728",
    "#9467bd",
    "#8c564b",
    "#e377c2",
    "#7f7f7f",
    "#bcbd22",
    "#17becf",
  ];

  const totalInstancias = datosTorta.reduce((sum, item) => sum + item.value, 0);

  const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
    if (active && payload && payload.length > 0) {
      const data = payload[0].payload;
      const porcentaje = ((data.value / totalInstancias) * 100).toFixed(1);

      return (
        <Box
          sx={{
            backgroundColor: "background.paper",
            padding: 0.5,
            border: 1,
            borderColor: "divider",
            borderRadius: 0.5,
            fontSize: "0.7rem",
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
            {data.name}
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {data.value} inst. ({porcentaje}%)
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: "text.secondary", fontSize: "0.6rem" }}
          >
            Ene-Jun: {data.primerSemestre} | Jul-Dic: {data.segundoSemestre}
          </Typography>
        </Box>
      );
    }
    return null;
  };

  return (
    <Box
      sx={{
        width: "100%",
        height: "190px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Typography
        variant="caption"
        align="center"
        sx={{
          paddingBottom: "5px",
          fontWeight: "bold",
          lineHeight: 1,
        }}
      >
        Por Área
      </Typography>

      <Box sx={{ flex: 1, minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={datosTorta}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ percent }) =>
                percent && percent > 0.08
                  ? `${(percent * 100).toFixed(0)}%`
                  : ""
              }
              outerRadius={40}
              innerRadius={0}
              dataKey="value"
              paddingAngle={1}
            >
              {datosTorta.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                  stroke="#fff"
                  strokeWidth={0.5}
                />
              ))}
            </Pie>
            <RechartsTooltip content={<CustomTooltip />} />
            {datosTorta.length <= 3 && (
              <Legend
                wrapperStyle={{
                  fontSize: "0.55rem",
                  paddingTop: "2px",
                }}
                iconSize={6}
                layout="horizontal"
                verticalAlign="bottom"
              />
            )}
          </PieChart>
        </ResponsiveContainer>
      </Box>

      <Typography
        variant="caption"
        color="text.secondary"
        align="center"
        sx={{
          mt: 0.3,
          fontSize: "0.55rem",
          lineHeight: 1,
        }}
      >
        {totalInstancias} inspecciones • {datosTorta.length} áreas
      </Typography>
    </Box>
  );
};
