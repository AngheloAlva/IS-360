"use client"

import { useState, useMemo } from "react"

import type { ToolFilters, CompanyToolSummary } from "../types"

const mockCompaniesWithTools: CompanyToolSummary[] = [
	{
		id: "1",
		name: "Constructora AB",
		rut: "12.345.678-9",
		toolsCount: 24,
		toolsInUse: 18,
		toolsAvailable: 6,
		activePermits: 3,
		lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000),
	},
	{
		id: "2",
		name: "Metalúrgica XYZ",
		rut: "20.987.654-3",
		toolsCount: 31,
		toolsInUse: 12,
		toolsAvailable: 19,
		activePermits: 2,
		lastActivity: new Date(Date.now() - 4 * 60 * 60 * 1000),
	},
	{
		id: "3",
		name: "Servicios DEF",
		rut: "20.456.789-1",
		toolsCount: 15,
		toolsInUse: 8,
		toolsAvailable: 7,
		activePermits: 1,
		lastActivity: new Date(Date.now() - 6 * 60 * 60 * 1000),
	},
	{
		id: "4",
		name: "Ingeniería Simple",
		rut: "20.789.123-4",
		toolsCount: 42,
		toolsInUse: 0,
		toolsAvailable: 42,
		activePermits: 0,
		lastActivity: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
	},
	{
		id: "5",
		name: "Mantenimiento JKL",
		rut: "20.321.654-9",
		toolsCount: 28,
		toolsInUse: 4,
		toolsAvailable: 24,
		activePermits: 1,
		lastActivity: new Date(Date.now() - 1 * 60 * 60 * 1000),
	},
]

export function useToolFilters() {
	const [filters, setFilters] = useState<ToolFilters>({
		search: "",
	})
	const [isLoading] = useState(false)

	const companiesWithTools = useMemo(() => {
		return mockCompaniesWithTools.filter((company) => {
			if (filters.search) {
				const searchLower = filters.search.toLowerCase()
				return (
					company.name.toLowerCase().includes(searchLower) || company.rut.includes(filters.search)
				)
			}
			return true
		})
	}, [filters])

	const updateFilters = (newFilters: Partial<ToolFilters>) => {
		setFilters((prev) => ({ ...prev, ...newFilters }))
	}

	const clearFilters = () => {
		setFilters({ search: "" })
	}

	return {
		filters,
		isLoading,
		clearFilters,
		updateFilters,
		companiesWithTools,
	}
}
