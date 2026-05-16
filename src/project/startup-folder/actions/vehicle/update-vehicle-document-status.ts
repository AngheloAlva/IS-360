import { VEHICLE_CONFIG } from "../../factory/configs"
import { undoDocumentReview } from "../../factory/createFolderActions"

export const undoVehicleDocumentReview = ({ documentIds }: { documentIds: string[] }) =>
	undoDocumentReview(VEHICLE_CONFIG, { documentIds })
