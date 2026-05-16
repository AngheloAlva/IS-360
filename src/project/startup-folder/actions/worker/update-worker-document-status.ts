import { WORKER_CONFIG } from "../../factory/configs"
import { undoDocumentReview } from "../../factory/createFolderActions"

export const undoWorkerDocumentReview = ({ documentIds }: { documentIds: string[] }) =>
	undoDocumentReview(WORKER_CONFIG, { documentIds })
