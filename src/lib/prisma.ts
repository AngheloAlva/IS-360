import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as {
	prisma: PrismaClient | undefined
}

const prisma =
	globalForPrisma.prisma ??
	new PrismaClient({
		log: ["error", "warn"],
		datasourceUrl: process.env.DATABASE_URL,
	})

// Guardar en globalThis en todos los entornos
if (!globalForPrisma.prisma) {
	globalForPrisma.prisma = prisma
}

export default prisma
