import { BASIC_CONFIG } from "../../factory/configs"
import { undoDocumentReview as undoDocumentReviewImpl } from "../../factory/createFolderActions"

export const undoDocumentReview = ({ documentIds }: { documentIds: string[] }) =>
	undoDocumentReviewImpl(BASIC_CONFIG, { documentIds })
