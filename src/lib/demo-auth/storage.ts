import type { DemoUser } from "./types"

export const DEMO_USER_STORAGE_KEY = "is-360-demo-user"

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
	window.dispatchEvent(new Event("demo-user-changed"))
}

export function clearDemoUser(): void {
	if (typeof window === "undefined") return
	window.localStorage.removeItem(DEMO_USER_STORAGE_KEY)
	window.dispatchEvent(new Event("demo-user-changed"))
}
