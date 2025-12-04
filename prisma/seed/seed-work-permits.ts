import { PrismaClient, WORK_PERMIT_STATUS } from "@prisma/client"
import { faker } from "@faker-js/faker"

const prisma = new PrismaClient()

// Configurar faker
faker.seed(456) // Semilla diferente para variedad

// URL de archivo de prueba
const SAMPLE_FILE_URL =
	"https://sistemagestionotc.blob.core.windows.net/adjuntos/1761592632624-4a75jw4-5a99.svg"

// Datos realistas para permisos de trabajo
const mutualidades = [
	"Mutual de Seguridad",
	"ACHS (Asociación Chilena de Seguridad)",
	"IST (Instituto de Seguridad del Trabajo)",
	"Mutual de Seguridad de la Cámara Chilena de la Construcción",
]

const toolsList = [
	"Taladro eléctrico",
	"Amoladora angular",
	"Sierra circular",
	"Llave inglesa",
	"Destornilladores",
	"Alicate",
	"Martillo",
	"Nivel",
	"Cinta métrica",
	"Escalera",
	"Andamio",
	"Arnés de seguridad",
	"Casco de seguridad",
	"Guantes de seguridad",
	"Lentes de protección",
]

const preChecksList = [
	"Verificación de área de trabajo",
	"Inspección de herramientas",
	"Revisión de EPP",
	"Delimitación de zona",
	"Señalización instalada",
	"Permisos vigentes",
	"Condiciones climáticas favorables",
	"Iluminación adecuada",
	"Ventilación verificada",
	"Vías de escape despejadas",
]

const activityDetailsList = [
	"Instalación eléctrica",
	"Mantenimiento preventivo",
	"Reparación de equipos",
	"Soldadura",
	"Trabajo en altura",
	"Excavación",
	"Montaje de estructuras",
	"Pintura industrial",
	"Limpieza de equipos",
	"Inspección técnica",
]

const risksList = [
	"Caída de altura",
	"Contacto eléctrico",
	"Atrapamiento",
	"Golpes por objetos",
	"Cortes",
	"Quemaduras",
	"Exposición a químicos",
	"Ruido excesivo",
	"Sobreesfuerzo",
	"Proyección de partículas",
	"Incendio",
	"Explosión",
]

const controlMeasuresList = [
	"Uso obligatorio de EPP",
	"Señalización de área",
	"Delimitación con cinta",
	"Supervisión permanente",
	"Capacitación previa",
	"Inspección de equipos",
	"Ventilación adecuada",
	"Extintor disponible",
	"Botiquín de primeros auxilios",
	"Sistema de comunicación",
	"Procedimiento de emergencia",
]

const workTypes = [
	"Trabajo en caliente",
	"Trabajo en altura",
	"Trabajo eléctrico",
	"Trabajo en espacio confinado",
	"Excavación",
	"Izaje de cargas",
]

