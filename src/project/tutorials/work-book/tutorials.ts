import { WORK_ORDER_PRIORITY, WORK_ORDER_STATUS, WORK_ORDER_TYPE } from "@/generated/prisma/enums"
import type {
	WorkBookByCompany,
	WorkBooksResponse,
} from "@/project/work-order/hooks/use-work-books-by-company"
import type { TutorialDefinition, TutorialLink } from "@/project/tutorials/types"

export const WORK_BOOK_TUTORIAL_SLUG = {
	CREATE_WORK_BOOK: "crear-libro-de-obras",
	CREATE_MILESTONES: "crear-hitos-y-actividades",
	REQUEST_APPROVAL: "mandar-a-aprobacion",
	RESPOND_INSPECTIONS: "responder-inspecciones-de-seguridad",
} as const

export type WorkBookTutorialSlug =
	(typeof WORK_BOOK_TUTORIAL_SLUG)[keyof typeof WORK_BOOK_TUTORIAL_SLUG]

const WORK_BOOK_TUTORIAL_BASE_PATH = "/dashboard/libro-de-obras/tutoriales"

const WORK_BOOK_TUTORIALS: TutorialDefinition[] = [
	{
		slug: WORK_BOOK_TUTORIAL_SLUG.CREATE_WORK_BOOK,
		title: "Como crear un Libro de Obra",
		description: "Aprende a identificar una OT sin libro y simular su creacion.",
		steps: [
			{
				id: "open-tutorials",
				title: "Seleccionar tutorial",
				description: "Usa este boton para abrir el listado de tutoriales disponibles del modulo.",
				targetId: "work-book-tutorial-dropdown",
			},
			{
				id: "review-missing-book",
				title: "OT sin libro creado",
				description:
					"Este texto en rojo indica que la OT aun no tiene libro de obras. Haz click para iniciar el formulario.",
				targetId: "work-book-missing-name",
			},
			{
				id: "complete-book-name",
				title: "Completar nombre de obra",
				description: "Ingresa el nombre de la obra de ejemplo para simular la creacion.",
				targetId: "work-book-init-name",
			},
			{
				id: "complete-start-date",
				title: "Seleccionar fecha de inicio",
				description: "Selecciona la fecha de inicio y luego confirma la simulacion.",
				targetId: "work-book-init-date",
			},
			{
				id: "simulate-submit",
				title: "Simular creacion",
				description:
					"Este boton no crea datos reales. Solo simula la accion para entrenamiento del contratista.",
				targetId: "work-book-init-submit",
			},
		],
	},
	{
		slug: WORK_BOOK_TUTORIAL_SLUG.CREATE_MILESTONES,
		title: "Como crear Hitos y agregar actividades",
		description: "Flujo guiado para crear hitos y luego registrar actividad diaria.",
		steps: [
			{
				id: "workbook-header",
				title: "Encabezado del libro",
				description: "Aqui ves el nombre del libro, OT, estado y progreso general del trabajo.",
				targetId: "tutorial-workbook-header",
			},
			{
				id: "workbook-accordions",
				title: "Datos generales del libro",
				description:
					"En esta seccion estan los detalles de OT y equipos para contexto antes de registrar hitos.",
				targetId: "tutorial-workbook-accordions",
			},
			{
				id: "milestone-open-form",
				title: "Abrir formulario de hitos",
				description: "Con este boton se abre el formulario para crear o editar hitos del libro.",
				targetId: "tutorial-create-milestones",
			},
			{
				id: "milestone-fill-form",
				title: "Revisar datos del formulario",
				description: "Aqui revisas los hitos precompletados. En este paso se bloquea el guardado.",
				targetId: "tutorial-milestones-sheet",
			},
			{
				id: "milestone-save",
				title: "Guardar hitos",
				description:
					"Presiona Guardar Hitos para simular la creacion de los hitos de entrenamiento.",
				targetId: "tutorial-milestones-submit",
			},
			{
				id: "activities-tab",
				title: "Ir a actividades diarias",
				description: "Cambia al tab de actividades para registrar el trabajo diario.",
				targetId: "tutorial-tab-activities",
			},
			{
				id: "activity-open-form",
				title: "Abrir actividad diaria",
				description:
					"Usa este boton para abrir el formulario de Actividad Diaria con datos de ejemplo.",
				targetId: "tutorial-create-activity",
			},
			{
				id: "activity-fill-form",
				title: "Revisar formulario de actividad",
				description: "Revisa el detalle del formulario. En este paso se bloquea el guardado.",
				targetId: "tutorial-activity-sheet",
			},
			{
				id: "activity-save",
				title: "Guardar actividad",
				description: "Presiona Crear actividad para simular el registro diario.",
				targetId: "tutorial-activity-submit",
			},
		],
	},
	{
		slug: WORK_BOOK_TUTORIAL_SLUG.REQUEST_APPROVAL,
		title: "Como mandar a aprobacion",
		description: "Simula el envio de hitos a aprobacion y el avance final del libro.",
		steps: [
			{
				id: "approval-open-action",
				title: "Abrir accion de aprobacion",
				description:
					"Ubica un hito disponible y presiona Enviar a Aprobacion para abrir la confirmacion.",
				targetId: "tutorial-send-approval",
			},
			{
				id: "approval-review-dialog",
				title: "Revisar cuadro de confirmacion",
				description: "En este cuadro se confirma el envio del hito a aprobacion de forma simulada.",
				targetId: "tutorial-approval-dialog",
			},
			{
				id: "approval-confirm",
				title: "Confirmar envio",
				description: "Presiona Confirmar envio para completar el paso del hito seleccionado.",
				targetId: "tutorial-approval-confirm",
			},
			{
				id: "approval-rule",
				title: "Regla de finalizacion",
				description: "Cuando todos los hitos son aprobados, el libro llega automaticamente a 100%.",
				targetId: "tutorial-approval-note",
			},
		],
	},
	{
		slug: WORK_BOOK_TUTORIAL_SLUG.RESPOND_INSPECTIONS,
		title: "Responder Inspecciones de Seguridad",
		description: "Practica el ciclo contratista/interno hasta cerrar una inspeccion aprobada.",
		steps: [
			{
				id: "inspection-open-form",
				title: "Abrir formulario de inspeccion",
				description:
					"Con este boton se abre el formulario para registrar una inspeccion de ejemplo.",
				targetId: "tutorial-inspection-create",
			},
			{
				id: "inspection-review-form",
				title: "Revisar datos de inspeccion",
				description: "Aqui se visualizan los campos del formulario con datos de entrenamiento.",
				targetId: "tutorial-inspection-sheet",
			},
			{
				id: "inspection-submit",
				title: "Crear inspeccion",
				description: "Presiona Crear Inspeccion para simular el registro inicial.",
				targetId: "tutorial-inspection-submit",
			},
			{
				id: "inspection-status",
				title: "Ver estado del ciclo",
				description: "Aqui ves el estado actual de la inspeccion durante las respuestas.",
				targetId: "tutorial-inspection-status",
			},
			{
				id: "inspection-contractor-response",
				title: "Responder como contratista",
				description:
					"Agrega comentario y, si quieres, adjunto opcional para responder la observacion.",
				targetId: "tutorial-inspection-respond",
			},
			{
				id: "inspection-internal-review",
				title: "Revision Interna",
				description:
					"El responsable interno puede aprobar o rechazar. Si rechaza, el contratista vuelve a responder hasta aprobar.",
				targetId: "tutorial-inspection-review",
			},
		],
	},
]

