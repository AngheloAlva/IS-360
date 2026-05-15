import { notFound } from "next/navigation"
import { headers } from "next/headers"

import { auth } from "@/lib/auth"

import { ApiKeysPage } from "@/project/api-keys/components/ApiKeysPage"

export default async function AdminApiKeysPage(): Promise<React.ReactElement> {
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
						<h1 className="text-3xl font-bold tracking-tight">API Keys</h1>
						<p className="opacity-90">Gestión de claves de acceso para Power BI</p>
					</div>
				</div>
			</div>

			<ApiKeysPage />
		</div>
	)
}
