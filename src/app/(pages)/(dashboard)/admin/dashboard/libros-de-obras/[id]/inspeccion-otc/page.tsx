import { notFound } from "next/navigation"
import { headers } from "next/headers"

import { auth } from "@/lib/auth"

import OtcInspectorForm from "@/components/forms/work-book/OtcInspectorForm"
import BackButton from "@/components/shared/BackButton"

export default async function CreateOtcInspectionPage({
	params,
}: {
	params: Promise<{ id: string }>
}) {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.session) {
		return notFound()
	}

	const { id } = await params

	return (
		<>
			<div className="mx-auto flex w-full max-w-screen-xl items-center justify-start gap-2">
				<BackButton href={`/admin/dashboard/libros-de-obras/${id}`} />
				<h1 className="text-2xl font-bold text-gray-800">Inspección OTC</h1>
			</div>

			<OtcInspectorForm workOrderId={id} userId={session.user.id} />
		</>
	)
}
