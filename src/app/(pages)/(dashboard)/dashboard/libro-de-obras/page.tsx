import { unauthorized } from "next/navigation"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"

import { WorkBookDataTable } from "@/components/sections/work-book/WorkBookDataTable"
import NewWorkBookForm from "@/components/forms/work-book/NewWorkBookForm"

export default async function WorkBooksPage() {
	const res = await auth.api.getSession({
		headers: await headers(),
	})

	if (!res || !res.user || !res.user.companyId) {
		return unauthorized()
	}

	return (
		<main className="flex h-full w-full flex-1 flex-col gap-8 transition-all">
			<div className="flex w-full flex-wrap items-center justify-between gap-2">
				<div>
					<h1 className="text-text w-fit text-3xl font-bold">Libro de Obras</h1>
					<p className="text-text-foreground">
						Aca puedes gestionar tus libros de obras y sus actividades.
					</p>
				</div>

				<NewWorkBookForm userId={res.user.id} companyId={res.user.companyId} />
			</div>

			<WorkBookDataTable companyId={res.user.companyId} />
		</main>
	)
}
