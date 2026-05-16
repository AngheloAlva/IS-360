import { ENVIRONMENTAL_CONFIG } from "../../factory/configs"
import { undoDocumentReview } from "../../factory/createFolderActions"

export const undoEnvironmentalDocumentReview = ({ documentIds }: { documentIds: string[] }) =>
	undoDocumentReview(ENVIRONMENTAL_CONFIG, { documentIds })
