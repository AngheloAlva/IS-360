import { PlusIcon, UploadIcon } from "lucide-react"
import { notFound } from "next/navigation"
import { headers } from "next/headers"
import Link from "next/link"

import { Areas } from "@/lib/consts/areas"
import { auth } from "@/lib/auth"

import { FileExplorerTable } from "@/components/sections/documentation/FileExplorerTable"
import BackButton from "@/components/shared/BackButton"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface PageProps {
	params: Promise<{
		area: string
		folderSlug: string[]
	}>
}

export default async function DocumentsFilesPage({ params }: PageProps) {
	const { area, folderSlug } = await params

	const data = await auth.api.getSession({
		headers: await headers(),
	})

	if (!data?.user) {
		return notFound()
	}

	const areaName = Areas[area as keyof typeof Areas]["title"]
	const areaValue = Areas[area as keyof typeof Areas]["value"]
	const lastFolder = folderSlug[folderSlug.length - 1]

	const backPath =
		folderSlug.length >= 1
			? `/dashboard/documentacion/${area}/${folderSlug.slice(0, -1).join("/")}`
			: `/dashboard/documentacion/${area}`

	const lastPath =
		folderSlug.length >= 1
			? `/dashboard/documentacion/${area}/${folderSlug.join("/")}`
			: `/dashboard/documentacion/${area}`

	return (
		<div className="container mx-auto px-4 py-6">
			<div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
				<div className="flex items-center gap-3">
					<BackButton href={backPath} />

					<h1 className="text-3xl font-bold text-gray-800">Gestor Documental</h1>
					<Badge className={"mt-0.5 rounded-lg text-sm font-medium"}>{areaName}</Badge>
				</div>

				<div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
					<Link
						href={`/dashboard/documentacion/nuevo-archivo?area=${area}&parentFolderSlug=${lastFolder}&backPath=${lastPath}`}
					>
						<Button className="group flex items-center gap-2 border border-green-600 bg-white text-green-600 hover:bg-green-600 hover:text-white">
							<span className="font-medium">Subir Archivo</span>
							<UploadIcon className="h-4 w-4" />
						</Button>
					</Link>

					<Link
						href={`/dashboard/documentacion/nueva-carpeta?area=${area}&isRootFolder=false&parentFolderSlug=${lastFolder}&backPath=${lastPath}`}
					>
						<Button className="group hover:bg-primary border-primary text-primary flex items-center gap-2 border bg-white hover:text-white">
							<span className="font-medium">Nueva Carpeta</span>
							<PlusIcon className="h-4 w-4" />
						</Button>
					</Link>
				</div>
			</div>

			<FileExplorerTable
				lastPath={lastPath}
				areaValue={areaValue}
				userId={data.user.id}
				actualFolderSlug={lastFolder}
				foldersSlugs={[area, ...folderSlug]}
			/>
		</div>
	)
}
