import { unauthorized } from "next/navigation"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"

import { WorkBookTable } from "@/features/work-order/components/data/WorkBookTable"
import NewWorkBookForm from "@/features/work-order/components/forms/NewWorkBookForm"

export default async function WorkBooksPage() {
	const res = await auth.api.getSession({
		headers: await headers(),
	})

	if (!res || !res.user || !res.user.companyId) {
		return unauthorized()
	}

	return (
		<main className="flex h-full w-full flex-1 flex-col gap-8 transition-all">
			<div className="rounded-lg bg-gradient-to-r from-blue-600 to-indigo-700 p-6 shadow-lg">
				<div className="flex items-center justify-between">
					<div className="text-white">
						<h1 className="text-3xl font-bold tracking-tight">Libro de Obras</h1>
						<p className="opacity-90">Gestión de libros de obras de tu empresa</p>
					</div>

					<NewWorkBookForm userId={res.user.id} companyId={res.user.companyId} />
				</div>
			</div>

			<WorkBookTable companyId={res.user.companyId} />
		</main>
	)
}
