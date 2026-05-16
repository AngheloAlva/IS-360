import { ENVIRONMENT_CONFIG } from "../../factory/configs"
import { undoDocumentReview } from "../../factory/createFolderActions"

export const undoEnvironmentDocumentReview = ({ documentIds }: { documentIds: string[] }) =>
	undoDocumentReview(ENVIRONMENT_CONFIG, { documentIds })
