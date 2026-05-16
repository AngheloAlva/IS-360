import { ENVIRONMENTAL_CONFIG } from "../../factory/configs"
import { submitForReview } from "../../factory/createFolderActions"

export const submitEnvironmentalFolderForReview = ({
	emails,
	userId,
	folderId,
}: {
	userId: string
	emails: string[]
	folderId: string
}) => submitForReview(ENVIRONMENTAL_CONFIG, { emails, userId, folderId })
