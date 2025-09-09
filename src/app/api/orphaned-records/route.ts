import { NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"

interface OrphanedRecord {
	rut: string
	name: string
	company: string
	fecha: string
	vencimiento: string | null
	estado: string
	status: string
	originalRowNumber: number
	originalData: Record<string, unknown>
}

interface OrphanedRecordsData {
	metadata: {
		generatedAt: string
		totalRecords: number
		description: string
	}
	records: OrphanedRecord[]
}

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url)
		const page = parseInt(searchParams.get("page") || "1", 10)
		const limit = parseInt(searchParams.get("limit") || "10", 10)
		const search = searchParams.get("search") || ""

		// Buscar archivos de registros huérfanos en el directorio raíz del proyecto
		const projectRoot = process.cwd()
		const files = fs.readdirSync(projectRoot)

		// Buscar el archivo más reciente que contenga "orphaned-records"
		const orphanedFiles = files
			.filter((file) => file.includes("orphaned-records") && file.endsWith(".json"))
			.sort((a, b) => {
				const statA = fs.statSync(path.join(projectRoot, a))
				const statB = fs.statSync(path.join(projectRoot, b))
				return statB.mtime.getTime() - statA.mtime.getTime() // Más reciente primero
			})

		if (orphanedFiles.length === 0) {
			return NextResponse.json(
				{ error: "No se encontraron archivos de registros huérfanos" },
				{ status: 404 }
			)
		}

		// Leer el archivo más reciente
		const latestFile = orphanedFiles[0]
		const filePath = path.join(projectRoot, latestFile)
		const fileContent = fs.readFileSync(filePath, "utf8")
		const jsonData: OrphanedRecordsData = JSON.parse(fileContent)

		// Filtrar por búsqueda si se proporciona
		let filteredRecords = jsonData.records
		if (search) {
			const searchLower = search.toLowerCase()
			filteredRecords = jsonData.records.filter(
				(record) =>
					record.name?.toLowerCase().includes(searchLower) ||
					record.rut?.toLowerCase().includes(searchLower) ||
					record.company?.toLowerCase().includes(searchLower)
			)
		}

		// Calcular paginación
		const total = filteredRecords.length
		const totalPages = Math.ceil(total / limit)
		const offset = (page - 1) * limit
		const paginatedRecords = filteredRecords.slice(offset, offset + limit)

		return NextResponse.json({
			metadata: {
				...jsonData.metadata,
				totalRecords: jsonData.records.length,
				filteredRecords: total,
				currentPage: page,
				totalPages,
				limit,
				hasNextPage: page < totalPages,
				hasPreviousPage: page > 1,
			},
			records: paginatedRecords,
		})
	} catch (error) {
		console.error("[GET_ORPHANED_RECORDS]", error)
		return NextResponse.json({ error: "Error al leer los registros huérfanos" }, { status: 500 })
	}
}
