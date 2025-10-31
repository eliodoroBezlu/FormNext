import { FormConfigRegistry } from "../../types/IProps"
import { cylinderFormConfigs } from "./cylinder.config"
import { groupedFormConfigs } from "./grouped.config"
import { standardFormConfigs } from "./standard.config"
import { vehicleFormConfigs } from "./vehicle.config"


// Combinar todas las configuraciones en un solo registro
export const formConfigRegistry: FormConfigRegistry = {
  ...standardFormConfigs,
  ...cylinderFormConfigs,
  ...groupedFormConfigs,
  ...vehicleFormConfigs,
}

// Re-exportar configuraciones individuales para uso específico
export { standardFormConfigs, cylinderFormConfigs, groupedFormConfigs, vehicleFormConfigs }
