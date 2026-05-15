import ExcelJS from "exceljs"

import { getDotState, isInActivationWindow, isWeekend } from "./gantt-utils"
import { TaskFrequencyLabels } from "@/lib/consts/task-frequency"
import { flattenTreeForExport, type LocationTreeNode } from "./build-location-tree"

import type { MonthMeta } from "@/project/maintenance-plan/hooks/use-maintenance-schedule"

const HEADER_BG = "FF4338CA"
const HEADER_LIGHT = "FF6366F1"
const GROUP_BG = "FFE0E7FF"
const WEEKEND_BG = "FFF3F4F6"
const ACTIVATION_BG = "FFECFEFF"
const BORDER_COLOR = "FFD1D5DB"

const DOT_COLORS = {
	completed: "FF10B981",
	"wo-pending": "FF3B82F6",
	"future-automated": "FF22D3EE",
	"future-manual": "FFFBBF24",
	stuck: "FFEF4444",
} as const

const thinBorder: ExcelJS.Border = {
	style: "thin",
	color: { argb: BORDER_COLOR },
}

const allBorders: Partial<ExcelJS.Borders> = {
	top: thinBorder,
	bottom: thinBorder,
	left: thinBorder,
	right: thinBorder,
}

export async function exportGanttToExcel(
	tree: LocationTreeNode[],
	months: MonthMeta[]
): Promise<void> {
	const groups = flattenTreeForExport(tree)
	const workbook = new ExcelJS.Workbook()
	const firstMonth = months[0]
	const lastMonth = months[months.length - 1]
	const sheetName =
		months.length === 1 ? firstMonth.label : `${firstMonth.label} - ${lastMonth.label}`
	const ws = workbook.addWorksheet(sheetName)

	const totalDayCols = months.reduce((sum, m) => sum + m.daysInMonth, 0)
	const lastCol = totalDayCols + 2

	const today = (() => {
		const n = new Date()
		return new Date(n.getFullYear(), n.getMonth(), n.getDate())
	})()

	ws.views = [{ state: "frozen", xSplit: 1, ySplit: 2 }]

	// Column widths
	ws.getColumn(1).width = 40
	let colIdx = 2
	for (const m of months) {
		for (let d = 0; d < m.daysInMonth; d++) {
			ws.getColumn(colIdx++).width = 4
		}
	}
	ws.getColumn(lastCol).width = 15

	// ── Row 1: Month headers ──
	const monthHeaderRow = ws.addRow([])
	monthHeaderRow.height = 18

	ws.mergeCells(1, 1, 2, 1)
	ws.getCell(1, 1).value = "Actividad / Trabajo"
	ws.getCell(1, 1).font = { bold: true }
	ws.getCell(1, 1).border = allBorders
	ws.getCell(1, 1).alignment = { vertical: "middle" }
	ws.getCell(1, 1).fill = {
		type: "pattern",
		pattern: "solid",
		fgColor: { argb: "FFE5E7EB" },
	}

	let monthCol = 2
	for (const m of months) {
		ws.mergeCells(1, monthCol, 1, monthCol + m.daysInMonth - 1)
		const cell = ws.getCell(1, monthCol)
		cell.value = m.label
		cell.font = { bold: true, color: { argb: "FFFFFFFF" } }
		cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: HEADER_BG } }
		cell.alignment = { horizontal: "center", vertical: "middle" }
		cell.border = allBorders
		monthCol += m.daysInMonth
	}

	ws.mergeCells(1, lastCol, 2, lastCol)
	ws.getCell(1, lastCol).value = "Último Mant."
	ws.getCell(1, lastCol).font = { bold: true }
	ws.getCell(1, lastCol).border = allBorders
	ws.getCell(1, lastCol).alignment = { horizontal: "center", vertical: "middle" }
	ws.getCell(1, lastCol).fill = {
		type: "pattern",
		pattern: "solid",
		fgColor: { argb: "FFE5E7EB" },
	}

	// ── Row 2: Day numbers ──
	const dayRow = ws.addRow([])
	dayRow.height = 16

	colIdx = 2
	for (const m of months) {
		for (let d = 1; d <= m.daysInMonth; d++) {
			const cell = ws.getCell(2, colIdx)
			cell.value = d
			cell.alignment = { horizontal: "center", vertical: "middle" }
			cell.border = allBorders

			if (isWeekend(d, m.month, m.year)) {
				cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: HEADER_LIGHT } }
				cell.font = { size: 8, color: { argb: "FFFFFFFF" } }
			} else {
				cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF3F4F6" } }
				cell.font = { size: 8 }
			}
			colIdx++
		}
	}

	// ── Data rows grouped by location ──
	for (const group of groups) {
		// Location group header
		const headerRow = ws.addRow([])
		headerRow.height = 20
		const headerCell = ws.getCell(headerRow.number, 1)
		headerCell.value = `${group.location}  (${group.tasks.length})`
		headerCell.font = { bold: true, size: 11 }
		headerCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: GROUP_BG } }
		headerCell.border = allBorders
		headerCell.alignment = { vertical: "middle" }

		for (let c = 2; c <= lastCol; c++) {
			const cell = ws.getCell(headerRow.number, c)
			cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: GROUP_BG } }
			cell.border = allBorders
		}

		// Tasks
		for (const task of group.tasks) {
			const row = ws.addRow([])
			row.height = 22

			const nameCell = ws.getCell(row.number, 1)
			nameCell.value = `    ${task.name}\n    ${TaskFrequencyLabels[task.frequency]}${task.isAutomated ? " · Automática" : ""}`
			nameCell.border = allBorders
			nameCell.alignment = { wrapText: true, vertical: "middle" }
			nameCell.font = { size: 10 }

			colIdx = 2
			for (const m of months) {
				for (let d = 1; d <= m.daysInMonth; d++) {
					const cell = ws.getCell(row.number, colIdx)
					const state = getDotState(task, d, m.month, m.year, today)
					const inWindow = isInActivationWindow(task, d, m.month, m.year)

					cell.border = allBorders
					cell.alignment = { horizontal: "center", vertical: "middle" }

					if (state) {
						cell.value = "●"
						cell.fill = {
							type: "pattern",
							pattern: "solid",
							fgColor: { argb: DOT_COLORS[state.kind] },
						}
						cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 9 }
					} else if (inWindow) {
						cell.fill = {
							type: "pattern",
							pattern: "solid",
							fgColor: { argb: ACTIVATION_BG },
						}
					} else if (isWeekend(d, m.month, m.year)) {
						cell.fill = {
							type: "pattern",
							pattern: "solid",
							fgColor: { argb: WEEKEND_BG },
						}
					}

					colIdx++
				}
			}

			const lastCell = ws.getCell(row.number, lastCol)
			lastCell.value = task.lastCompleted
				? `${new Date(task.lastCompleted).toLocaleDateString("es-CL")}${task.lastCompletedOt ? `\n${task.lastCompletedOt}` : ""}`
				: "—"
			lastCell.border = allBorders
			lastCell.alignment = { horizontal: "center", vertical: "middle", wrapText: true }
			lastCell.font = { size: 9 }
		}
	}

	// ── Legend (below data) ──
	const legendStartRow = (ws.lastRow?.number ?? 2) + 2
	const legend: Array<{ color: string; label: string }> = [
		{ color: DOT_COLORS["future-manual"], label: "Pendiente manual" },
		{ color: DOT_COLORS["future-automated"], label: "Pendiente automática" },
		{ color: DOT_COLORS["wo-pending"], label: "OT generada (en curso)" },
		{ color: DOT_COLORS.completed, label: "Completada" },
		{ color: DOT_COLORS.stuck, label: "Atorada (OT previa sin cerrar)" },
		{ color: ACTIVATION_BG, label: "Ventana de activación automática" },
	]

	ws.getCell(legendStartRow, 1).value = "Leyenda"
	ws.getCell(legendStartRow, 1).font = { bold: true, size: 11 }

	legend.forEach((item, idx) => {
		const r = legendStartRow + 1 + idx
		const dot = ws.getCell(r, 1)
		dot.value = "●"
		dot.alignment = { horizontal: "center" }
		dot.font = { bold: true, color: { argb: item.color }, size: 14 }
		ws.getCell(r, 2).value = item.label
		ws.getCell(r, 2).font = { size: 10 }
	})

	// Download
	const buffer = await workbook.xlsx.writeBuffer()
	const blob = new Blob([buffer], {
		type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
	})
	const url = URL.createObjectURL(blob)
	const anchor = document.createElement("a")
	anchor.href = url
	anchor.download = `programacion-${firstMonth.year}-${String(firstMonth.month).padStart(2, "0")}.xlsx`
	anchor.click()
	URL.revokeObjectURL(url)
}
