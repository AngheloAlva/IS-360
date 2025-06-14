"use server"

import prisma from "@/lib/prisma"

export async function getWorkPermitsStats() {
	const totalPermits = await prisma.workPermit.count()

	// Obtener las empresas más activas
	const companies = await prisma.$queryRaw<Array<{ name: string; count: number }>>`
		SELECT "company" as name, COUNT(*) as count
		FROM "work_permit"
		GROUP BY "company"
		ORDER BY count DESC
		LIMIT 5
	`

	// Obtener las áreas de trabajo más comunes
	const areas = await prisma.$queryRaw<Array<{ name: string; count: number }>>`
		SELECT "exactPlace" as name, COUNT(*) as count
		FROM "work_permit"
		GROUP BY "exactPlace"
		ORDER BY count DESC
		LIMIT 5
	`

	// Obtener los tipos de trabajo más comunes
	const types = await prisma.$queryRaw<Array<{ name: string; count: number }>>`
		SELECT "workWillBe" as name, COUNT(*) as count
		FROM "work_permit"
		GROUP BY "workWillBe"
		ORDER BY count DESC
		LIMIT 5
	`

	return {
		topCompanies: companies.map((company) => ({
			name: company.name,
			permits: Number(company.count),
			percentage: Math.round((Number(company.count) / totalPermits) * 100),
		})),
		workAreas: areas.map((area) => ({
			name: area.name,
			permits: Number(area.count),
			percentage: Math.round((Number(area.count) / totalPermits) * 100),
		})),
		workTypes: types.map((type) => ({
			name: type.name,
			permits: Number(type.count),
			percentage: Math.round((Number(type.count) / totalPermits) * 100),
		})),
	}
}
