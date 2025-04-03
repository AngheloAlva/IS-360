import { notFound } from "next/navigation"
import { headers } from "next/headers"

import { auth } from "@/lib/auth"

import ActivityForm from "@/components/forms/work-book/ActivityForm"
import BackButton from "@/components/shared/BackButton"

export default async function CreateAdditionalActivityPage({
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
				<BackButton href={`/admin/dashboard/libros-de-obras/${id}`} />
				<h1 className="text-2xl font-bold text-gray-800">Agregar Actividad Adicional</h1>
			</div>

			<ActivityForm entryType="ADDITIONAL_ACTIVITY" workOrderId={id} session={session} />
		</>
	)
}
