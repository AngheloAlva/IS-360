import { notFound } from "next/navigation"
import { headers } from "next/headers"

import { getFolderById } from "@/actions/document-management/getFolders"
import { auth } from "@/lib/auth"

import UpdateFolderForm from "@/components/forms/document-management/UpdateFolderForm"

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>
type Params = Promise<{ folderId: string }>

export default async function UpdateFolderPage(props: {
	searchParams: SearchParams
	params: Params
}) {
	const res = await auth.api.getSession({
		headers: await headers(),
	})

	if (!res) {
		return notFound()
	}

	const folderId = (await props.params).folderId
	const { data, ok } = await getFolderById(folderId)

	if (!ok || !data) {
		return notFound()
	}

	const searchParams = await props.searchParams
	const lastPath = searchParams.lastPath as string | undefined

	return (
		<>
			<h1 className="w-fit text-3xl font-bold">Actualizar Carpeta</h1>

			<UpdateFolderForm lastPath={lastPath} userId={res.user.id} oldFolder={data} />
		</>
	)
}
