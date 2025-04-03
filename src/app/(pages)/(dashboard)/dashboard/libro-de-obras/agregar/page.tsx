import { notFound } from "next/navigation"
import { headers } from "next/headers"

import { auth } from "@/lib/auth"

import WorkBookForm from "@/components/sections/work-book/WorkBookForm"
import BackButton from "@/components/shared/BackButton"

export default async function CreateWorkBookPage() {
	const data = await auth.api.getSession({
		headers: await headers(),
	})

	if (!data || !data.session) {
		return notFound()
	}

	return (
		<>
			<div className="mx-auto flex w-full max-w-screen-md items-center justify-start gap-2">
				<BackButton href="/dashboard/libro-de-obras" />
				<h1 className="w-fit text-3xl font-bold">Nuevo Libro de Obras</h1>
			</div>

			<WorkBookForm userId={data.user.id} companyId={data.user.companyId!} />
		</>
	)
}
