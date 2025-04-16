import { notFound } from "next/navigation"
import { headers } from "next/headers"

import { auth } from "@/lib/auth"

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import QueryProvider from "@/components/providers/QueryProvider"
import { AppSidebar } from "@/components/sidebar/appSidebar"
import Header from "@/components/header/Header"

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
				<AppSidebar session={session} />

				<SidebarInset className="overflow-hidden shadow">
					<Header session={session} />

					<main className="bg-secondary-background flex min-h-full flex-col items-center gap-8 p-4 pb-20 lg:p-8 lg:pb-32">
						{children}
					</main>
				</SidebarInset>
			</SidebarProvider>
		</QueryProvider>
	)
}
