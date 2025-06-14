import { notFound } from "next/navigation"
import { headers } from "next/headers"

import { auth } from "@/lib/auth"

import { FileExplorerBySearch } from "@/features/document/components/data/FileExplorerBySearch"

export default async function DocumentsBySearchPage() {
	const data = await auth.api.getSession({
		headers: await headers(),
	})

	if (!data?.user) {
		return notFound()
	}

	return (
		<div className="w-full max-w-screen-xl flex-1">
			<FileExplorerBySearch />
		</div>
	)
}
