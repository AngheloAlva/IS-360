import { SAFETY_AND_HEALTH_CONFIG } from "../../factory/configs"
import { undoDocumentReview } from "../../factory/createFolderActions"

export const undoSafetyDocumentReview = ({ documentIds }: { documentIds: string[] }) =>
	undoDocumentReview(SAFETY_AND_HEALTH_CONFIG, { documentIds })
