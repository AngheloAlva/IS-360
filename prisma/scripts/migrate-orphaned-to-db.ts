import dotenv from "dotenv"
dotenv.config({ path: ".env.local" })

import { SAFETY_TALK_STATUS } from "@/generated/prisma/enums"
import { PrismaClient } from "@/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import * as fs from "fs"
import path from "path"

const adapter = new PrismaPg({
	connectionString: process.env.DATABASE_URL,
})
const prisma = new PrismaClient({ adapter })

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

function normalizeRut(rut: string | null | undefined): string {
	if (!rut) return ""
	return rut.replace(/[\.\-\s]/g, "").toUpperCase()
}

function excelSerialToDate(serial: number | string | Date): Date {
	if (serial instanceof Date) {
		return serial
	}

	if (typeof serial === "string") {
		const parsedDate = new Date(serial)
		return isNaN(parsedDate.getTime()) ? new Date() : parsedDate
	}

	if (typeof serial === "number") {
		const excelEpoch = new Date(1900, 0, 1)
		const daysToAdd = serial >= 60 ? serial - 2 : serial - 1
		const resultDate = new Date(excelEpoch.getTime() + daysToAdd * 24 * 60 * 60 * 1000)
		return resultDate
	}

	return new Date()
}

function mapStatus(status: string): SAFETY_TALK_STATUS {
	const normalized = status.toUpperCase().trim()

	if (normalized === "PASSED" || normalized.includes("VIGENTE")) {
		return SAFETY_TALK_STATUS.PASSED
	}

	if (normalized === "FAILED" || normalized.includes("NO VIGENTE")) {
		return SAFETY_TALK_STATUS.FAILED
	}

	return SAFETY_TALK_STATUS.PENDING
}

function findLatestOrphanedFile(): string | null {
	const dataDir = path.join(process.cwd(), "public", "data")

	if (!fs.existsSync(dataDir)) {
		return null
	}

	const files = fs.readdirSync(dataDir)
	const orphanedFiles = files
		.filter((file) => file.includes("orphaned-records") && file.endsWith(".json"))
		.sort((a, b) => {
			const statA = fs.statSync(path.join(dataDir, a))
			const statB = fs.statSync(path.join(dataDir, b))
			return statB.mtime.getTime() - statA.mtime.getTime()
		})

	return orphanedFiles.length > 0 ? path.join(dataDir, orphanedFiles[0]) : null
}

async function migrateOrphanedRecords(dryRun: boolean): Promise<void> {
	const filePath = findLatestOrphanedFile()

	if (!filePath) {
		console.error("No se encontraron archivos de registros huérfanos en public/data/")
		process.exit(1)
	}

	console.log(`Leyendo archivo: ${filePath}`)
	const fileContent = fs.readFileSync(filePath, "utf8")
	const jsonData: OrphanedRecordsData = JSON.parse(fileContent)

	console.log(`Total de registros en archivo: ${jsonData.records.length}`)

	const records = jsonData.records.map((record) => {
		const sessionDate = excelSerialToDate(
			(record.originalData.FECHA as number | string | Date) || record.fecha
		)
		const expiresAt = record.vencimiento
			? excelSerialToDate(
					(record.originalData.Vencimiento as number | string | Date) || record.vencimiento
				)
			: null

		return {
			rut: normalizeRut(record.rut),
			name: record.name || "Sin nombre",
			company: record.company || "Sin empresa",
			sessionDate,
			expiresAt,
			status: mapStatus(record.status || record.estado),
			source: "IMPORT",
			notes: `Importado desde archivo huérfano. Fila original: ${record.originalRowNumber}. Estado original: ${record.estado}`,
		}
	})

	if (dryRun) {
		console.log("\n=== MODO DRY RUN ===")
		console.log(`Se migrarían ${records.length} registros`)
		console.log("\nPrimeros 5 registros:")
		records.slice(0, 5).forEach((record, i) => {
			console.log(
				`  ${i + 1}. ${record.name} (${record.rut}) - ${record.company} - ${record.status}`
			)
			console.log(`     Fecha: ${record.sessionDate.toISOString()}`)
			console.log(`     Vencimiento: ${record.expiresAt?.toISOString() || "N/A"}`)
		})

		const statusCounts = records.reduce(
			(acc, r) => {
				acc[r.status] = (acc[r.status] || 0) + 1
				return acc
			},
			{} as Record<string, number>
		)

		console.log("\nDistribución por estado:")
		Object.entries(statusCounts).forEach(([status, count]) => {
			console.log(`  ${status}: ${count}`)
		})

		return
	}

	console.log("\nInsertando registros en la base de datos...")

	try {
		const result = await prisma.inPersonSafetyTalkRecord.createMany({
			data: records,
			skipDuplicates: true,
		})

		console.log("\n=== RESUMEN ===")
		console.log(`Total en archivo: ${jsonData.records.length}`)
		console.log(`Migrados: ${result.count}`)
		console.log(`Omitidos (duplicados): ${jsonData.records.length - result.count}`)
	} catch (error) {
		console.error("Error durante la migración:", error)
		process.exit(1)
	} finally {
		await prisma.$disconnect()
	}
}

// NOTA: Después de ejecutar esta migración exitosamente, los archivos JSON
// en public/data/ (*-orphaned-records.json) se pueden eliminar manualmente,
// ya que los datos ahora viven en la tabla InPersonSafetyTalkRecord de la DB.

async function main() {
	const args = process.argv.slice(2)
	const dryRun = args.includes("--dry-run")

	if (dryRun) {
		console.log("Ejecutando en modo DRY RUN (no se realizarán cambios en la DB)\n")
	}

	await migrateOrphanedRecords(dryRun)
}

if (require.main === module) {
	main().catch(console.error)
}

export { migrateOrphanedRecords }
