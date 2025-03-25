import { notFound } from "next/navigation"
import { headers } from "next/headers"

import { auth } from "@/lib/auth"

import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/sidebar/appSidebar"
import { Separator } from "@/components/ui/separator"
import PageName from "@/components/sidebar/PageName"
import QueryProvider from "@/components/providers/QueryProvider"

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

				<SidebarInset>
					<header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
						<div className="flex items-center gap-2 px-4">
							<SidebarTrigger className="-ml-1" />
							<Separator orientation="vertical" className="mr-2 h-4" />
							<PageName />
						</div>
					</header>

					<main className="bg-background flex flex-col items-center gap-8 p-4 pb-20 lg:p-8 lg:pb-32">
						{children}
					</main>
				</SidebarInset>
			</SidebarProvider>
		</QueryProvider>
	)
}
