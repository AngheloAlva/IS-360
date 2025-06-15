import { prismaAdapter } from "better-auth/adapters/prisma"
import { admin as adminPlugin, twoFactor } from "better-auth/plugins"
import { nextCookies } from "better-auth/next-js"
import { betterAuth } from "better-auth"

import { resend } from "./resend"
import prisma from "./prisma"
import {
	ac,
	user,
	admin,
	userOperator,
	partnerCompany,
	companyOperator,
	workBookOperator,
	workOrderOperator,
	equipmentOperator,
	workPermitOperator,
	safetyTalkOperator,
	documentationOperator,
	startupFolderOperator,
	maintenancePlanOperator,
} from "./permissions"

import { OTPCodeEmail } from "@/project/auth/components/emails/OTPCodeEmail"

export const auth = betterAuth({
	database: prismaAdapter(prisma, {
		provider: "postgresql",
	}),
	emailAndPassword: {
		enabled: true,
		sendResetPassword: async ({ user, url }) => {
			await resend.emails.send({
				from: "anghelo.alva@ingenieriasimple.cl",
				to: [user.email],
				subject: `Restablecimiento de contraseña para OTC 360`,
				text: `Ingresa al siguiente link para restablecer tu contraseña: ${url}`,
			})
		},
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
				nullable: true,
				input: true,
			},
			area: {
				type: "string",
				required: false,
				nullable: true,
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
			phone: {
				type: "string",
				required: false,
				input: true,
			},
			accessRole: {
				type: "string",
				required: false,
				input: true,
			},
			documentAreas: {
				type: "string[]",
				required: true,
				input: true,
			},
			internalArea: {
				type: "string",
				required: false,
				nullable: true,
				input: true,
			},
			isActive: {
				type: "boolean",
				required: false,
				input: false,
			},
		},
	},
	plugins: [
		nextCookies(),
		adminPlugin({
			ac,
			roles: {
				admin,
				user,
				userOperator,
				partnerCompany,
				companyOperator,
				workBookOperator,
				workOrderOperator,
				equipmentOperator,
				safetyTalkOperator,
				workPermitOperator,
				documentationOperator,
				startupFolderOperator,
				maintenancePlanOperator,
			},
		}),
		twoFactor({
			skipVerificationOnEnable: true,
			otpOptions: {
				async sendOTP({ user, otp }) {
					await resend.emails.send({
						from: "anghelo.alva@ingenieriasimple.cl",
						to: [user.email],
						subject: `Código de verificación para OTC 360`,
						react: await OTPCodeEmail({
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
