import { DocumentCategory } from "@/generated/prisma/enums"

import { BASIC_FOLDER_STRUCTURE } from "@/lib/consts/basic-startup-folders-structure"
import {
	ENVIRONMENT_STRUCTURE,
	ENVIRONMENTAL_STRUCTURE,
	EXTENDED_ENVIRONMENT_STRUCTURE,
	SAFETY_AND_HEALTH_STRUCTURE,
	TECH_SPEC_STRUCTURE,
} from "@/lib/consts/startup-folders-structure"
import { VEHICLE_STRUCTURE } from "@/lib/consts/vehicle-folder-structure"
import {
	BASE_WORKER_STRUCTURE,
	DRIVER_WORKER_STRUCTURE,
} from "@/lib/consts/worker-folder-structure"

export type FolderTypeKey =
	| "basic"
	| "vehicle"
	| "worker"
	| "safetyAndHealth"
	| "techSpecs"
	| "environment"
	| "environmental"

interface BaseFolderConfig {
	key: FolderTypeKey
	folderTable: string
	documentTable: string
	category: DocumentCategory
	documentEntityType: string
	folderEntityType: string
	expectedTypes: string[] | ((flags: { moreMonthDuration: boolean; isDriver: boolean }) => string[])
	needsStartupFolderMeta?: boolean
	successMessages: {
		uploadOk: string
		uploadFail: string
		notFound: string
		notAuthorized: string
		linkOk?: string
		submitOk: string
	}
}

export interface EntityFolderConfig extends BaseFolderConfig {
	hasEntities: true
	entityField: "workerId" | "vehicleId"
	entityTable: "user" | "vehicle"
	entityLabel: string
	syncIrlOnLink: boolean
	supportsIsDriver: boolean
}

export interface DocOnlyFolderConfig extends BaseFolderConfig {
	hasEntities: false
}

export type FolderConfig = EntityFolderConfig | DocOnlyFolderConfig

export const BASIC_CONFIG: EntityFolderConfig = {
	key: "basic",
	hasEntities: true,
	folderTable: "basic_folder",
	documentTable: "basic_document",
	category: DocumentCategory.BASIC,
	documentEntityType: "BasicDocument",
	folderEntityType: "BasicFolder",
	entityField: "workerId",
	entityTable: "user",
	entityLabel: "personal",
	syncIrlOnLink: true,
	supportsIsDriver: false,
	expectedTypes: BASIC_FOLDER_STRUCTURE.documents.map((d) => d.type),
	successMessages: {
		uploadOk: "Documento de personal subido correctamente",
		uploadFail: "Ocurrio un error subiendo el documento",
		notFound: "Carpeta de personal no encontrada",
		notAuthorized: "No autorizado - El usuario no pertenece a la empresa",
		linkOk: "Carpeta de documentos básicos creada y asignada",
		submitOk: "Los documentos han sido enviados a revisión correctamente.",
	},
}

export const VEHICLE_CONFIG: EntityFolderConfig = {
	key: "vehicle",
	hasEntities: true,
	folderTable: "vehicle_folders",
	documentTable: "vehicle_document",
	category: DocumentCategory.VEHICLES,
	documentEntityType: "VehicleDocument",
	folderEntityType: "VehicleFolder",
	entityField: "vehicleId",
	entityTable: "vehicle",
	entityLabel: "vehiculo",
	syncIrlOnLink: false,
	supportsIsDriver: false,
	expectedTypes: VEHICLE_STRUCTURE.documents.map((d) => d.type),
	successMessages: {
		uploadOk: "Documento de vehiculo subido correctamente",
		uploadFail: "Ocurrio un problema al subir el documento",
		notFound: "Carpeta de vehiculo no encontrada",
		notAuthorized: "No autorizado - El vehiculo no pertenece a la empresa",
		linkOk: "Carpeta del vehiculo creada y asignada",
		submitOk: "Los documentos han sido enviados a revisión correctamente.",
	},
}

