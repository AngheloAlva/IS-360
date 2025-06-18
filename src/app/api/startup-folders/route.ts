import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(req: NextRequest) {
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
			safetyAndHealthFolders: folder.safetyAndHealthFolders.map((shf) => ({
				...shf,
				totalDocuments: shf.documents.length,
				approvedDocuments: shf.documents.filter((doc) => doc.status === "APPROVED").length,
				rejectedDocuments: shf.documents.filter((doc) => doc.status === "REJECTED").length,
				submittedDocuments: shf.documents.filter((doc) => doc.status === "SUBMITTED").length,
				draftDocuments: shf.documents.filter((doc) => doc.status === "DRAFT").length,
				documents: undefined,
			})),
			environmentalFolders: folder.environmentalFolders.map((ef) => ({
				...ef,
				totalDocuments: ef.documents.length,
				approvedDocuments: ef.documents.filter((doc) => doc.status === "APPROVED").length,
				rejectedDocuments: ef.documents.filter((doc) => doc.status === "REJECTED").length,
				submittedDocuments: ef.documents.filter((doc) => doc.status === "SUBMITTED").length,
				draftDocuments: ef.documents.filter((doc) => doc.status === "DRAFT").length,
				documents: undefined,
			})),
			workersFolders: folder.workersFolders.map((wf) => ({
				...wf,
				totalDocuments: wf.documents.length,
				approvedDocuments: wf.documents.filter((doc) => doc.status === "APPROVED").length,
				rejectedDocuments: wf.documents.filter((doc) => doc.status === "REJECTED").length,
				submittedDocuments: wf.documents.filter((doc) => doc.status === "SUBMITTED").length,
				draftDocuments: wf.documents.filter((doc) => doc.status === "DRAFT").length,
				documents: undefined,
			})),
			vehiclesFolders: folder.vehiclesFolders.map((vf) => ({
				...vf,
				totalDocuments: vf.documents.length,
				approvedDocuments: vf.documents.filter((doc) => doc.status === "APPROVED").length,
				rejectedDocuments: vf.documents.filter((doc) => doc.status === "REJECTED").length,
				submittedDocuments: vf.documents.filter((doc) => doc.status === "SUBMITTED").length,
				draftDocuments: vf.documents.filter((doc) => doc.status === "DRAFT").length,
				documents: undefined,
			})),
		}))

		return NextResponse.json(processedFolders)
	} catch (error) {
		console.error("[GENERAL_STARTUP_FOLDER_GET]", error)
		return new NextResponse("Internal Error", { status: 500 })
	}
}
