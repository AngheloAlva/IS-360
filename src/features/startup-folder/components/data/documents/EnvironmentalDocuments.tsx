import { EarthIcon } from "lucide-react"

import { StartupFolderWithDocuments } from "@/features/startup-folder/hooks/use-startup-folder"
import { DocumentCategory, ReviewStatus } from "@prisma/client"
import { getDocumentStatus } from "@/lib/get-document-status"
import {
	StartupFolderStructure,
	ENVIRONMENTAL_STRUCTURE,
} from "@/lib/consts/startup-folders-structure"

import { AccordionItem, AccordionContent } from "@/shared/components/ui/accordion"
import { SubmitReviewRequestDialog } from "../SubmitReviewRequestDialog"
import { SendStartupFolderReview } from "../SendStartupFolderReview"
import StartupFolderTrigger from "./StartupFolderTrigger"
import { DocumentList } from "./DocumentList"

export default function EnvironmentalDocuments({
	folder,
	userId,
	companyId,
	isOtcMember,
}: {
	userId: string
	companyId: string
	isOtcMember: boolean
	folder: StartupFolderWithDocuments["environmentalFolders"][number]
}): React.ReactElement {
	const totalDocs = ENVIRONMENTAL_STRUCTURE.documents.length
	const completedDocs = ENVIRONMENTAL_STRUCTURE.documents.filter(
		(doc: StartupFolderStructure["documents"][number]) =>
			getDocumentStatus(DocumentCategory.ENVIRONMENTAL, doc.type, folder.documents).status ===
			"APPROVED"
	).length
	const requiredPending = ENVIRONMENTAL_STRUCTURE.documents.filter(
		(doc: StartupFolderStructure["documents"][number]) =>
			!getDocumentStatus(DocumentCategory.ENVIRONMENTAL, doc.type, folder.documents).isUploaded &&
			getDocumentStatus(DocumentCategory.ENVIRONMENTAL, doc.type, folder.documents).isRequired
	).length

	const sectionDescription = ENVIRONMENTAL_STRUCTURE.description

	const progressPercentage = totalDocs > 0 ? (completedDocs / totalDocs) * 100 : 0

	const isEditable = folder.status === ReviewStatus.DRAFT

	return (
		<div className="mb-4 flex w-full items-start justify-between gap-4">
			<AccordionItem
				key={ENVIRONMENTAL_STRUCTURE.title}
				value={ENVIRONMENTAL_STRUCTURE.title}
				className="bg-background w-full rounded-md border border-solid px-4"
			>
				<StartupFolderTrigger
					icon={<EarthIcon />}
					totalDocs={totalDocs}
					completedDocs={completedDocs}
					requiredPending={requiredPending}
					title={ENVIRONMENTAL_STRUCTURE.title}
					progressPercentage={progressPercentage}
					sectionDescription={sectionDescription}
				/>

				<AccordionContent>
					<DocumentList
						userId={userId}
						folderId={folder.id}
						companyId={companyId}
						isEditable={isEditable}
						isOtcMember={isOtcMember}
						documents={folder.documents}
						category={DocumentCategory.ENVIRONMENTAL}
						documentsStructure={ENVIRONMENTAL_STRUCTURE}
					/>
				</AccordionContent>
			</AccordionItem>

			{isOtcMember && folder.status === ReviewStatus.SUBMITTED && (
				<SendStartupFolderReview
					userId={userId}
					folderId={folder.id}
					companyId={companyId}
					title={ENVIRONMENTAL_STRUCTURE.title}
					category={DocumentCategory.ENVIRONMENTAL}
				/>
			)}

			{!isOtcMember && (
				<SubmitReviewRequestDialog
					userId={userId}
					folderId={folder.id}
					companyId={companyId}
					disabled={!isEditable}
					folderType="ENVIRONMENTAL"
					folderName={ENVIRONMENTAL_STRUCTURE.title}
				/>
			)}
		</div>
	)
}
