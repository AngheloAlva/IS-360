import {
	PrismaClient,
	LABOR_CONTROL_STATUS,
	LABOR_CONTROL_DOCUMENT_TYPE,
	WORKER_LABOR_CONTROL_DOCUMENT_TYPE,
} from "@prisma/client"
import { faker } from "@faker-js/faker"

const prisma = new PrismaClient()

// Configurar faker
faker.seed(999)

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
	console.log("📊 Iniciando seed de control laboral...")

	// Limpiar control laboral existente
	console.log("🧹 Limpiando control laboral existente...")
	await prisma.workerLaborControlDocument.deleteMany({})
	await prisma.laborControlDocument.deleteMany({})
	await prisma.workerLaborControlFolder.deleteMany({})
	await prisma.laborControlFolder.deleteMany({})
	console.log("✅ Control laboral limpiado")

	// Obtener empresas activas
	const companies = await prisma.company.findMany({
		where: {
			isActive: true,
		},
	})

	if (companies.length === 0) {
		console.log("⚠️ No hay empresas activas. Ejecuta primero el seed principal.")
		return
	}

	console.log(`📋 Encontradas ${companies.length} empresas activas`)

	// Obtener usuarios
	const users = await prisma.user.findMany({
		where: {
			accessRole: "PARTNER_COMPANY",
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
		if (companyUsers.length === 0) {
			console.log(`   ⏭️  Omitiendo ${company.name} (sin usuarios)`)
			continue
		}

		console.log(`\n   🏢 Procesando ${company.name}...`)

		// Crear carpetas para los últimos 6 meses
		const currentDate = new Date()
		for (let i = 0; i < 6; i++) {
			const monthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
			const monthName = MONTHS[monthDate.getMonth()]
			const year = monthDate.getFullYear()

			console.log(`      📁 ${monthName} ${year}`)

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

	console.log("\n✨ Seed de control laboral completado!")
	console.log("\n📊 Resumen:")
	console.log(`   - Empresas procesadas: ${companies.length}`)
	console.log(`   - Carpetas mensuales creadas: ${laborControlFoldersCreated}`)
	console.log(`   - Documentos de empresa: ~${Math.floor(laborControlDocsCreated * 0.3)}`)
	console.log(`   - Documentos de trabajadores: ~${Math.floor(laborControlDocsCreated * 0.7)}`)
	console.log(`   - Total de documentos: ${laborControlDocsCreated}`)
}

main()
	.catch((e) => {
		console.error("❌ Error durante el seed de control laboral:", e)
		process.exit(1)
	})
	.finally(async () => {
		await prisma.$disconnect()
	})
