"use server"

import { renderToBuffer } from "@react-pdf/renderer"

import { SafetyTalkCertificate } from "../utils/certificate-generator"
import { WorkerDocumentType } from "@/generated/prisma/enums"
import { uploadBufferToCloud } from "@/lib/upload-files"
import { logActivity } from "@/lib/activity/log"
import prisma from "@/lib/prisma"
import {
	MODULES,
	ACTIVITY_TYPE,
	DocumentCategory,
	BasicDocumentType,
} from "@/generated/prisma/enums"
import { SYSTEM_USER_ID } from "@/lib/consts/system-user"
import {
	autoApproveBasicFolderIfReady,
	autoApproveWorkerFolderIfReady,
} from "@/project/startup-folder/actions/auto-approve-folder"

interface UploadCertificateResult {
	success: boolean
	error?: string
	uploadedToFolders?: {
		basicFolders: number
		workerFolders: number
	}
}

export async function uploadCertificateToStartupFolders(
	userSafetyTalkId: string,
	userId: string
): Promise<UploadCertificateResult> {
	try {
		const userSafetyTalk = await prisma.userSafetyTalk.findUnique({
			where: { id: userSafetyTalkId },
			include: {
				user: {
					include: {
						company: true,
					},
				},
			},
		})

		if (!userSafetyTalk) {
			return {
				success: false,
				error: "Registro de charla no encontrado",
			}
		}

		if (userSafetyTalk.status !== "PASSED") {
			return {
				success: false,
				error: "La charla no ha sido aprobada",
			}
		}

		const [basicFolders, workerFolders] = await Promise.all([
			prisma.basicFolder.findMany({
				where: {
					workerId: userId,
					startupFolder: {
						isDeleted: false,
					},
				},
				include: {
					startupFolder: true,
					documents: {
						where: {
							type: BasicDocumentType.IRL_SAFETY_TALK,
						},
						select: {
							id: true,
						},
					},
				},
			}),
			prisma.workerFolder.findMany({
				where: {
					workerId: userId,
					startupFolder: {
						isDeleted: false,
					},
				},
				include: {
					startupFolder: true,
					documents: {
						where: {
							type: WorkerDocumentType.IRL_SAFETY_TALK,
						},
						select: {
							id: true,
						},
					},
				},
			}),
		])

		const basicFoldersWithoutCertificate = basicFolders.filter(
			(folder) => folder.documents.length === 0
		)
		const workerFoldersWithoutCertificate = workerFolders.filter(
			(folder) => folder.documents.length === 0
		)

		if (
			basicFoldersWithoutCertificate.length === 0 &&
			workerFoldersWithoutCertificate.length === 0
		) {
			return {
				success: true,
				uploadedToFolders: {
					basicFolders: 0,
					workerFolders: 0,
				},
			}
		}

		const pdfBuffer = await renderToBuffer(
			SafetyTalkCertificate({
				rut: userSafetyTalk.user.rut,
				name: userSafetyTalk.user.name,
				score: userSafetyTalk.score || 0,
				category: userSafetyTalk.category,
				expiresAt: userSafetyTalk.expiresAt || new Date(),
				completedAt: userSafetyTalk.completedAt || new Date(),
				companyName: userSafetyTalk.user.company?.name || "Oleoducto Trasandino Chile",
			})
		)

		const filename = `certificado-${userSafetyTalk.category}-${userSafetyTalk.user.rut}.pdf`
		const uploadResult = await uploadBufferToCloud({
			buffer: pdfBuffer,
			filename,
			contentType: "application/pdf",
			containerType: "startup",
		})

		const expirationDate = new Date()
		expirationDate.setFullYear(expirationDate.getFullYear() + 1)

		const documentName = "Charla de Inducción de Riesgos Laborales"

		const basicDocumentPromises = basicFoldersWithoutCertificate.map(async (folder) => {
			try {
				const existingDocument = await prisma.basicDocument.findFirst({
					where: {
						folderId: folder.id,
						type: "IRL_SAFETY_TALK",
					},
					orderBy: {
						uploadedAt: "desc",
					},
				})

				const document = existingDocument
					? await prisma.basicDocument.update({
							where: { id: existingDocument.id },
							data: {
								expirationDate,
								status: "APPROVED",
								name: documentName,
								url: uploadResult.url,
								reviewedAt: new Date(),
								reviewerId: SYSTEM_USER_ID,
								uploadedById: SYSTEM_USER_ID,
							},
						})
					: await prisma.basicDocument.create({
							data: {
								expirationDate,
								status: "APPROVED",
								name: documentName,
								folderId: folder.id,
								url: uploadResult.url,
								reviewedAt: new Date(),
								reviewerId: SYSTEM_USER_ID,
								uploadedById: SYSTEM_USER_ID,
								category: DocumentCategory.BASIC,
								type: "IRL_SAFETY_TALK" as BasicDocumentType,
							},
						})

				await logActivity({
					userId: SYSTEM_USER_ID,
					module: MODULES.STARTUP_FOLDERS,
					action: ACTIVITY_TYPE.UPLOAD,
					entityId: document.id,
					entityType: "BasicDocument",
					metadata: {
						documentName,
						documentType: "IRL_SAFETY_TALK",
						workerId: userId,
						startupFolderId: folder.startupFolderId,
						documentUrl: uploadResult.url,
						expirationDate: expirationDate.toISOString(),
						automatic: true,
						source: "safety_talk_certificate",
					},
				})

				return document
			} catch (error) {
				console.error(`Error creating BasicDocument for folder ${folder.id}:`, error)
				return null
			}
		})

		const workerDocumentPromises = workerFoldersWithoutCertificate.map(async (folder) => {
			try {
				const existingDocument = await prisma.workerDocument.findFirst({
					where: {
						folderId: folder.id,
						type: "IRL_SAFETY_TALK",
					},
					orderBy: {
						uploadedAt: "desc",
					},
				})

				const document = existingDocument
					? await prisma.workerDocument.update({
							where: { id: existingDocument.id },
							data: {
								expirationDate,
								status: "APPROVED",
								name: documentName,
								url: uploadResult.url,
								reviewedAt: new Date(),
								reviewerId: SYSTEM_USER_ID,
								uploadedById: SYSTEM_USER_ID,
							},
						})
					: await prisma.workerDocument.create({
							data: {
								expirationDate,
								status: "APPROVED",
								name: documentName,
								folderId: folder.id,
								url: uploadResult.url,
								reviewedAt: new Date(),
								reviewerId: SYSTEM_USER_ID,
								uploadedById: SYSTEM_USER_ID,
								category: DocumentCategory.PERSONNEL,
								type: "IRL_SAFETY_TALK" as WorkerDocumentType,
							},
						})

				await logActivity({
					userId: SYSTEM_USER_ID,
					module: MODULES.STARTUP_FOLDERS,
					action: ACTIVITY_TYPE.UPLOAD,
					entityId: document.id,
					entityType: "WorkerDocument",
					metadata: {
						documentName,
						documentType: "IRL_SAFETY_TALK",
						workerId: userId,
						startupFolderId: folder.startupFolderId,
						documentUrl: uploadResult.url,
						expirationDate: expirationDate.toISOString(),
						automatic: true,
						source: "safety_talk_certificate",
					},
				})

				return document
			} catch (error) {
				console.error(`Error creating WorkerDocument for folder ${folder.id}:`, error)
				return null
			}
		})

		const [basicDocuments, workerDocuments] = await Promise.all([
			Promise.all(basicDocumentPromises),
			Promise.all(workerDocumentPromises),
		])

		const successfulBasicUploads = basicDocuments.filter((doc) => doc !== null).length
		const successfulWorkerUploads = workerDocuments.filter((doc) => doc !== null).length

		console.log(
			`Certificate uploaded to ${successfulBasicUploads} basic folders and ${successfulWorkerUploads} worker folders for user ${userId}`
		)

		let autoApprovedBasicFolders = 0
		let autoApprovedWorkerFolders = 0

		for (const folder of basicFoldersWithoutCertificate) {
			try {
				const wasApproved = await autoApproveBasicFolderIfReady(userId, folder.startupFolderId)
				if (wasApproved) {
					autoApprovedBasicFolders++
				}
			} catch (error) {
				console.error(`Error auto-approving basic folder ${folder.id}:`, error)
			}
		}

		for (const folder of workerFoldersWithoutCertificate) {
			try {
				const wasApproved = await autoApproveWorkerFolderIfReady(userId, folder.startupFolderId)

				if (wasApproved) {
					autoApprovedWorkerFolders++
				}
			} catch (error) {
				console.error(`Error auto-approving worker folder ${folder.id}:`, error)
			}
		}

		if (autoApprovedBasicFolders > 0 || autoApprovedWorkerFolders > 0) {
			console.log(
				`Auto-approved ${autoApprovedBasicFolders} basic folders and ${autoApprovedWorkerFolders} worker folders`
			)
		}

		return {
			success: true,
			uploadedToFolders: {
				basicFolders: successfulBasicUploads,
				workerFolders: successfulWorkerUploads,
			},
		}
	} catch (error) {
		console.error("Error uploading certificate to startup folders:", error)
		return {
			success: false,
			error: error instanceof Error ? error.message : "Error desconocido al subir certificado",
		}
	}
}
