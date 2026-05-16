import { TECH_SPECS_CONFIG } from "../../factory/configs"
import { submitForReview } from "../../factory/createFolderActions"

export const submitTechSpecsDocumentForReview = ({
	emails,
	userId,
	folderId,
}: {
	userId: string
	emails: string[]
	folderId: string
}) => submitForReview(TECH_SPECS_CONFIG, { emails, userId, folderId })
