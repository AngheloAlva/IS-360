import {
	PrismaClient,
	VEHICLE_TYPE,
	CRITICALITY,
	PLAN_FREQUENCY,
	WORK_ORDER_TYPE,
	WORK_ORDER_STATUS,
	WORK_ORDER_PRIORITY,
	WORK_ORDER_CAPEX,
	WORK_REQUEST_STATUS,
	WORK_REQUEST_TYPE,
	StartupFolderType,
	StartupFolderStatus,
	SAFETY_TALK_CATEGORY,
	SAFETY_TALK_STATUS,
} from "@prisma/client"
import { faker } from "@faker-js/faker"
import { auth } from "@/lib/auth"

const prisma = new PrismaClient()

// Configurar faker para español de Chile
faker.seed(123) // Para resultados consistentes

// Datos realistas chilenos
const chileanCompanyNames = [
	"Constructora Los Andes Ltda.",
	"Servicios Industriales Patagonia SpA",
	"Mantención y Proyectos del Norte",
	"Ingeniería y Construcción Austral",
	"Transportes y Logística Cordillera",
	"Soluciones Eléctricas Valparaíso",
	"Minería y Servicios Atacama",
	"Construcciones Metálicas del Sur",
	"Servicios Generales Bío Bío",
	"Ingeniería Industrial Maipo",
	"Obras Civiles y Montajes Ltda.",
	"Servicios Técnicos Aconcagua",
	"Mantenimiento Industrial Loa",
	"Proyectos y Construcción Elqui",
	"Servicios Mineros Copiapó",
	"Ingeniería del Pacífico SpA",
	"Construcciones y Montajes Arauco",
	"Servicios Industriales Llanquihue",
	"Mantención Eléctrica Coquimbo",
	"Obras y Proyectos Magallanes",
]

const chileanCities = [
	"Santiago",
	"Valparaíso",
	"Concepción",
	"La Serena",
	"Antofagasta",
	"Temuco",
	"Rancagua",
	"Talca",
	"Arica",
	"Chillán",
	"Iquique",
	"Los Ángeles",
	"Puerto Montt",
	"Coyhaique",
	"Punta Arenas",
]

const equipmentNames = [
	"Bomba Centrífuga Principal",
	"Compresor de Aire Industrial",
	"Transformador Eléctrico 500kVA",
	"Motor Eléctrico Trifásico",
	"Válvula de Control Neumática",
	"Intercambiador de Calor",
	"Turbina Generadora",
	"Sistema de Filtración",
	"Caldera Industrial",
	"Ventilador Centrífugo",
	"Reductor de Velocidad",
	"Tablero de Control Principal",
	"Sistema Hidráulico",
	"Unidad de Refrigeración",
	"Transportador de Banda",
	"Grúa Puente 10 Ton",
	"Sistema de Bombeo",
	"Equipo de Soldadura",
	"Compresor de Tornillo",
	"Generador Diesel 250kW",
]

// Función para generar RUT chileno válido
function generateChileanRUT(): string {
	const num = faker.number.int({ min: 5000000, max: 25000000 })
	let sum = 0
	let multiplier = 2

	const numStr = num.toString()
	for (let i = numStr.length - 1; i >= 0; i--) {
		sum += parseInt(numStr[i]) * multiplier
		multiplier = multiplier === 7 ? 2 : multiplier + 1
	}

	const remainder = sum % 11
	const dv = 11 - remainder
	let dvStr: string

	if (dv === 11) dvStr = "0"
	else if (dv === 10) dvStr = "K"
	else dvStr = dv.toString()

	return `${num.toString().slice(0, -3)}.${num.toString().slice(-3)}-${dvStr}`
}

// Función para generar patente chilena
function generateChileanPlate(): string {
	const letters = "ABCDEFGHJKLMNPRSTUVWXYZ"
	const oldFormat = faker.datatype.boolean()

	if (oldFormat) {
		// Formato antiguo: AA-1234
		return `${letters[faker.number.int({ min: 0, max: letters.length - 1 })]}${letters[faker.number.int({ min: 0, max: letters.length - 1 })]}-${faker.number.int({ min: 1000, max: 9999 })}`
	} else {
		// Formato nuevo: BBBB-12
		return `${letters[faker.number.int({ min: 0, max: letters.length - 1 })]}${letters[faker.number.int({ min: 0, max: letters.length - 1 })]}${letters[faker.number.int({ min: 0, max: letters.length - 1 })]}${letters[faker.number.int({ min: 0, max: letters.length - 1 })]}-${faker.number.int({ min: 10, max: 99 })}`
	}
}

