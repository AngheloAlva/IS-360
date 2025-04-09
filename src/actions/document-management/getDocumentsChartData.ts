"use server"

import { addDays } from "date-fns"

import prisma from "@/lib/prisma"
import { AreasValues } from "@/lib/consts/areas"
import { AREAS } from "@prisma/client"

export async function getDocumentsChartData() {
	// Get documents by area
	const areas = Object.values(AreasValues)

	const areaData = await Promise.all(
		areas.map(async (area) => {
			const count = await prisma.folder.findMany({
				where: { area, isActive: true },
				include: {
					_count: {
						select: { files: true },
					},
				},
			})

			const totalFiles = count.reduce((acc, folder) => acc + folder._count.files, 0)

			return {
				area,
				_count: { files: totalFiles },
			}
		})
	)

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
		}),
		// Expires after 90 days
		prisma.file.count({
			where: {
				isActive: true,
				expirationDate: {
					gte: next90Days,
				},
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
	})

	const areaColors: Record<keyof typeof AreasValues, string> = {
		OPERATIONS: "#2563eb",
		INSTRUCTIONS: "#60a5fa",
		INTEGRITY_AND_MAINTENANCE: "#10b981",
		ENVIRONMENT: "#84cc16",
		OPERATIONAL_SAFETY: "#eab308", // Añadido OPERATIONAL_SAFETY que faltaba
		QUALITY_AND_OPERATIONAL_EXCELLENCE: "#f59e0b",
		REGULATORY_COMPLIANCE: "#dc2626",
		LEGAL: "#8b5cf6",
		COMMUNITIES: "#ec4899",
		PROJECTS: "#6b7280", // Añadido PROJECTS que faltaba
	}

	const areaLabels: Record<keyof typeof AreasValues, string> = {
		OPERATIONS: "Operaciones",
		INSTRUCTIONS: "Instructivos",
		INTEGRITY_AND_MAINTENANCE: "Integridad y Mantención",
		ENVIRONMENT: "Medio Ambiente",
		OPERATIONAL_SAFETY: "Seguridad Operacional",
		QUALITY_AND_OPERATIONAL_EXCELLENCE: "Calidad y Excelencia Operacional",
		REGULATORY_COMPLIANCE: "Cumplimiento Normativo",
		LEGAL: "Jurídica",
		COMMUNITIES: "Comunidades",
		PROJECTS: "Proyectos", // Añadido PROJECTS que faltaba,
	}

	return {
		areaData: areaData.map((area: { area: AREAS; _count: { files: number } }) => ({
			name: areaLabels[area.area as keyof typeof AreasValues],
			value: area._count.files,
			fill: areaColors[area.area as keyof typeof AreasValues],
		})),
		expirationData: [
			{
				name: "Vencido",
				value: expirationData[0],
			},
			{
				name: "Vence esta semana",
				value: expirationData[1],
			},
			{
				name: "Vence en 8-15 días",
				value: expirationData[2],
			},
			{
				name: "Vence en 16-30 días",
				value: expirationData[3],
			},
			{
				name: "Vence en 31-60 días",
				value: expirationData[4],
			},
			{
				name: "Vence en 61-90 días",
				value: expirationData[5],
			},
			{
				name: "Vence después de 90 días",
				value: expirationData[6],
			},
		],
		responsibleData: responsibleData.map((user: { name: string; _count: { files: number } }) => ({
			name: user.name,
			value: user._count.files,
		})),
	}
}
