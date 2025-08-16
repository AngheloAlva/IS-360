// import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
// import { ConstructionIcon } from "lucide-react"
import { notFound } from "next/navigation"
import { headers } from "next/headers"

import { auth } from "@/lib/auth"
import { ConstructionIcon } from "lucide-react"

// import { SidebarInset, SidebarProvider } from "@/shared/components/ui/sidebar"
// import QueryProvider from "@/shared/components/providers/QueryProvider"
// import { AppSidebar } from "@/shared/components/sidebar/appSidebar"
// import Header from "@/shared/components/header/Header"

export default async function AdminDashboardLayout({}: Readonly<{
	children: React.ReactNode
}>) {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session) {
		notFound()
	}

	return (
		// <QueryProvider>
		// 	<SidebarProvider>
		// 		<AppSidebar session={session} canAccessAdminRoutes={session.user.accessRole === "ADMIN"} />

		// 		<SidebarInset className="overflow-x-hidden">
		// 			<Header session={session} />

		// 			<main className="bg-secondary-background flex h-full flex-col items-center gap-8 p-4 pb-20 lg:p-8 lg:pb-32">
		// 				{children}
		// 			</main>

		// 			<ReactQueryDevtools />
		// 		</SidebarInset>
		// 	</SidebarProvider>
		// </QueryProvider>

		<div className="flex h-screen w-screen flex-1 flex-col items-center justify-between">
			<div></div>

			<div className="h-fit max-w-md text-center">
				<h1 className="text-text/60 mb-6 text-5xl font-bold">EN MANTENIMIENTO</h1>

				<div className="mb-6 flex items-center justify-center">
					<div className="text-8xl font-bold text-blue-500">5</div>
					<div className="mx-2 flex h-20 w-20 items-center justify-center rounded-xl bg-blue-500 p-4">
						<div className="bg-background rounded-lg p-1.5">
							<ConstructionIcon className="size-11 text-blue-500" />
						</div>
					</div>
					<div className="text-8xl font-bold text-blue-500">3</div>
				</div>

				<p className="text-muted-foreground mb-8">
					El sitio se encuentra en mantenimiento, por favor vuelva a intentar más tarde.
				</p>
			</div>

			<div className="text-muted-foreground py-4 text-center text-xs">
				© {new Date().getFullYear()} - OTC 360
			</div>
		</div>
	)
}
