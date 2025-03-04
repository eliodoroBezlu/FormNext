import type React from "react";
import { Typography, Box } from "@mui/material";
import type { FormData } from "../types/formTypes";
import Grid from "@mui/material/Grid2";

interface InspeccionPdfContentProps {
  inspeccion: FormData;
}

export const InspeccionPdfContent: React.FC<InspeccionPdfContentProps> = ({
  inspeccion,
}) => {
  const renderFirma = (firma: string) => {
    if (!firma) return null;

    return (
      <Box>
        <Box>
          <img
            src={firma || "/placeholder.svg"}
            style={{
              width: "100%",
              height: "1.7rem",
            }}
            onError={(e) => {
              console.error(`Error al cargar la firma: `);
              const target = e.target as HTMLImageElement;
              target.style.display = "none";
            }}
          />
        </Box>
      </Box>
    );
  };

  return (
    <Box id="pdf-content" className="pdf-container">
      <Grid container sx={{ width: "100%" }}>
        <Grid
          size={{ xs: 2, sm: 3, md: 2 }}
          sx={{
            border: "0.125rem solid #000",
            height: "2rem",
          }}
        >
          <img
            src="/MSC.png"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
            }}
          />
        </Grid>
        <Grid
          size={{ xs: 8, sm: 6, md: 8 }}
          sx={{
            borderTop: "0.125rem solid #000",
            borderBottom: "0.125rem solid",
            justifyContent: "center",
            alignItems: "center",
            display: "flex",
            height: "2rem",
          }}
        >
          <Typography
            variant="h6"
            align="center"
            sx={{
              textTransform: "uppercase",
              fontSize: "0.6rem",
              fontWeight: "bold",
            }}
          >
            Lista de Chequeo - Arnés y Conectores <br />
            Sistema de Protección personal contra caidas
          </Typography>
        </Grid>
        <Grid
          size={{ xs: 2, sm: 3, md: 2 }}
          sx={{
            border: "0.125rem solid #000",
            height: "2rem",
          }}
        >
          <Typography align="center" sx={{ fontSize: "0.3rem" }}>
            {inspeccion.documentCode} <br />
            Revisión: {inspeccion.revisionNumber}
          </Typography>
          <Typography
            align="center"
            sx={{
              textTransform: "uppercase",
              borderTop: "0.125rem solid black",
              fontSize: "0.5rem",
              fontWeight: "bold",
              backgroundColor: "#B0B0B0",
              color: "white",
            }}
          >
            interna
          </Typography>
        </Grid>
      </Grid>
      <Grid container spacing={2} marginTop={"0.2rem"}>
        <Grid direction={"row"} sx={{ width: "100%" }} container spacing={0}>
          <Grid
            size={{ xs: 5 }}
            sx={{
              border: "0.125rem solid #000",
            }}
          >
            <Box display="flex" alignItems="center">
              <Typography
                sx={{
                  fontWeight: "bold",
                  textTransform: "uppercase",
                  fontSize: "0.5rem",
                  borderRight: "0.125rem solid #000",
                  paddingRight: "2.25rem",

                  background: "#86b5da ",
                }}
                marginRight={"0.625rem"}
              >
                superintendencia:&nbsp;
              </Typography>
              <Typography sx={{ fontSize: "0.5rem" }}>
                {inspeccion.informacionGeneral.superintendencia}
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 7 }} container spacing={0}>
            <Grid
              size={{ xs: 6 }}
              sx={{
                borderTop: "0.125rem solid #000",
                borderBottom: "0.125rem solid",
              }}
            >
              <Box display="flex" alignItems="center">
                <Typography
                  sx={{
                    fontWeight: "bold",
                    textTransform: "uppercase",
                    fontSize: "0.5rem",
                    display: "inline",
                    borderRight: "0.125rem solid #000",
                    paddingRight: "2.25rem",

                    background: "#86b5da ",
                  }}
                >
                  ÁREA/SECCIÓN:&nbsp;
                </Typography>

                <Typography sx={{ fontSize: "0.5rem", display: "inline" }}>
                  {inspeccion.informacionGeneral.area}
                </Typography>
              </Box>
            </Grid>

            <Grid
              size={{ xs: 6 }}
              sx={{
                border: "0.125rem solid #000",
              }}
            >
              <Box display="flex" alignItems="center">
                <Typography
                  sx={{
                    fontWeight: "bold",
                    fontSize: "0.5rem",
                    display: "inline",
                    borderRight: "0.125rem solid #000",
                    paddingRight: "0.25rem",
                    background: "#86b5da ",
                  }}
                >
                  Nombre Trabajador:&nbsp;
                </Typography>

                <Typography sx={{ fontSize: "0.5rem", display: "inline" }}>
                  {inspeccion.informacionGeneral.trabajador}
                </Typography>
              </Box>
            </Grid>
          </Grid>
          <Grid
            size={{ xs: 5 }}
            sx={{
              borderLeft: "0.125rem solid #000",
              borderRight: "0.125rem solid #000",
            }}
          >
            <Box display="flex" alignItems="center" sx={{ height: "100%" }}>
              <Typography
                sx={{
                  fontWeight: "bold",
                  textTransform: "uppercase",
                  fontSize: "0.5rem",
                  borderRight: "0.125rem solid #000",
                  paddingRight: "5.688rem",
                  height: "100%",

                  background: "#86b5da ",
                }}
                marginRight={"0.625rem"}
              >
                fecha:&nbsp;
              </Typography>

              <Typography sx={{ fontSize: "0.5rem" }}>
                {inspeccion.informacionGeneral.fecha
                  ? new Date(
                      inspeccion.informacionGeneral.fecha
                    ).toLocaleDateString()
                  : "Fecha no disponible"}
              </Typography>
            </Box>
          </Grid>

          <Grid size={{ xs: 7 }} container>
            <Grid size={{ xs: 6 }}>
              <Box display="flex" alignItems="center">
                <Typography
                  sx={{
                    fontWeight: "bold",
                    textTransform: "uppercase",
                    fontSize: "0.5rem",
                    display: "inline",
                    borderRight: "0.125rem solid #000",
                    paddingRight: "2.25rem",

                    background: "#86b5da ",
                  }}
                >
                  n° inspección:&nbsp;
                </Typography>
                <Typography sx={{ fontSize: "0.5rem", display: "inline" }}>
                  {inspeccion.informacionGeneral.numInspeccion}
                </Typography>
              </Box>
            </Grid>

            <Grid
              size={{ xs: 6 }}
              sx={{
                borderLeft: "0.125rem solid #000",
                borderRight: "0.125rem solid #000",
              }}
            >
              <Box display="flex" alignItems="center">
                <Typography
                  sx={{
                    fontWeight: "bold",
                    //textTransform: "uppercase",
                    fontSize: "0.5rem",
                    display: "inline",

                    borderRight: "0.125rem solid #000",
                    paddingRight: "0.2rem",
                    background: "#86b5da ",
                  }}
                >
                  Nombre Supervisor:&nbsp;
                </Typography>
                <Typography sx={{ fontSize: "0.5rem", display: "inline" }}>
                  {inspeccion.informacionGeneral.supervisor}
                </Typography>
              </Box>
            </Grid>
          </Grid>

          <Grid
            size={{ xs: 5 }}
            sx={{
              border: "0.125rem solid #000",
            }}
          >
            <Box display="flex" alignItems="center">
              <Typography
                sx={{
                  fontWeight: "bold",
                  textTransform: "uppercase",
                  fontSize: "0.5rem",
                  borderRight: "0.125rem solid #000",
                  paddingRight: "3.438rem",

                  background: "#86b5da ",
                }}
                marginRight={"0.625rem"}
              >
                cod. de arnés:&nbsp;
              </Typography>
              <Typography sx={{ fontSize: "0.5rem", display: "inline" }}>
                {inspeccion.informacionGeneral.codArnes}
              </Typography>
            </Box>
          </Grid>

          <Grid size={{ xs: 7 }} container>
            <Grid
              size={{ xs: 6 }}
              sx={{
                borderTop: "0.125rem solid #000",
                borderBottom: "0.125rem solid #000",
              }}
            >
              <Box display="flex" alignItems="center">
                <Typography
                  sx={{
                    fontWeight: "bold",
                    textTransform: "uppercase",
                    fontSize: "0.5rem",
                    display: "inline",

                    borderRight: "0.125rem solid #000",
                    paddingRight: "1.813rem",

                    background: "#86b5da ",
                  }}
                >
                  cod. conector:&nbsp;
                </Typography>
                <Typography sx={{ fontSize: "0.5rem", display: "inline" }}>
                  {inspeccion.informacionGeneral.codConector}
                </Typography>
              </Box>
            </Grid>

            <Grid
              size={{ xs: 6 }}
              sx={{
                border: "0.125rem solid #000",
              }}
            >
              <Box display="flex" alignItems="center">
                <Typography
                  sx={{
                    fontWeight: "bold",
                    textTransform: "uppercase",
                    fontSize: "0.5rem",
                    display: "inline",
                  }}
                ></Typography>
                <Typography
                  sx={{ fontSize: "0.5rem", display: "inline" }}
                ></Typography>
              </Box>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <Grid>
        {/* Header */}
        <Grid container>
          <Grid
            size={{ xs: 1 }}
            sx={{
              borderWidth: "0rem 0.125rem 0.125rem 0.125rem",
              borderStyle: "solid",
              width: "1.25rem",
              padding: "0.063rem",
              height: "1rem",
              backgroundColor: "#B0B0B0",
            }}
          >
            <Typography
              align="center"
              sx={{ fontSize: "0.5rem", textAlign: "center" }}
            >
              N°
            </Typography>
          </Grid>
          <Grid
            size={{ xs: 6 }}
            sx={{
              borderWidth: "0rem 0rem 0.125rem 0rem",
              borderStyle: "solid",
              padding: "0.063rem",
              width: "25rem",
              height: "1rem",
              backgroundColor: "#B0B0B0",
            }}
          >
            <Typography
              align="left"
              sx={{
                fontSize: "0.5rem",
                textAlign: "center",
                fontWeight: "bold",
              }}
            >
              ITEM
            </Typography>
          </Grid>
          <Grid
            size={{ xs: 1 }}
            sx={{
              borderWidth: "0rem 0.125rem 0.125rem 0.125rem",
              borderStyle: "solid",
              width: "2.438rem",
              height: "1rem",
              backgroundColor: "#B0B0B0",
            }}
          >
            <Typography
              align="center"
              sx={{
                fontSize: "0.5rem",
                textAlign: "center",
                fontWeight: "bold",
              }}
            >
              SI
            </Typography>
          </Grid>
          <Grid
            size={{ xs: 1 }}
            sx={{
              borderWidth: "0rem 0.125rem 0.125rem 0rem",
              borderStyle: "solid",
              width: "2.438rem",
              height: "1rem",
              backgroundColor: "#B0B0B0",
            }}
          >
            <Typography
              align="center"
              sx={{
                fontSize: "0.5rem",
                textAlign: "center",
                fontWeight: "bold",
              }}
            >
              NO
            </Typography>
          </Grid>
          <Grid
            size={{ xs: 1 }}
            sx={{
              borderWidth: "0rem 0.125rem 0.125rem 0rem",
              borderStyle: "solid",
              width: "2.438rem",
              height: "1rem",
              backgroundColor: "#B0B0B0",
            }}
          >
            <Typography
              align="center"
              sx={{
                fontSize: "0.5rem",
                textAlign: "center",
                fontWeight: "bold",
              }}
            >
              NA
            </Typography>
          </Grid>
          <Grid
            size={{ xs: 2 }}
            sx={{
              borderWidth: "0rem 0.125rem 0.125rem 0rem",
              borderStyle: "solid",
              width: "13.67rem",
              height: "1rem",
              backgroundColor: "#B0B0B0",
            }}
          >
            {/* hasta aqui verifique */}
            <Typography
              align="left"
              sx={{
                fontSize: "0.5rem",
                textAlign: "center",
                fontWeight: "bold",
              }}
            >
              OBSERVACIONES
            </Typography>
          </Grid>
        </Grid>
        <Grid container></Grid>
      </Grid>

      {inspeccion.resultados.map((title) => (
        <Grid key={title.id} container>
          <Grid
            size={{ xs: 12 }}
            sx={{
              borderWidth: "0rem 0.125rem 0.125rem 0.125rem",
              borderStyle: "solid",
            }}
          >
            <>
              {title.id === "3" && (
                <>
                  <center>
                    <Typography
                      sx={{
                        fontSize: "0.7rem",
                        fontWeight: "bold",
                        backgroundColor: "#B0B0B0",
                      }}
                    >
                      CONECTORES
                    </Typography>

                    <Typography
                      sx={{
                        fontSize: "0.6rem",
                        fontWeight: "bold",
                        backgroundColor: "#B0B0B0",
                      }}
                    >
                      {title.title}
                    </Typography>
                  </center>
                </>
              )}

              {title.id === "1" && (
                <>
                  <center>
                    <Typography
                      sx={{
                        fontSize: "0.7rem",
                        fontWeight: "bold",
                        backgroundColor: "#B0B0B0",
                      }}
                    >
                      ARNÉS
                    </Typography>

                    <Typography
                      sx={{
                        fontSize: "0.6rem",
                        fontWeight: "bold",
                        backgroundColor: "#B0B0B0",
                      }}
                    >
                      {title.title}
                    </Typography>
                  </center>
                </>
              )}

              {!["1", "3"].includes(title.id) && (
                <center>
                  <Typography
                    sx={{
                      fontSize: "0.6rem",
                      fontWeight: "bold",
                      backgroundColor: "#B0B0B0",
                    }}
                  >
                    {title.title}
                  </Typography>
                </center>
              )}
            </>
          </Grid>
          {title.items.map((seccion) => (
            <Grid key={seccion.id} container>
              <Grid
                size={{ xs: 1 }}
                sx={{
                  borderWidth: "0rem 0.125rem 0.125rem 0.125rem",
                  borderStyle: "solid",
                  width: "1.25rem",
                }}
              >
                <Typography
                  align="center"
                  sx={{ fontSize: "0.5rem", textAlign: "center" }}
                >
                  {seccion.id}
                </Typography>
              </Grid>
              <Grid
                size={{ xs: 11 }}
                sx={{
                  borderWidth: "0rem 0.125rem 0.125rem 0rem",
                  borderStyle: "solid",
                  width: "45.99rem",
                  backgroundColor: "#B0B0B0",
                }}
              >
                <Typography sx={{ fontSize: "0.5rem", fontWeight: "bold" }}>
                  {seccion.category}
                </Typography>
              </Grid>
              {seccion.items.map((item) => (
                <Grid key={item.id} container>
                  <Grid
                    size={{ xs: 1 }}
                    sx={{
                      borderWidth: "0rem 0.125rem 0.125rem 0.125rem",
                      borderStyle: "solid",
                      width: "1.25rem",
                    }}
                  >
                    <Typography
                      align="center"
                      sx={{ fontSize: "0.5rem", textAlign: "center" }}
                    >
                      {item.id}
                    </Typography>
                  </Grid>
                  <Grid
                    size={{ xs: 6 }}
                    sx={{
                      borderWidth: "0rem 0.125rem 0.125rem 0rem",
                      borderStyle: "solid",
                      width: "24.99rem",
                    }}
                  >
                    <Typography
                      align="left"
                      sx={{
                        fontSize: "0.5rem",
                        fontWeight: "bold",
                      }}
                    >
                      {item.description}
                    </Typography>
                  </Grid>
                  <Grid
                    size={{ xs: 1 }}
                    sx={{
                      borderWidth: "0rem 0.125rem 0.125rem 0rem",
                      borderStyle: "solid",
                      width: "2.438rem",
                      background: "#fc0303",
                    }}
                  >
                    <Typography
                      align="center"
                      sx={{
                        fontSize: "0.5rem",
                        textAlign: "center",
                        fontWeight: "bold",
                      }}
                    >
                      {item.response === "si" ? item.response : ""}
                    </Typography>
                  </Grid>
                  <Grid
                    size={{ xs: 1 }}
                    sx={{
                      borderWidth: "0rem 0.125rem 0.125rem 0rem",
                      borderStyle: "solid",
                      padding: "0.063rem",
                      width: "2.438rem",
                    }}
                  >
                    <Typography
                      align="center"
                      sx={{
                        fontSize: "0.5rem",
                        textAlign: "center",
                        fontWeight: "bold",
                      }}
                    >
                      {item.response === "no" ? item.response : ""}
                    </Typography>
                  </Grid>
                  <Grid
                    size={{ xs: 1 }}
                    sx={{
                      borderWidth: "0rem 0.125rem 0.125rem 0rem",
                      borderStyle: "solid",
                      padding: "0.063rem",
                      width: "2.438rem",
                    }}
                  >
                    <Typography
                      align="center"
                      sx={{
                        fontSize: "0.5rem",
                        textAlign: "center",
                        fontWeight: "bold",
                        width: "2.438rem",
                      }}
                    >
                      {item.response === "na" ? item.response : ""}
                    </Typography>
                  </Grid>
                  <Grid
                    size={{ xs: 12 }}
                    sx={{
                      borderWidth: "0rem 0.125rem 0.125rem 0rem",
                      borderStyle: "solid",
                      padding: "0.630.125rem",
                      width: "13.67rem",
                    }}
                  >
                    <Typography
                      align="left"
                      sx={{
                        fontSize: "0.5rem",
                        textAlign: "center",
                        fontWeight: "bold",
                      }}
                    >
                      {item.observation}
                    </Typography>
                  </Grid>
                </Grid>
              ))}
            </Grid>
          ))}
        </Grid>
      ))}

      <Grid container>
        <Grid
          size={{ xs: 10 }}
          sx={{
            borderWidth: "0rem 0.125rem 0.125rem 0.125rem",
            borderStyle: "solid",
            background: "#fc0303",
            textAlign: "center",
            height: "2rem",
          }}
        >
          <Typography sx={{ color: "#fcfafa" }}>
            QUE DEBE HACER SI MARCO ALGUNA CASILLA ROJA &quot;NO LO USE&quot;
          </Typography>
        </Grid>
        <Grid size={{ xs: 2 }} container sx={{ height: "2rem" }}>
          <Grid
            size={{ xs: 12 }}
            sx={{
              borderWidth: "0rem 0.125rem 0.125rem 0rem",
              borderStyle: "solid",
              textAlign: "center",
              background: "#f3a20c",
              height: "1rem",
              fontSize: "0.7rem",
            }}
          >
            OPERATIVO
          </Grid>
          <Grid
            size={{ xs: 6 }}
            sx={{
              borderWidth: "0rem 0.125rem 0.125rem 0rem",
              borderStyle: "solid",
              textAlign: "center",
              background: "#f3a20c",
              height: "1rem",
              fontSize: "0.7rem",
            }}
          >
            SI
          </Grid>
          <Grid
            size={{ xs: 6 }}
            sx={{
              borderWidth: "0rem 0.125rem 0.125rem 0rem",
              borderStyle: "solid",
              textAlign: "center",
              background: "#f3a20c",
              height: "1rem",
              fontSize: "0.7rem",
            }}
          >
            NO
          </Grid>
        </Grid>
        <Grid
          size={{ xs: 10 }}
          sx={{
            borderWidth: "0rem 0.125rem 0.125rem 0.125rem",
            borderStyle: "solid",
          }}
        >
          <Typography sx={{ color: "#fc0303", fontSize: "0.5rem" }}>
            Si usted nota que el arnés, conector u otro de los dispositivos
            inspeccionados se encuentra EN MAL ESTADO O DEFECTUOSO, estos deben
            ser removidos cuanto antes del lugar de trabajo y dados de baja
            cortándolos (coordine con su Supervisor). &quot;NO LO USE&quot;
          </Typography>
        </Grid>
        <Grid
          size={{ xs: 1 }}
          sx={{
            borderWidth: "0rem 0.125rem 0.125rem 0rem",
            borderStyle: "solid",
            textAlign: "center",
          }}
        >
          {inspeccion.operativo === "SI" ? inspeccion.operativo : ""}
        </Grid>
        <Grid
          size={{ xs: 1 }}
          sx={{
            borderWidth: "0rem 0.125rem 0.125rem 0rem",
            borderStyle: "solid",
            textAlign: "center",
          }}
        >
          {inspeccion.operativo === "NO" ? inspeccion.operativo : ""}
        </Grid>
      </Grid>

      <Grid container>
        <Grid
          size={{ xs: 8 }}
          sx={{
            borderWidth: "0rem 0.125rem 0.125rem 0.125rem",
            borderStyle: "solid",
            height: "8rem",
          }}
        >
          <img
            src="/ArnesConectores.png"
            style={{
              width: "100%",
              height: "100%",
              //objectFit: "contain",
            }}
          />
        </Grid>

        <Grid
          size={{ xs: 4 }}
          sx={{
            textAlign: "center",
            borderWidth: "0rem 0.125rem 0.125rem 0rem",
            borderStyle: "solid",
          }}
        >
          <Typography
            sx={{
              fontSize: "0.7rem",
              fontWeight: "bold",
              borderWidth: "0rem 0rem 0.125rem 0rem",
              borderStyle: "solid",
              background: "#f3a20c",
            }}
          >
            Observaciones Complementarias
          </Typography>
          <Typography
            sx={{
              fontSize: "0.7rem",
              fontWeight: "bold",
            }}
          >
            {inspeccion.observacionesComplementarias || "Sin observaciones"}
          </Typography>
        </Grid>
      </Grid>

      <Grid container>
        <Grid
          size={{ xs: 5 }}
          sx={{
            textAlign: "center",
            borderWidth: "0rem 0.125rem 0.125rem 0.125rem",
            borderStyle: "solid",
            height: "3.5rem",
          }}
        >
          <Typography
            sx={{
              fontSize: "0.5rem",
              textTransform: "uppercase",
              fontWeight: "bold",
              borderBottom: "0.125rem solid",
              padding: "0.5rem 0rem 0.22rem 0rem",
              background: "#a3c1e8",
            }}
          >
            Inspeccion realizada por
          </Typography>

          <Typography>{inspeccion.inspectionConductedBy}</Typography>
        </Grid>
        <Grid
          size={{ xs: 2 }}
          sx={{
            textAlign: "center",
            borderWidth: "0rem 0.125rem 0.125rem 0rem",
            borderStyle: "solid",
            height: "3.5rem",
          }}
        >
          <Typography
            sx={{
              fontSize: "0.5rem",
              textTransform: "uppercase",
              fontWeight: "bold",
              borderBottom: "0.125rem solid",
              padding: "0.5rem 0rem 0.22rem 0rem",
              background: "#a3c1e8",
            }}
          >
            FIRMA
          </Typography>
          {renderFirma(inspeccion.firmaInspector)}
        </Grid>

        <Grid
          size={{ xs: 3 }}
          sx={{
            textAlign: "center",
            borderWidth: "0rem 0.125rem 0.125rem 0rem",
            borderStyle: "solid",
            height: "3.5rem",
          }}
        >
          <Typography
            sx={{
              fontSize: "0.5rem",
              fontWeight: "bold",
              borderBottom: "0.125rem solid black",
              background: "#06fcfc",
              color: "#ffff",
            }}
          >
            INSPECCIÓN APROBADA POR (Supervisor de Área):
          </Typography>
          <Typography>{inspeccion.inspectionApprovedBy}</Typography>
        </Grid>
        <Grid
          size={{ xs: 1 }}
          sx={{
            textAlign: "center",
            borderWidth: "0rem 0.125rem 0.125rem 0rem",
            borderStyle: "solid",
            height: "3.5rem",
          }}
        >
          <Typography
            sx={{
              fontSize: "0.5rem",
              fontWeight: "bold",
              borderBottom: "0.125rem solid black",
              padding: "0.5rem 0rem 0.22rem 0rem",
              background: "#06fcfc",
              color: "#ffff",
            }}
          >
            FIRMA
          </Typography>
          {renderFirma(inspeccion.firmaSupervisor)}
        </Grid>

        <Grid
          size={{ xs: 1 }}
          sx={{
            textAlign: "center",
            borderWidth: "0rem 0.125rem 0.125rem 0rem",
            borderStyle: "solid",
            height: "3.5rem",
          }}
        >
          <Typography
            sx={{
              fontSize: "0.5rem",
              fontWeight: "bold",
              borderBottom: "0.125rem solid black",
              padding: "0.5rem 0rem 0.22rem 0rem",
              background: "#06fcfc",
              color: "#ffff",
            }}
          >
            FECHA
          </Typography>

          <Typography>
            {inspeccion.informacionGeneral.fecha
              ? new Date(inspeccion.reviewDate).toLocaleDateString()
              : "Fecha no disponible"}
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );
};
