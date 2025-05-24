import { UserIcon, UsersIcon } from "lucide-react"

import { WORKER_STRUCTURE } from "@/lib/consts/startup-folders-structure"
import { DocumentCategory, ReviewStatus } from "@prisma/client"
import { getDocumentStatus } from "@/lib/get-document-status"

import { SubmitReviewRequestDialog } from "../SubmitReviewRequestDialog"
import StartupFolderTrigger from "./StartupFolderTrigger"
import { DocumentList } from "./DocumentList"
import {
	Accordion,
	AccordionItem,
	AccordionTrigger,
	AccordionContent,
} from "@/components/ui/accordion"

import type { StartupFolderWithDocuments } from "@/hooks/startup-folders/use-startup-folder"

interface WorkerDocumentsProps {
	userId: string
	companyId: string
	isOtcMember: boolean
	startupFolderId: string
	folders: StartupFolderWithDocuments["workersFolders"]
}

export default function WorkerDocuments({
	userId,
	folders,
	companyId,
	isOtcMember,
	startupFolderId,
}: WorkerDocumentsProps): React.ReactElement {
	const totalExpectedDocsPerWorker = WORKER_STRUCTURE.documents.length
	let overallUploadedDocsCount = 0
	let overallRequiredPendingDocsCount = 0

	folders.forEach((folder) => {
		WORKER_STRUCTURE.documents.forEach((docStruct) => {
			const { isUploaded, isRequired } = getDocumentStatus(
				WORKER_STRUCTURE.category as DocumentCategory,
				docStruct.type,
				folder.documents
			)

			if (isUploaded) overallUploadedDocsCount++
			if (isRequired && !isUploaded) overallRequiredPendingDocsCount++
		})
	})

	const totalDocsForSection =
		totalExpectedDocsPerWorker * Math.max(1, folders.length > 0 ? folders.length : 1)

	const progressPercentage =
		totalDocsForSection > 0 ? Math.round((overallUploadedDocsCount / totalDocsForSection) * 100) : 0

	const foldersStatus = folders.find((folder) => folder.status === ReviewStatus.APPROVED)
		? ReviewStatus.APPROVED
		: folders.find((folder) => folder.status === ReviewStatus.SUBMITTED)
			? ReviewStatus.SUBMITTED
			: ReviewStatus.DRAFT

	return (
		<div className="mb-4 flex w-full items-start justify-between gap-4">
			<AccordionItem
				key={WORKER_STRUCTURE.title}
				value={WORKER_STRUCTURE.title}
				className="bg-background mb-4 w-full rounded-md border border-solid px-4"
			>
				<StartupFolderTrigger
					userId={userId}
					icon={<UsersIcon />}
					companyId={companyId}
					status={foldersStatus}
					isOtcMember={isOtcMember}
					folderId={startupFolderId}
					title={WORKER_STRUCTURE.title}
					totalDocs={totalDocsForSection}
					category={DocumentCategory.PERSONNEL}
					progressPercentage={progressPercentage}
					completedDocs={overallUploadedDocsCount}
					requiredPending={overallRequiredPendingDocsCount}
					sectionDescription={WORKER_STRUCTURE.description}
				/>

				<AccordionContent>
					{folders.length === 0 && (
						<div className="text-muted-foreground py-2 text-center text-sm">
							No hay trabajadores con documentación. Puede agregar documentos de trabajador
							utilizando la opción Subir Documento General para Trabajadores.
						</div>
					)}

					<div className="space-y-6 py-2">
						<Accordion type="multiple" className="space-y-4">
							{folders.map((folder) => {
								const isEditable = folder.status === ReviewStatus.DRAFT
								const totalDocumentsUploaded = folder.documents.filter(
									(doc) => doc.url !== ""
								).length

								return (
									<AccordionItem
										key={folder.id}
										value={folder.id}
										className="border-muted rounded-md border"
									>
										<AccordionTrigger className="cursor-pointer px-4 py-3 hover:no-underline">
											<div className="flex items-center">
												<div className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500">
													<UserIcon className="h-4 w-4" />
												</div>

												<div className="flex flex-col">
													<span className="font-medium">{folder.worker.name}</span>
													<span className="text-muted-foreground text-sm">
														{totalDocumentsUploaded} de {WORKER_STRUCTURE.documents.length}{" "}
														documentos agregados
													</span>
												</div>
											</div>
										</AccordionTrigger>

										<AccordionContent className="px-4 pt-0 pb-2">
											<DocumentList
												userId={userId}
												folderId={folder.id}
												companyId={companyId}
												isEditable={isEditable}
												documents={folder.documents}
												category={WORKER_STRUCTURE.category}
												documentsStructure={WORKER_STRUCTURE}
											/>
										</AccordionContent>
									</AccordionItem>
								)
							})}
						</Accordion>
					</div>
				</AccordionContent>
			</AccordionItem>

			{!isOtcMember && (
				<SubmitReviewRequestDialog
					folderType="WORKER"
					companyId={companyId}
					folderId={startupFolderId}
					folderName={WORKER_STRUCTURE.title}
					disabled={folders.some((folder) => folder.status !== ReviewStatus.DRAFT)}
				/>
			)}
		</div>
	)
}
