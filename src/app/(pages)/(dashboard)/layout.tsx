import { cookies, headers } from "next/headers"
import { redirect } from "next/navigation"

import { auth } from "@/lib/auth"

import { SidebarInset, SidebarProvider } from "@/shared/components/ui/sidebar"
import QueryProvider from "@/shared/components/providers/QueryProvider"
import { AppSidebar } from "@/shared/components/sidebar/appSidebar"
import { TooltipProvider } from "@/shared/components/ui/tooltip"
import Header from "@/shared/components/header/Header"

export default async function AdminDashboardLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	const [cookieStore, headerStore] = await Promise.all([cookies(), headers()])
	const defaultOpen = cookieStore.get("sidebar_state")?.value === "true"

	const session = await auth.api.getSession({ headers: headerStore })

	if (!session) {
		redirect("/auth/login")
	}

	return (
		<QueryProvider>
			<SidebarProvider defaultOpen={defaultOpen}>
				<TooltipProvider>
					<AppSidebar
						session={session}
						canAccessAdminRoutes={session.user.accessRole === "ADMIN"}
						canAccessSupervisorRoutes={session.user.isSupervisor || false}
					/>

					<SidebarInset className="overflow-x-hidden">
						<Header session={session} />

						<main className="bg-secondary-background flex h-full flex-1 flex-col items-center gap-8 p-4 pb-20 lg:p-8 lg:pb-32">
							{children}
						</main>

						{/*<ReactQueryDevtools />*/}
					</SidebarInset>
				</TooltipProvider>
			</SidebarProvider>
		</QueryProvider>
	)
}