export const WORKER_CONFIG: EntityFolderConfig = {
	key: "worker",
	hasEntities: true,
	folderTable: "worker_folders",
	documentTable: "worker_document",
	category: DocumentCategory.PERSONNEL,
	documentEntityType: "WorkerDocument",
	folderEntityType: "WorkerFolder",
	entityField: "workerId",
	entityTable: "user",
	entityLabel: "colaborador",
	syncIrlOnLink: true,
	supportsIsDriver: true,
	expectedTypes: ({ isDriver }) =>
		(isDriver ? DRIVER_WORKER_STRUCTURE : BASE_WORKER_STRUCTURE).documents.map((d) => d.type),
	successMessages: {
		uploadOk: "Documento de colaborador subido correctamente",
		uploadFail: "Ocurrio un error subiendo el documento",
		notFound: "Carpeta de personal no encontrada",
		notAuthorized: "No autorizado - El usuario no pertenece a la empresa",
		linkOk: "Carpeta de colaborador creada y asignada",
		submitOk: "Los documentos han sido enviados a revisión correctamente.",
	},
}

export const SAFETY_AND_HEALTH_CONFIG: DocOnlyFolderConfig = {
	key: "safetyAndHealth",
	hasEntities: false,
	folderTable: "safety_and_health_folder",
	documentTable: "safety_and_health_document",
	category: DocumentCategory.SAFETY_AND_HEALTH,
	documentEntityType: "SafetyAndHealthDocument",
	folderEntityType: "SafetyAndHealthFolder",
	expectedTypes: SAFETY_AND_HEALTH_STRUCTURE.documents.map((d) => d.type),
	successMessages: {
		uploadOk: "Documento subido correctamente",
		uploadFail: "Ocurrio un error subiendo el documento",
		notFound: "Carpeta no encontrada",
		notAuthorized: "No autorizado",
		submitOk: "La carpeta ha sido enviada a revisión correctamente.",
	},
}

export const TECH_SPECS_CONFIG: DocOnlyFolderConfig = {
	key: "techSpecs",
	hasEntities: false,
	folderTable: "tech_specs_folder",
	documentTable: "tech_specs_document",
	category: DocumentCategory.TECHNICAL_SPECS,
	documentEntityType: "TechSpecsDocument",
	folderEntityType: "TechSpecsFolder",
	expectedTypes: TECH_SPEC_STRUCTURE.documents.map((d) => d.type),
	successMessages: {
		uploadOk: "Documento subido correctamente",
		uploadFail: "Ocurrio un error subiendo el documento",
		notFound: "Carpeta no encontrada",
		notAuthorized: "No autorizado",
		submitOk: "La carpeta ha sido enviada a revisión correctamente.",
	},
}

export const ENVIRONMENT_CONFIG: DocOnlyFolderConfig = {
	key: "environment",
	hasEntities: false,
	folderTable: "environment_folder",
	documentTable: "environment_document",
	category: DocumentCategory.ENVIRONMENT,
	documentEntityType: "EnvironmentDocument",
	folderEntityType: "EnvironmentFolder",
	expectedTypes: ({ moreMonthDuration }) =>
		(moreMonthDuration ? EXTENDED_ENVIRONMENT_STRUCTURE : ENVIRONMENT_STRUCTURE).documents.map(
			(d) => d.type,
		),
	needsStartupFolderMeta: true,
	successMessages: {
		uploadOk: "Documento subido correctamente",
		uploadFail: "Ocurrio un error subiendo el documento",
		notFound: "Carpeta no encontrada",
		notAuthorized: "No autorizado",
		submitOk: "La carpeta ha sido enviada a revisión correctamente.",
	},
}

export const ENVIRONMENTAL_CONFIG: DocOnlyFolderConfig = {
	key: "environmental",
	hasEntities: false,
	folderTable: "environmental_folder",
	documentTable: "environmental_document",
	category: DocumentCategory.ENVIRONMENTAL,
	documentEntityType: "EnvironmentalDocument",
	folderEntityType: "EnvironmentalFolder",
	expectedTypes: ENVIRONMENTAL_STRUCTURE.documents.map((d) => d.type),
	successMessages: {
		uploadOk: "Documento subido correctamente",
		uploadFail: "Ocurrio un error subiendo el documento",
		notFound: "Carpeta no encontrada",
		notAuthorized: "No autorizado",
		submitOk: "La carpeta ha sido enviada a revisión correctamente.",
	},
}

export const FOLDER_CONFIGS: Record<FolderTypeKey, FolderConfig> = {
	basic: BASIC_CONFIG,
	vehicle: VEHICLE_CONFIG,
	worker: WORKER_CONFIG,
	safetyAndHealth: SAFETY_AND_HEALTH_CONFIG,
	techSpecs: TECH_SPECS_CONFIG,
	environment: ENVIRONMENT_CONFIG,
	environmental: ENVIRONMENTAL_CONFIG,
}
