import { headers } from "next/headers"

import { Areas } from "@/lib/consts/areas"
import { auth } from "@/lib/auth"

import NewFolderForm from "@/components/forms/document-management/NewFolderForm"
import BackButton from "@/components/shared/BackButton"

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

export default async function AddNewFolderPage(props: { searchParams: SearchParams }) {
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
	const area = searchParams.area as (typeof Areas)[keyof typeof Areas]["value"]
	const isRootFolder = Boolean(searchParams.isRootFolder)
	const parentFolderSlug = searchParams.parentFolderSlug as string | undefined
	const backPath = searchParams.backPath as string | undefined

	return (
		<>
			<div className="flex w-full max-w-screen-md items-center justify-start gap-2">
				<BackButton href={backPath || `/dashboard/documentacion/${area}`} />
				<h1 className="w-fit text-3xl font-bold">Nueva Carpeta</h1>
			</div>

			<NewFolderForm
				area={area}
				backPath={backPath}
				userId={res.user.id}
				isRootFolder={isRootFolder}
				parentSlug={parentFolderSlug}
			/>
		</>
	)
}