async function main() {
	console.log("🛡️ Iniciando seed de permisos de trabajo...")

	// Obtener órdenes de trabajo existentes
	const workOrders = await prisma.workOrder.findMany({
		include: {
			company: true,
			supervisor: true,
			responsible: true,
		},
	})

	if (workOrders.length === 0) {
		console.log("⚠️ No hay órdenes de trabajo. Ejecuta primero el seed principal.")
		return
	}

	console.log(`📋 Encontradas ${workOrders.length} órdenes de trabajo`)

	// Obtener usuarios para asignar como participantes
	const users = await prisma.user.findMany({
		where: {
			accessRole: "PARTNER_COMPANY",
		},
	})

	const statuses: WORK_PERMIT_STATUS[] = ["ACTIVE", "COMPLETED", "REVIEW_PENDING", "REJECTED"]

	let permitsCreated = 0

	// Crear permisos de trabajo para ~60% de las órdenes
	for (const workOrder of workOrders) {
		// Saltar si no tiene empresa asignada
		if (!workOrder.companyId) continue

		// 60% de probabilidad de crear permiso
		if (faker.datatype.boolean({ probability: 0.6 })) {
			const companyUsers = users.filter((u) => u.companyId === workOrder.companyId)

			if (companyUsers.length === 0) continue

			const startDate = faker.date.between({
				from: workOrder.programDate,
				to: workOrder.estimatedEndDate,
			})
			const endDate = faker.date.soon({ days: faker.number.int({ min: 1, max: 5 }), refDate: startDate })

			const status = faker.helpers.arrayElement(statuses)
			const isCompleted = status === "COMPLETED"
			const isApproved = status === "ACTIVE" || status === "COMPLETED"

			// Seleccionar participantes (2-5 usuarios de la misma empresa)
			const participantCount = faker.number.int({ min: 2, max: Math.min(5, companyUsers.length) })
			const participants = faker.helpers.arrayElements(companyUsers, participantCount)

			const workPermit = await prisma.workPermit.create({
				data: {
					status: status,
					isUrgent: faker.datatype.boolean({ probability: 0.2 }),
					aplicantPt: faker.helpers.arrayElement(companyUsers).name,
					mutuality: faker.helpers.arrayElement(mutualidades),
					otherMutuality: faker.datatype.boolean({ probability: 0.1 })
						? faker.company.name()
						: null,
					exactPlace: `${faker.helpers.arrayElement([
						"Sala de máquinas",
						"Área de producción",
						"Bodega",
						"Oficinas",
						"Patio exterior",
						"Planta baja",
						"Segundo piso",
						"Techo",
						"Estacionamiento",
						"Zona de carga",
					])} - ${faker.location.street()}`,
					workWillBe: faker.helpers.arrayElement(workTypes),
					workWillBeOther: faker.datatype.boolean({ probability: 0.15 })
						? faker.lorem.sentence()
						: null,
					tools: faker.helpers.arrayElements(toolsList, faker.number.int({ min: 3, max: 8 })),
					otherTools: faker.datatype.boolean({ probability: 0.2 })
						? faker.helpers.arrayElement([
								"Equipo de medición láser",
								"Cámara termográfica",
								"Detector de gases",
								"Multímetro digital",
							])
						: null,
					preChecks: faker.helpers.arrayElements(
						preChecksList,
						faker.number.int({ min: 4, max: 8 })
					),
					otherPreChecks: faker.datatype.boolean({ probability: 0.15 })
						? faker.lorem.sentence()
						: null,
					activityDetails: faker.helpers.arrayElements(
						activityDetailsList,
						faker.number.int({ min: 2, max: 5 })
					),
					riskIdentification: faker.helpers.arrayElements(
						risksList,
						faker.number.int({ min: 3, max: 6 })
					),
					otherRisk: faker.datatype.boolean({ probability: 0.2 }) ? faker.lorem.sentence() : null,
					preventiveControlMeasures: faker.helpers.arrayElements(
						controlMeasuresList,
						faker.number.int({ min: 4, max: 8 })
					),
					otherPreventiveControlMeasures: faker.datatype.boolean({ probability: 0.15 })
						? faker.lorem.sentence()
						: null,
					generateWaste: faker.datatype.boolean({ probability: 0.7 }),
					wasteType: faker.datatype.boolean({ probability: 0.7 })
						? faker.helpers.arrayElement([
								"Residuos metálicos",
								"Residuos plásticos",
								"Residuos de madera",
								"Residuos peligrosos",
								"Aceites usados",
								"Envases contaminados",
							])
						: null,
					wasteDisposalLocation: faker.datatype.boolean({ probability: 0.7 })
						? faker.helpers.arrayElement([
								"Contenedor de residuos peligrosos",
								"Punto limpio autorizado",
								"Bodega de residuos",
								"Zona de acopio temporal",
							])
						: null,
					whoDeliversWorkAreaOp: isCompleted ? workOrder.supervisor.name : undefined,
					workerExecutor: faker.helpers.arrayElement(participants).name,
					workCompleted: isCompleted ? true : null,
					cleanAndTidyWorkArea: isCompleted
						? faker.datatype.boolean({ probability: 0.95 })
						: null,
					additionalObservations: faker.datatype.boolean({ probability: 0.4 })
						? faker.lorem.paragraph()
						: null,
					observations: faker.datatype.boolean({ probability: 0.3 }) ? faker.lorem.sentence() : null,
					acceptTerms: true,
					startDate: startDate,
					endDate: endDate,
					initialAreaMeasurement: faker.number.float({ min: 10, max: 500, fractionDigits: 2 }),
					approvalDate: isApproved ? faker.date.between({ from: startDate, to: endDate }) : null,
					approvalById: isApproved ? workOrder.supervisorId : null,
					approvalNotes: isApproved && faker.datatype.boolean({ probability: 0.3 })
						? faker.lorem.sentence()
						: null,
					closingDate: isCompleted ? endDate : null,
					closingById: isCompleted ? workOrder.responsibleId : null,
					preventionOfficerId: faker.datatype.boolean({ probability: 0.8 })
						? workOrder.supervisorId
						: null,
					otNumberId: workOrder.id,
					userId: faker.helpers.arrayElement(companyUsers).id,
					companyId: workOrder.companyId,
					participants: {
						connect: participants.map((p) => ({ id: p.id })),
					},
					createdAt: faker.date.between({
						from: new Date(workOrder.createdAt),
						to: startDate,
					}),
					updatedAt: new Date(),
				},
			})

			// Crear adjuntos para el permiso (1-3 archivos)
			const attachmentCount = faker.number.int({ min: 1, max: 3 })
			for (let i = 0; i < attachmentCount; i++) {
				await prisma.workPermitAttachment.create({
					data: {
						name: faker.helpers.arrayElement([
							"Análisis de riesgo.pdf",
							"Procedimiento de trabajo.pdf",
							"Certificado EPP.pdf",
							"Plano de ubicación.pdf",
							"Checklist de seguridad.pdf",
							"Autorización especial.pdf",
						]),
						url: SAMPLE_FILE_URL,
						type: "application/pdf",
						size: faker.number.int({ min: 50000, max: 500000 }),
						uploadedById: faker.helpers.arrayElement(companyUsers).id,
						workPermitId: workPermit.id,
						uploadedAt: faker.date.between({
							from: new Date(workPermit.createdAt),
							to: new Date(),
						}),
						createdAt: new Date(workPermit.createdAt),
						updatedAt: new Date(),
					},
				})
			}

			permitsCreated++
		}
	}

	console.log(`✅ ${permitsCreated} permisos de trabajo creados`)
	console.log("\n📊 Resumen:")
	console.log(`   - Permisos de trabajo: ${permitsCreated}`)
	console.log(`   - Adjuntos: ~${permitsCreated * 2} archivos`)
}

main()
	.catch((e) => {
		console.error("❌ Error durante el seed de permisos:", e)
		process.exit(1)
	})
	.finally(async () => {
		await prisma.$disconnect()
	})
