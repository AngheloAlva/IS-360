import { Areas } from "@/lib/consts/areas"

import { PlusIcon, UploadIcon, RefreshCcw, ChevronLeft } from "lucide-react"
import { notFound } from "next/navigation"
import Link from "next/link"

import { FileExplorerTable } from "@/components/document-management/FileExplorerTable"
import { getFilesAndFolders } from "@/actions/document-management/getFilesAndFolders"
import { Button } from "@/components/ui/button"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

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
	const lastFolder = folderSlug[folderSlug.length - 1]

	const res = await getFilesAndFolders(areaName, lastFolder)

	if (!res.ok || !res.folders || !res.files) {
		return notFound()
	}

	const backPath =
		folderSlug.length > 1
			? `/dashboard/documentacion/${area}/${folderSlug.slice(0, -1).join("/")}`
			: `/dashboard/documentacion/${area}`

	return (
		<div className="container mx-auto">
			<div className="mb-6 flex items-center justify-between">
				<div className="flex items-center gap-4">
					<Link
						className="hover:bg-primary/40 hover:text-primary mt-0.5 rounded-full transition-colors"
						href={backPath}
					>
						<ChevronLeft className="h-7 w-7" />
					</Link>

					<h1 className="text-2xl font-bold capitalize">Gestor Documental - {area}</h1>
				</div>

				<div className="flex gap-2">
					<Button size="sm" variant="outline">
						<RefreshCcw className="mr-2 h-4 w-4" />
						Actualizar
					</Button>

					<Link
						href={`/dashboard/documentacion/nuevo-archivo?area=${areaName}&parentFolderSlug=${lastFolder}&backPath=${backPath}`}
					>
						<Button size="sm" variant="outline">
							<UploadIcon className="mr-2 h-4 w-4" />
							Subir Archivo
						</Button>
					</Link>

					<Link
						href={`/dashboard/documentacion/nueva-carpeta?area=${areaName}&isRootFolder=false&parentFolderSlug=${lastFolder}&backPath=${backPath}`}
					>
						<Button size="sm">
							<PlusIcon className="mr-2 h-4 w-4" />
							Nueva Carpeta
						</Button>
					</Link>
				</div>
			</div>

			<div className="rounded-md border bg-white shadow-sm">
				<FileExplorerTable
					files={res.files}
					folders={res.folders}
					foldersSlugs={[area, ...folderSlug]}
					isAdmin={data.user.role === "ADMIN" || data.user.role === "SUPERADMIN"}
				/>
			</div>
		</div>
	)
}
