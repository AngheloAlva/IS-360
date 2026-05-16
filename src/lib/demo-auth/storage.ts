import type { DemoUser } from "./types"

export const DEMO_USER_STORAGE_KEY = "is-360-demo-user"
export const DEMO_ROLE_COOKIE = "is-360-demo-role"

const COOKIE_MAX_AGE_DAYS = 30

function writeRoleCookie(role: DemoUser["role"]): void {
	const maxAge = COOKIE_MAX_AGE_DAYS * 24 * 60 * 60
	document.cookie = `${DEMO_ROLE_COOKIE}=${role}; path=/; max-age=${maxAge}; SameSite=Lax`
}

function clearRoleCookie(): void {
	document.cookie = `${DEMO_ROLE_COOKIE}=; path=/; max-age=0; SameSite=Lax`
}

export function getDemoUser(): DemoUser | null {
	if (typeof window === "undefined") return null
	try {
		const raw = window.localStorage.getItem(DEMO_USER_STORAGE_KEY)
		if (!raw) return null
		return JSON.parse(raw) as DemoUser
	} catch {
		return null
	}
}

export function setDemoUser(user: DemoUser): void {
	if (typeof window === "undefined") return
	window.localStorage.setItem(DEMO_USER_STORAGE_KEY, JSON.stringify(user))
	writeRoleCookie(user.role)
	window.dispatchEvent(new Event("demo-user-changed"))
}

export function clearDemoUser(): void {
	if (typeof window === "undefined") return
	window.localStorage.removeItem(DEMO_USER_STORAGE_KEY)
	clearRoleCookie()
	window.dispatchEvent(new Event("demo-user-changed"))
}
