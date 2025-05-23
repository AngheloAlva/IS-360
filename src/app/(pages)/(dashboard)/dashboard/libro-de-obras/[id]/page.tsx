import { notFound } from "next/navigation"
import { headers } from "next/headers"

import { USER_ROLE } from "@prisma/client"
import { auth } from "@/lib/auth"

import WorkBookMain from "@/components/sections/work-book/WorkBookMain"

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
				userId={session.user.id}
				userRole={session.user.role as USER_ROLE}
			/>
		</>
	)
}