async function main() {
	console.log("🌱 Iniciando seed de la base de datos...")

	// Limpiar datos existentes
	console.log("🧹 Limpiando datos existentes...")
	// await prisma.workEntry.deleteMany()
	// await prisma.milestone.deleteMany()
	// await prisma.workOrder.deleteMany()
	// await prisma.workPermit.deleteMany()
	// await prisma.lockoutPermit.deleteMany()
	// await prisma.maintenancePlanTask.deleteMany()
	// await prisma.maintenancePlan.deleteMany()
	// await prisma.equipment.deleteMany()
	// await prisma.vehicle.deleteMany()
	// await prisma.workRequest.deleteMany()
	// await prisma.startupFolder.deleteMany()
	// await prisma.userSafetyTalk.deleteMany()
	// await prisma.notification.deleteMany()
	// await prisma.company.deleteMany()
	// await prisma.counter.deleteMany()
	// await prisma.workRequestCounter.deleteMany()

	// Crear empresas contratistas
	console.log("🏢 Creando empresas contratistas...")
	const companies = []
	for (let i = 0; i < 20; i++) {
		const companyName = chileanCompanyNames[i]
		const company = await prisma.company.create({
			data: {
				name: companyName,
				rut: generateChileanRUT(),
				isActive: faker.datatype.boolean({ probability: 0.9 }),
				createdById: "8cNg2WgdgSO8ECWF1WV92o1lbzSZbkCJ",
				createdAt: faker.date.past({ years: 2 }),
				updatedAt: new Date(),
			},
		})
		companies.push(company)
	}
	console.log(`✅ ${companies.length} empresas creadas`)

	// Crear usuarios supervisores y trabajadores
	console.log("👥 Creando usuarios...")
	const users = []
	for (const company of companies) {
		// Crear 1-2 supervisores por empresa
		const supervisorCount = faker.number.int({ min: 1, max: 2 })
		for (let i = 0; i < supervisorCount; i++) {
			const firstName = faker.person.firstName()
			const lastName = faker.person.lastName()
			const password = "Password123!"

			const supervisor = await auth.api.signUpEmail({
				body: {
					name: `${firstName} ${lastName}`,
					password,
					documentAreas: [],
					email: faker.internet
						.email({
							firstName: firstName.toLowerCase(),
							lastName: lastName.toLowerCase(),
						})
						.toLowerCase(),
					rut: generateChileanRUT(),
					accessRole: "PARTNER_COMPANY",
					allowedModules: ["HOME", "WORK_ORDERS", "WORK_PERMITS", "EQUIPMENT", "SAFETY_TALK"],
					companyId: company.id,
					isSupervisor: true,
					phone: faker.phone.number({ style: "national" }),
				},
			})
			users.push(supervisor.user)
		}

		// Crear 3-5 trabajadores por empresa
		const workerCount = faker.number.int({ min: 3, max: 5 })
		for (let i = 0; i < workerCount; i++) {
			const firstName = faker.person.firstName()
			const lastName = faker.person.lastName()
			const password = "Password123!"

			const worker = await auth.api.signUpEmail({
				body: {
					name: `${firstName} ${lastName}`,
					password,
					documentAreas: [],
					email: faker.internet
						.email({
							firstName: firstName.toLowerCase(),
							lastName: lastName.toLowerCase(),
						})
						.toLowerCase(),
					rut: generateChileanRUT(),
					accessRole: "PARTNER_COMPANY",
					allowedModules: ["HOME", "SAFETY_TALK", "NOTIFICATIONS"],
					companyId: company.id,
					isSupervisor: false,
					phone: faker.phone.number({ style: "national" }),
				},
			})
			users.push(worker.user)
		}
	}
	console.log(`✅ ${users.length} usuarios creados`)

	// Crear vehículos
	console.log("🚗 Creando vehículos...")
	const vehicles = []
	const vehicleTypes: VEHICLE_TYPE[] = ["CAR", "TRUCK", "VAN", "BUS", "MOTORCYCLE"]
	const vehicleBrands = [
		"Toyota",
		"Chevrolet",
		"Ford",
		"Nissan",
		"Hyundai",
		"Kia",
		"Mazda",
		"Mitsubishi",
	]

	for (const company of companies) {
		const vehicleCount = faker.number.int({ min: 1, max: 3 })
		for (let i = 0; i < vehicleCount; i++) {
			const vehicle = await prisma.vehicle.create({
				data: {
					plate: generateChileanPlate(),
					model: faker.vehicle.model(),
					year: faker.number.int({ min: 2010, max: 2024 }),
					brand: faker.helpers.arrayElement(vehicleBrands),
					type: faker.helpers.arrayElement(vehicleTypes),
					color: faker.vehicle.color(),
					isMain: i === 0,
					isActive: true,
					companyId: company.id,
					createdAt: faker.date.past({ years: 1 }),
					updatedAt: new Date(),
				},
			})
			vehicles.push(vehicle)
		}
	}
	console.log(`✅ ${vehicles.length} vehículos creados`)

	// Crear equipos
	console.log("⚙️ Creando equipos...")
	const equipments = []
	const locations = chileanCities
	const criticalities: CRITICALITY[] = ["CRITICAL", "SEMICRITICAL", "UNCITICAL"]

	for (let i = 0; i < 30; i++) {
		const equipment = await prisma.equipment.create({
			data: {
				barcode: faker.string.alphanumeric(12).toUpperCase(),
				name: equipmentNames[i % equipmentNames.length],
				description: faker.lorem.sentence(),
				location: faker.helpers.arrayElement(locations),
				isOperational: faker.datatype.boolean({ probability: 0.85 }),
				type: faker.helpers.arrayElement(["Eléctrico", "Mecánico", "Hidráulico", "Neumático"]),
				tag: `EQ-${faker.string.alphanumeric(6).toUpperCase()}`,
				criticality: faker.helpers.arrayElement(criticalities),
				createdById: "8cNg2WgdgSO8ECWF1WV92o1lbzSZbkCJ",
				createdAt: faker.date.past({ years: 2 }),
				updatedAt: new Date(),
			},
		})
		equipments.push(equipment)
	}
	console.log(`✅ ${equipments.length} equipos creados`)

	// Crear planes de mantenimiento
	console.log("📋 Creando planes de mantenimiento...")
	const frequencies: PLAN_FREQUENCY[] = [
		"DAILY",
		"WEEKLY",
		"MONTHLY",
		"QUARTERLY",
		"BIANNUAL",
		"YEARLY",
	]

	for (let i = 0; i < 15; i++) {
		const equipment = faker.helpers.arrayElement(equipments)
		const plan = await prisma.maintenancePlan.create({
			data: {
				slug: faker.helpers.slugify(`plan-${equipment.name}-${faker.string.alphanumeric(4)}`),
				name: `Plan de Mantenimiento - ${equipment.name}`,
				description: faker.lorem.paragraph(),
				equipmentId: equipment.id,
				createdById: "8cNg2WgdgSO8ECWF1WV92o1lbzSZbkCJ",
				createdAt: faker.date.past({ years: 1 }),
				updatedAt: new Date(),
			},
		})

		// Crear tareas para el plan
		const taskCount = faker.number.int({ min: 2, max: 4 })
		for (let j = 0; j < taskCount; j++) {
			await prisma.maintenancePlanTask.create({
				data: {
					slug: faker.helpers.slugify(`task-${equipment.name}-${faker.string.alphanumeric(6)}`),
					name: faker.helpers.arrayElement([
						"Inspección Visual",
						"Lubricación",
						"Cambio de Filtros",
						"Revisión Eléctrica",
						"Calibración",
						"Limpieza General",
					]),
					description: faker.lorem.sentence(),
					frequency: faker.helpers.arrayElement(frequencies),
					nextDate: faker.date.future({ years: 1 }),
					isAutomated: faker.datatype.boolean({ probability: 0.3 }),
					equipmentId: equipment.id,
					maintenancePlanId: plan.id,
					createdById: "8cNg2WgdgSO8ECWF1WV92o1lbzSZbkCJ",
					createdAt: faker.date.past({ years: 1 }),
					updatedAt: new Date(),
				},
			})
		}
	}
	console.log("✅ Planes de mantenimiento creados")

	// Crear contador de OT
	await prisma.counter.create({
		data: {
			id: "ot_counter",
			value: 1,
		},
	})

	// Crear órdenes de trabajo
	console.log("📝 Creando órdenes de trabajo...")
	const workOrderTypes: WORK_ORDER_TYPE[] = ["CORRECTIVE", "PREVENTIVE", "PREDICTIVE", "PROACTIVE"]
	const workOrderStatuses: WORK_ORDER_STATUS[] = [
		"PLANNED",
		"PENDING",
		"IN_PROGRESS",
		"COMPLETED",
		"CANCELLED",
	]
	const priorities: WORK_ORDER_PRIORITY[] = ["HIGH", "MEDIUM", "LOW"]
	const capexOptions: WORK_ORDER_CAPEX[] = ["CONFIDABILITY", "MITIGATE_RISK", "COMPLIANCE"]

	for (let i = 0; i < 25; i++) {
		const company = faker.helpers.arrayElement(companies)
		const supervisor = await prisma.user.findFirst({
			where: {
				companyId: company.id,
				isSupervisor: true,
			},
		})
		const responsible = await prisma.user.findFirst({
			where: {
				companyId: company.id,
				isSupervisor: false,
			},
		})

		if (!supervisor || !responsible) continue

		const solicitationDate = faker.date.past({ years: 1 })
		const programDate = faker.date.soon({ days: 30, refDate: solicitationDate })
		const estimatedDays = faker.number.int({ min: 1, max: 15 })
		const estimatedHours = faker.number.int({ min: 4, max: 160 })

		const workOrder = await prisma.workOrder.create({
			data: {
				otNumber: `OT-${String(i + 1).padStart(6, "0")}`,
				type: faker.helpers.arrayElement(workOrderTypes),
				status: faker.helpers.arrayElement(workOrderStatuses),
				progress: faker.number.int({ min: 0, max: 100 }),
				solicitationDate: solicitationDate,
				solicitationTime: faker.date.recent().toTimeString().slice(0, 5),
				workRequest: faker.lorem.sentence(),
				workDescription: faker.lorem.paragraph(),
				priority: faker.helpers.arrayElement(priorities),
				capex: faker.helpers.arrayElement(capexOptions),
				programDate: programDate,
				estimatedHours: estimatedHours,
				estimatedDays: estimatedDays,
				estimatedEndDate: new Date(programDate.getTime() + estimatedDays * 24 * 60 * 60 * 1000),
				companyId: company.id,
				supervisorId: supervisor.id,
				responsibleId: responsible.id,
				createdAt: solicitationDate,
				updatedAt: new Date(),
			},
		})

		// Asignar equipos a la orden
		const equipmentCount = faker.number.int({ min: 1, max: 3 })
		const selectedEquipments = faker.helpers.arrayElements(equipments, equipmentCount)
		await prisma.workOrder.update({
			where: { id: workOrder.id },
			data: {
				equipments: {
					connect: selectedEquipments.map((eq) => ({ id: eq.id })),
				},
			},
		})
	}
	console.log("✅ Órdenes de trabajo creadas")

	// Crear solicitudes de trabajo
	console.log("📨 Creando solicitudes de trabajo...")
	await prisma.workRequestCounter.create({
		data: {
			id: "work_request_counter",
			value: 1,
		},
	})

	const workRequestStatuses: WORK_REQUEST_STATUS[] = [
		"REPORTED",
		"APPROVED",
		"ATTENDED",
		"CANCELLED",
	]
	const workRequestTypes: WORK_REQUEST_TYPE[] = ["MECHANIC", "ELECTRIC"]

	for (let i = 0; i < 20; i++) {
		const user = faker.helpers.arrayElement(users)
		const equipment = faker.helpers.arrayElement(equipments)

		await prisma.workRequest.create({
			data: {
				requestNumber: `SR-${String(i + 1).padStart(6, "0")}`,
				description: faker.lorem.paragraph(),
				isUrgent: faker.datatype.boolean({ probability: 0.2 }),
				requestDate: faker.date.past({ years: 1 }),
				observations: faker.datatype.boolean({ probability: 0.5 }) ? faker.lorem.sentence() : null,
				customLocation: faker.helpers.arrayElement(chileanCities),
				status: faker.helpers.arrayElement(workRequestStatuses),
				workType: faker.helpers.arrayElement(workRequestTypes),
				userId: user.id,
				operatorId: faker.datatype.boolean({ probability: 0.7 })
					? "8cNg2WgdgSO8ECWF1WV92o1lbzSZbkCJ"
					: null,
				equipments: {
					connect: [{ id: equipment.id }],
				},
				createdAt: faker.date.past({ years: 1 }),
				updatedAt: new Date(),
			},
		})
	}
	console.log("✅ Solicitudes de trabajo creadas")

	// Crear carpetas de arranque
	console.log("📁 Creando carpetas de arranque...")
	const startupFolderStatuses: StartupFolderStatus[] = ["PENDING", "IN_PROGRESS", "COMPLETED"]
	const startupFolderTypes: StartupFolderType[] = ["BASIC", "FULL"]

	for (const company of companies.slice(0, 15)) {
		await prisma.startupFolder.create({
			data: {
				name: `Carpeta de Arranque - ${company.name}`,
				type: faker.helpers.arrayElement(startupFolderTypes),
				status: faker.helpers.arrayElement(startupFolderStatuses),
				moreMonthDuration: faker.datatype.boolean({ probability: 0.3 }),
				companyId: company.id,
				createdAt: faker.date.past({ years: 1 }),
				updatedAt: new Date(),
			},
		})
	}
	console.log("✅ Carpetas de arranque creadas")

	// Crear charlas de seguridad
	console.log("🎓 Creando charlas de seguridad...")
	const safetyTalkCategories: SAFETY_TALK_CATEGORY[] = ["ENVIRONMENT", "VISITOR", "IRL"]
	const safetyTalkStatuses: SAFETY_TALK_STATUS[] = [
		"PENDING",
		"IN_PROGRESS",
		"PASSED",
		"FAILED",
		"BLOCKED",
	]

	for (const user of users.slice(0, 30)) {
		const category = faker.helpers.arrayElement(safetyTalkCategories)
		await prisma.userSafetyTalk.create({
			data: {
				category: category,
				status: faker.helpers.arrayElement(safetyTalkStatuses),
				currentAttempts: faker.number.int({ min: 0, max: 3 }),
				startedAt: faker.datatype.boolean({ probability: 0.7 })
					? faker.date.past({ years: 1 })
					: null,
				lastAttemptAt: faker.datatype.boolean({ probability: 0.5 }) ? faker.date.recent() : null,
				score: faker.datatype.boolean({ probability: 0.6 })
					? faker.number.float({ min: 60, max: 100, fractionDigits: 1 })
					: null,
				minRequiredScore: 70.0,
				userId: user.id,
				createdAt: faker.date.past({ years: 1 }),
				updatedAt: new Date(),
			},
		})
	}
	console.log("✅ Charlas de seguridad creadas")

	console.log("\n✨ Seed completado exitosamente!")
	console.log("\n📊 Resumen:")
	console.log(`   - ${companies.length} Empresas`)
	console.log(`   - ${users.length} Usuarios`)
	console.log(`   - ${vehicles.length} Vehículos`)
	console.log(`   - ${equipments.length} Equipos`)
	console.log(`   - 25 Órdenes de trabajo`)
	console.log(`   - 20 Solicitudes de trabajo`)
	console.log(`   - 15 Carpetas de arranque`)
	console.log(`   - 30 Charlas de seguridad`)
	console.log(`   - ~60 Notificaciones`)
}

main()
	.catch((e) => {
		console.error("❌ Error durante el seed:", e)
		process.exit(1)
	})
	.finally(async () => {
		await prisma.$disconnect()
	})
