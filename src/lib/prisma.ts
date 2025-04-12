import { PrismaClient } from "@prisma/client"

const prismaClientSingleton = () => {
	if (typeof window === "undefined") {
		return new PrismaClient({
			log: ["error", "warn"],
			datasourceUrl: process.env.DATABASE_URL,
		})
	}
	return null
}

const globalForPrisma = globalThis as unknown as {
	prisma: PrismaClient
}

const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== "production" && prisma) globalForPrisma.prisma = prisma

export default prisma
