import { FormConfigRegistry } from "../types/IProps"
import { andamioFormConfigs } from "./form-configs/andamio.config"
import { groupedFormConfigs } from "./form-configs/grouped.config"
import { standardFormConfigs } from "./form-configs/standard.config"
import { vehicleFormConfigs } from "./form-configs/vehicle.config"


// Combinar todas las configuraciones en un solo registro
export const formConfigRegistry: FormConfigRegistry = {
  ...standardFormConfigs,
  ...groupedFormConfigs,
  ...vehicleFormConfigs,
  ...andamioFormConfigs
}

// Re-exportar configuraciones individuales para uso específico
export { standardFormConfigs, groupedFormConfigs, vehicleFormConfigs, andamioFormConfigs }
