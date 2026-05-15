"use server"

import { uploadCertificateToStartupFolders } from "./upload-certificate-to-startup-folders"
import { BasicDocumentType, WorkerDocumentType } from "@/generated/prisma/client"
import prisma from "@/lib/prisma"

interface RetroactiveUploadResult {
	success: boolean
	processed: number
	successful: number
	failed: number
	errors: Array<{ userId: string; userName: string; error: string }>
}

/**
 * Procesa evaluaciones IRL aprobadas que tengan carpetas de arranque
 * sin certificado IRL y sube únicamente los faltantes.
 *
 * Esta función es idempotente: puede ejecutarse múltiples veces sin
 * duplicar certificados ya cargados.
 */
export async function uploadAllApprovedIRLCertificates(): Promise<RetroactiveUploadResult> {
	try {
		// Buscar evaluaciones IRL aprobadas que aún tengan carpetas sin certificado
		const approvedIRLTalks = await prisma.userSafetyTalk.findMany({
			where: {
				category: "IRL",
				status: "PASSED",
				OR: [
					{
						user: {
							basicFolder: {
								some: {
									startupFolder: {
										isDeleted: false,
									},
									documents: {
										none: {
											type: BasicDocumentType.IRL_SAFETY_TALK,
										},
									},
								},
							},
						},
					},
					{
						user: {
							workerFolder: {
								some: {
									startupFolder: {
										isDeleted: false,
									},
									documents: {
										none: {
											type: WorkerDocumentType.IRL_SAFETY_TALK,
										},
									},
								},
							},
						},
					},
				],
			},
			include: {
				user: {
					select: {
						id: true,
						name: true,
						rut: true,
					},
				},
			},
			orderBy: {
				completedAt: "desc",
			},
		})

		console.log(
			`Found ${approvedIRLTalks.length} approved IRL evaluations with missing startup certificates`
		)

		const results: RetroactiveUploadResult = {
			success: true,
			processed: 0,
			successful: 0,
			failed: 0,
			errors: [],
		}

		// Procesar cada evaluación aprobada
		for (const safetyTalk of approvedIRLTalks) {
			results.processed++

			try {
				console.log(
					`Processing ${results.processed}/${approvedIRLTalks.length}: ${safetyTalk.user.name} (${safetyTalk.user.rut})`
				)

				const uploadResult = await uploadCertificateToStartupFolders(
					safetyTalk.id,
					safetyTalk.userId
				)

				if (uploadResult.success) {
					results.successful++
					console.log(
						`✓ Successfully uploaded certificate to ${uploadResult.uploadedToFolders?.basicFolders || 0} basic folders and ${uploadResult.uploadedToFolders?.workerFolders || 0} worker folders`
					)
				} else {
					results.failed++
					results.errors.push({
						userId: safetyTalk.userId,
						userName: safetyTalk.user.name,
						error: uploadResult.error || "Unknown error",
					})
					console.error(`✗ Failed: ${uploadResult.error}`)
				}
			} catch (error) {
				results.failed++
				const errorMessage = error instanceof Error ? error.message : "Unknown error"
				results.errors.push({
					userId: safetyTalk.userId,
					userName: safetyTalk.user.name,
					error: errorMessage,
				})
				console.error(`✗ Exception processing ${safetyTalk.user.name}:`, error)
			}

			// Pequeña pausa para no sobrecargar el servidor
			await new Promise((resolve) => setTimeout(resolve, 100))
		}

		console.log("\n=== RESUMEN ===")
		console.log(`Procesadas: ${results.processed}`)
		console.log(`Exitosas: ${results.successful}`)
		console.log(`Fallidas: ${results.failed}`)

		if (results.errors.length > 0) {
			console.log("\nErrores:")
			results.errors.forEach((err) => {
				console.log(`- ${err.userName} (${err.userId}): ${err.error}`)
			})
		}

		return results
	} catch (error) {
		console.error("Error in retroactive upload:", error)
		return {
			success: false,
			processed: 0,
			successful: 0,
			failed: 0,
			errors: [
				{
					userId: "N/A",
					userName: "N/A",
					error: error instanceof Error ? error.message : "Unknown error",
				},
			],
		}
	}
}
