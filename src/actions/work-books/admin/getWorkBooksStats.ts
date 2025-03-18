"use server"

import prisma from "@/lib/prisma"

export async function getWorkBooksStats() {
	const [topCompanies, workTypes, workLocations] = (await Promise.all([
		prisma.$queryRaw`
			SELECT
				"contractingCompany" as name,
				COUNT(*) as books,
				ROUND(COUNT(*)::decimal / (SELECT COUNT(*) FROM work_book)::decimal * 100, 1) as percentage
			FROM work_book
			GROUP BY "contractingCompany"
			ORDER BY books DESC
			LIMIT 5
		`,
		prisma.$queryRaw`
			SELECT
				"workType" as name,
				COUNT(*) as books,
				ROUND(COUNT(*)::decimal / (SELECT COUNT(*) FROM work_book)::decimal * 100, 1) as percentage
			FROM work_book
			GROUP BY "workType"
			ORDER BY books DESC
			LIMIT 5
		`,
		prisma.$queryRaw`
			SELECT
				"workLocation" as name,
				COUNT(*) as books,
				ROUND(COUNT(*)::decimal / (SELECT COUNT(*) FROM work_book)::decimal * 100, 1) as percentage
			FROM work_book
			GROUP BY "workLocation"
			ORDER BY books DESC
			LIMIT 5
		`,
	])) as [
		{
			name: string
			books: number
			percentage: number
		}[],
		{
			name: string
			books: number
			percentage: number
		}[],
		{
			name: string
			books: number
			percentage: number
		}[],
	]

	return {
		topCompanies: topCompanies.map(
			(company: { name: string; books: number; percentage: number }) => ({
				name: company.name,
				books: Number(company.books),
				percentage: Number(company.percentage),
			})
		),
		workTypes: workTypes.map((type: { name: string; books: number; percentage: number }) => ({
			name: type.name,
			books: Number(type.books),
			percentage: Number(type.percentage),
		})),
		workLocations: workLocations.map(
			(location: { name: string; books: number; percentage: number }) => ({
				name: location.name,
				books: Number(location.books),
				percentage: Number(location.percentage),
			})
		),
	}
}
