import { notFound } from "next/navigation"
import { headers } from "next/headers"

import { auth } from "@/lib/auth"

import ActivityForm from "@/components/forms/work-book/WorkBookActivityForm"
import BackButton from "@/components/shared/BackButton"

export default async function CreateDailyActivityPage({
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
				<h1 className="text-text text-2xl font-bold">Agregar Actividad Diaria</h1>
			</div>

			<ActivityForm entryType="DAILY_ACTIVITY" workOrderId={id} userId={session.session.userId} />
		</>
	)
}
