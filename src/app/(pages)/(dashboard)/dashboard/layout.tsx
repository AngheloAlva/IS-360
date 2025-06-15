import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { notFound } from "next/navigation"

export default async function AdminDashboardLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session) {
		return notFound()
	}

	if (!session.user.isSupervisor) {
		return (
			<Alert variant="destructive">
				<AlertTitle>Acceso denegado</AlertTitle>
				<AlertDescription>
					Por el momento solo los supervisores pueden acceder a esta sección.
				</AlertDescription>
			</Alert>
		)
	}

	return children
}
