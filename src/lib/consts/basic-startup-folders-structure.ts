import { BasicDocumentType, DocumentCategory } from "@prisma/client"

export interface BasicStartupFolderStructure {
	title: string
	description: string
	documents: {
		name: string
		description?: string
		type: BasicDocumentType
	}[]
}

export const BASIC_FOLDER_STRUCTURE: BasicStartupFolderStructure = {
	title: "Documentación básica",
	description: "Documentación básica para que el trabajador pueda desempeñar sus funciones en OTC.",
	documents: [
		{
			type: BasicDocumentType.CONTRACT,
			name: "Contrato de trabajo o de prestación de servicios",
			description: "Contrato de trabajo o de prestación de servicios.",
		},
		{
			type: BasicDocumentType.INSURANCE,
			name: "Cobertura del seguro contra accidentes laborales",
			description: "Certificado de cobertura del seguro contra accidentes laborales.",
		},
		{
			type: BasicDocumentType.PPE_RECEIPT,
			name: "Registro firmado de entrega de EPP",
			description: "Registro firmado de entrega de elementos de protección personal.",
		},
		{
			type: BasicDocumentType.SAFETY_AND_HEALTH_INFO,
			name: "Inducción sobre Información de riesgos laborales (DS44)",
			description:
				"Inducción sobre Información de riesgos laborales (DS44), la cual debe incluir, los riesgos a los que se podría estar expuesto en OTC y las respectivas medidas de control.",
		},
	],
}

export const getBasicDocuments = () => {
	return {
		category: DocumentCategory.BASIC,
		title: BASIC_FOLDER_STRUCTURE.title,
		documents: BASIC_FOLDER_STRUCTURE.documents,
	}
}
