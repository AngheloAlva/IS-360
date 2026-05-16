import { ENVIRONMENT_CONFIG } from "../../factory/configs"
import { submitForReview } from "../../factory/createFolderActions"

export const submitEnvironmentFolderForReview = ({
	emails,
	userId,
	folderId,
}: {
	userId: string
	emails: string[]
	folderId: string
}) => submitForReview(ENVIRONMENT_CONFIG, { emails, userId, folderId })
