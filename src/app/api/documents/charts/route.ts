"use server"

import { addDays, format, subDays } from "date-fns"
import { NextResponse } from "next/server"
import { headers } from "next/headers"

import { type DocumentAreasValues, DocumentAreasValuesArray } from "@/lib/consts/areas"
import { DocumentExpirations } from "@/lib/consts/document-expirations"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

import type { AREAS } from "@prisma/client"

function formatFileType(mimeType: string): string {
	const typeMap: Record<string, string> = {
		// Documentos de Office
		"application/msword": "Word (.doc)",
		"application/vnd.openxmlformats-officedocument.wordprocessingml.document": "Word (.docx)",
		"application/vnd.ms-excel": "Excel (.xls)",
		"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "Excel (.xlsx)",
		"application/vnd.ms-powerpoint": "PowerPoint (.ppt)",
		"application/vnd.openxmlformats-officedocument.presentationml.presentation":
			"PowerPoint (.pptx)",

		// PDFs
		"application/pdf": "PDF",

		// Imágenes
		"image/jpeg": "JPEG",
		"image/jpg": "JPG",
		"image/png": "PNG",
		"image/gif": "GIF",
		"image/bmp": "BMP",
		"image/webp": "WebP",
		"image/svg+xml": "SVG",

		// Archivos comprimidos
		"application/zip": "ZIP",
		"application/x-zip-compressed": "ZIP",
		"application/x-rar-compressed": "RAR",
		"application/x-7z-compressed": "7Z",
		"application/gzip": "GZIP",

		// Texto
		"text/plain": "Texto (.txt)",
		"text/csv": "CSV",
		"text/html": "HTML",
		"text/css": "CSS",
		"text/javascript": "JavaScript",

		// Videos
		"video/mp4": "MP4",
		"video/avi": "AVI",
		"video/quicktime": "MOV",
		"video/x-msvideo": "AVI",

		// Audio
		"audio/mpeg": "MP3",
		"audio/wav": "WAV",
		"audio/ogg": "OGG",

		// Otros
		"application/json": "JSON",
		"application/xml": "XML",
		"application/octet-stream": "Archivo binario",
	}

	// Si el tipo está vacío o es null
	if (!mimeType || mimeType.trim() === "") {
		return "Sin tipo"
	}

	// Si existe en el mapa, devolver el nombre formateado
	if (typeMap[mimeType]) {
		return typeMap[mimeType]
	}

	// Si no existe, intentar extraer la extensión del tipo MIME
	if (mimeType.includes("/")) {
		const [category, subtype] = mimeType.split("/")

		// Formatear categorías conocidas
		switch (category) {
			case "image":
				return `Imagen (${subtype.toUpperCase()})`
			case "video":
				return `Video (${subtype.toUpperCase()})`
			case "audio":
				return `Audio (${subtype.toUpperCase()})`
			case "text":
				return `Texto (${subtype.toUpperCase()})`
			case "application":
				return `Aplicación (${subtype.toUpperCase()})`
			default:
				return `${category.charAt(0).toUpperCase() + category.slice(1)} (${subtype.toUpperCase()})`
		}
	}

	// Si no se puede formatear, devolver el tipo original
	return mimeType
}

