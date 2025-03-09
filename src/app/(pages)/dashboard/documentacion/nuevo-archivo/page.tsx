import { headers } from "next/headers"

import { auth } from "@/lib/auth"

import { NewFileForm } from "@/components/forms/document-management/NewFileForm"

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
	const parentFolderId = searchParams.parentFolderId as string | undefined

	return (
		<>
			<h1 className="w-fit text-3xl font-bold">Nuevo Archivo</h1>

			<NewFileForm userId={res.user.id} folderId={parentFolderId} area={area} />
		</>
	)
}
