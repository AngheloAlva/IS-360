// Script para generar carpetas de arranque generales para todas las empresas existentes
import { PrismaClient, CompanyDocumentType } from "@prisma/client"
import { GENERAL_STARTUP_FOLDER_STRUCTURE } from "../../src/lib/consts/startup-folders"

const prisma = new PrismaClient()

async function generateGeneralStartupFolders() {
	try {
		console.log("🚀 Iniciando generación de carpetas de arranque generales...")

		// Obtener todas las empresas
		const companies = await prisma.company.findMany({
			select: {
				id: true,
				name: true,
				rut: true,
			},
		})

		console.log(`📊 Se encontraron ${companies.length} empresas en total`)

		// Contador para carpetas creadas y errores
		let foldersCreated = 0
		let foldersSkipped = 0
		let errors = 0

		// Para cada empresa, crear una carpeta general si no existe ya
		for (const company of companies) {
			try {
				// Verificar si la empresa ya tiene una carpeta de arranque general
				const existingFolder = await prisma.generalStartupFolder.findFirst({
					where: {
						companyId: company.id,
					},
				})

				if (existingFolder) {
					console.log(
						`⏭️  La empresa ${company.name} (${company.rut}) ya tiene una carpeta de arranque general. Saltando...`
					)
					foldersSkipped++
					continue
				}

				// Crear la carpeta de arranque general
				const generalFolder = await prisma.generalStartupFolder.create({
					data: {
						companyId: company.id,
						status: "DRAFT",
					},
				})

				console.log(
					`✅ Carpeta de arranque general creada para la empresa ${company.name} (${company.rut})`
				)

				// Crear los documentos base para la carpeta
				// Agrupa documentos por sección para asignar la subcategoría correcta
				const documentsToCreate = Object.entries(GENERAL_STARTUP_FOLDER_STRUCTURE).flatMap(
					([, section]) =>
						section.documents.map((doc) => ({
							folderId: generalFolder.id,
							type: doc.type as CompanyDocumentType,
							fileType: doc.fileType,
							name: doc.name,
							url: "", // URL vacía inicialmente
							subcategory: section.subcategory,
						}))
				)

				if (documentsToCreate.length > 0) {
					await prisma.companyDocument.createMany({
						data: documentsToCreate,
					})

					console.log(
						`📝 Creados ${documentsToCreate.length} documentos base para la carpeta de ${company.name}`
					)
				}

				foldersCreated++
			} catch (error) {
				console.error(
					`❌ Error al crear carpeta para la empresa ${company.name} (${company.id}):`,
					error
				)
				errors++
			}
		}

		console.log("\n📊 Resumen:")
		console.log(`✅ Carpetas creadas: ${foldersCreated}`)
		console.log(`⏭️  Carpetas omitidas (ya existían): ${foldersSkipped}`)
		console.log(`❌ Errores: ${errors}`)
		console.log(`🏢 Total de empresas procesadas: ${companies.length}`)
	} catch (error) {
		console.error("❌ Error al generar las carpetas de arranque generales:", error)
	} finally {
		await prisma.$disconnect()
	}
}

// Ejecutar la función principal
generateGeneralStartupFolders().catch((e) => {
	console.error("❌ Error no controlado:", e)
	process.exit(1)
})
