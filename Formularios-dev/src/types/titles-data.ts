import type { InspectionTitle } from "./formTypes";

export const titles: InspectionTitle[] = [
  {
    id: "1",
    title: "HERRAJES (Componentes plásticos y metálicos integrales del arnés)",
    items: [
      {
        id: "1",
        category: "ARGOLLAS EN 'D' O ANILLOS",
        items: [
          {
            id: "1.2",
            description:
              "Con deformaciones o desgaste excesivo (dobladura, etc.)",
            response: null,
            observation: "",
          },
          {
            id: "1.3",
            description:
              "Picaduras, grietas, trizaduras (que abarquen un 50% de una sección)",
            response: null,
            observation: "",
          },
          {
            id: "1.4",
            description:
              "Corrosión de la argolla (Corrosión de toda la argolla)",
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
              "Picaduras, grietas, trizaduras, quemaduras. (que abarquen un 50% de una sección)",
            response: null,
            observation: "",
          },
          {
            id: "3.3",
            description:
              "Corrosión de las hebillas (corrosión de toda la hebilla)",
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
    ],
  },
  {
    id: "2",
    title: "TEJIDO TRENZADO (Correas de fibra sintética)",
    items: [
      {
        id: "5",
        category: "AGUJEROS (POR QUEMADURAS O CORTES)",
        items: [
          {
            id: "5.1",
            description:
              'Agujeros mayores a 1/16" (1.59 mm) en correas de hombro, pierna o parte más resistente del arnés',
            response: null,
            observation: "",
          },
          {
            id: "5.2",
            description:
              "Presencia de más de un (1) agujero pasante en la correa",
            response: null,
            observation: "",
          },
          {
            id: "5.3",
            description:
              'Agujeros mayores a 1/4" (6.35 mm) en correas de pecho o los protectores',
            response: null,
            observation: "",
          },
          {
            id: "5.4",
            description:
              'Agujeros, quemaduras o cortes cerca al anillo "D" dorsal (de cualquier tamaño)',
            response: null,
            observation: "",
          },
          {
            id: "5.5",
            description: "Cortes que llegaron a las costuras",
            response: null,
            observation: "",
          },
          {
            id: "5.6",
            description:
              'Cortes mayores a 1/8" (3,18 mm) en cualquier parte del tejido trenzado',
            response: null,
            observation: "",
          },
        ],
      },
      {
        id: "6",
        category: "COSTURAS",
        items: [
          {
            id: "6.1",
            description:
              "Más de dos (2) hilos cortados o rotos en el mismo patrón",
            response: null,
            observation: "",
          },
          {
            id: "6.2",
            description: "Pérdida de costura",
            response: null,
            observation: "",
          },
          {
            id: "6.3",
            description: "Daño de costura por calor o fricción",
            response: null,
            observation: "",
          },
        ],
      },
      {
        id: "7",
        category:
          "DAÑO POR CALOR (escoria de soldadura, llama, contacto con parte calientes u otros, áreas marrones y duras)",
        items: [
          {
            id: "7.1",
            description:
              "Las costuras han sido afectadas por quemaduras (pérdida de costura)",
            response: null,
            observation: "",
          },
          {
            id: "7.2",
            description:
              "Quemaduras en correas de hombro, pierna o parte resistente del arnés",
            response: null,
            observation: "",
          },
          {
            id: "7.3",
            description:
              "Quemadura en el protector de espalda que pasen su grosor",
            response: null,
            observation: "",
          },
          {
            id: "7.4",
            description: 'Quemadura cerca al anillo "D" dorsal',
            response: null,
            observation: "",
          },
        ],
      },
    ],
  },
  {
    id: "3",
    title: "HERRAJES",
    items: [
      {
        id: "8",
        category:
          "GANCHOS DE SEGURIDAD, AJUSTADORES, GUARDACABOS, BARRA EXPANSORA",
        items: [
          {
            id: "8.1",
            description:
              "Presentan daños (que afecten su cierre o funcionalidad)",
            response: null,
            observation: "",
          },
          {
            id: "8.2",
            description: "Están rotos o rajados (cualquier daño)",
            response: null,
            observation: "",
          },
          {
            id: "8.3",
            description:
              "Presentan deformación (que afecte su cierre o funcionalidad)",
            response: null,
            observation: "",
          },
          {
            id: "8.4",
            description:
              "Presentas bordes afilados (que puedan causar cortes al conector durante su uso)",
            response: null,
            observation: "",
          },
          {
            id: "8.5",
            description: "Resortes con fallas (trabado)",
            response: null,
            observation: "",
          },
          {
            id: "8.6",
            description: "Los ganchos de conexión NO funcionan correctamente",
            response: null,
            observation: "",
          },
          {
            id: "8.7",
            description: "Presentan corrosión (Corrosión de toda la argolla)",
            response: null,
            observation: "",
          },
        ],
      },
    ],
  },
  {
    id: "4",
    title: "TEJIDO TRENZADO (Correas de fibra sintéticaa)",
    items: [
      {
        id: "9",
        category: "INTEGRIDAD TEJIDO TRENZADO",
        items: [
          {
            id: "9.1",
            description: "Presenta partes deshilachadas",
            response: null,
            observation: "",
          },
          {
            id: "9.2",
            description: "Tiene cortes",
            response: null,
            observation: "",
          },
          {
            id: "9.3",
            description: "Tiene fibras rotas",
            response: null,
            observation: "",
          },
          {
            id: "9.4",
            description: "Presenta rasgaduras",
            response: null,
            observation: "",
          },
          {
            id: "9.5",
            description:
              "Presenta daños por calor o productos químicos: manchas marrones, zonas decoloradas, áreas quebradizas",
            response: null,
            observation: "",
          },
          {
            id: "9.6",
            description:
              "Presenta daños por radiación ultravioleta: decoloración y presencia de astillas en la superficie del tejido trenzado (desintegración progresiva)",
            response: null,
            observation: "",
          },
        ],
      },
      {
        id: "10",
        category: "AMORTIGUADOR DE CAÍDAS",
        items: [
          {
            id: "10.1",
            description: "Desgaste del protector, deformación, quemaduras",
            response: null,
            observation: "",
          },
          {
            id: "10.2",
            description: "Testigo activado",
            response: null,
            observation: "",
          },
        ],
      },
    ],
  },
];
