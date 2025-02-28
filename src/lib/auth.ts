import { nextCookies } from "better-auth/next-js"
import { admin } from "better-auth/plugins"
import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import prisma from "./prisma"

export const auth = betterAuth({
	database: prismaAdapter(prisma, {
		provider: "postgresql",
	}),
	emailAndPassword: {
		enabled: true,
	},
	session: {
		cookieCache: {
			enabled: true,
			maxAge: 5 * 60,
		},
	},
	user: {
		additionalFields: {
			rut: {
				type: "string",
				required: true,
				unique: true,
			},
		},
	},
	plugins: [
		nextCookies(),
		admin({
			defaultRole: "PARTNER_COMPANY",
			adminRole: ["ADMIN", "SUPERADMIN"],
		}),
	],
	baseURL: process.env.NEXT_PUBLIC_BASE_URL!,
})

export type Session = typeof auth.$Infer.Session
