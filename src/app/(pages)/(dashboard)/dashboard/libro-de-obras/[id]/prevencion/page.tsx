import { notFound } from "next/navigation"
import { headers } from "next/headers"

import { auth } from "@/lib/auth"

import PreventionAreasForm from "@/components/forms/work-book/PreventionAreasForm"
import BackButton from "@/components/shared/BackButton"

export default async function CreatePreventionAreaPage({
	params,
}: {
	params: Promise<{ id: string }>
}) {
	const { id } = await params

	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.session) {
		return notFound()
	}

	return (
		<>
			<div className="mx-auto flex w-full max-w-screen-xl items-center justify-start gap-2">
				<BackButton href={`/dashboard/libro-de-obras/${id}`} />
				<h1 className="text-2xl font-bold text-gray-800">Agregar Área de Prevención</h1>
			</div>

			<PreventionAreasForm workBookId={id} userId={session.session.userId} />
		</>
	)
}
