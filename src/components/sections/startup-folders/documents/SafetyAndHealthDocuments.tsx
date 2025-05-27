import { ShieldPlusIcon } from "lucide-react"

import { StartupFolderWithDocuments } from "@/hooks/startup-folders/use-startup-folder"
import { DocumentCategory, ReviewStatus } from "@prisma/client"
import { getDocumentStatus } from "@/lib/get-document-status"
import {
	StartupFolderStructure,
	SAFETY_AND_HEALTH_STRUCTURE,
} from "@/lib/consts/startup-folders-structure"

import { AccordionItem, AccordionContent } from "@/components/ui/accordion"
import { SubmitReviewRequestDialog } from "../SubmitReviewRequestDialog"
import StartupFolderTrigger from "./StartupFolderTrigger"
import { DocumentList } from "./DocumentList"

export default function SafetyAndHealthDocuments({
	folder,
	userId,
	companyId,
	isOtcMember,
}: {
	userId: string
	companyId: string
	isOtcMember: boolean
	folder: StartupFolderWithDocuments["safetyAndHealthFolders"][number]
}): React.ReactElement {
	const totalDocs = SAFETY_AND_HEALTH_STRUCTURE.documents.length
	const completedDocs = SAFETY_AND_HEALTH_STRUCTURE.documents.filter(
		(doc: StartupFolderStructure["documents"][number]) =>
			getDocumentStatus(DocumentCategory.SAFETY_AND_HEALTH, doc.type, folder.documents).isUploaded
	).length
	const requiredPending = SAFETY_AND_HEALTH_STRUCTURE.documents.filter(
		(doc: StartupFolderStructure["documents"][number]) =>
			!getDocumentStatus(DocumentCategory.SAFETY_AND_HEALTH, doc.type, folder.documents)
				.isUploaded &&
			getDocumentStatus(DocumentCategory.SAFETY_AND_HEALTH, doc.type, folder.documents).isRequired
	).length

	const progressPercentage = totalDocs > 0 ? Math.round((completedDocs / totalDocs) * 100) : 0

	const sectionDescription = SAFETY_AND_HEALTH_STRUCTURE.description

	const isEditable = folder.status === ReviewStatus.DRAFT

	return (
		<div className="mb-4 flex w-full items-start justify-between gap-4">
			<AccordionItem
				key={SAFETY_AND_HEALTH_STRUCTURE.title}
				value={SAFETY_AND_HEALTH_STRUCTURE.title}
				className="bg-background w-full rounded-md border border-solid px-4"
			>
				<StartupFolderTrigger
					userId={userId}
					folderId={folder.id}
					totalDocs={totalDocs}
					companyId={companyId}
					status={folder.status}
					icon={<ShieldPlusIcon />}
					isOtcMember={isOtcMember}
					completedDocs={completedDocs}
					requiredPending={requiredPending}
					progressPercentage={progressPercentage}
					sectionDescription={sectionDescription}
					title={SAFETY_AND_HEALTH_STRUCTURE.title}
					category={DocumentCategory.SAFETY_AND_HEALTH}
				/>

				<AccordionContent>
					<DocumentList
						userId={userId}
						folderId={folder.id}
						companyId={companyId}
						isEditable={isEditable}
						isOtcMember={isOtcMember}
						documents={folder.documents}
						category={SAFETY_AND_HEALTH_STRUCTURE.category}
						documentsStructure={SAFETY_AND_HEALTH_STRUCTURE}
					/>
				</AccordionContent>
			</AccordionItem>

			{!isOtcMember && (
				<SubmitReviewRequestDialog
					folderId={folder.id}
					companyId={companyId}
					disabled={!isEditable}
					folderType="SAFETY_AND_HEALTH"
					folderName={SAFETY_AND_HEALTH_STRUCTURE.title}
				/>
			)}
		</div>
	)
}
