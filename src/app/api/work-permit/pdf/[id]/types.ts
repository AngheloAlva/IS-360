import type { WorkPermit } from "@/generated/prisma/client"

export interface WorkPermitData extends WorkPermit {
	otNumber?: {
		otNumber: string
		workBookName?: string
		workRequest: string
		workDescription: string
		supervisor: {
			name: string
			rut: string
		}
		responsible: {
			name: string
			rut: string
		}
	}
	user: {
		name: string
		rut: string
		internalRole: string
	}
	company: {
		name: string
		rut: string
	}
	participants: {
		name: string
		rut: string
		internalRole: string
	}[]
	activities?: {
		id: string
		activity: string
		peligros: string[]
		riesgos: string[]
		medidasDeControl: string[]
		otroPeligro: string | null
		otroRiesgo: string | null
		otraMedidaDeControl: string | null
		order: number
		workPermitId: string
	}[]
}
