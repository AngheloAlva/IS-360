import { headers } from "next/headers"
import { notFound } from "next/navigation"

import { auth } from "@/lib/auth"
import WorkBookTutorialPageClient from "@/project/work-order/components/tutorials/WorkBookTutorialPageClient"
import {
	WORK_BOOK_TUTORIAL_LINKS,
	getWorkBookTutorialBySlug,
} from "@/project/tutorials/work-book/tutorials"

export default async function WorkBookTutorialPage({
	params,
}: {
	params: Promise<{ tutorial: string }>
}) {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.companyId) {
		return notFound()
	}

	const { tutorial } = await params
	const activeTutorial = getWorkBookTutorialBySlug(tutorial)

	if (!activeTutorial) {
		return notFound()
	}

	return (
		<WorkBookTutorialPageClient tutorial={activeTutorial} tutorials={WORK_BOOK_TUTORIAL_LINKS} />
	)
}
