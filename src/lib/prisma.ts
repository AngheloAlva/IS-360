import { PrismaClient } from "@prisma/client"

const prismaClientSingleton = () => {
	const client = new PrismaClient({
		datasources: {
			db: {
				url: process.env.DATABASE_URL,
			},
		},
		log: ["error", "warn"],
	})

	// Asegurarse de que las conexiones se cierren al salir
	process.on("beforeExit", async () => {
		await client.$disconnect()
	})

	return client
}

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>

const globalForPrisma = globalThis as unknown as {
	prisma: PrismaClientSingleton | undefined
}

const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

export default prisma
