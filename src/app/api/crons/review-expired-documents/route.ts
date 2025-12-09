import { NextResponse } from "next/server"

import { MODULES, ACTIVITY_TYPE, ACCESS_ROLE } from "@prisma/client"
import { logActivity } from "@/lib/activity/log"
import { resend } from "@/lib/resend"
import prisma from "@/lib/prisma"

import { ExpiredDocumentsEmail } from "@/project/startup-folder/components/emails/ExpiredDocumentsEmail"

type ExpiredDocument = {
	id: string
	name: string
	type: string
	category: string
	expirationDate: Date
	status: string
	folderId: string
	companyId: string
	companyName: string
}

type ExpiredDocumentsSummary = {
	companyId: string
	companyName: string
	companyRut: string
	totalExpiredDocuments: number
	expiredDocuments: ExpiredDocument[]
	adminEmails: string[]
}

export async function GET(): Promise<NextResponse> {
	try {
		const today = new Date()
		today.setHours(0, 0, 0, 0)

		const [
			basicDocs,
			safetyDocs,
			environmentalDocs,
			environmentDocs,
			techSpecsDocs,
			workerDocs,
			vehicleDocs,
		] = await Promise.all([
			prisma.basicDocument.findMany({
				where: {
					expirationDate: {
						not: null,
						lte: today,
					},
					status: {
						not: "EXPIRED",
					},
				},
				select: {
					id: true,
					name: true,
					type: true,
					status: true,
					expirationDate: true,
					folder: {
						select: {
							id: true,
							startupFolder: {
								select: {
									company: {
										select: {
											id: true,
											name: true,
											rut: true,
										},
									},
								},
							},
						},
					},
				},
			}),

			prisma.safetyAndHealthDocument.findMany({
				where: {
					expirationDate: {
						not: null,
						lte: today,
					},
					status: {
						not: "EXPIRED",
					},
				},
				select: {
					id: true,
					name: true,
					type: true,
					status: true,
					expirationDate: true,
					folder: {
						select: {
							id: true,
							startupFolder: {
								select: {
									company: {
										select: {
											id: true,
											name: true,
											rut: true,
										},
									},
								},
							},
						},
					},
				},
			}),

			prisma.environmentalDocument.findMany({
				where: {
					expirationDate: {
						not: null,
						lte: today,
					},
					status: {
						not: "EXPIRED",
					},
				},
				select: {
					id: true,
					name: true,
					type: true,
					status: true,
					expirationDate: true,
					folder: {
						select: {
							id: true,
							startupFolder: {
								select: {
									company: {
										select: {
											id: true,
											name: true,
											rut: true,
										},
									},
								},
							},
						},
					},
				},
			}),

			prisma.environmentDocument.findMany({
				where: {
					expirationDate: {
						not: null,
						lte: today,
					},
					status: {
						not: "EXPIRED",
					},
				},
				select: {
					id: true,
					name: true,
					type: true,
					status: true,
					expirationDate: true,
					folder: {
						select: {
							id: true,
							startupFolder: {
								select: {
									company: {
										select: {
											id: true,
											name: true,
											rut: true,
										},
									},
								},
							},
						},
					},
				},
			}),

			prisma.techSpecsDocument.findMany({
				where: {
					expirationDate: {
						not: null,
						lte: today,
					},
					status: {
						not: "EXPIRED",
					},
				},
				select: {
					id: true,
					name: true,
					type: true,
					status: true,
					expirationDate: true,
					folder: {
						select: {
							id: true,
							startupFolder: {
								select: {
									company: {
										select: {
											id: true,
											name: true,
											rut: true,
										},
									},
								},
							},
						},
					},
				},
			}),

			prisma.workerDocument.findMany({
				where: {
					expirationDate: {
						not: null,
						lte: today,
					},
					status: {
						not: "EXPIRED",
					},
					folder: {
						worker: {
							isActive: true,
						},
					},
				},
				select: {
					id: true,
					name: true,
					type: true,
					status: true,
					expirationDate: true,
					folder: {
						select: {
							id: true,
							startupFolder: {
								select: {
									company: {
										select: {
											id: true,
											name: true,
											rut: true,
										},
									},
								},
							},
						},
					},
				},
			}),

			prisma.vehicleDocument.findMany({
				where: {
					expirationDate: {
						not: null,
						lte: today,
					},
					status: {
						not: "EXPIRED",
					},
					folder: {
						vehicle: {
							isActive: true,
						},
					},
				},
				select: {
					id: true,
					name: true,
					type: true,
					status: true,
					expirationDate: true,
					folder: {
						select: {
							id: true,
							startupFolder: {
								select: {
									company: {
										select: {
											id: true,
											name: true,
											rut: true,
										},
									},
								},
							},
						},
					},
				},
			}),
		])

		const allExpiredDocuments: ExpiredDocument[] = [
			...basicDocs.map((doc) => ({
				id: doc.id,
				name: doc.name,
				type: doc.type,
				category: "BASIC",
				expirationDate: doc.expirationDate!,
				status: doc.status,
				folderId: doc.folder.id,
				companyId: doc.folder.startupFolder.company.id,
				companyName: doc.folder.startupFolder.company.name,
			})),
			...safetyDocs.map((doc) => ({
				id: doc.id,
				name: doc.name,
				type: doc.type,
				category: "SAFETY_AND_HEALTH",
				expirationDate: doc.expirationDate!,
				status: doc.status,
				folderId: doc.folder.id,
				companyId: doc.folder.startupFolder.company.id,
				companyName: doc.folder.startupFolder.company.name,
			})),
			...environmentalDocs.map((doc) => ({
				id: doc.id,
				name: doc.name,
				type: doc.type,
				category: "ENVIRONMENTAL",
				expirationDate: doc.expirationDate!,
				status: doc.status,
				folderId: doc.folder.id,
				companyId: doc.folder.startupFolder.company.id,
				companyName: doc.folder.startupFolder.company.name,
			})),
			...environmentDocs.map((doc) => ({
				id: doc.id,
				name: doc.name,
				type: doc.type,
				category: "ENVIRONMENT",
				expirationDate: doc.expirationDate!,
				status: doc.status,
				folderId: doc.folder.id,
				companyId: doc.folder.startupFolder.company.id,
				companyName: doc.folder.startupFolder.company.name,
			})),
			...techSpecsDocs.map((doc) => ({
				id: doc.id,
				name: doc.name,
				type: doc.type,
				category: "TECHNICAL_SPECS",
				expirationDate: doc.expirationDate!,
				status: doc.status,
				folderId: doc.folder.id,
				companyId: doc.folder.startupFolder.company.id,
				companyName: doc.folder.startupFolder.company.name,
			})),
			...workerDocs.map((doc) => ({
				id: doc.id,
				name: doc.name,
				type: doc.type,
				category: "PERSONNEL",
				expirationDate: doc.expirationDate!,
				status: doc.status,
				folderId: doc.folder.id,
				companyId: doc.folder.startupFolder.company.id,
				companyName: doc.folder.startupFolder.company.name,
			})),
			...vehicleDocs.map((doc) => ({
				id: doc.id,
				name: doc.name,
				type: doc.type,
				category: "VEHICLES",
				expirationDate: doc.expirationDate!,
				status: doc.status,
				folderId: doc.folder.id,
				companyId: doc.folder.startupFolder.company.id,
				companyName: doc.folder.startupFolder.company.name,
			})),
		]

		if (allExpiredDocuments.length === 0) {
			console.log("[CRON_EXPIRED_DOCUMENTS] No expired documents found")
			return NextResponse.json({
				message: "No expired documents found",
				processedDocuments: 0,
			})
		}

		const updatePromises = []
		const documentsByCategory = {
			BASIC: allExpiredDocuments.filter((doc) => doc.category === "BASIC").map((doc) => doc.id),
			SAFETY_AND_HEALTH: allExpiredDocuments
				.filter((doc) => doc.category === "SAFETY_AND_HEALTH")
				.map((doc) => doc.id),
			ENVIRONMENTAL: allExpiredDocuments
				.filter((doc) => doc.category === "ENVIRONMENTAL")
				.map((doc) => doc.id),
			ENVIRONMENT: allExpiredDocuments
				.filter((doc) => doc.category === "ENVIRONMENT")
				.map((doc) => doc.id),
			TECHNICAL_SPECS: allExpiredDocuments
				.filter((doc) => doc.category === "TECHNICAL_SPECS")
				.map((doc) => doc.id),
			PERSONNEL: allExpiredDocuments
				.filter((doc) => doc.category === "PERSONNEL")
				.map((doc) => doc.id),
			VEHICLES: allExpiredDocuments
				.filter((doc) => doc.category === "VEHICLES")
				.map((doc) => doc.id),
		}

		if (documentsByCategory.BASIC.length > 0) {
			updatePromises.push(
				prisma.basicDocument.updateMany({
					where: { id: { in: documentsByCategory.BASIC } },
					data: { status: "EXPIRED" },
				})
			)
		}

		if (documentsByCategory.SAFETY_AND_HEALTH.length > 0) {
			updatePromises.push(
				prisma.safetyAndHealthDocument.updateMany({
					where: { id: { in: documentsByCategory.SAFETY_AND_HEALTH } },
					data: { status: "EXPIRED" },
				})
			)
		}

		if (documentsByCategory.ENVIRONMENTAL.length > 0) {
			updatePromises.push(
				prisma.environmentalDocument.updateMany({
					where: { id: { in: documentsByCategory.ENVIRONMENTAL } },
					data: { status: "EXPIRED" },
				})
			)
		}

		if (documentsByCategory.ENVIRONMENT.length > 0) {
			updatePromises.push(
				prisma.environmentDocument.updateMany({
					where: { id: { in: documentsByCategory.ENVIRONMENT } },
					data: { status: "EXPIRED" },
				})
			)
		}

		if (documentsByCategory.TECHNICAL_SPECS.length > 0) {
			updatePromises.push(
				prisma.techSpecsDocument.updateMany({
					where: { id: { in: documentsByCategory.TECHNICAL_SPECS } },
					data: { status: "EXPIRED" },
				})
			)
		}

		if (documentsByCategory.PERSONNEL.length > 0) {
			updatePromises.push(
				prisma.workerDocument.updateMany({
					where: { id: { in: documentsByCategory.PERSONNEL } },
					data: { status: "EXPIRED" },
				})
			)
		}

		if (documentsByCategory.VEHICLES.length > 0) {
			updatePromises.push(
				prisma.vehicleDocument.updateMany({
					where: { id: { in: documentsByCategory.VEHICLES } },
					data: { status: "EXPIRED" },
				})
			)
		}

		await Promise.all(updatePromises)

		const folderUpdatePromises = []

		const foldersByCategory = {
			BASIC: new Set<string>(),
			SAFETY_AND_HEALTH: new Set<string>(),
			ENVIRONMENTAL: new Set<string>(),
			ENVIRONMENT: new Set<string>(),
			TECHNICAL_SPECS: new Set<string>(),
			PERSONNEL: new Set<string>(),
			VEHICLES: new Set<string>(),
		}

		for (const doc of allExpiredDocuments) {
			foldersByCategory[doc.category as keyof typeof foldersByCategory].add(doc.folderId)
		}

		if (foldersByCategory.BASIC.size > 0) {
			folderUpdatePromises.push(
				prisma.basicFolder.updateMany({
					where: {
						id: { in: Array.from(foldersByCategory.BASIC) },
						status: { not: "EXPIRED" },
					},
					data: { status: "EXPIRED" },
				})
			)
		}

		if (foldersByCategory.SAFETY_AND_HEALTH.size > 0) {
			folderUpdatePromises.push(
				prisma.safetyAndHealthFolder.updateMany({
					where: {
						id: { in: Array.from(foldersByCategory.SAFETY_AND_HEALTH) },
						status: { not: "EXPIRED" },
					},
					data: { status: "EXPIRED" },
				})
			)
		}

		if (foldersByCategory.ENVIRONMENTAL.size > 0) {
			folderUpdatePromises.push(
				prisma.environmentalFolder.updateMany({
					where: {
						id: { in: Array.from(foldersByCategory.ENVIRONMENTAL) },
						status: { not: "EXPIRED" },
					},
					data: { status: "EXPIRED" },
				})
			)
		}

		if (foldersByCategory.ENVIRONMENT.size > 0) {
			folderUpdatePromises.push(
				prisma.environmentFolder.updateMany({
					where: {
						id: { in: Array.from(foldersByCategory.ENVIRONMENT) },
						status: { not: "EXPIRED" },
					},
					data: { status: "EXPIRED" },
				})
			)
		}

		if (foldersByCategory.TECHNICAL_SPECS.size > 0) {
			folderUpdatePromises.push(
				prisma.techSpecsFolder.updateMany({
					where: {
						id: { in: Array.from(foldersByCategory.TECHNICAL_SPECS) },
						status: { not: "EXPIRED" },
					},
					data: { status: "EXPIRED" },
				})
			)
		}

		if (foldersByCategory.PERSONNEL.size > 0) {
			folderUpdatePromises.push(
				prisma.workerFolder.updateMany({
					where: {
						id: { in: Array.from(foldersByCategory.PERSONNEL) },
						status: { not: "EXPIRED" },
					},
					data: { status: "EXPIRED" },
				})
			)
		}

		if (foldersByCategory.VEHICLES.size > 0) {
			folderUpdatePromises.push(
				prisma.vehicleFolder.updateMany({
					where: {
						id: { in: Array.from(foldersByCategory.VEHICLES) },
						status: { not: "EXPIRED" },
					},
					data: { status: "EXPIRED" },
				})
			)
		}

		// Execute all folder updates
		await Promise.all(folderUpdatePromises)

		const companiesMap = new Map<string, ExpiredDocumentsSummary>()

		for (const doc of allExpiredDocuments) {
			if (!companiesMap.has(doc.companyId)) {
				const companyAdmins = await prisma.user.findMany({
					where: {
						companyId: doc.companyId,
						accessRole: ACCESS_ROLE.ADMIN,
						isActive: true,
					},
					select: {
						email: true,
					},
				})

				companiesMap.set(doc.companyId, {
					companyId: doc.companyId,
					companyName: doc.companyName,
					companyRut: "",
					totalExpiredDocuments: 0,
					expiredDocuments: [],
					adminEmails: companyAdmins.map((admin) => admin.email),
				})
			}

			const companySummary = companiesMap.get(doc.companyId)!
			companySummary.totalExpiredDocuments++
			companySummary.expiredDocuments.push(doc)
		}

		const systemUser = await prisma.user.findFirst({
			where: {
				accessRole: ACCESS_ROLE.ADMIN,
			},
			select: {
				id: true,
			},
		})

		if (systemUser) {
			await logActivity({
				userId: systemUser.id,
				module: MODULES.DOCUMENTATION,
				action: ACTIVITY_TYPE.UPDATE,
				entityType: "ExpiredDocuments",
				entityId: "cron-job",
				metadata: {
					totalExpiredDocuments: allExpiredDocuments.length,
					companiesAffected: companiesMap.size,
					categoriesAffected: Object.keys(documentsByCategory).filter(
						(category) =>
							documentsByCategory[category as keyof typeof documentsByCategory].length > 0
					),
					executionDate: today.toISOString(),
				},
			})
		}

		const emailPromises = []
		const otcInternalEmail = "anghelo.alva@ingenieriasimple.cl"

		for (const company of companiesMap.values()) {
			const companySupervisors = await prisma.user.findMany({
				where: {
					companyId: company.companyId,
					isSupervisor: true,
					isActive: true,
				},
				select: {
					email: true,
				},
			})

			const supervisorEmails = companySupervisors.map((supervisor) => supervisor.email)

			const categorySummary = company.expiredDocuments.reduce(
				(acc, doc) => {
					acc[doc.category] = (acc[doc.category] || 0) + 1
					return acc
				},
				{} as Record<string, number>
			)

			if (supervisorEmails.length > 0) {
				emailPromises.push(
					resend.emails.send({
						from: "anghelo.alva@ingenieriasimple.cl",
						to: supervisorEmails,
						subject: `🚨 Alerta: Documentos Vencidos - ${company.companyName}`,
						react: ExpiredDocumentsEmail({
							companyName: company.companyName,
							expiredDocuments: company.expiredDocuments,
							totalExpiredDocuments: company.totalExpiredDocuments,
							categorySummary,
							isInternal: false,
						}),
					})
				)
			}

			emailPromises.push(
				resend.emails.send({
					from: "anghelo.alva@ingenieriasimple.cl",
					to: [otcInternalEmail],
					subject: `Documentos Vencidos - ${company.companyName}`,
					react: ExpiredDocumentsEmail({
						companyName: company.companyName,
						expiredDocuments: company.expiredDocuments,
						totalExpiredDocuments: company.totalExpiredDocuments,
						categorySummary,
						isInternal: true,
					}),
				})
			)
		}

		return NextResponse.json({
			message: "Expired documents review completed successfully",
		})
	} catch (error) {
		console.error("[CRON_EXPIRED_DOCUMENTS_ERROR]", error)
		return new NextResponse("Internal Error", { status: 500 })
	}
}
