import { notFound } from "next/navigation"
import { headers } from "next/headers"

import { getFileById } from "@/actions/document-management/getFiles"
import { auth } from "@/lib/auth"

import { UpdateFileForm } from "@/components/forms/document-management/UpdateFileForm"
import BackButton from "@/components/shared/BackButton"

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
	const area = searchParams.area as string
	const lastPath = searchParams.lastPath as string | undefined
	const backPath = searchParams.backPath as string | undefined

	return (
		<>
			<div className="flex w-full items-center justify-start gap-2">
				<BackButton href={backPath || `/dashboard/documentacion/${area}`} />
				<h1 className="text-text w-fit text-3xl font-bold">Actualizar Archivo</h1>
			</div>

			<UpdateFileForm fileId={fileId} lastPath={lastPath} userId={res.user.id} initialData={data} />
		</>
	)
}
