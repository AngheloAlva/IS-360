import { CarIcon, CheckCircle2, Clock, ExternalLink } from "lucide-react"

import { VEHICLE_STRUCTURE } from "@/lib/consts/startup-folders-structure"
import { DocumentCategory, ReviewStatus } from "@prisma/client"
import { getDocumentStatus } from "@/lib/get-document-status"
import { cn } from "@/lib/utils"

import { StartupFolderStatusBadge } from "@/components/ui/startup-folder-status-badge"
import { UploadStartupFolderDocumentForm } from "../UploadStartupFolderDocumentForm"
import { SubmitReviewRequestDialog } from "../SubmitReviewRequestDialog"
import StartupFolderTrigger from "./StartupFolderTrigger"
import { Button } from "@/components/ui/button"
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
			const { isUploaded, isRequired } = getDocumentStatus(
				VEHICLE_STRUCTURE.category as DocumentCategory,
				docStruct.type,
				folder.documents
			)

			if (isUploaded) overallUploadedDocsCount++
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
						userId={userId}
						icon={<CarIcon />}
						companyId={companyId}
						status={foldersStatus}
						isOtcMember={isOtcMember}
						folderId={startupFolderId}
						title={VEHICLE_STRUCTURE.title}
						totalDocs={totalDocsForSection}
						category={DocumentCategory.VEHICLES}
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
													<div className="flex w-full items-center justify-between">
														<div className="flex items-center">
															<div className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-500">
																<CarIcon className="h-4 w-4" />
															</div>

															<div className="flex flex-col">
																<span className="font-medium">
																	{folder.vehicle.model} ({folder.vehicle.plate})
																</span>
																<span className="text-muted-foreground text-sm">
																	{totalDocumentsUploaded} de {VEHICLE_STRUCTURE.documents.length}
																	documentos agregados
																</span>
															</div>
														</div>
													</div>
												</AccordionTrigger>

												<AccordionContent>
													<div className="space-y-4 p-4">
														{VEHICLE_STRUCTURE.documents.map((docStruct) => {
															const { document, isUploaded, status } = getDocumentStatus(
																VEHICLE_STRUCTURE.category,
																docStruct.type,
																folder.documents
															)

															return (
																<div
																	key={docStruct.type}
																	className="flex items-center justify-between rounded-lg border p-4"
																>
																	<div className="flex items-center gap-3">
																		<div
																			className={cn(
																				"flex h-8 w-8 items-center justify-center rounded-full",
																				isUploaded
																					? "bg-green-100 text-green-600"
																					: "bg-gray-100 text-gray-400"
																			)}
																		>
																			{isUploaded ? (
																				<CheckCircle2 className="h-4 w-4" />
																			) : (
																				<Clock className="h-4 w-4" />
																			)}
																		</div>
																		<div>
																			<h4 className="font-medium">{docStruct.name}</h4>
																		</div>
																	</div>
																	<div className="flex items-center gap-2">
																		{document &&
																			(isUploaded ? (
																				<>
																					<span
																						className={cn(
																							"rounded-full px-2 py-1 text-xs font-medium",
																							status === "APPROVED" &&
																								"bg-green-100 text-green-800",
																							status === "REJECTED" && "bg-red-100 text-red-800",
																							status === "DRAFT" && "bg-yellow-100 text-yellow-800"
																						)}
																					>
																						<StartupFolderStatusBadge status={status} />
																					</span>
																					<Button variant="ghost" size="icon" asChild>
																						<a
																							href={document.url}
																							target="_blank"
																							rel="noopener noreferrer"
																							className="text-blue-600 hover:text-blue-800"
																						>
																							<ExternalLink className="h-4 w-4" />
																						</a>
																					</Button>
																				</>
																			) : (
																				<UploadStartupFolderDocumentForm
																					userId={userId}
																					isUpdate={false}
																					folderId={folder.id}
																					companyId={companyId}
																					type={docStruct.type}
																					documentId={document.id}
																					vehicleId={folder.vehicle.id}
																					documentName={docStruct.name}
																					category={VEHICLE_STRUCTURE.category}
																				/>
																			))}
																	</div>
																</div>
															)
														})}
													</div>
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

			{!isOtcMember && (
				<SubmitReviewRequestDialog
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
