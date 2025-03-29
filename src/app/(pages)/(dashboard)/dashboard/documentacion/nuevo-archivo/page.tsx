import { headers } from "next/headers"

import { auth } from "@/lib/auth"

import { NewFileForm } from "@/components/forms/document-management/NewFileForm"
import BackButton from "@/components/shared/BackButton"

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

export default async function AddNewFilePage(props: { searchParams: SearchParams }) {
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
	const area = searchParams.area as string
	const parentFolderSlug = searchParams.parentFolderSlug as string | undefined
	const backPath = searchParams.backPath as string | undefined

	return (
		<>
			<div className="flex w-full max-w-screen-md items-center justify-start gap-2">
				<BackButton href={backPath || `/dashboard/documentacion/${area}`} />
				<h1 className="w-fit text-3xl font-bold">Nuevo Archivo</h1>
			</div>

			<NewFileForm
				area={area}
				backPath={backPath}
				userId={res.user.id}
				folderSlug={parentFolderSlug}
			/>
		</>
	)
}
