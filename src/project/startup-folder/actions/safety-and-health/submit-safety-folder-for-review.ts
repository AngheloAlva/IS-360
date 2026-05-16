import { SAFETY_AND_HEALTH_CONFIG } from "../../factory/configs"
import { submitForReview } from "../../factory/createFolderActions"

export const submitSafetyAndHealthFolderForReview = ({
	emails,
	userId,
	folderId,
}: {
	userId: string
	emails: string[]
	folderId: string
}) => submitForReview(SAFETY_AND_HEALTH_CONFIG, { emails, userId, folderId })
