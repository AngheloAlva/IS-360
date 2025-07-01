import { NextResponse } from "next/server"
import { headers } from "next/headers"

import { auth } from "@/lib/auth"

// Mapeo de nombres técnicos a nombres amigables para el usuario
const TABLE_DISPLAY_NAMES: Record<string, string> = {
	User: "Usuarios",
	Company: "Empresas",
	WorkOrder: "Órdenes de Trabajo",
	StartupFolder: "Carpetas de Arranque",
	Vehicle: "Vehículos",
	WorkPermit: "Permisos de Trabajo",
	Worker: "Trabajadores",
	Equipment: "Equipos",
	MaintenancePlan: "Planes de Mantenimiento",
	MaintenancePlanTask: "Tareas de Mantenimiento",
	CompanyDocument: "Documentos de Empresa",
	WorkerDocument: "Documentos de Trabajador",
	VehicleDocument: "Documentos de Vehículo",
	WorkOrderFolder: "Carpetas de Órdenes de Trabajo",
	EnvironmentalDocument: "Documentos Ambientales",
}

// Descripciones de las tablas
const TABLE_DESCRIPTIONS: Record<string, string> = {
	User: "Usuarios del sistema",
	Company: "Empresas contratistas",
	WorkOrder: "Órdenes de trabajo asignadas a contratistas",
	StartupFolder: "Carpetas de arranque para documentación",
	Vehicle: "Vehículos registrados de contratistas",
	WorkPermit: "Permisos de trabajo para órdenes específicas",
	Worker: "Trabajadores de empresas contratistas",
	Equipment: "Equipos registrados",
	MaintenancePlan: "Planes de mantenimiento programado",
	MaintenancePlanTask: "Tareas específicas dentro de planes de mantenimiento",
	CompanyDocument: "Documentos asociados a empresas",
	WorkerDocument: "Documentos asociados a trabajadores",
	VehicleDocument: "Documentos asociados a vehículos",
	WorkOrderFolder: "Carpetas asociadas a órdenes de trabajo",
	EnvironmentalDocument: "Documentos de gestión ambiental",
}

