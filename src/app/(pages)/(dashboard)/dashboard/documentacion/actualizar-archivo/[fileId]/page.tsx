import { notFound } from "next/navigation"
import { headers } from "next/headers"

import { getFileById } from "@/actions/document-management/getFiles"
import { auth } from "@/lib/auth"

import { UpdateFileForm } from "@/components/forms/document-management/UpdateFileForm"

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>
type Params = Promise<{ fileId: string }>

export default async function UpdateFilePage(props: {
	searchParams: SearchParams
	params: Params
}) {
	const res = await auth.api.getSession({
		headers: await headers(),
	})

	if (!res) {
		return notFound()
	}

	const fileId = (await props.params).fileId
	const { data, ok } = await getFileById(fileId)

	if (!ok || !data) {
		return notFound()
	}

	const searchParams = await props.searchParams
	const lastPath = searchParams.lastPath as string | undefined

	return (
		<>
			<h1 className="w-fit text-3xl font-bold">Actualizar Archivo</h1>

			<UpdateFileForm fileId={fileId} lastPath={lastPath} userId={res.user.id} initialData={data} />
		</>
	)
}
