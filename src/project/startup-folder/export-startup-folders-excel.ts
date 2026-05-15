import ExcelJS from "exceljs"

import type { CompanyWithStartupFolders, ListFolder } from "./hooks/use-startup-folder"

const STATUS_CONFIG: Record<string, { label: string; color: string; font: string }> = {
	PENDING: { label: "Pendiente", color: "FFF59E0B", font: "FF92400E" },
	IN_PROGRESS: { label: "En Progreso", color: "FF3B82F6", font: "FF1E3A5F" },
	COMPLETED: { label: "Completada", color: "FF10B981", font: "FF064E3B" },
}

const TYPE_LABELS: Record<string, string> = {
	BASIC: "Basica",
	FULL: "Completa",
}

const getPercent = (approved: number, total: number): number => {
	if (!total) return 0
	return Math.min((approved / total) * 100, 100)
}

const getFolderPercent = (folder: ListFolder): number =>
	getPercent(folder.approvedDocuments, folder.totalDocuments)

const getAveragePercent = (folders: ListFolder[]): number | null => {
	if (!folders.length) return null
	const percentages = folders.map(getFolderPercent)
	return percentages.reduce((a, b) => a + b, 0) / percentages.length
}

const getFolderExpiredCount = (folder: ListFolder): number => folder.expiredDocuments ?? 0

const getTotalExpired = (folders: ListFolder[]): number =>
	folders.reduce((sum, f) => sum + getFolderExpiredCount(f), 0)

interface FolderPercentages {
	safety: number | null
	environment: number | null
	techSpecs: number | null
	workers: number | null
	vehicles: number | null
	basic: number | null
	expired: number
	total: number
}

function calculateFolderPercentages(
	folder: CompanyWithStartupFolders["StartupFolders"][number]
): FolderPercentages {
	if (folder.type === "BASIC") {
		const basicTotal = getAveragePercent(folder.basicFolders) ?? 0
		const expired = getTotalExpired(folder.basicFolders)

		return {
			safety: null,
			environment: null,
			techSpecs: null,
			workers: null,
			vehicles: null,
			basic: basicTotal,
			expired,
			total: basicTotal,
		}
	}

	const safetyPercent = folder.safetyAndHealthFolders[0]
		? getFolderPercent(folder.safetyAndHealthFolders[0])
		: 0

	const envFolder =
		folder.environmentalFolders[0] ?? folder.environmentFolders[0]
	const environmentPercent = envFolder ? getFolderPercent(envFolder) : 0

	const techSpecsPercent = folder.techSpecsFolders.length
		? getFolderPercent(folder.techSpecsFolders[0])
		: null

	const workersPercent = getAveragePercent(folder.workersFolders as ListFolder[])
	const vehiclesPercent = getAveragePercent(folder.vehiclesFolders)

	const components: number[] = [
		safetyPercent,
		environmentPercent,
		...(folder.techSpecsFolders.length > 0 ? [techSpecsPercent!] : []),
		...(folder.workersFolders.length > 0 ? [workersPercent!] : []),
		...(folder.vehiclesFolders.length > 0 ? [vehiclesPercent!] : []),
	]

	const totalPercent = components.length
		? components.reduce((a, b) => a + b, 0) / components.length
		: 0

	const expired =
		getTotalExpired(folder.safetyAndHealthFolders) +
		getTotalExpired(folder.environmentalFolders) +
		getTotalExpired(folder.environmentFolders) +
		getTotalExpired(folder.techSpecsFolders) +
		getTotalExpired(folder.workersFolders as ListFolder[]) +
		getTotalExpired(folder.vehiclesFolders)

	return {
		safety: safetyPercent,
		environment: environmentPercent,
		techSpecs: techSpecsPercent,
		workers: workersPercent,
		vehicles: vehiclesPercent,
		basic: null,
		expired,
		total: totalPercent,
	}
}

function getProgressColor(value: number): string {
	if (value >= 80) return "FF10B981"
	if (value >= 50) return "FF3B82F6"
	if (value >= 20) return "FFF59E0B"
	return "FFEF4444"
}

function getProgressBar(value: number): string {
	const filled = Math.round(value / 10)
	const empty = 10 - filled
	return "\u2588".repeat(filled) + "\u2591".repeat(empty) + ` ${Math.round(value)}%`
}

function applyProgressStyle(cell: ExcelJS.Cell, value: number | null) {
	if (value === null) {
		cell.value = "-"
		cell.alignment = { horizontal: "center", vertical: "middle" }
		cell.font = { color: { argb: "FF9CA3AF" }, size: 10 }
		return
	}

	cell.value = getProgressBar(value)
	cell.font = { color: { argb: getProgressColor(value) }, size: 10, bold: value >= 100 }
	cell.alignment = { horizontal: "left", vertical: "middle" }
}

const HEADERS = [
	"Empresa",
	"RUT",
	"Carpeta",
	"Tipo",
	"Estado",
	"Seg. y Salud",
	"Medio Ambiente",
	"Esp. Tecnicas",
	"Trabajadores",
	"Vehiculos",
	"Doc. Basica",
	"Vencidos",
	"Progreso Total",
]