export async function GET() {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id) {
		return new NextResponse("No autorizado", { status: 401 })
	}

	// Get documents by area
	const areas = DocumentAreasValuesArray

	const areaData = await Promise.all(
		areas.map(async (area) => {
			const count = await prisma.folder.findMany({
				where: { area, isActive: true, isExternal: false },
				include: {
					_count: {
						select: {
							files: {
								where: { isActive: true },
							},
						},
					},
				},
				cacheStrategy: {
					ttl: 120,
					swr: 10,
				},
			})

			const totalFiles = count.reduce((acc, folder) => acc + folder._count.files, 0)

			return {
				area,
				_count: { files: totalFiles },
			}
		})
	)

	// Get additional metrics
	const totalFolders = await // Total folders
	prisma.folder.count({
		where: { isActive: true, isExternal: false },
		cacheStrategy: { ttl: 120 },
	})

	// Get file type distribution
	const fileTypes = await prisma.file.groupBy({
		by: ["type"],
		where: { isActive: true },
		_count: { type: true },
		cacheStrategy: { ttl: 120 },
	})

	// Get monthly upload trends (last 6 months)
	const sixMonthsAgo = subDays(new Date(), 180)
	const monthlyUploads = await Promise.all(
		Array.from({ length: 6 }, (_, i) => {
			const startDate = addDays(sixMonthsAgo, i * 30)
			const endDate = addDays(startDate, 30)
			return prisma.file
				.count({
					where: {
						isActive: true,
						createdAt: {
							gte: startDate,
							lt: endDate,
						},
					},
					cacheStrategy: { ttl: 120 },
				})
				.then((count) => ({
					month: format(startDate, "MMM"),
					count,
				}))
		})
	)

	// Get top contributors (users with most uploads)
	const topContributors = await prisma.user.findMany({
		select: {
			name: true,
			_count: {
				select: {
					files: {
						where: { isActive: true },
					},
				},
			},
		},
		where: {
			files: {
				some: { isActive: true },
			},
		},
		orderBy: {
			files: {
				_count: "desc",
			},
		},
		take: 5,
		cacheStrategy: { ttl: 120 },
	})

	// Get documents by expiration
	const now = new Date()
	const nextWeek = addDays(now, 7)
	const next15Days = addDays(now, 15)
	const next30Days = addDays(now, 30)
	const next60Days = addDays(now, 60)
	const next90Days = addDays(now, 90)

	const expirationData = await Promise.all([
		// Expired
		prisma.file.count({
			where: {
				isActive: true,
				expirationDate: {
					lt: now,
				},
			},
			cacheStrategy: {
				ttl: 120,
				swr: 10,
			},
		}),
		// Expires this week
		prisma.file.count({
			where: {
				isActive: true,
				expirationDate: {
					gte: now,
					lt: nextWeek,
				},
			},
			cacheStrategy: {
				ttl: 120,
				swr: 10,
			},
		}),
		// Expires in 8-15 days
		prisma.file.count({
			where: {
				isActive: true,
				expirationDate: {
					gte: nextWeek,
					lt: next15Days,
				},
			},
			cacheStrategy: {
				ttl: 120,
				swr: 10,
			},
		}),
		// Expires in 16-30 days
		prisma.file.count({
			where: {
				isActive: true,
				expirationDate: {
					gte: next15Days,
					lt: next30Days,
				},
			},
			cacheStrategy: {
				ttl: 120,
				swr: 10,
			},
		}),
		// Expires in 31-60 days
		prisma.file.count({
			where: {
				isActive: true,
				expirationDate: {
					gte: next30Days,
					lt: next60Days,
				},
			},
			cacheStrategy: {
				ttl: 120,
				swr: 10,
			},
		}),
		// Expires in 61-90 days
		prisma.file.count({
			where: {
				isActive: true,
				expirationDate: {
					gte: next60Days,
					lt: next90Days,
				},
			},
			cacheStrategy: {
				ttl: 120,
				swr: 10,
			},
		}),
		// Expires after 90 days
		prisma.file.count({
			where: {
				isActive: true,
				expirationDate: {
					gte: next90Days,
				},
			},
			cacheStrategy: {
				ttl: 120,
				swr: 10,
			},
		}),
	])

	// Get documents by responsible
	const responsibleData = await prisma.user.findMany({
		select: {
			name: true,
			_count: {
				select: {
					files: true,
				},
			},
		},
		where: {
			files: {
				some: {},
			},
		},
		cacheStrategy: {
			ttl: 120,
			swr: 10,
		},
	})

	const areaColors: Record<keyof typeof DocumentAreasValues, string> = {
		OPERATIONS: "#2563eb",
		INSTRUCTIONS: "#60a5fa",
		INTEGRITY_AND_MAINTENANCE: "#10b981",
		ENVIRONMENT: "#84cc16",
		OPERATIONAL_SAFETY: "#eab308",
		DOCUMENTARY_LIBRARY: "#f59e0b",
		REGULATORY_COMPLIANCE: "#dc2626",
		LEGAL: "#8b5cf6",
		COMMUNITIES: "#ec4899",
		PROJECTS: "#6b7280",
	}

	const areaLabels: Record<keyof typeof DocumentAreasValues, string> = {
		OPERATIONS: "Operaciones",
		INSTRUCTIONS: "Instructivos",
		INTEGRITY_AND_MAINTENANCE: "Integridad y Mantención",
		ENVIRONMENT: "Medio Ambiente",
		OPERATIONAL_SAFETY: "Seguridad Operacional",
		DOCUMENTARY_LIBRARY: "Calidad y Excelencia Operacional",
		REGULATORY_COMPLIANCE: "Cumplimiento Normativo",
		LEGAL: "Jurídica",
		COMMUNITIES: "Comunidades",
		PROJECTS: "Proyectos",
	}

	// Get recent file changes
	const recentChanges = await prisma.fileHistory.findMany({
		take: 10,
		orderBy: {
			modifiedAt: "desc",
		},
		include: {
			file: true,
			modifiedBy: {
				select: {
					name: true,
					role: true,
					area: true,
				},
			},
		},
		cacheStrategy: {
			ttl: 120,
			swr: 10,
		},
	})

	// Get last 15 days for changes per day
	const last15Days = Array.from({ length: 15 }, (_, i) => {
		const date = subDays(new Date(), i)
		return format(date, "yyyy-MM-dd")
	}).reverse()

	const [activityByDay, changesPerDay] = await Promise.all([
		// Activity (files and folders created)
		Promise.all(
			last15Days.map(async (date) => {
				const [filesCount, foldersCount] = await Promise.all([
					// Files created on this day
					prisma.file.count({
						where: {
							createdAt: {
								gte: new Date(date),
								lt: addDays(new Date(date), 1),
							},
							isActive: true,
						},
						cacheStrategy: { ttl: 120 },
					}),
					// Folders created on this day
					prisma.folder.count({
						where: {
							createdAt: {
								gte: new Date(date),
								lt: addDays(new Date(date), 1),
							},
							isActive: true,
						},
						cacheStrategy: { ttl: 120 },
					}),
				])

				return {
					date,
					files: filesCount,
					folders: foldersCount,
				}
			})
		),
		// Changes per day (only last 15 days)
		Promise.all(
			last15Days.map(async (date) => {
				const count = await prisma.fileHistory.count({
					where: {
						modifiedAt: {
							gte: new Date(date),
							lt: addDays(new Date(date), 1),
						},
					},
					cacheStrategy: { ttl: 120 },
				})
				return { date, changes: count }
			})
		),
	])

	return NextResponse.json({
		areaData: areaData.map((area: { area: AREAS; _count: { files: number } }) => ({
			name: areaLabels[area.area as keyof typeof DocumentAreasValues],
			value: area._count.files,
			fill: areaColors[area.area as keyof typeof DocumentAreasValues],
		})),
		expirationData: [
			{
				id: DocumentExpirations[0].id,
				name: DocumentExpirations[0].name,
				value: expirationData[0],
			},
			{
				id: DocumentExpirations[1].id,
				name: DocumentExpirations[1].name,
				value: expirationData[1],
			},
			{
				id: DocumentExpirations[2].id,
				name: DocumentExpirations[2].name,
				value: expirationData[2],
			},
			{
				id: DocumentExpirations[3].id,
				name: DocumentExpirations[3].name,
				value: expirationData[3],
			},
			{
				id: DocumentExpirations[4].id,
				name: DocumentExpirations[4].name,
				value: expirationData[4],
			},
			{
				id: DocumentExpirations[5].id,
				name: DocumentExpirations[5].name,
				value: expirationData[5],
			},
			{
				id: DocumentExpirations[6].id,
				name: DocumentExpirations[6].name,
				value: expirationData[6],
			},
		],
		responsibleData: responsibleData.map((user: { name: string; _count: { files: number } }) => ({
			name: user.name,
			value: user._count.files,
		})),
		recentChanges: recentChanges.map((change) => ({
			id: change.id,
			fileName: change.file.name,
			previousName: change.previousName,
			modifiedBy: change.modifiedBy.name,
			modifiedAt: format(change.modifiedAt, "dd/MM/yyyy HH:mm"),
			reason: change.reason || "Sin razón especificada",
			userRole: change.modifiedBy.role,
			userArea: change.modifiedBy.area,
		})),
		activityByDay: activityByDay.map((day) => ({
			date: format(new Date(day.date), "dd/MM"),
			archivos: day.files,
			carpetas: day.folders,
		})),
		changesPerDay: changesPerDay.map((day) => ({
			date: format(new Date(day.date), "dd/MM"),
			cambios: day.changes,
		})),
		// New metrics
		metrics: {
			totalFolders,
		},
		fileTypes: fileTypes.map((type) => ({
			name: formatFileType(type.type),
			value: type._count.type,
		})),
		monthlyUploads,
		topContributors: topContributors.map((user) => ({
			name: user.name,
			value: user._count.files,
		})),
	})
}
