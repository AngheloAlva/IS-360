"use client"

import { useEffect, useState } from "react"

import { getDemoUser } from "./storage"
import type { DemoUser } from "./types"

export function useDemoUser(): DemoUser | null {
	const [user, setUser] = useState<DemoUser | null>(null)

	useEffect(() => {
		setUser(getDemoUser())
		const handler = () => setUser(getDemoUser())
		window.addEventListener("demo-user-changed", handler)
		window.addEventListener("storage", handler)
		return () => {
			window.removeEventListener("demo-user-changed", handler)
			window.removeEventListener("storage", handler)
		}
	}, [])

	return user
}
