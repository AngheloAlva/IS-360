import { notFound } from "next/navigation"
import { headers } from "next/headers"

import { auth } from "@/lib/auth"

import ActivityForm from "@/components/forms/work-book/ActivityForm"
import BackButton from "@/components/shared/BackButton"
import { Card } from "@/components/ui/card"

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
		<Card className="w-full max-w-screen-xl p-5">
			<div className="mx-auto flex w-full max-w-screen-xl items-center justify-start gap-2">
				<BackButton href={`/dashboard/libro-de-obras/${id}`} />
				<h1 className="text-text text-2xl font-bold">Agregar Actividad Diaria</h1>
			</div>

			<ActivityForm entryType="DAILY_ACTIVITY" workOrderId={id} session={session} />
		</Card>
	)
}
