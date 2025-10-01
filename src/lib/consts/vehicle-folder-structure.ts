import { DocumentCategory, VehicleDocumentType } from "@prisma/client"

export interface VehicleFolderStructure {
	title: string
	description: string
	documents: {
		name: string
		description?: string
		type: VehicleDocumentType
	}[]
}

export const VEHICLE_STRUCTURE: VehicleFolderStructure = {
	title: "Vehículos y Equipos",
	description: "Documentación obligatoria de equipos y vehículos asignados al proyecto.",
	documents: [
		{
			type: VehicleDocumentType.EQUIPMENT_FILE,
			name: "Ficha de equipos",
			description:
				"Archivo que contenga como mínimo tipo de vehículo, patente, año, marca, modelo, nombre de la compañía de seguro y vigencias de; revisión técnica, permiso de circulación, seguro obligatorio.",
		},
		{
			type: VehicleDocumentType.VEHICLE_REGISTRATION,
			name: "Inscripción del vehículo motorizado (Padrón)",
			description: "Fotocopia de inscripción oficial del vehículo.",
		},
		{
			type: VehicleDocumentType.CIRCULATION_PERMIT,
			name: "Permiso de circulación",
			description: "Fotocopia del Permiso de circulación vigente.",
		},
		{
			type: VehicleDocumentType.TECHNICAL_REVIEW,
			name: "Revisión técnica",
			description: "Fotocopia de la Revisión técnica vigente.",
		},
		{
			type: VehicleDocumentType.INSURANCE,
			name: "Seguro obligatorio",
			description: "Fotocopia del Seguro vigente contra accidentes.",
		},
		{
			type: VehicleDocumentType.CHECKLIST,
			name: "Lista de chequeo previa al ingreso",
			description:
				"Revisión interna firmada antes del ingreso a IS 360, que asegure las perfectas condiciones previa al servicio.",
		},
		{
			type: VehicleDocumentType.TRANSPORTATION_TO_OTC,
			name: "Vehículo de transporte de trabajadores",
			description: "Documentación del vehículo de traslado al sitio de trabajo.",
		},
	],
}

export const getVehicleDocuments = () => {
	return {
		title: VEHICLE_STRUCTURE.title,
		documents: VEHICLE_STRUCTURE.documents,
		category: DocumentCategory.VEHICLES,
	}
}
