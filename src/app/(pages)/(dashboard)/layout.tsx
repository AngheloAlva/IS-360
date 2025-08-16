import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { notFound } from "next/navigation"
import { headers } from "next/headers"

import { auth } from "@/lib/auth"

import { SidebarInset, SidebarProvider } from "@/shared/components/ui/sidebar"
import QueryProvider from "@/shared/components/providers/QueryProvider"
import { AppSidebar } from "@/shared/components/sidebar/appSidebar"
import Header from "@/shared/components/header/Header"

export default async function AdminDashboardLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session) {
		notFound()
	}

	return (
		<QueryProvider>
			<SidebarProvider>
				<AppSidebar session={session} canAccessAdminRoutes={session.user.accessRole === "ADMIN"} />

				<SidebarInset className="overflow-x-hidden">
					<Header session={session} />

					<main className="bg-secondary-background flex h-full flex-col items-center gap-8 p-4 pb-20 lg:p-8 lg:pb-32">
						{children}
					</main>

					<ReactQueryDevtools />
				</SidebarInset>
			</SidebarProvider>
		</QueryProvider>
	)
}