export const WORK_BOOK_TUTORIAL_LINKS: TutorialLink[] = WORK_BOOK_TUTORIALS.map((tutorial) => ({
	slug: tutorial.slug,
	title: tutorial.title,
	description: tutorial.description,
	href: `${WORK_BOOK_TUTORIAL_BASE_PATH}/${tutorial.slug}`,
}))

export function getWorkBookTutorialBySlug(slug: string): TutorialDefinition | null {
	return WORK_BOOK_TUTORIALS.find((tutorial) => tutorial.slug === slug) ?? null
}

export function isWorkBookDetailTutorial(slug: string): boolean {
	return slug !== WORK_BOOK_TUTORIAL_SLUG.CREATE_WORK_BOOK
}

const WORK_BOOK_TUTORIAL_MOCK_ROWS: WorkBookByCompany[] = [
	{
		id: "mock-wb-001",
		otNumber: "OT-2026-0001",
		workBookName: "Montaje estructura sector norte",
		rescheduledEndDate: new Date("2026-02-20"),
		estimatedEndDate: new Date("2026-02-20"),
		workBookLocation: "Planta Maipu",
		workBookStartDate: "2026-02-01",
		progress: 45,
		status: WORK_ORDER_STATUS.IN_PROGRESS,
		solicitationDate: new Date("2026-01-25"),
		type: WORK_ORDER_TYPE.CORRECTIVE,
		priority: WORK_ORDER_PRIORITY.HIGH,
		workRequest: "Corregir desgaste en estructura metalica",
		programDate: new Date("2026-02-02"),
		estimatedDays: 20,
		estimatedHours: 160,
		workDescription: "Trabajo de reforzamiento y soldadura",
		equipments: [{ name: "Grua Horquilla" }, { name: "Plataforma Elevadora" }],
		supervisor: {
			id: "mock-supervisor-1",
			name: "Patricio Rojas",
			email: "patricio.rojas@ejemplo.cl",
			role: "SUPERVISOR",
		},
		responsible: {
			id: "mock-responsable-1",
			name: "Camila Soto",
			email: "camila.soto@ingsimple.cl",
			role: "INTERNAL_MEMBER",
		},
		_count: {
			workBookEntries: 12,
		},
	},
	{
		id: "mock-wb-002",
		otNumber: "OT-2026-0008",
		workBookName: "Cambio de valvulas linea 3",
		workBookLocation: "Planta Quilicura",
		workBookStartDate: "2026-01-20",
		estimatedEndDate: new Date("2026-02-20"),
		rescheduledEndDate: new Date("2026-02-20"),
		progress: 100,
		status: WORK_ORDER_STATUS.CLOSURE_REQUESTED,
		solicitationDate: new Date("2026-01-15"),
		type: WORK_ORDER_TYPE.PREVENTIVE,
		priority: WORK_ORDER_PRIORITY.MEDIUM,
		workRequest: "Reemplazo de valvulas por mantenimiento preventivo",
		programDate: new Date("2026-01-20"),
		estimatedDays: 10,
		estimatedHours: 80,
		workDescription: "Recambio de piezas y prueba de presion",
		equipments: [{ name: "Compresor" }],
		supervisor: {
			id: "mock-supervisor-2",
			name: "Andrea Fuentes",
			email: "andrea.fuentes@ejemplo.cl",
			role: "SUPERVISOR",
		},
		responsible: {
			id: "mock-responsable-2",
			name: "Pablo Mella",
			email: "pablo.mella@ingsimple.cl",
			role: "INTERNAL_MEMBER",
		},
		_count: {
			workBookEntries: 20,
		},
	},
	{
		id: "mock-wb-003",
		otNumber: "OT-2026-0014",
		workBookName: null,
		workBookLocation: "Planta Renca",
		estimatedEndDate: null,
		rescheduledEndDate: null,
		workBookStartDate: null,
		progress: 0,
		status: WORK_ORDER_STATUS.PLANNED,
		solicitationDate: new Date("2026-02-10"),
		type: WORK_ORDER_TYPE.PROACTIVE,
		priority: WORK_ORDER_PRIORITY.LOW,
		workRequest: "Inspeccion visual de soportes",
		programDate: new Date("2026-03-01"),
		estimatedDays: 5,
		estimatedHours: 32,
		workDescription: "Inspeccion inicial para planificacion",
		equipments: [{ name: "Camioneta" }],
		supervisor: {
			id: "mock-supervisor-3",
			name: "Cristian Arriagada",
			email: "cristian.arriagada@ejemplo.cl",
			role: "SUPERVISOR",
		},
		responsible: {
			id: "mock-responsable-3",
			name: "Valeria Salas",
			email: "valeria.salas@ingsimple.cl",
			role: "INTERNAL_MEMBER",
		},
		_count: {
			workBookEntries: 0,
		},
	},
]

export const WORK_BOOK_TUTORIAL_MOCK_DATA: WorkBooksResponse = {
	workBooks: WORK_BOOK_TUTORIAL_MOCK_ROWS,
	total: WORK_BOOK_TUTORIAL_MOCK_ROWS.length,
	pages: 1,
}
