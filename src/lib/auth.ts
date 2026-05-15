import { prismaAdapter } from "better-auth/adapters/prisma"
import { admin as adminPlugin, twoFactor } from "better-auth/plugins"
import { createAuthMiddleware } from "better-auth/api"
import { nextCookies } from "better-auth/next-js"
import { betterAuth } from "better-auth"

import { logAuthEvent } from "./activity/auth-log"
import { resend } from "./resend"
import prisma from "./prisma"
import {
	ac,
	user,
	admin,
	operator,
	userOperator,
	partnerCompany,
	companyOperator,
	workBookOperator,
	workOrderEraser,
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
				from: "sistema@is360.cl",
				to: [user.email],
				subject: `Restablecimiento de contraseña para IS 360`,
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
			allowedModules: {
				type: "string[]",
				required: false,
				input: true,
			},
		},
	},
	databaseHooks: {
		user: {
			create: {
				after: async (user) => {
					await logAuthEvent({
						action: "CREATE",
						entityId: user.id,
						entityType: "User",
						metadata: {
							email: user.email,
							name: user.name,
							role: (user as { role?: string }).role ?? null,
							source: "better-auth.user.create",
						},
					})
				},
			},
		},
		session: {
			create: {
				after: async (session) => {
					await logAuthEvent({
						action: "LOGIN",
						entityId: session.userId,
						entityType: "User",
						metadata: {
							sessionId: session.id,
							source: "better-auth.session.create",
						},
					})
				},
			},
		},
	},
	hooks: {
		after: createAuthMiddleware(async (ctx) => {
			const path = ctx.path

			if (path === "/sign-out") {
				const userId = ctx.context.session?.user?.id
				if (userId) {
					await logAuthEvent({
						action: "LOGOUT",
						entityId: userId,
						entityType: "User",
						metadata: { source: "better-auth.sign-out" },
					})
				}
				return
			}

			if (path === "/change-password") {
				const userId = ctx.context.session?.user?.id
				if (userId) {
					await logAuthEvent({
						action: "UPDATE",
						entityId: userId,
						entityType: "User",
						metadata: { type: "password-change", source: "better-auth.change-password" },
						severity: "MEDIUM",
					})
				}
				return
			}

			if (path === "/forget-password" || path === "/request-password-reset") {
				const email = (ctx.body as { email?: string } | undefined)?.email
				await logAuthEvent({
					action: "UPDATE",
					entityId: email ?? "unknown",
					entityType: "User",
					metadata: {
						type: "password-reset-request",
						email,
						source: `better-auth${path}`,
					},
					severity: "MEDIUM",
				})
				return
			}

			if (path === "/reset-password") {
				const newSession = (ctx.context.returned as { user?: { id?: string } } | undefined)?.user?.id
				await logAuthEvent({
					action: "UPDATE",
					entityId: newSession ?? "unknown",
					entityType: "User",
					metadata: { type: "password-reset", source: "better-auth.reset-password" },
					severity: "MEDIUM",
				})
				return
			}

			if (path === "/two-factor/enable") {
				const userId = ctx.context.session?.user?.id
				if (userId) {
					await logAuthEvent({
						action: "UPDATE",
						entityId: userId,
						entityType: "User",
						metadata: { type: "2fa-enable", source: "better-auth.two-factor.enable" },
						severity: "MEDIUM",
					})
				}
				return
			}

			if (path === "/two-factor/disable") {
				const userId = ctx.context.session?.user?.id
				if (userId) {
					await logAuthEvent({
						action: "UPDATE",
						entityId: userId,
						entityType: "User",
						metadata: { type: "2fa-disable", source: "better-auth.two-factor.disable" },
						severity: "HIGH",
					})
				}
				return
			}

			if (path === "/two-factor/verify-otp" || path === "/two-factor/verify-totp") {
				const userId = ctx.context.session?.user?.id
				if (userId) {
					await logAuthEvent({
						action: "UPDATE",
						entityId: userId,
						entityType: "User",
						metadata: { type: "2fa-verify", source: `better-auth${path}` },
					})
				}
				return
			}
		}),
	},
	plugins: [
		nextCookies(),
		adminPlugin({
			ac,
			roles: {
				admin,
				user,
				operator,
				userOperator,
				partnerCompany,
				companyOperator,
				workBookOperator,
				workOrderEraser,
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
						from: "sistema@is360.cl",
						to: [user.email],
						subject: `Código de verificación para IS 360`,
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
