"use client"

import { useState } from "react"

import type { Tool, ToolActivity, CompanyToolSummary } from "../types"

// Datos mock para herramientas por empresa
const mockToolsByCompany: Record<string, Tool[]> = {
	"1": [
		{
			id: "t1",
			name: "Taladro Percutor HD-2000",
			code: "TPH-001",
			description: "Taladro percutor de alta potencia",
			category: "POWER_TOOLS",
			status: "IN_USE",
			companyId: "1",
			createdAt: new Date(),
			updatedAt: new Date(),
		},
		{
			id: "t2",
			name: "Martillo Neumático",
			code: "MN-002",
			description: "Martillo neumático para demolición",
			category: "PNEUMATIC",
			status: "AVAILABLE",
			companyId: "1",
			createdAt: new Date(),
			updatedAt: new Date(),
		},
		{
			id: "t3",
			name: "Sierra Circular",
			code: "SC-003",
			description: "Sierra circular para corte de madera",
			category: "CUTTING",
			status: "IN_USE",
			companyId: "1",
			createdAt: new Date(),
			updatedAt: new Date(),
		},
	],
	"2": [
		{
			id: "t4",
			name: "Soldadora MIG-250",
			code: "SM-004",
			description: "Soldadora MIG de 250 amperios",
			category: "WELDING",
			status: "IN_USE",
			companyId: "2",
			createdAt: new Date(),
			updatedAt: new Date(),
		},
		{
			id: "t5",
			name: "Amoladora Angular",
			code: "AA-005",
			description: "Amoladora angular 115mm",
			category: "POWER_TOOLS",
			status: "AVAILABLE",
			companyId: "2",
			createdAt: new Date(),
			updatedAt: new Date(),
		},
	],
	"3": [
		{
			id: "t6",
			name: "Compresor 50L",
			code: "C50-006",
			description: "Compresor de aire 50 litros",
			category: "PNEUMATIC",
			status: "IN_USE",
			companyId: "3",
			createdAt: new Date(),
			updatedAt: new Date(),
		},
	],
	"4": [
		{
			id: "t4",
			name: "Soldadora MIG-250",
			code: "SM-004",
			description: "Soldadora MIG de 250 amperios",
			category: "WELDING",
			status: "IN_USE",
			companyId: "2",
			createdAt: new Date(),
			updatedAt: new Date(),
		},
		{
			id: "t5",
			name: "Amoladora Angular",
			code: "AA-005",
			description: "Amoladora angular 115mm",
			category: "POWER_TOOLS",
			status: "AVAILABLE",
			companyId: "2",
			createdAt: new Date(),
			updatedAt: new Date(),
		},
	],
	"5": [
		{
			id: "t6",
			name: "Compresor 50L",
			code: "C50-006",
			description: "Compresor de aire 50 litros",
			category: "PNEUMATIC",
			status: "IN_USE",
			companyId: "3",
			createdAt: new Date(),
			updatedAt: new Date(),
		},
	],
}

const mockCompanies: Record<string, CompanyToolSummary> = {
	"1": {
		id: "1",
		name: "Constructora AB",
		rut: "12.345.678-9",
		toolsCount: 24,
		toolsInUse: 18,
		toolsAvailable: 6,
		activePermits: 3,
		lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000),
	},
	"2": {
		id: "2",
		name: "Metalúrgica XYZ",
		rut: "20.987.654-3",
		toolsCount: 31,
		toolsInUse: 12,
		toolsAvailable: 19,
		activePermits: 2,
		lastActivity: new Date(Date.now() - 4 * 60 * 60 * 1000),
	},
	"3": {
		id: "3",
		name: "Servicios DEF",
		rut: "20.456.789-1",
		toolsCount: 15,
		toolsInUse: 8,
		toolsAvailable: 7,
		activePermits: 1,
		lastActivity: new Date(Date.now() - 6 * 60 * 60 * 1000),
	},
	"4": {
		id: "4",
		name: "Ingeniería Simple",
		rut: "20.789.123-4",
		toolsCount: 42,
		toolsInUse: 0,
		toolsAvailable: 42,
		activePermits: 0,
		lastActivity: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
	},
	"5": {
		id: "5",
		name: "Mantenimiento JKL",
		rut: "20.321.654-9",
		toolsCount: 28,
		toolsInUse: 4,
		toolsAvailable: 24,
		activePermits: 1,
		lastActivity: new Date(Date.now() - 1 * 60 * 60 * 1000),
	},
}

export function useCompanyTools(companyId: string) {
	const [activities, setActivities] = useState<ToolActivity[]>([
		{
			id: "a1",
			toolId: "t1",
			workPermitId: "wp1",
			activityType: "ENTRY",
			timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
			comments: "Herramienta asignada para trabajo de perforación",
			createdBy: "user1",
		},
		{
			id: "a2",
			toolId: "t3",
			workPermitId: "wp2",
			activityType: "ENTRY",
			timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
			comments: "Sierra asignada para corte de materiales",
			createdBy: "user2",
		},
	])

	const company = mockCompanies[companyId]
	const tools = mockToolsByCompany[companyId] || []

	const addActivity = (newActivity: Omit<ToolActivity, "id" | "timestamp" | "createdBy">) => {
		const activity: ToolActivity = {
			...newActivity,
			id: `a${Date.now()}`,
			timestamp: new Date(),
			createdBy: "demo-user",
		}
		setActivities((prev) => [activity, ...prev])
	}

	return {
		company,
		tools,
		activities,
		addActivity,
	}
}
