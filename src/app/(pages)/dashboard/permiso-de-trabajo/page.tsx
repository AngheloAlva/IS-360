import MainWorkBook from "@/components/sections/work-permit/Main"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

export default async function WorkPermitPage(props: { searchParams: SearchParams }) {
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
