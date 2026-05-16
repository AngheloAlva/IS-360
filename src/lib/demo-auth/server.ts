import { cookies } from "next/headers"

import { DEMO_USERS } from "./users"
import { DEMO_ROLE_COOKIE } from "./storage"
import type { DemoRole, DemoUser } from "./types"

export type DemoSession = {
	session: {
		id: string
		userId: string
		token: string
		expiresAt: Date
		ipAddress: string | null
		userAgent: string | null
		createdAt: Date
		updatedAt: Date
	}
	user: DemoSessionUser
}

export type DemoSessionUser = DemoUser & {
	emailVerified: boolean
	image: string | null
	createdAt: Date
	updatedAt: Date
	rut: string
	internalRole: string | null
	area: string | null
	phone: string | null
	documentAreas: string[]
	internalArea: string | null
	isActive: boolean
	allowedModules: string[] | null
	banned: boolean
	banReason: string | null
	banExpires: Date | null
	twoFactorEnabled: boolean | null
}

const FAR_FUTURE = new Date("2099-12-31T00:00:00Z")
const EPOCH = new Date("2025-01-01T00:00:00Z")

function buildSessionFromUser(base: DemoUser): DemoSession {
	const user: DemoSessionUser = {
		...base,
		emailVerified: true,
		image: null,
		createdAt: EPOCH,
		updatedAt: EPOCH,
		rut: `demo-${base.id}`,
		internalRole: base.role === "internal-tech" ? "TECHNICIAN" : null,
		area: null,
		phone: null,
		documentAreas: [],
		internalArea: null,
		isActive: true,
		allowedModules: null,
		banned: false,
		banReason: null,
		banExpires: null,
		twoFactorEnabled: false,
	}
	return {
		user,
		session: {
			id: `demo-session-${base.id}`,
			userId: base.id,
			token: `demo-token-${base.id}`,
			expiresAt: FAR_FUTURE,
			ipAddress: null,
			userAgent: null,
			createdAt: EPOCH,
			updatedAt: EPOCH,
		},
	}
}

function isDemoRole(value: string | undefined): value is DemoRole {
	return value === "admin" || value === "internal-tech" || value === "supervisor"
}

export async function getDemoSession(): Promise<DemoSession | null> {
	const store = await cookies()
	const role = store.get(DEMO_ROLE_COOKIE)?.value
	if (!isDemoRole(role)) return null
	const base = DEMO_USERS[role]
	return buildSessionFromUser(base)
}
