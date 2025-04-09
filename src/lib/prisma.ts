import { PrismaClient } from "@prisma/client"

const prismaClientSingleton = () => {
	const client = new PrismaClient({
		log: ["error", "warn"],
		datasourceUrl: process.env.DATABASE_URL,
	})

	const cleanupConnections = async () => {
		try {
			await client.$disconnect()
		} catch (e) {
			console.error("Error al desconectar Prisma:", e)
		}
	}

	// Limpiar conexiones periódicamente (tanto en desarrollo como producción)
	const cleanup = setInterval(cleanupConnections, 5000)

	// Limpiar en eventos del sistema
	const setupCleanup = () => {
		process.on("SIGTERM", cleanupConnections)
		process.on("SIGINT", cleanupConnections)
		process.on("beforeExit", () => {
			clearInterval(cleanup)
			cleanupConnections()
		})
	}

	setupCleanup()

	return client
}

const globalForPrisma = globalThis as unknown as {
	prisma: ReturnType<typeof prismaClientSingleton> | undefined
}

const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

export default prisma
