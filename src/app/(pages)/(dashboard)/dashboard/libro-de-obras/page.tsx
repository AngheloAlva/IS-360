import { unauthorized } from "next/navigation"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"

import { WORK_BOOK_TUTORIAL_LINKS } from "@/project/tutorials/work-book/tutorials"
import { WorkBookTable } from "@/project/work-order/components/data/WorkBookTable"
import TutorialsDropdown from "@/shared/components/TutorialsDropdown"
import ModuleHeader from "@/shared/components/ModuleHeader"

export default async function WorkBooksPage() {
	const res = await auth.api.getSession({
		headers: await headers(),
	})

	if (!res || !res.user || !res.user.companyId) {
		return unauthorized()
	}

	return (
		<main className="flex h-full w-full flex-1 flex-col gap-8 transition-all">
			<ModuleHeader
				title="Libro de Obras"
				description="Gestión de libros de obras de tu empresa"
				className="from-orange-600 to-red-700 dark:from-orange-800 dark:to-red-900"
			>
				<>
					<TutorialsDropdown
						tutorials={WORK_BOOK_TUTORIAL_LINKS}
						targetId="work-book-tutorial-dropdown"
					/>
				</>
			</ModuleHeader>

			<WorkBookTable companyId={res.user.companyId} />
		</main>
	)
}
