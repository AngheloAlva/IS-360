import { TECH_SPECS_CONFIG } from "../../factory/configs"
import { undoDocumentReview } from "../../factory/createFolderActions"

export const undoTechnicalDocumentReview = ({ documentIds }: { documentIds: string[] }) =>
	undoDocumentReview(TECH_SPECS_CONFIG, { documentIds })
