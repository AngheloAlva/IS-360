export interface Tool {
	id: string
	name: string
	code: string
	description?: string
	category: ToolCategory
	status: ToolStatus
	companyId: string
	createdAt: Date
	updatedAt: Date
}

export interface ToolActivity {
	id: string
	toolId: string
	workPermitId?: string
	activityType: ActivityType
	timestamp: Date
	comments?: string
	createdBy: string
}

export interface WorkPermitTool {
	id: string
	workPermitId: string
	toolId: string
	assignedAt: Date
	returnedAt?: Date
	status: AssignmentStatus
}

export type ToolCategory =
	| "POWER_TOOLS"
	| "HAND_TOOLS"
	| "MEASURING"
	| "SAFETY"
	| "CUTTING"
	| "WELDING"
	| "PNEUMATIC"
	| "HYDRAULIC"
	| "OTHER"

export type ToolStatus = "AVAILABLE" | "IN_USE" | "MAINTENANCE" | "OUT_OF_SERVICE" | "LOST"

export type ActivityType = "ENTRY" | "EXIT" | "STAY"

export type AssignmentStatus = "ASSIGNED" | "RETURNED" | "OVERDUE"

export interface CompanyToolSummary {
	id: string
	name: string
	rut: string
	toolsCount: number
	toolsInUse: number
	toolsAvailable: number
	activePermits: number
	lastActivity: Date
}

// Filtros y búsqueda
export interface ToolFilters {
	search?: string
	category?: ToolCategory
	status?: ToolStatus
	companyId?: string
	dateFrom?: Date
	dateTo?: Date
}

export interface ActivityFilters {
	toolId?: string
	workPermitId?: string
	activityType?: ActivityType
	dateFrom?: Date
	dateTo?: Date
	companyId?: string
}
