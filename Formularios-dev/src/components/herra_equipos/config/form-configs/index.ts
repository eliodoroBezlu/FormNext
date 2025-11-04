import { FormConfigRegistry } from "../../types/IProps"
import { andamioFormConfigs } from "./andamio.config"
import { groupedFormConfigs } from "./grouped.config"
import { standardFormConfigs } from "./standard.config"
import { vehicleFormConfigs } from "./vehicle.config"


// Combinar todas las configuraciones en un solo registro
export const formConfigRegistry: FormConfigRegistry = {
  ...standardFormConfigs,
  ...groupedFormConfigs,
  ...vehicleFormConfigs,
  ...andamioFormConfigs
}

// Re-exportar configuraciones individuales para uso específico
export { standardFormConfigs, groupedFormConfigs, vehicleFormConfigs, andamioFormConfigs }
