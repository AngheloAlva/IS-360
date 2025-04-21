import { headers } from "next/headers"

import { auth } from "@/lib/auth"

import WorkBookMain from "@/components/sections/work-book/WorkBookMain"
import { unauthorized } from "next/navigation"

export default async function WorkBooksPage() {
	const res = await auth.api.getSession({
		headers: await headers(),
	})

	if (!res) {
		return unauthorized()
	}

	return <WorkBookMain companyId={res.user.companyId!} />
}
