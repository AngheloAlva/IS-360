import { headers } from "next/headers"
import { notFound } from "next/navigation"

import { auth } from "@/lib/auth"
import SupportDashboard from "@/project/support/components/SupportDashboard"

export default async function AdminSupportPage() {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id) {
		return notFound()
	}

	return <SupportDashboard isAdmin />
}
