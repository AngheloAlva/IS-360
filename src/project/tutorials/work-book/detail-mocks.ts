import { MILESTONE_STATUS, WORK_ORDER_STATUS } from "@/generated/prisma/enums"
import type { WorkBookById } from "@/project/work-order/hooks/use-work-book-by-id"
import type { Milestone } from "@/project/work-order/hooks/use-work-book-milestones"
import type { WorkEntry } from "@/project/work-order/hooks/use-work-entries"
import {
	WORK_BOOK_TUTORIAL_SLUG,
	type WorkBookTutorialSlug,
} from "@/project/tutorials/work-book/tutorials"

interface WorkBookTutorialDetailMock {
	workBook: WorkBookById
	milestones: Milestone[]
	entries: WorkEntry[]
}

const BASE_MILESTONES: Milestone[] = [
	{
		id: "tutorial-milestone-1",
		name: "Hito 1 - Preparacion de area",
		description: "Preparar zona y validar condiciones iniciales.",
		order: 1,
		closureComment: null,
		isCompleted: false,
		status: MILESTONE_STATUS.IN_PROGRESS,
		weight: 33.3,
		startDate: new Date(),
		endDate: new Date(),
		workOrderId: "tutorial-workbook",
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
		activities: [
			{
				id: "tutorial-activity-1",
				executionDate: new Date(),
				activityName: "Despeje inicial",
				comments: "Actividad base de ejemplo",
				activityEndTime: "12:00",
				activityStartTime: "09:00",
				_count: {
					assignedUsers: 2,
				},
			},
		],
	},
	{
		id: "tutorial-milestone-2",
		name: "Hito 2 - Ejecucion de trabajo",
		description: "Ejecutar actividades planificadas del trabajo.",
		order: 2,
		closureComment: null,
		isCompleted: false,
		status: MILESTONE_STATUS.IN_PROGRESS,
		weight: 33.3,
		startDate: new Date(),
		endDate: new Date(),
		workOrderId: "tutorial-workbook",
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
		activities: [
			{
				id: "tutorial-activity-2",
				executionDate: new Date(),
				activityName: "Montaje de estructura",
				comments: "Actividad base de ejemplo",
				activityEndTime: "17:30",
				activityStartTime: "13:30",
				_count: {
					assignedUsers: 3,
				},
			},
		],
	},
	{
		id: "tutorial-milestone-3",
		name: "Hito 3 - Cierre y limpieza",
		description: "Cerrar tareas y dejar evidencia final.",
		order: 3,
		closureComment: null,
		isCompleted: false,
		status: MILESTONE_STATUS.IN_PROGRESS,
		weight: 33.4,
		startDate: new Date(),
		endDate: new Date(),
		workOrderId: "tutorial-workbook",
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
		activities: [
			{
				id: "tutorial-activity-3",
				executionDate: new Date(),
				activityName: "Verificacion de cierre",
				comments: "Actividad base de ejemplo",
				activityEndTime: "19:00",
				activityStartTime: "18:00",
				_count: {
					assignedUsers: 1,
				},
			},
		],
	},
]

const BASE_WORK_BOOK: WorkBookById = {
	id: "tutorial-workbook",
	otNumber: "OT-2026-0099",
	workBookName: "Libro de Obras de Entrenamiento",
	workBookLocation: "Planta Maipu",
	workBookStartDate: new Date(),
	status: WORK_ORDER_STATUS.IN_PROGRESS,
	progress: 45,
	workRequest: "Corregir desgaste en estructura metalica",
	type: "CORRECTIVE",
	priority: "HIGH",
	programDate: new Date(),
	estimatedEndDate: new Date(),
	responsibleId: "tutorial-responsible",
	supervisorId: "tutorial-supervisor",
	companyId: "tutorial-company",
	createdAt: new Date(),
	updatedAt: new Date(),
	solicitationDate: new Date(),
	workDescription: "Trabajo de reforzamiento y soldadura",
	estimatedDays: 20,
	estimatedHours: 160,
	equipments: [
		{
			id: "eq-1",
			tag: "EQ-001",
			name: "Grua Horquilla",
			type: "Maquinaria",
			location: "Patio Norte",
			attachments: [],
		},
	],
	workBookEntries: {
		include: {
			createdBy: true,
			assignedUsers: true,
		},
	},
	company: {
		id: "tutorial-company",
		rut: "76.123.456-7",
		name: "Constructora Demo",
	},
	supervisor: {
		id: "tutorial-supervisor",
		rut: "11.111.111-1",
		name: "Patricio Rojas",
		email: "patricio.rojas@ejemplo.cl",
		phone: "+56 9 1234 5678",
	},
	responsible: {
		id: "tutorial-responsible",
		rut: "22.222.222-2",
		name: "Camila Soto",
		email: "camila.soto@ingsimple.cl",
		phone: "+56 9 8765 4321",
	},
	workPermits: [],
	_count: {
		milestones: BASE_MILESTONES.length,
	},
} as unknown as WorkBookById

const BASE_ENTRIES: WorkEntry[] = [
	{
		id: "entry-1",
		activityName: "Actividad Diaria - Inspeccion inicial",
		comments: "Registro de ejemplo para capacitacion",
		createdAt: new Date().toISOString(),
		activityStartTime: "09:00",
		activityEndTime: "11:30",
		supervisionComments: "",
		safetyObservations: "",
		nonConformities: "",
		inspectorName: "",
		recommendations: "",
		executionDate: new Date(),
		entryType: "DAILY_ACTIVITY",
		others: "",
		createdBy: {
			name: "Juan Soto",
		},
		assignedUsers: [],
		attachments: [],
		milestone: {
			id: "tutorial-milestone-1",
			name: "Hito 1 - Preparacion de area",
		},
	},
]

export function getWorkBookDetailMockByTutorial(
	slug: WorkBookTutorialSlug
): WorkBookTutorialDetailMock {
	if (slug === WORK_BOOK_TUTORIAL_SLUG.CREATE_MILESTONES) {
		return {
			workBook: {
				...BASE_WORK_BOOK,
				_count: {
					milestones: 0,
				},
			},
			milestones: [],
			entries: [],
		}
	}

	if (slug === WORK_BOOK_TUTORIAL_SLUG.REQUEST_APPROVAL) {
		return {
			workBook: {
				...BASE_WORK_BOOK,
				progress: 80,
			},
			milestones: BASE_MILESTONES,
			entries: BASE_ENTRIES,
		}
	}

	if (slug === WORK_BOOK_TUTORIAL_SLUG.RESPOND_INSPECTIONS) {
		return {
			workBook: {
				...BASE_WORK_BOOK,
				progress: 65,
			},
			milestones: BASE_MILESTONES,
			entries: BASE_ENTRIES,
		}
	}

	return {
		workBook: BASE_WORK_BOOK,
		milestones: BASE_MILESTONES,
		entries: BASE_ENTRIES,
	}
}
