import { notFound } from "next/navigation"
import { headers } from "next/headers"

import { auth } from "@/lib/auth"

import WorkBookMain from "@/features/work-order/components/data/WorkBookMain"

export default async function WorkBooksPage({ params }: { params: Promise<{ id: string }> }) {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	const { id } = await params

	if (!session?.user) {
		return notFound()
	}

	return (
		<>
			<WorkBookMain
				workBookId={id}
				hasPermission={false}
				userId={session.user.id}
				userRole={session.user.role!}
			/>
		</>
	)
}
