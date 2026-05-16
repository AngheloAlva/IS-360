import { BASIC_CONFIG } from "../../factory/configs"
import { submitForReview } from "../../factory/createFolderActions"

export const submitBasicFolderForReview = ({
	emails,
	userId,
	workerId,
	folderId,
}: {
	userId: string
	workerId: string
	emails: string[]
	folderId: string
}) => submitForReview(BASIC_CONFIG, { emails, userId, folderId, workerId })
