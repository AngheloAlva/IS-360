import { type NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"

import { BASIC_FOLDER_STRUCTURE } from "@/lib/consts/basic-startup-folders-structure"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import {
	TECH_SPEC_STRUCTURE,
	ENVIRONMENT_STRUCTURE,
	ENVIRONMENTAL_STRUCTURE,
	SAFETY_AND_HEALTH_STRUCTURE,
	EXTENDED_ENVIRONMENT_STRUCTURE,
} from "@/lib/consts/startup-folders-structure"
import {
	BASE_WORKER_STRUCTURE,
	DRIVER_WORKER_STRUCTURE,
} from "@/lib/consts/worker-folder-structure"
import { VEHICLE_STRUCTURE } from "@/lib/consts/vehicle-folder-structure"

export async function GET(req: NextRequest): Promise<NextResponse> {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id) {
		return new NextResponse("No autorizado", { status: 401 })
	}

	try {
		const searchParams = req.nextUrl.searchParams
		const companyId = searchParams.get("companyId")
		const folderId = searchParams.get("folderId")

		if (!companyId && !folderId) {
			return new NextResponse("Either company ID or folder ID is required", { status: 400 })
		}

		const where: {
			companyId?: string
			id?: string
		} = {}
		if (companyId) where.companyId = companyId
		if (folderId) where.id = folderId

		const startupFolders = await prisma.startupFolder.findMany({
			where,
			include: {
				company: {
					select: {
						name: true,
						rut: true,
					},
				},
				basicFolders: {
					include: {
						documents: {
							select: {
								status: true,
							},
						},
					},
				},
				safetyAndHealthFolders: {
					include: {
						documents: {
							select: {
								status: true,
							},
						},
					},
				},
				environmentalFolders: {
					include: {
						documents: {
							select: {
								status: true,
							},
						},
					},
				},
				environmentFolders: {
					include: {
						documents: {
							select: {
								status: true,
							},
						},
					},
				},
				techSpecsFolders: {
					include: {
						documents: {
							select: {
								status: true,
							},
						},
					},
				},
				workersFolders: {
					where: {
						worker: {
							isActive: true,
						},
					},
					include: {
						documents: {
							select: {
								status: true,
							},
						},
					},
				},
				vehiclesFolders: {
					where: {
						vehicle: {
							isActive: true,
						},
					},
					include: {
						documents: {
							select: {
								status: true,
							},
						},
					},
				},
			},
			orderBy: {
				createdAt: "asc",
			},
		})

		if (!startupFolders) {
			return new NextResponse("General startup folder not found", { status: 404 })
		}
		const processedFolders = startupFolders.map((folder) => ({
			...folder,
			basicFolder: folder.basicFolders.map((basic) => ({
				...basic,
				totalDocuments: BASIC_FOLDER_STRUCTURE.documents.length,
				approvedDocuments: basic.documents.filter((doc) => doc.status === "APPROVED").length,
				rejectedDocuments: basic.documents.filter((doc) => doc.status === "REJECTED").length,
				submittedDocuments: basic.documents.filter((doc) => doc.status === "SUBMITTED").length,
				draftDocuments: basic.documents.filter((doc) => doc.status === "DRAFT").length,
				documents: undefined,
				isCompleted:
					basic.documents.length === BASIC_FOLDER_STRUCTURE.documents.length &&
					basic.documents?.every((doc) => doc.status === "APPROVED"),
			})),
			safetyAndHealthFolders: folder.safetyAndHealthFolders.map((shf) => ({
				...shf,
				totalDocuments: SAFETY_AND_HEALTH_STRUCTURE.documents.length,
				approvedDocuments: shf.documents.filter((doc) => doc.status === "APPROVED").length,
				rejectedDocuments: shf.documents.filter((doc) => doc.status === "REJECTED").length,
				submittedDocuments: shf.documents.filter((doc) => doc.status === "SUBMITTED").length,
				draftDocuments: shf.documents.filter((doc) => doc.status === "DRAFT").length,
				documents: undefined,
				isCompleted:
					shf.documents.length === SAFETY_AND_HEALTH_STRUCTURE.documents.length &&
					shf.documents?.every((doc) => doc.status === "APPROVED"),
			})),
			environmentalFolders: folder.environmentalFolders.map((ef) => ({
				...ef,
				totalDocuments: ENVIRONMENTAL_STRUCTURE.documents.length,
				approvedDocuments: ef.documents.filter((doc) => doc.status === "APPROVED").length,
				rejectedDocuments: ef.documents.filter((doc) => doc.status === "REJECTED").length,
				submittedDocuments: ef.documents.filter((doc) => doc.status === "SUBMITTED").length,
				draftDocuments: ef.documents.filter((doc) => doc.status === "DRAFT").length,
				documents: undefined,
				isCompleted:
					ef.documents.length === ENVIRONMENTAL_STRUCTURE.documents.length &&
					ef.documents?.every((doc) => doc.status === "APPROVED"),
			})),
			environmentFolders: folder.environmentFolders.map((ef) => ({
				...ef,
				totalDocuments: folder.moreMonthDuration
					? EXTENDED_ENVIRONMENT_STRUCTURE.documents.length
					: ENVIRONMENT_STRUCTURE.documents.length,
				approvedDocuments: ef.documents.filter((doc) => doc.status === "APPROVED").length,
				rejectedDocuments: ef.documents.filter((doc) => doc.status === "REJECTED").length,
				submittedDocuments: ef.documents.filter((doc) => doc.status === "SUBMITTED").length,
				draftDocuments: ef.documents.filter((doc) => doc.status === "DRAFT").length,
				documents: undefined,
				isCompleted:
					ef.documents.length === ENVIRONMENTAL_STRUCTURE.documents.length &&
					ef.documents?.every((doc) => doc.status === "APPROVED"),
			})),
			techSpecsFolders: folder.techSpecsFolders.map((tsf) => ({
				...tsf,
				totalDocuments: TECH_SPEC_STRUCTURE.documents.length,
				approvedDocuments: tsf.documents.filter((doc) => doc.status === "APPROVED").length,
				rejectedDocuments: tsf.documents.filter((doc) => doc.status === "REJECTED").length,
				submittedDocuments: tsf.documents.filter((doc) => doc.status === "SUBMITTED").length,
				draftDocuments: tsf.documents.filter((doc) => doc.status === "DRAFT").length,
				documents: undefined,
				isCompleted:
					tsf.documents.length === TECH_SPEC_STRUCTURE.documents.length &&
					tsf.documents?.every((doc) => doc.status === "APPROVED"),
			})),
			workersFolders: folder.workersFolders.map((wf) => ({
				...wf,
				totalDocuments: wf.isDriver
					? DRIVER_WORKER_STRUCTURE.documents.length
					: BASE_WORKER_STRUCTURE.documents.length,
				approvedDocuments: wf.documents.filter((doc) => doc.status === "APPROVED").length,
				rejectedDocuments: wf.documents.filter((doc) => doc.status === "REJECTED").length,
				submittedDocuments: wf.documents.filter((doc) => doc.status === "SUBMITTED").length,
				draftDocuments: wf.documents.filter((doc) => doc.status === "DRAFT").length,
				documents: undefined,
				isCompleted:
					wf.documents.length >=
						(wf.isDriver
							? DRIVER_WORKER_STRUCTURE.documents.length
							: BASE_WORKER_STRUCTURE.documents.length) &&
					wf.documents?.every((doc) => doc.status === "APPROVED"),
			})),
			vehiclesFolders: folder.vehiclesFolders.map((vf) => ({
				...vf,
				totalDocuments: VEHICLE_STRUCTURE.documents.length,
				approvedDocuments: vf.documents.filter((doc) => doc.status === "APPROVED").length,
				rejectedDocuments: vf.documents.filter((doc) => doc.status === "REJECTED").length,
				submittedDocuments: vf.documents.filter((doc) => doc.status === "SUBMITTED").length,
				draftDocuments: vf.documents.filter((doc) => doc.status === "DRAFT").length,
				documents: undefined,
				isCompleted:
					vf.documents.length >= VEHICLE_STRUCTURE.documents.length &&
					vf.documents?.every((doc) => doc.status === "APPROVED"),
			})),
		}))

		return NextResponse.json(processedFolders)
	} catch (error) {
		console.error("[GENERAL_STARTUP_FOLDER_GET]", error)
		return new NextResponse("Internal Error", { status: 500 })
	}
}
