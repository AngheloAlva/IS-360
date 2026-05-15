import { SAFETY_TALK_CATEGORY, SAFETY_TALK_STATUS } from "@/generated/prisma/enums"
import * as XLSX from "xlsx"
import * as fs from "fs"

import prisma from "@/lib/prisma"

interface ExcelRow {
	"RUT": string
	"FECHA": string | Date
	"Vencimiento": string | Date
	"Estado": string
	"Tipo de Inducción": string
	"NOMBRE"?: string
	"EMPRESA"?: string
}

interface ImportResult {
	success: number
	errors: Array<{
		row: number
		data: ExcelRow
		error: string
	}>
	warnings: Array<{
		row: number
		data: ExcelRow
		message: string
	}>
	orphanedRecords: Array<{
		row: number
		data: ExcelRow
		processedData: {
			rut: string
			name: string
			company: string
			fecha: Date
			vencimiento: Date | null
			estado: string
			status: string
		}
	}>
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

async function clearExistingSafetyTalks(): Promise<void> {
	console.log("Eliminando charlas de seguridad existentes...")

	await prisma.safetyTalkAttempt.deleteMany({})
	console.log("- SafetyTalkAttempts eliminados")

	await prisma.userSafetyTalk.deleteMany({})
	console.log("- UserSafetyTalks eliminados")

	console.log("Todas las charlas existentes han sido eliminadas.\n")
}

function mapStateToStatus(estado: string): SAFETY_TALK_STATUS {
	const normalizedEstado = estado.toLowerCase().trim()

	if (normalizedEstado.includes("vigente")) {
		return SAFETY_TALK_STATUS.PASSED
	}

	if (normalizedEstado.includes("no vigente")) {
		return SAFETY_TALK_STATUS.FAILED
	}

	return SAFETY_TALK_STATUS.PENDING
}

async function findUserByRUT(
	rut: string
): Promise<{ id: string; name: string; companyId: string | null } | null> {
	const normalizedRUT = rut

	const user = await prisma.user.findUnique({
		where: { rut: normalizedRUT },
		select: { id: true, name: true, companyId: true },
	})

	return user
}

async function processRow(row: ExcelRow): Promise<{
	success: boolean
	error?: string
	orphaned?: boolean
	orphanedData?: {
		rut: string
		name: string
		company: string
		fecha: Date
		vencimiento: Date | null
		estado: string
		status: string
	}
}> {
	try {
		if (!row.RUT) {
			return {
				success: false,
				error: "Datos requeridos faltantes (RUT)",
			}
		}

		const completedAt = row.FECHA ? excelSerialToDate(row.FECHA) : new Date()
		const expiresAt = row.Vencimiento ? excelSerialToDate(row.Vencimiento) : null
		const status = mapStateToStatus(row.Estado || "pending")

		const user = await findUserByRUT(row.RUT)
		if (!user) {
			return {
				success: false,
				orphaned: true,
				orphanedData: {
					rut: row.RUT,
					name: row.NOMBRE || "Sin nombre",
					company: row.EMPRESA || "Sin empresa",
					fecha: completedAt,
					vencimiento: expiresAt,
					estado: row.Estado || "pending",
					status: status,
				},
			}
		}

		const category = SAFETY_TALK_CATEGORY.VISITOR

		let userSafetyTalk = await prisma.userSafetyTalk.findFirst({
			where: {
				userId: user.id,
				category: category,
			},
		})

		if (!userSafetyTalk) {
			userSafetyTalk = await prisma.userSafetyTalk.create({
				data: {
					userId: user.id,
					category: category,
					status: status,
					currentAttempts: status === SAFETY_TALK_STATUS.PASSED ? 1 : 0,
					startedAt: completedAt,
					lastAttemptAt: completedAt,
					completedAt: status === SAFETY_TALK_STATUS.PASSED ? completedAt : null,
					expiresAt: expiresAt,
					score: status === "PASSED" ? 85.0 : null,
					manuallyApproved: status === "MANUALLY_APPROVED",
					inPersonSessionDate: completedAt,
				},
			})
		} else {
			await prisma.userSafetyTalk.update({
				where: { id: userSafetyTalk.id },
				data: {
					status: status,
					lastAttemptAt: completedAt,
					completedAt: status === SAFETY_TALK_STATUS.PASSED ? completedAt : null,
					expiresAt: expiresAt || userSafetyTalk.expiresAt,
					inPersonSessionDate: completedAt,
				},
			})
		}
		if (status === SAFETY_TALK_STATUS.PASSED || status === SAFETY_TALK_STATUS.FAILED) {
			await prisma.safetyTalkAttempt.create({
				data: {
					userId: user.id,
					userSafetyTalkId: userSafetyTalk.id,
					category: category,
					score:
						status === SAFETY_TALK_STATUS.PASSED
							? 85.0
							: status === SAFETY_TALK_STATUS.FAILED
								? 45.0
								: 85.0,
					passed: status === SAFETY_TALK_STATUS.PASSED,
					answers: { importedData: true },
					attemptNumber: 1,
					completedAt: completedAt,
				},
			})
		}

		return {
			success: true,
		}
	} catch (error) {
		return {
			success: false,
			error: `Error procesando fila: ${error instanceof Error ? error.message : "Error desconocido"}`,
		}
	}
}

async function importSafetyTalks(filePath: string): Promise<ImportResult> {
	const result: ImportResult = {
		success: 0,
		errors: [],
		warnings: [],
		orphanedRecords: [],
	}

	try {
		await clearExistingSafetyTalks()

		const workbook = XLSX.readFile(filePath)
		const sheetName = workbook.SheetNames[0]
		const worksheet = workbook.Sheets[sheetName]
		const data: ExcelRow[] = XLSX.utils.sheet_to_json(worksheet)

		console.log(`Procesando ${data.length} filas...`)

		for (let i = 0; i < data.length; i++) {
			const row = data[i]
			console.log(`Procesando fila ${i + 1}/${data.length}: RUT ${row.RUT}`)

			const processResult = await processRow(row)

			if (processResult.success) {
				result.success++
			} else if (processResult.orphaned && processResult.orphanedData) {
				// Agregar a registros huérfanos en lugar de errores
				result.orphanedRecords.push({
					row: i + 1,
					data: row,
					processedData: processResult.orphanedData,
				})
			} else {
				result.errors.push({
					row: i + 1,
					data: row,
					error: processResult.error || "Error desconocido",
				})
			}

			// Pausa pequeña para no sobrecargar la DB
			await new Promise((resolve) => setTimeout(resolve, 100))
		}

		return result
	} catch (error) {
		console.error("Error leyendo archivo Excel:", error)
		throw new Error(
			`Error leyendo archivo: ${error instanceof Error ? error.message : "Error desconocido"}`
		)
	} finally {
		await prisma.$disconnect()
	}
}

/**
 * Write orphaned records directly to InPersonSafetyTalkRecord table in the DB
 * instead of generating JSON files.
 */
async function saveOrphanedRecordsToDB(result: ImportResult): Promise<number> {
	if (result.orphanedRecords.length === 0) {
		return 0
	}

	const records = result.orphanedRecords.map((record) => ({
		rut: normalizeRut(record.processedData.rut),
		name: record.processedData.name || "Sin nombre",
		company: record.processedData.company || "Sin empresa",
		sessionDate: record.processedData.fecha,
		expiresAt: record.processedData.vencimiento,
		status: mapStateToStatus(record.processedData.estado) as SAFETY_TALK_STATUS,
		source: "IMPORT",
		notes: `Importado desde Excel. Fila original: ${record.row}. Estado original: ${record.processedData.estado}`,
	}))

	const dbResult = await prisma.inPersonSafetyTalkRecord.createMany({
		data: records,
		skipDuplicates: true,
	})

	console.log(`${dbResult.count} registros huérfanos guardados en la base de datos`)
	return dbResult.count
}

function generateReport(result: ImportResult, outputPath: string): void {
	const report = {
		summary: {
			total: result.success + result.errors.length + result.orphanedRecords.length,
			successful: result.success,
			failed: result.errors.length,
			orphaned: result.orphanedRecords.length,
			warnings: result.warnings.length,
			timestamp: new Date().toISOString(),
		},
		errors: result.errors,
		warnings: result.warnings,
	}

	fs.writeFileSync(outputPath, JSON.stringify(report, null, 2))
	console.log(`Reporte guardado en: ${outputPath}`)
}

async function main() {
	const args = process.argv.slice(2)

	if (args.length < 1) {
		console.log("Uso: npm run import-safety-talks <archivo-excel.xlsx> [reporte-output.json]")
		process.exit(1)
	}

	const excelFile = args[0]
	const reportFile = args[1] || `public/data/safety-talks-import-report-${Date.now()}.json`

	if (!fs.existsSync(excelFile)) {
		console.error(`Archivo no encontrado: ${excelFile}`)
		process.exit(1)
	}

	try {
		console.log(`Iniciando importación desde: ${excelFile}`)

		const result = await importSafetyTalks(excelFile)

		console.log("\n=== RESUMEN ===")
		console.log(
			`Total procesadas: ${result.success + result.errors.length + result.orphanedRecords.length}`
		)
		console.log(`Exitosas: ${result.success}`)
		console.log(`Errores: ${result.errors.length}`)
		console.log(`Registros huérfanos: ${result.orphanedRecords.length}`)
		console.log(`Advertencias: ${result.warnings.length}`)

		if (result.errors.length > 0) {
			console.log("\n=== ERRORES ===")
			result.errors.forEach((error) => {
				console.log(`Fila ${error.row}: ${error.error}`)
				console.log(`  RUT: ${error.data.RUT}`)
			})
		}

		if (result.orphanedRecords.length > 0) {
			console.log("\n=== REGISTROS HUÉRFANOS ===")
			console.log(`Se encontraron ${result.orphanedRecords.length} registros sin usuario asociado`)
			console.log("Guardando registros huérfanos en la base de datos...")
			const savedCount = await saveOrphanedRecordsToDB(result)
			console.log(`${savedCount} registros huérfanos guardados en InPersonSafetyTalkRecord`)

			result.orphanedRecords.slice(0, 5).forEach((orphan) => {
				console.log(
					`Fila ${orphan.row}: ${orphan.processedData.name} (${orphan.processedData.rut}) - ${orphan.processedData.company}`
				)
			})
			if (result.orphanedRecords.length > 5) {
				console.log(`... y ${result.orphanedRecords.length - 5} más`)
			}
		}

		if (result.warnings.length > 0) {
			console.log("\n=== ADVERTENCIAS ===")
			result.warnings.forEach((warning) => {
				console.log(`Fila ${warning.row}: ${warning.message}`)
				console.log(`  RUT: ${warning.data.RUT}`)
			})
		}

		generateReport(result, reportFile)
	} catch (error) {
		console.error("Error durante la importación:", error)
		process.exit(1)
	}
}

if (require.main === module) {
	main().catch(console.error)
}

export { importSafetyTalks }
export type { ImportResult }
