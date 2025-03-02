import { headers } from "next/headers"

import { auth } from "@/lib/auth"

import MainWorkBook from "@/components/sections/work-book/Main"

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

export default async function WorkBooksPage(props: { searchParams: SearchParams }) {
	const res = await auth.api.getSession({
		headers: await headers(),
	})

	if (!res) {
		return (
			<main className="flex h-screen items-center justify-center">
				<p>Acceso denegado</p>
			</main>
		)
	}

	const searchParams = await props.searchParams
	const page = searchParams.page ? parseInt(searchParams.page as string) : 1

	return <MainWorkBook page={page} userId={res.user.id} />
}