const COL_WIDTHS = [35, 14, 30, 12, 16, 22, 22, 22, 22, 22, 22, 14, 22]

export async function exportStartupFoldersToExcel(companies: CompanyWithStartupFolders[]) {
	const wb = new ExcelJS.Workbook()
	const ws = wb.addWorksheet("Carpetas de Arranque")

	// Column config
	ws.columns = HEADERS.map((header, i) => ({
		header,
		key: header,
		width: COL_WIDTHS[i],
	}))

	// Header style
	const headerRow = ws.getRow(1)
	headerRow.height = 28
	headerRow.eachCell((cell) => {
		cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 }
		cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0D9488" } }
		cell.alignment = { horizontal: "center", vertical: "middle" }
		cell.border = {
			bottom: { style: "thin", color: { argb: "FF0F766E" } },
		}
	})

	let currentRow = 2

	for (const company of companies) {
		const activeFolders = company.StartupFolders.filter((f) => !f.isArchived && !f.isDeleted)
		if (activeFolders.length === 0) continue

		const companyStartRow = currentRow

		for (let i = 0; i < activeFolders.length; i++) {
			const folder = activeFolders[i]
			const pct = calculateFolderPercentages(folder)
			const row = ws.getRow(currentRow)

			// Company name & RUT only on first row
			if (i === 0) {
				row.getCell(1).value = company.name
				row.getCell(1).font = { bold: true, size: 11 }
				row.getCell(2).value = company.rut
				row.getCell(2).font = { size: 10, color: { argb: "FF6B7280" } }
			}

			row.getCell(1).alignment = { vertical: "middle" }
			row.getCell(2).alignment = { vertical: "middle" }

			// Folder name
			row.getCell(3).value = folder.name
			row.getCell(3).font = { size: 10 }
			row.getCell(3).alignment = { vertical: "middle" }

			// Type
			row.getCell(4).value = TYPE_LABELS[folder.type] ?? folder.type
			row.getCell(4).alignment = { horizontal: "center", vertical: "middle" }
			row.getCell(4).font = { size: 10 }

			// Status with color
			const statusConf = STATUS_CONFIG[folder.status]
			if (statusConf) {
				row.getCell(5).value = statusConf.label
				row.getCell(5).font = { bold: true, size: 10, color: { argb: statusConf.font } }
			} else {
				row.getCell(5).value = folder.status
			}
			row.getCell(5).alignment = { horizontal: "center", vertical: "middle" }

			// Progress bars per section
			applyProgressStyle(row.getCell(6), pct.safety)
			applyProgressStyle(row.getCell(7), pct.environment)
			applyProgressStyle(row.getCell(8), pct.techSpecs)
			applyProgressStyle(row.getCell(9), pct.workers)
			applyProgressStyle(row.getCell(10), pct.vehicles)
			applyProgressStyle(row.getCell(11), pct.basic)

			// Expired/To-Update count
			const expiredCell = row.getCell(12)
			if (pct.expired > 0) {
				expiredCell.value = `${pct.expired}`
				expiredCell.font = { bold: true, size: 10, color: { argb: "FF7C3AED" } }
			} else {
				expiredCell.value = "-"
				expiredCell.font = { size: 10, color: { argb: "FF9CA3AF" } }
			}
			expiredCell.alignment = { horizontal: "center", vertical: "middle" }

			// Total progress — always present, slightly different style
			const totalCell = row.getCell(13)
			totalCell.value = getProgressBar(pct.total)
			totalCell.font = {
				bold: true,
				size: 10,
				color: { argb: getProgressColor(pct.total) },
			}
			totalCell.alignment = { horizontal: "left", vertical: "middle" }

			row.height = 22
			currentRow++
		}

		// Merge company name & RUT cells if multiple folders
		if (activeFolders.length > 1) {
			ws.mergeCells(companyStartRow, 1, currentRow - 1, 1)
			ws.mergeCells(companyStartRow, 2, currentRow - 1, 2)
			ws.getCell(companyStartRow, 1).alignment = { vertical: "middle" }
			ws.getCell(companyStartRow, 2).alignment = { vertical: "middle" }
		}

		// Separator border between companies
		const lastCompanyRow = ws.getRow(currentRow - 1)
		lastCompanyRow.eachCell((cell) => {
			cell.border = {
				...cell.border,
				bottom: { style: "thin", color: { argb: "FFE5E7EB" } },
			}
		})
	}

	// Freeze header row
	ws.views = [{ state: "frozen", ySplit: 1, xSplit: 0, activeCell: "A2" }]

	// Auto-filter
	ws.autoFilter = {
		from: { row: 1, column: 1 },
		to: { row: currentRow - 1, column: HEADERS.length },
	}

	const buffer = await wb.xlsx.writeBuffer()
	const blob = new Blob([buffer], {
		type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
	})

	const today = new Date().toISOString().slice(0, 10)
	const url = URL.createObjectURL(blob)
	const a = document.createElement("a")
	a.href = url
	a.download = `carpetas-de-arranque-${today}.xlsx`
	a.click()
	URL.revokeObjectURL(url)
}
