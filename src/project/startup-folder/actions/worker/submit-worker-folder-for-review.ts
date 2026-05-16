import { WORKER_CONFIG } from "../../factory/configs"
import { submitForReview } from "../../factory/createFolderActions"

export const submitWorkerFolderForReview = ({
	emails,
	userId,
	workerId,
	folderId,
}: {
	userId: string
	workerId: string
	emails: string[]
	folderId: string
	companyId?: string
}) => submitForReview(WORKER_CONFIG, { emails, userId, folderId, workerId })
