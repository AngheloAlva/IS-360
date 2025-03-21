"use server"

import { addDays } from "date-fns"

import prisma from "@/lib/prisma"

import { Area } from "@prisma/client"

export async function getDocumentsChartData() {
	// Get documents by area
	const areas = Object.values(Area)

	const areaData = await Promise.all(
		areas.map(async (area) => {
			const count = await prisma.folder.findMany({
				where: { area },
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
				expirationDate: {
					lt: now,
				},
			},
		}),
		// Expires this week
		prisma.file.count({
			where: {
				expirationDate: {
					gte: now,
					lt: nextWeek,
				},
			},
		}),
		// Expires in 8-15 days
		prisma.file.count({
			where: {
				expirationDate: {
					gte: nextWeek,
					lt: next15Days,
				},
			},
		}),
		// Expires in 16-30 days
		prisma.file.count({
			where: {
				expirationDate: {
					gte: next15Days,
					lt: next30Days,
				},
			},
		}),
		// Expires in 31-60 days
		prisma.file.count({
			where: {
				expirationDate: {
					gte: next30Days,
					lt: next60Days,
				},
			},
		}),
		// Expires in 61-90 days
		prisma.file.count({
			where: {
				expirationDate: {
					gte: next60Days,
					lt: next90Days,
				},
			},
		}),
		// Expires after 90 days
		prisma.file.count({
			where: {
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

	const areaColors = {
		OPERACIONES: "#2563eb",
		INSTRUCTIVOS: "#60a5fa",
		INTEGRIDAD_Y_MANTENCION: "#10b981",
		MEDIO_AMBIENTE: "#84cc16",
		PREVENCION_RIESGOS: "#eab308",
		CALIDAD_Y_EXCELENCIA_PROFESIONAL: "#f59e0b",
		HSEQ: "#dc2626",
		JURIDICA: "#8b5cf6",
		COMUNIDADES: "#ec4899",
	}

	const areaLabels = {
		OPERACIONES: "Operaciones",
		INSTRUCTIVOS: "Instructivos",
		INTEGRIDAD_Y_MANTENCION: "Integridad y Mantención",
		MEDIO_AMBIENTE: "Medio Ambiente",
		PREVENCION_RIESGOS: "Prevención de Riesgos",
		CALIDAD_Y_EXCELENCIA_PROFESIONAL: "Calidad y Excelencia Profesional",
		HSEQ: "HSEQ",
		JURIDICA: "Jurídica",
		COMUNIDADES: "Comunidades",
	}

	return {
		areaData: areaData.map((area: { area: Area; _count: { files: number } }) => ({
			name: areaLabels[area.area as keyof typeof areaLabels],
			value: area._count.files,
			fill: areaColors[area.area as keyof typeof areaColors],
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
