import { notFound } from "next/navigation"
import { headers } from "next/headers"

import { auth } from "@/lib/auth"

import { ApiDocsPage } from "@/project/api-keys/components/ApiDocsPage"

export default async function AdminApiDocsPage(): Promise<React.ReactElement> {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id) return notFound()

	if (session.user.role !== "admin") return notFound()

	return (
		<div className="flex h-full w-full flex-1 flex-col gap-8 transition-all">
			<div className="rounded-lg bg-linear-to-r from-blue-600 to-sky-500 p-6">
				<div className="flex items-center justify-between">
					<div className="text-white">
						<h1 className="text-3xl font-bold tracking-tight">
							Documentacion API
						</h1>
						<p className="opacity-90">
							Guia de conexion para Power BI
						</p>
					</div>
				</div>
			</div>

			<ApiDocsPage />
		</div>
	)
}
