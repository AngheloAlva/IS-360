"use client"

import { redirect } from "next/navigation"

import { AnalyticsDashboard } from "@/project/analytics/components/AnalyticsDashboard"
import { authClient } from "@/lib/auth-client"
import { useEffect, useState } from "react"
import { Session } from "@/lib/auth"

export default function AnalyticsPage() {
	const [session, setSession] = useState<Session | null>(null)

	useEffect(() => {
		const getSession = async () => {
			const session = await authClient.getSession()
			setSession(session.data)
		}
		getSession()
	}, [])

	if (!session) {
		return <div>Cargando...</div>
	}

	if (!session.user?.id) {
		redirect("/auth/login")
	}

	return <AnalyticsDashboard />
}
