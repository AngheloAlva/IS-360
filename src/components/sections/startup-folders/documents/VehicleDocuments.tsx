import { CarIcon } from "lucide-react"

import { VEHICLE_STRUCTURE } from "@/lib/consts/startup-folders-structure"
import { DocumentCategory, ReviewStatus } from "@prisma/client"
import { getDocumentStatus } from "@/lib/get-document-status"

import { SendStartupFolderReview } from "../admin/SendStartupFolderReview"
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

interface VehicleDocumentsProps {
	userId: string
	companyId: string
	isOtcMember: boolean
	startupFolderId: string
	folders: StartupFolderWithDocuments["vehiclesFolders"]
}

export default function VehicleDocuments({
	userId,
	companyId,
	folders,
	isOtcMember,
	startupFolderId,
}: VehicleDocumentsProps): React.ReactElement {
	const totalExpectedDocsPerVehicle = VEHICLE_STRUCTURE.documents.length
	let overallUploadedDocsCount = 0
	let overallRequiredPendingDocsCount = 0

	folders.forEach((folder) => {
		VEHICLE_STRUCTURE.documents.forEach((docStruct) => {
			const { isUploaded, isRequired, status } = getDocumentStatus(
				VEHICLE_STRUCTURE.category as DocumentCategory,
				docStruct.type,
				folder.documents
			)

			if (status === "APPROVED") overallUploadedDocsCount++
			if (isRequired && !isUploaded) overallRequiredPendingDocsCount++
		})
	})

	const totalDocsForSection =
		totalExpectedDocsPerVehicle * Math.max(1, folders.length > 0 ? folders.length : 1)

	const progressPercentage =
		totalDocsForSection > 0 ? Math.round((overallUploadedDocsCount / totalDocsForSection) * 100) : 0

	const foldersStatus = folders.find((folder) => folder.status === ReviewStatus.APPROVED)
		? ReviewStatus.APPROVED
		: folders.find((folder) => folder.status === ReviewStatus.SUBMITTED)
			? ReviewStatus.SUBMITTED
			: ReviewStatus.DRAFT

	return (
		<div className="mb-4 flex w-full items-start justify-between gap-4">
			<Accordion type="single" collapsible className="w-full space-y-4">
				<AccordionItem
					value={VEHICLE_STRUCTURE.title}
					className="bg-background rounded-md border border-solid px-4"
				>
					<StartupFolderTrigger
						icon={<CarIcon />}
						title={VEHICLE_STRUCTURE.title}
						totalDocs={totalDocsForSection}
						progressPercentage={progressPercentage}
						completedDocs={overallUploadedDocsCount}
						requiredPending={overallRequiredPendingDocsCount}
						sectionDescription={VEHICLE_STRUCTURE.description}
					/>

					<AccordionContent>
						{folders.length === 0 ? (
							<div className="text-muted-foreground py-2 text-center text-sm">
								No hay vehículos con documentación. Puede agregar documentos de vehículos utilizando
								la opción Subir Documento General para Vehículos.
							</div>
						) : (
							<div className="space-y-6 py-2">
								<Accordion type="multiple" className="space-y-4">
									{folders.map((folder) => {
										const isEditable = folder.status === ReviewStatus.DRAFT

										const totalDocumentsUploaded = folder.documents.filter(
											(doc: { url: string }) => doc.url !== ""
										).length

										return (
											<AccordionItem
												key={folder.id}
												value={folder.id}
												className="border-muted rounded-md border"
											>
												<AccordionTrigger className="cursor-pointer px-4 py-3 hover:no-underline">
													<div className="flex items-center">
														<div className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-500">
															<CarIcon className="h-4 w-4" />
														</div>

														<div className="flex flex-col">
															<span className="font-medium">
																{folder.vehicle.model}{" "}
																{folder.vehicle?.plate && `(${folder.vehicle.plate})`}
															</span>
															<span className="text-muted-foreground text-sm">
																{totalDocumentsUploaded} de {VEHICLE_STRUCTURE.documents.length}
																documentos agregados
															</span>
														</div>
													</div>
												</AccordionTrigger>

												<AccordionContent className="px-4 pt-0 pb-2">
													<DocumentList
														userId={userId}
														companyId={companyId}
														folderId={folder.id}
														isEditable={isEditable}
														isOtcMember={isOtcMember}
														documents={folder.documents}
														vehicleId={folder.vehicle.id}
														category={VEHICLE_STRUCTURE.category}
														documentsStructure={VEHICLE_STRUCTURE}
													/>
												</AccordionContent>
											</AccordionItem>
										)
									})}
								</Accordion>
							</div>
						)}
					</AccordionContent>
				</AccordionItem>
			</Accordion>

			{isOtcMember && foldersStatus === ReviewStatus.SUBMITTED && (
				<SendStartupFolderReview
					userId={userId}
					companyId={companyId}
					folderId={startupFolderId}
					title={VEHICLE_STRUCTURE.title}
					category={DocumentCategory.VEHICLES}
				/>
			)}

			{!isOtcMember && (
				<SubmitReviewRequestDialog
					userId={userId}
					folderType="VEHICLE"
					companyId={companyId}
					folderId={startupFolderId}
					folderName={VEHICLE_STRUCTURE.title}
					disabled={folders.some((folder) => folder.status !== ReviewStatus.DRAFT)}
				/>
			)}
		</div>
	)
}
