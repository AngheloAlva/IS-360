import {
	PrismaClient,
	ReviewStatus,
	SafetyAndHealthDocumentType,
	WorkerDocumentType,
	VehicleDocumentType,
	EnvironmentalDocType,
	EnvironmentDocType,
	BasicDocumentType,
	TechSpecsDocumentType,
	LABOR_CONTROL_STATUS,
	LABOR_CONTROL_DOCUMENT_TYPE,
	WORKER_LABOR_CONTROL_DOCUMENT_TYPE,
} from "@prisma/client"
import { faker } from "@faker-js/faker"

const prisma = new PrismaClient()

// Configurar faker
faker.seed(789)

// URL de archivo de prueba
const SAMPLE_FILE_URL =
	"https://sistemagestionotc.blob.core.windows.net/adjuntos/1761592632624-4a75jw4-5a99.svg"

// Meses en español
const MONTHS = [
	"Enero",
	"Febrero",
	"Marzo",
	"Abril",
	"Mayo",
	"Junio",
	"Julio",
	"Agosto",
	"Septiembre",
	"Octubre",
	"Noviembre",
	"Diciembre",
]

async function main() {
	console.log("📁 Iniciando seed de carpetas de arranque y control laboral...")

	// Obtener carpetas de arranque existentes
	const startupFolders = await prisma.startupFolder.findMany({
		include: {
			company: true,
		},
	})

	if (startupFolders.length === 0) {
		console.log("⚠️ No hay carpetas de arranque. Ejecuta primero el seed principal.")
		return
	}

	console.log(`📋 Encontradas ${startupFolders.length} carpetas de arranque`)

	// Obtener usuarios
	const users = await prisma.user.findMany({
		where: {
			accessRole: "PARTNER_COMPANY",
		},
	})

	// Obtener vehículos
	const vehicles = await prisma.vehicle.findMany()

	const reviewStatuses: ReviewStatus[] = ["DRAFT", "SUBMITTED", "APPROVED", "REJECTED"]

	let foldersProcessed = 0
	let documentsCreated = 0

	// Intentar limpiar carpetas de arranque existentes
	console.log("🧹 Limpiando carpetas de arranque existentes...")
	let skipStartupFolders = false
	try {
		await prisma.safetyAndHealthDocument.deleteMany({})
		await prisma.workerDocument.deleteMany({})
		await prisma.vehicleDocument.deleteMany({})
		await prisma.environmentalDocument.deleteMany({})
		await prisma.environmentDocument.deleteMany({})
		await prisma.basicDocument.deleteMany({})
		await prisma.techSpecsDocument.deleteMany({})

		await prisma.safetyAndHealthFolder.deleteMany({})
		await prisma.workerFolder.deleteMany({})
		await prisma.vehicleFolder.deleteMany({})
		await prisma.environmentalFolder.deleteMany({})
		await prisma.environmentFolder.deleteMany({})
		await prisma.basicFolder.deleteMany({})
		await prisma.techSpecsFolder.deleteMany({})

		console.log("✅ Carpetas de arranque limpiadas")
	} catch {
		console.log("⚠️ No se pudieron limpiar las carpetas de arranque, se omitirá esta sección")
		console.log("   Continuando solo con control laboral...")
		skipStartupFolders = true
	}

	// Procesar cada carpeta de arranque
	if (!skipStartupFolders) {
	for (const startupFolder of startupFolders) {
		const companyUsers = users.filter((u) => u.companyId === startupFolder.companyId)
		const companyVehicles = vehicles.filter((v) => v.companyId === startupFolder.companyId)

		if (companyUsers.length === 0) continue

		// 1. CARPETA DE SEGURIDAD Y SALUD
		console.log(
			`   📄 Procesando carpeta de seguridad y salud para ${startupFolder.company.name}...`
		)

		const safetyFolder = await prisma.safetyAndHealthFolder.create({
			data: {
				status: faker.helpers.arrayElement(reviewStatuses),
				additionalNotificationEmails: faker.helpers.arrayElements(
					companyUsers.map((u) => u.email),
					faker.number.int({ min: 1, max: 3 })
				),
				submittedAt: faker.datatype.boolean({ probability: 0.7 })
					? faker.date.recent({ days: 30 })
					: null,
				startupFolderId: startupFolder.id,
				reviewerId: faker.datatype.boolean({ probability: 0.6 })
					? faker.helpers.arrayElement(companyUsers).id
					: null,
			},
		})

		// Documentos de seguridad y salud
		const safetyDocTypes: SafetyAndHealthDocumentType[] = [
			"COMPANY_INFO",
			"STAFF_LIST",
			"MUTUAL",
			"INTERNAL_REGULATION",
			"RISK_MATRIX",
			"PREVENTION_PLAN",
			"WORK_PROCEDURE",
			"EMERGENCY_PROCEDURE",
			"PPE_CERTIFICATION",
			"ORGANIZATION_CHART",
		]

		for (const docType of faker.helpers.arrayElements(
			safetyDocTypes,
			faker.number.int({ min: 5, max: safetyDocTypes.length })
		)) {
			await prisma.safetyAndHealthDocument.create({
				data: {
					type: docType,
					name: `${docType.replace(/_/g, " ").toLowerCase()}.pdf`,
					url: SAMPLE_FILE_URL,
					category: "SAFETY_AND_HEALTH",
					status: faker.helpers.arrayElement(reviewStatuses),
					reviewNotes: faker.datatype.boolean({ probability: 0.3 }) ? faker.lorem.sentence() : null,
					reviewedAt: faker.datatype.boolean({ probability: 0.5 })
						? faker.date.recent({ days: 20 })
						: null,
					submittedAt: faker.datatype.boolean({ probability: 0.7 })
						? faker.date.recent({ days: 25 })
						: null,
					expirationDate: faker.datatype.boolean({ probability: 0.6 })
						? faker.date.future({ years: 1 })
						: null,
					uploadedById: faker.helpers.arrayElement(companyUsers).id,
					reviewerId: faker.datatype.boolean({ probability: 0.5 })
						? faker.helpers.arrayElement(companyUsers).id
						: null,
					folderId: safetyFolder.id,
				},
			})
			documentsCreated++
		}

		// 2. CARPETAS DE TRABAJADORES
		console.log(`   👷 Procesando carpetas de trabajadores...`)

		const workerCount = Math.min(companyUsers.length, faker.number.int({ min: 3, max: 8 }))
		const selectedWorkers = faker.helpers.arrayElements(companyUsers, workerCount)

		for (const worker of selectedWorkers) {
			const workerFolder = await prisma.workerFolder.create({
				data: {
					status: faker.helpers.arrayElement(reviewStatuses),
					additionalNotificationEmails: [worker.email],
					submittedAt: faker.datatype.boolean({ probability: 0.7 })
						? faker.date.recent({ days: 30 })
						: null,
					isDriver: faker.datatype.boolean({ probability: 0.6 }),
					workerId: worker.id,
					startupFolderId: startupFolder.id,
					reviewerId: faker.datatype.boolean({ probability: 0.6 })
						? faker.helpers.arrayElement(companyUsers).id
						: null,
				},
			})

			// Documentos del trabajador
			const workerDocTypes: WorkerDocumentType[] = [
				"CONTRACT",
				"INTERNAL_REGULATION_RECEIPT",
				"RISK_INFORMATION",
				"ID_CARD",
				"HEALTH_EXAM",
				"RISK_MATRIX_TRAINING",
				"WORK_PROCEDURE_TRAINING",
				"PPE_RECEIPT",
			]

			for (const docType of faker.helpers.arrayElements(
				workerDocTypes,
				faker.number.int({ min: 4, max: workerDocTypes.length })
			)) {
				await prisma.workerDocument.create({
					data: {
						type: docType,
						name: `${worker.name} - ${docType.replace(/_/g, " ").toLowerCase()}.pdf`,
						url: SAMPLE_FILE_URL,
						category: "PERSONNEL",
						status: faker.helpers.arrayElement(reviewStatuses),
						reviewNotes: faker.datatype.boolean({ probability: 0.2 })
							? faker.lorem.sentence()
							: null,
						reviewedAt: faker.datatype.boolean({ probability: 0.5 })
							? faker.date.recent({ days: 20 })
							: null,
						submittedAt: faker.datatype.boolean({ probability: 0.7 })
							? faker.date.recent({ days: 25 })
							: null,
						expirationDate: faker.datatype.boolean({ probability: 0.5 })
							? faker.date.future({ years: 1 })
							: null,
						uploadedById: worker.id,
						reviewerId: faker.datatype.boolean({ probability: 0.5 })
							? faker.helpers.arrayElement(companyUsers).id
							: null,
						folderId: workerFolder.id,
					},
				})
				documentsCreated++
			}
		}

		// 3. CARPETAS DE VEHÍCULOS
		if (companyVehicles.length > 0) {
			console.log(`   🚗 Procesando carpetas de vehículos...`)

			for (const vehicle of companyVehicles) {
				const vehicleFolder = await prisma.vehicleFolder.create({
					data: {
						status: faker.helpers.arrayElement(reviewStatuses),
						additionalNotificationEmails: faker.helpers.arrayElements(
							companyUsers.map((u) => u.email),
							faker.number.int({ min: 1, max: 2 })
						),
						submittedAt: faker.datatype.boolean({ probability: 0.7 })
							? faker.date.recent({ days: 30 })
							: null,
						vehicleId: vehicle.id,
						startupFolderId: startupFolder.id,
						reviewerId: faker.datatype.boolean({ probability: 0.6 })
							? faker.helpers.arrayElement(companyUsers).id
							: null,
					},
				})

				// Documentos del vehículo
				const vehicleDocTypes: VehicleDocumentType[] = [
					"EQUIPMENT_FILE",
					"VEHICLE_REGISTRATION",
					"CIRCULATION_PERMIT",
					"TECHNICAL_REVIEW",
					"INSURANCE",
					"CHECKLIST",
				]

				for (const docType of faker.helpers.arrayElements(
					vehicleDocTypes,
					faker.number.int({ min: 4, max: vehicleDocTypes.length })
				)) {
					await prisma.vehicleDocument.create({
						data: {
							type: docType,
							name: `${vehicle.plate} - ${docType.replace(/_/g, " ").toLowerCase()}.pdf`,
							url: SAMPLE_FILE_URL,
							category: "VEHICLES",
							status: faker.helpers.arrayElement(reviewStatuses),
							reviewNotes: faker.datatype.boolean({ probability: 0.2 })
								? faker.lorem.sentence()
								: null,
							reviewedAt: faker.datatype.boolean({ probability: 0.5 })
								? faker.date.recent({ days: 20 })
								: null,
							submittedAt: faker.datatype.boolean({ probability: 0.7 })
								? faker.date.recent({ days: 25 })
								: null,
							expirationDate: faker.datatype.boolean({ probability: 0.8 })
								? faker.date.future({ years: 1 })
								: null,
							uploadedById: faker.helpers.arrayElement(companyUsers).id,
							reviewerId: faker.datatype.boolean({ probability: 0.5 })
								? faker.helpers.arrayElement(companyUsers).id
								: null,
							folderId: vehicleFolder.id,
						},
					})
					documentsCreated++
				}
			}
		}

		// 4. CARPETA AMBIENTAL
		console.log(`   🌱 Procesando carpeta ambiental...`)

		const environmentalFolder = await prisma.environmentalFolder.create({
			data: {
				status: faker.helpers.arrayElement(reviewStatuses),
				additionalNotificationEmails: faker.helpers.arrayElements(
					companyUsers.map((u) => u.email),
					faker.number.int({ min: 1, max: 3 })
				),
				submittedAt: faker.datatype.boolean({ probability: 0.7 })
					? faker.date.recent({ days: 30 })
					: null,
				startupFolderId: startupFolder.id,
				reviewerId: faker.datatype.boolean({ probability: 0.6 })
					? faker.helpers.arrayElement(companyUsers).id
					: null,
			},
		})

		const environmentalDocTypes: EnvironmentalDocType[] = [
			"ENVIRONMENTAL_PLAN",
			"SPILL_PREVENTION",
			"WASTE_MANAGEMENT",
			"ENVIRONMENTAL_TRAINING",
			"ENVIRONMENTAL_MATRIX",
			"SAFETY_DATA_SHEET",
		]

		for (const docType of faker.helpers.arrayElements(
			environmentalDocTypes,
			faker.number.int({ min: 3, max: environmentalDocTypes.length })
		)) {
			await prisma.environmentalDocument.create({
				data: {
					type: docType,
					name: `${docType.replace(/_/g, " ").toLowerCase()}.pdf`,
					url: SAMPLE_FILE_URL,
					category: "ENVIRONMENTAL",
					status: faker.helpers.arrayElement(reviewStatuses),
					reviewNotes: faker.datatype.boolean({ probability: 0.3 }) ? faker.lorem.sentence() : null,
					reviewedAt: faker.datatype.boolean({ probability: 0.5 })
						? faker.date.recent({ days: 20 })
						: null,
					submittedAt: faker.datatype.boolean({ probability: 0.7 })
						? faker.date.recent({ days: 25 })
						: null,
					expirationDate: faker.datatype.boolean({ probability: 0.4 })
						? faker.date.future({ years: 1 })
						: null,
					uploadedById: faker.helpers.arrayElement(companyUsers).id,
					reviewerId: faker.datatype.boolean({ probability: 0.5 })
						? faker.helpers.arrayElement(companyUsers).id
						: null,
					folderId: environmentalFolder.id,
				},
			})
			documentsCreated++
		}

		// 5. CARPETA DE MEDIO AMBIENTE
		console.log(`   🌍 Procesando carpeta de medio ambiente...`)

		const environmentFolder = await prisma.environmentFolder.create({
			data: {
				status: faker.helpers.arrayElement(reviewStatuses),
				additionalNotificationEmails: faker.helpers.arrayElements(
					companyUsers.map((u) => u.email),
					faker.number.int({ min: 1, max: 3 })
				),
				submittedAt: faker.datatype.boolean({ probability: 0.7 })
					? faker.date.recent({ days: 30 })
					: null,
				startupFolderId: startupFolder.id,
				reviewerId: faker.datatype.boolean({ probability: 0.6 })
					? faker.helpers.arrayElement(companyUsers).id
					: null,
			},
		})

		const environmentDocTypes: EnvironmentDocType[] = [
			"WORK_PROCEDURE",
			"ENVIRONMENTAL_ASPECTS_AND_IMPACTS_MATRIX",
			"SAFETY_DATA_SHEET_FOR_CHEMICALS",
			"WORKER_TRAINING_RECORD",
			"ENVIRONMENTAL_MANAGEMENT_PLAN",
		]

		for (const docType of faker.helpers.arrayElements(
			environmentDocTypes,
			faker.number.int({ min: 2, max: environmentDocTypes.length })
		)) {
			await prisma.environmentDocument.create({
				data: {
					type: docType,
					name: `${docType.replace(/_/g, " ").toLowerCase()}.pdf`,
					url: SAMPLE_FILE_URL,
					category: "ENVIRONMENT",
					status: faker.helpers.arrayElement(reviewStatuses),
					reviewNotes: faker.datatype.boolean({ probability: 0.3 }) ? faker.lorem.sentence() : null,
					reviewedAt: faker.datatype.boolean({ probability: 0.5 })
						? faker.date.recent({ days: 20 })
						: null,
					submittedAt: faker.datatype.boolean({ probability: 0.7 })
						? faker.date.recent({ days: 25 })
						: null,
					expirationDate: faker.datatype.boolean({ probability: 0.4 })
						? faker.date.future({ years: 1 })
						: null,
					uploadedById: faker.helpers.arrayElement(companyUsers).id,
					reviewerId: faker.datatype.boolean({ probability: 0.5 })
						? faker.helpers.arrayElement(companyUsers).id
						: null,
					folderId: environmentFolder.id,
				},
			})
			documentsCreated++
		}

		// 6. CARPETAS BÁSICAS (para trabajadores)
		console.log(`   📋 Procesando carpetas básicas...`)

		for (const worker of selectedWorkers.slice(0, Math.min(5, selectedWorkers.length))) {
			const basicFolder = await prisma.basicFolder.create({
				data: {
					status: faker.helpers.arrayElement(reviewStatuses),
					additionalNotificationEmails: [worker.email],
					submittedAt: faker.datatype.boolean({ probability: 0.7 })
						? faker.date.recent({ days: 30 })
						: null,
					workerId: worker.id,
					startupFolderId: startupFolder.id,
					reviewerId: faker.datatype.boolean({ probability: 0.6 })
						? faker.helpers.arrayElement(companyUsers).id
						: null,
				},
			})

			const basicDocTypes: BasicDocumentType[] = [
				"CONTRACT",
				"INSURANCE",
				"PPE_RECEIPT",
				"SAFETY_AND_HEALTH_INFO",
			]

			for (const docType of basicDocTypes) {
				await prisma.basicDocument.create({
					data: {
						type: docType,
						name: `${worker.name} - ${docType.replace(/_/g, " ").toLowerCase()}.pdf`,
						url: SAMPLE_FILE_URL,
						category: "BASIC",
						status: faker.helpers.arrayElement(reviewStatuses),
						reviewNotes: faker.datatype.boolean({ probability: 0.2 })
							? faker.lorem.sentence()
							: null,
						reviewedAt: faker.datatype.boolean({ probability: 0.5 })
							? faker.date.recent({ days: 20 })
							: null,
						submittedAt: faker.datatype.boolean({ probability: 0.7 })
							? faker.date.recent({ days: 25 })
							: null,
						expirationDate: faker.datatype.boolean({ probability: 0.3 })
							? faker.date.future({ years: 1 })
							: null,
						uploadedById: worker.id,
						reviewerId: faker.datatype.boolean({ probability: 0.5 })
							? faker.helpers.arrayElement(companyUsers).id
							: null,
						folderId: basicFolder.id,
					},
				})
				documentsCreated++
			}
		}

		// 7. CARPETA DE ESPECIFICACIONES TÉCNICAS
		console.log(`   🔧 Procesando carpeta de especificaciones técnicas...`)

		const techSpecsFolder = await prisma.techSpecsFolder.create({
			data: {
				status: faker.helpers.arrayElement(reviewStatuses),
				additionalNotificationEmails: faker.helpers.arrayElements(
					companyUsers.map((u) => u.email),
					faker.number.int({ min: 1, max: 3 })
				),
				submittedAt: faker.datatype.boolean({ probability: 0.7 })
					? faker.date.recent({ days: 30 })
					: null,
				startupFolderId: startupFolder.id,
				reviewerId: faker.datatype.boolean({ probability: 0.6 })
					? faker.helpers.arrayElement(companyUsers).id
					: null,
			},
		})

		const techSpecsDocTypes: TechSpecsDocumentType[] = ["GANTT_CHART", "TECHNICAL_WORK_PROCEDURE"]

		for (const docType of techSpecsDocTypes) {
			await prisma.techSpecsDocument.create({
				data: {
					type: docType,
					name: `${docType.replace(/_/g, " ").toLowerCase()}.pdf`,
					url: SAMPLE_FILE_URL,
					category: "TECHNICAL_SPECS",
					status: faker.helpers.arrayElement(reviewStatuses),
					reviewNotes: faker.datatype.boolean({ probability: 0.3 }) ? faker.lorem.sentence() : null,
					reviewedAt: faker.datatype.boolean({ probability: 0.5 })
						? faker.date.recent({ days: 20 })
						: null,
					submittedAt: faker.datatype.boolean({ probability: 0.7 })
						? faker.date.recent({ days: 25 })
						: null,
					expirationDate: faker.datatype.boolean({ probability: 0.3 })
						? faker.date.future({ years: 1 })
						: null,
					uploadedById: faker.helpers.arrayElement(companyUsers).id,
					reviewerId: faker.datatype.boolean({ probability: 0.5 })
						? faker.helpers.arrayElement(companyUsers).id
						: null,
					folderId: techSpecsFolder.id,
				},
			})
			documentsCreated++
		}

			foldersProcessed++
	}

	console.log(`✅ ${foldersProcessed} carpetas de arranque procesadas`)
	} else {
		console.log("⏭️  Carpetas de arranque omitidas")
	}

	// ========================================
	// CONTROL LABORAL
	// ========================================
	console.log("\n📊 Creando carpetas de control laboral...")

	// Limpiar control laboral existente
	console.log("🧹 Limpiando control laboral existente...")
	await prisma.workerLaborControlDocument.deleteMany({})
	await prisma.laborControlDocument.deleteMany({})
	await prisma.workerLaborControlFolder.deleteMany({})
	await prisma.laborControlFolder.deleteMany({})
	console.log("✅ Control laboral limpiado")

	const companies = await prisma.company.findMany({
		where: {
			isActive: true,
		},
	})

	let laborControlFoldersCreated = 0
	let laborControlDocsCreated = 0

	const laborControlStatuses: LABOR_CONTROL_STATUS[] = [
		"DRAFT",
		"SUBMITTED",
		"APPROVED",
		"REJECTED",
	]

	// Crear carpetas de control laboral para cada empresa (últimos 6 meses)
	for (const company of companies) {
		const companyUsers = users.filter((u) => u.companyId === company.id)
		if (companyUsers.length === 0) continue

		// Crear carpetas para los últimos 6 meses
		const currentDate = new Date()
		for (let i = 0; i < 6; i++) {
			const monthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
			const monthName = MONTHS[monthDate.getMonth()]
			const year = monthDate.getFullYear()

			console.log(
				`   📁 Creando carpeta de control laboral: ${company.name} - ${monthName} ${year}`
			)

			const laborControlFolder = await prisma.laborControlFolder.create({
				data: {
					status: faker.helpers.arrayElement(laborControlStatuses),
					companyFolderStatus: faker.helpers.arrayElement(laborControlStatuses),
					emails: faker.helpers.arrayElements(
						companyUsers.map((u) => u.email),
						faker.number.int({ min: 1, max: 3 })
					),
					companyId: company.id,
					createdAt: monthDate,
					updatedAt: new Date(),
				},
			})

			// DOCUMENTOS DE EMPRESA
			const companyDocTypes: LABOR_CONTROL_DOCUMENT_TYPE[] = [
				"F30",
				"F30_1",
				"SINIESTRALITY",
				"TRG_TREASURY_CERTIFICATE",
			]

			for (const docType of faker.helpers.arrayElements(
				companyDocTypes,
				faker.number.int({ min: 2, max: companyDocTypes.length })
			)) {
				await prisma.laborControlDocument.create({
					data: {
						type: docType,
						status: faker.helpers.arrayElement(laborControlStatuses),
						name: `${company.name} - ${monthName} ${year} - ${docType.replace(/_/g, " ")}.pdf`,
						url: SAMPLE_FILE_URL,
						reviewNotes: faker.datatype.boolean({ probability: 0.3 })
							? faker.lorem.sentence()
							: null,
						reviewDate: faker.datatype.boolean({ probability: 0.5 })
							? faker.date.recent({ days: 15 })
							: null,
						uploadById: faker.helpers.arrayElement(companyUsers).id,
						reviewById: faker.datatype.boolean({ probability: 0.5 })
							? faker.helpers.arrayElement(companyUsers).id
							: null,
						folderId: laborControlFolder.id,
						uploadDate: faker.date.between({ from: monthDate, to: new Date() }),
						updatedAt: new Date(),
					},
				})
				laborControlDocsCreated++
			}

			// CARPETAS Y DOCUMENTOS DE TRABAJADORES
			const workerCount = Math.min(companyUsers.length, faker.number.int({ min: 3, max: 6 }))
			const selectedWorkers = faker.helpers.arrayElements(companyUsers, workerCount)

			for (const worker of selectedWorkers) {
				const workerLaborFolder = await prisma.workerLaborControlFolder.create({
					data: {
						status: faker.helpers.arrayElement(laborControlStatuses),
						emails: [worker.email],
						workerId: worker.id,
						laborControlFolderId: laborControlFolder.id,
						createdAt: monthDate,
						updatedAt: new Date(),
					},
				})

				const workerDocTypes: WORKER_LABOR_CONTROL_DOCUMENT_TYPE[] = [
					"ATTENDANCE_BOOK",
					"PAYROLL_STTLEMENT",
				]

				// Agregar documentos ocasionales
				if (faker.datatype.boolean({ probability: 0.2 })) {
					workerDocTypes.push("MEDICAL_LEAVE")
				}
				if (faker.datatype.boolean({ probability: 0.1 })) {
					workerDocTypes.push("STTLEMENT")
					workerDocTypes.push("NOTICE_OF_TERMINATION")
				}

				for (const docType of workerDocTypes) {
					await prisma.workerLaborControlDocument.create({
						data: {
							type: docType,
							status: faker.helpers.arrayElement(laborControlStatuses),
							name: `${worker.name} - ${monthName} ${year} - ${docType.replace(/_/g, " ")}.pdf`,
							url: SAMPLE_FILE_URL,
							reviewNotes: faker.datatype.boolean({ probability: 0.2 })
								? faker.lorem.sentence()
								: null,
							reviewDate: faker.datatype.boolean({ probability: 0.5 })
								? faker.date.recent({ days: 15 })
								: null,
							uploadById: worker.id,
							reviewById: faker.datatype.boolean({ probability: 0.5 })
								? faker.helpers.arrayElement(companyUsers).id
								: null,
							folderId: workerLaborFolder.id,
							uploadDate: faker.date.between({ from: monthDate, to: new Date() }),
							updatedAt: new Date(),
						},
					})
					laborControlDocsCreated++
				}
			}

			laborControlFoldersCreated++
		}
	}

	console.log(`✅ ${laborControlFoldersCreated} carpetas de control laboral creadas`)

	console.log("\n✨ Seed de carpetas completado!")
	console.log("\n📊 Resumen:")
	if (skipStartupFolders) {
		console.log(`   - Carpetas de arranque: OMITIDAS (ya existen datos)`)
	} else {
		console.log(`   - Carpetas de arranque procesadas: ${foldersProcessed}`)
		console.log(`   - Documentos de carpetas de arranque: ${documentsCreated}`)
	}
	console.log(`   - Carpetas de control laboral: ${laborControlFoldersCreated}`)
	console.log(`   - Documentos de control laboral: ${laborControlDocsCreated}`)
	console.log(`   - Total de documentos: ${documentsCreated + laborControlDocsCreated}`)
}

main()
	.catch((e) => {
		console.error("❌ Error durante el seed de carpetas:", e)
		process.exit(1)
	})
	.finally(async () => {
		await prisma.$disconnect()
	})
