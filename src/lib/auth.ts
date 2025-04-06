import { prismaAdapter } from "better-auth/adapters/prisma"
import { nextCookies } from "better-auth/next-js"
import { admin, twoFactor } from "better-auth/plugins"
import { betterAuth } from "better-auth"

import { USER_ROLES_VALUES } from "./consts/user-roles"
import { resend } from "./resend"
import prisma from "./prisma"

import { OTPCodeEmailTemplate } from "@/components/emails/OTPCodeEmailTemplate"

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
			companyId: {
				type: "string",
				required: false,
				input: true,
			},
			isSupervisor: {
				type: "boolean",
				required: false,
				input: true,
			},
		},
	},
	plugins: [
		nextCookies(),
		admin({
			adminRole: [USER_ROLES_VALUES.ADMIN, USER_ROLES_VALUES.SUPERADMIN],
			defaultRole: USER_ROLES_VALUES.PARTNER_COMPANY,
		}),
		twoFactor({
			skipVerificationOnEnable: true,
			otpOptions: {
				async sendOTP({ user, otp }) {
					await resend.emails.send({
						from: "anghelo.alva@ingenieriasimple.cl",
						to: [user.email],
						subject: `Código de verificación para OTC 360`,
						react: await OTPCodeEmailTemplate({
							otp,
						}),
					})
				},
			},
		}),
	],
	baseURL: process.env.NEXT_PUBLIC_BASE_URL!,
})

export type Session = typeof auth.$Infer.Session
