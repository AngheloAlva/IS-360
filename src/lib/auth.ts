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
				input: true,
			},
			internalRole: {
				type: "string",
				required: false,
				defaultValue: "NONE",
				input: true,
			},
			area: {
				type: "string",
				required: false,
				allowNull: true,
				input: true,
			},
			role: {
				type: "string",
				required: true,
				input: true,
				defaultValue: "PARTNER_COMPANY",
			},
			companyId: {
				type: "string",
				required: false,
				input: true,
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