export async function GET() {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id) {
		return new NextResponse("No autorizado", { status: 401 })
	}

	try {
		// Obtener información del modelo Prisma
		// En un entorno de producción, es posible que desees pre-calcular esto o usar una API Prisma más específica
		// Para este prototipo, simularemos la estructura basándonos en el conocimiento del esquema

		// Obtener modelos y campos relevantes
		// Nota: En una implementación real, esta información podría venir directamente de Prisma
		// o de un archivo de configuración pre-generado
		const tables = [
			{
				id: "Company",
				name: "Company",
				displayName: TABLE_DISPLAY_NAMES.Company || "Empresas",
				description: TABLE_DESCRIPTIONS.Company,
				fields: [
					{
						id: "id",
						name: "id",
						displayName: "ID",
						type: "string",
						isRequired: true,
						isPrimary: true,
					},
					{
						id: "name",
						name: "name",
						displayName: "Nombre",
						type: "string",
						isRequired: true,
						isPrimary: false,
					},
					{
						id: "nif",
						name: "nif",
						displayName: "NIF/CIF",
						type: "string",
						isRequired: true,
						isPrimary: false,
					},
					{
						id: "status",
						name: "status",
						displayName: "Estado",
						type: "enum",
						isRequired: true,
						isPrimary: false,
					},
					{
						id: "createdAt",
						name: "createdAt",
						displayName: "Fecha de creación",
						type: "date",
						isRequired: true,
						isPrimary: false,
					},
				],
			},
			{
				id: "WorkOrder",
				name: "WorkOrder",
				displayName: TABLE_DISPLAY_NAMES.WorkOrder || "Órdenes de Trabajo",
				description: TABLE_DESCRIPTIONS.WorkOrder,
				fields: [
					{
						id: "id",
						name: "id",
						displayName: "ID",
						type: "string",
						isRequired: true,
						isPrimary: true,
					},
					{
						id: "title",
						name: "title",
						displayName: "Título",
						type: "string",
						isRequired: true,
						isPrimary: false,
					},
					{
						id: "description",
						name: "description",
						displayName: "Descripción",
						type: "string",
						isRequired: false,
						isPrimary: false,
					},
					{
						id: "companyId",
						name: "companyId",
						displayName: "Empresa",
						type: "string",
						isRequired: true,
						isPrimary: false,
					},
					{
						id: "status",
						name: "status",
						displayName: "Estado",
						type: "enum",
						isRequired: true,
						isPrimary: false,
					},
					{
						id: "priority",
						name: "priority",
						displayName: "Prioridad",
						type: "enum",
						isRequired: true,
						isPrimary: false,
					},
					{
						id: "startDate",
						name: "startDate",
						displayName: "Fecha de inicio",
						type: "date",
						isRequired: false,
						isPrimary: false,
					},
					{
						id: "endDate",
						name: "endDate",
						displayName: "Fecha de fin",
						type: "date",
						isRequired: false,
						isPrimary: false,
					},
					{
						id: "createdAt",
						name: "createdAt",
						displayName: "Fecha de creación",
						type: "date",
						isRequired: true,
						isPrimary: false,
					},
				],
			},
			{
				id: "StartupFolder",
				name: "StartupFolder",
				displayName: TABLE_DISPLAY_NAMES.StartupFolder || "Carpetas de Arranque",
				description: TABLE_DESCRIPTIONS.StartupFolder,
				fields: [
					{
						id: "id",
						name: "id",
						displayName: "ID",
						type: "string",
						isRequired: true,
						isPrimary: true,
					},
					{
						id: "companyId",
						name: "companyId",
						displayName: "Empresa",
						type: "string",
						isRequired: true,
						isPrimary: false,
					},
					{
						id: "workOrderId",
						name: "workOrderId",
						displayName: "Orden de Trabajo",
						type: "string",
						isRequired: false,
						isPrimary: false,
					},
					{
						id: "status",
						name: "status",
						displayName: "Estado",
						type: "enum",
						isRequired: true,
						isPrimary: false,
						enumValues: ["DRAFT", "SUBMITTED", "APPROVED", "REJECTED"],
					},
					{
						id: "createdAt",
						name: "createdAt",
						displayName: "Fecha de creación",
						type: "date",
						isRequired: true,
						isPrimary: false,
					},
					{
						id: "submittedAt",
						name: "submittedAt",
						displayName: "Fecha de envío",
						type: "date",
						isRequired: false,
						isPrimary: false,
					},
				],
			},
			{
				id: "Vehicle",
				name: "Vehicle",
				displayName: TABLE_DISPLAY_NAMES.Vehicle || "Vehículos",
				description: TABLE_DESCRIPTIONS.Vehicle,
				fields: [
					{
						id: "id",
						name: "id",
						displayName: "ID",
						type: "string",
						isRequired: true,
						isPrimary: true,
					},
					{
						id: "plate",
						name: "plate",
						displayName: "Matrícula",
						type: "string",
						isRequired: true,
						isPrimary: false,
					},
					{
						id: "brand",
						name: "brand",
						displayName: "Marca",
						type: "string",
						isRequired: true,
						isPrimary: false,
					},
					{
						id: "model",
						name: "model",
						displayName: "Modelo",
						type: "string",
						isRequired: true,
						isPrimary: false,
					},
					{
						id: "companyId",
						name: "companyId",
						displayName: "Empresa",
						type: "string",
						isRequired: true,
						isPrimary: false,
					},
					{
						id: "createdAt",
						name: "createdAt",
						displayName: "Fecha de creación",
						type: "date",
						isRequired: true,
						isPrimary: false,
					},
				],
			},
			{
				id: "MaintenancePlan",
				name: "MaintenancePlan",
				displayName: TABLE_DISPLAY_NAMES.MaintenancePlan || "Planes de Mantenimiento",
				description: TABLE_DESCRIPTIONS.MaintenancePlan,
				fields: [
					{
						id: "id",
						name: "id",
						displayName: "ID",
						type: "string",
						isRequired: true,
						isPrimary: true,
					},
					{
						id: "name",
						name: "name",
						displayName: "Nombre",
						type: "string",
						isRequired: true,
						isPrimary: false,
					},
					{
						id: "equipmentId",
						name: "equipmentId",
						displayName: "Equipo",
						type: "string",
						isRequired: true,
						isPrimary: false,
					},
					{
						id: "status",
						name: "status",
						displayName: "Estado",
						type: "enum",
						isRequired: true,
						isPrimary: false,
					},
					{
						id: "createdAt",
						name: "createdAt",
						displayName: "Fecha de creación",
						type: "date",
						isRequired: true,
						isPrimary: false,
					},
				],
			},
			{
				id: "MaintenancePlanTask",
				name: "MaintenancePlanTask",
				displayName: TABLE_DISPLAY_NAMES.MaintenancePlanTask || "Tareas de Mantenimiento",
				description: TABLE_DESCRIPTIONS.MaintenancePlanTask,
				fields: [
					{
						id: "id",
						name: "id",
						displayName: "ID",
						type: "string",
						isRequired: true,
						isPrimary: true,
					},
					{
						id: "title",
						name: "title",
						displayName: "Título",
						type: "string",
						isRequired: true,
						isPrimary: false,
					},
					{
						id: "description",
						name: "description",
						displayName: "Descripción",
						type: "string",
						isRequired: false,
						isPrimary: false,
					},
					{
						id: "maintenancePlanId",
						name: "maintenancePlanId",
						displayName: "Plan de Mantenimiento",
						type: "string",
						isRequired: true,
						isPrimary: false,
					},
					{
						id: "frequency",
						name: "frequency",
						displayName: "Frecuencia",
						type: "enum",
						isRequired: true,
						isPrimary: false,
					},
					{
						id: "nextDate",
						name: "nextDate",
						displayName: "Próxima fecha",
						type: "date",
						isRequired: false,
						isPrimary: false,
					},
					{
						id: "createdAt",
						name: "createdAt",
						displayName: "Fecha de creación",
						type: "date",
						isRequired: true,
						isPrimary: false,
					},
				],
			},
		]

		// Definir relaciones
		const relationships = [
			{
				id: "company-workorder",
				sourceTable: "Company",
				sourceField: "id",
				targetTable: "WorkOrder",
				targetField: "companyId",
				relationType: "oneToMany",
			},
			{
				id: "company-startupfolder",
				sourceTable: "Company",
				sourceField: "id",
				targetTable: "StartupFolder",
				targetField: "companyId",
				relationType: "oneToMany",
			},
			{
				id: "workorder-startupfolder",
				sourceTable: "WorkOrder",
				sourceField: "id",
				targetTable: "StartupFolder",
				targetField: "workOrderId",
				relationType: "oneToOne",
			},
			{
				id: "company-vehicle",
				sourceTable: "Company",
				sourceField: "id",
				targetTable: "Vehicle",
				targetField: "companyId",
				relationType: "oneToMany",
			},
			{
				id: "equipment-maintenanceplan",
				sourceTable: "Equipment",
				sourceField: "id",
				targetTable: "MaintenancePlan",
				targetField: "equipmentId",
				relationType: "oneToMany",
			},
			{
				id: "maintenanceplan-task",
				sourceTable: "MaintenancePlan",
				sourceField: "id",
				targetTable: "MaintenancePlanTask",
				targetField: "maintenancePlanId",
				relationType: "oneToMany",
			},
		]

		return NextResponse.json({
			tables,
			relationships,
		})
	} catch (error) {
		console.error("Error getting schema info:", error)
		return NextResponse.json({ error: "Error getting schema info" }, { status: 500 })
	}
}
