import { headers } from "next/headers"

import { Areas } from "@/lib/consts/areas"
import { auth } from "@/lib/auth"

import NewFolderForm from "@/components/forms/document-management/NewFolderForm"

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
	const area = searchParams.area as (typeof Areas)[keyof typeof Areas]["title"]
	const isRootFolder = Boolean(searchParams.isRootFolder)
	const parentFolderId = searchParams.parentFolderId as string | undefined

	return (
		<>
			<h1 className="w-fit text-3xl font-bold">Nueva Carpeta</h1>

			<NewFolderForm
				area={area}
				userId={res.user.id}
				parentId={parentFolderId}
				isRootFolder={isRootFolder}
			/>
		</>
	)
}
