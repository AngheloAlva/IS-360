import { notFound } from "next/navigation"
import { headers } from "next/headers"

import { auth } from "@/lib/auth"

import NewComment from "@/components/forms/auth/NewCommentForm"
import BackButton from "@/components/shared/BackButton"

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>
type Params = Promise<{ fileId: string }>

export default async function NewFileCommentPage(props: {
	params: Params
	searchParams: SearchParams
}): Promise<React.ReactElement> {
	const { fileId } = await props.params

	const searchParams = await props.searchParams
	const lastPath = searchParams.lastPath as string | undefined

	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session) {
		return notFound()
	}

	return (
		<div className="w-full flex-1 space-y-4">
			<div className="mx-auto flex max-w-lg items-center gap-2">
				<BackButton href={lastPath || "/dashboard/documentacion"} />
				<h1 className="text-2xl font-bold">Nuevo comentario</h1>
			</div>

			<NewComment fileId={fileId} lastPath={lastPath} userId={session.user.id} />
		</div>
	)
}
