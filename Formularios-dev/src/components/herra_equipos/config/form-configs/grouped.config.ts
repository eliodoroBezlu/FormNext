import { FormFeatureConfig } from "../../types/IProps";


// Configuraciones para formularios con accesorios agrupados (Eslings, Grilletes, etc.)
export const groupedFormConfigs: Record<string, FormFeatureConfig> = {
  "3.04.P37.F19": {
    formCode: "3.04.P37.F19",
    formName: "INSPECCIÓN PRE-USO DE ELEMENTOS Y ACCESORIOS DE IZAJE - ESLINGAS, ESTROBOS, GRILLETES Y GANCHOS",
    formType: "grouped",
    signatures: {
      inspector: false,
      supervisor: false,
    },

    groupedConfig: {
      columns: [
        {
          key: 'eslinga_sintetica',
          label: 'ESLINGA SINTETICA',
          applicability: 'requiredWithCount',
        },
        {
          key: 'grillete',
          label: 'GRILLETE',
          applicability: 'requiredWithCount',
        },
        {
          key:'eslinga_cable',
          label: 'ESLINGA DE CABLE DE ACERO',
          applicability: 'requiredWithCount',
        },
        {
          key: 'gancho',
          label: 'GANCHO',
          applicability: 'requiredWithCount',
        }
      ],
      instructionText: 'Las casillas de los criterios de inspección deben ser marcados: Sí: No y NA (no aplica). Casillas en rojo determinan si se utiliza el ítem. / Acc. de izaje: en amarillo se registra la cantidad por tipo de elem. / Acc. de izaje.',
      questionColumnColors: {
        0: { eslinga_sintetica: "red", grillete: "red", eslinga_cable: "red", gancho: "red" },
        1: { eslinga_sintetica: "white", grillete: "white", eslinga_cable: "white", gancho: "white" },
        2: { eslinga_sintetica: "red", grillete: "gray", eslinga_cable: "gray", gancho: "gray" },
        3: { eslinga_sintetica: "red", grillete: "gray", eslinga_cable: "gray", gancho: "gray" },
        4: { eslinga_sintetica: "white", grillete: "gray", eslinga_cable: "gray", gancho: "gray" },
        5: { eslinga_sintetica: "red", grillete: "red", eslinga_cable: "red", gancho: "red" },
        6: { eslinga_sintetica: "white", grillete: "gray", eslinga_cable: "gray", gancho: "gray" },
        7: { eslinga_sintetica: "gray", grillete: "red", eslinga_cable: "gray", gancho: "gray" },
        8: { eslinga_sintetica: "gray", grillete: "red", eslinga_cable: "white", gancho: "gray" },
        9: { eslinga_sintetica: "white", grillete: "gray", eslinga_cable: "white", gancho: "gray" },
        10: { eslinga_sintetica: "grey", grillete: "red", eslinga_cable: "red", gancho: "gray" },
        11: {eslinga_sintetica: "grey", grillete: "grey", eslinga_cable: "red", gancho: "gray" },
        12: { eslinga_sintetica: "gray", grillete: "gray", eslinga_cable: "red", gancho: "gray" },
        13: { eslinga_sintetica: "gray", grillete: "gray", eslinga_cable: "white", gancho: "white"},
        14: { eslinga_sintetica: "gray", grillete: "gray", eslinga_cable: "red", gancho: "gray" },
        15: { eslinga_sintetica: "grey", grillete: "grey", eslinga_cable: "white", gancho: "white" },
        16: { eslinga_sintetica: "grey", grillete: "grey", eslinga_cable: "white", gancho: "white" },
        17: { eslinga_sintetica: "white", grillete: "gray", eslinga_cable: "red", gancho: "gray" },
        18: { eslinga_sintetica: "grey", grillete: "gray", eslinga_cable: "white", gancho: "white" },
        19: { eslinga_sintetica: "grey", grillete: "grey", eslinga_cable: "white", gancho: "white" },
        20: { eslinga_sintetica: "grey", grillete: "gray", eslinga_cable: "gray", gancho: "red" },
        21: { eslinga_sintetica: "gray", grillete: "red", eslinga_cable: "gray", gancho: "gray" },
        22: { eslinga_sintetica: "white", grillete: "white", eslinga_cable: "white", gancho: "white" },
        23: { eslinga_sintetica: "red", grillete: "red", eslinga_cable: "red", gancho: "red" },
        // ... etc
      }
    },
    colorCode: {
      enabled: false,
      hasTrimestre: false,
    },
    alert: {
      show: false,
      message: "Inspeccione cada eslinga individualmente",
      variant: "warning",
    },
    conclusion: {
      enabled: true,
      label:"DESCRIPCIÓN DEL APARATO DE IZAJE / CARGA / OPERACIÓN"
    },
    requiresPhotos: true,
    allowDraft: true,
  },
}
