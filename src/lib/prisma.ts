import { PrismaClient } from "@prisma/client"

const prismaClientSingleton = () => {
	const client = new PrismaClient({
		datasources: {
			db: {
				url: process.env.DATABASE_URL,
			},
		},
		log: ["error", "warn"],
	}).$extends({
		name: "connection-manager",
		client: {
			afterRequest: async () => {
				if (process.env.NODE_ENV === "production") {
					// Desconectar después de cada operación en producción
					setTimeout(() => {
						client.$disconnect()
					}, 200)
				}
			},
		},
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
