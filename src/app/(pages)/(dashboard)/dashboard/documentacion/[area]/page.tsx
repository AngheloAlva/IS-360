import { PlusIcon, UploadIcon } from "lucide-react"
import { notFound } from "next/navigation"
import { headers } from "next/headers"
import Link from "next/link"

import { getFilesAndFolders } from "@/actions/document-management/getFilesAndFolders"
import { Areas, SpecialAreas } from "@/lib/consts/areas"
import { auth } from "@/lib/auth"

import { FileExplorerTable } from "@/components/document-management/FileExplorerTable"
import BackButton from "@/components/shared/BackButton"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface PageProps {
	params: Promise<{
		area: string
	}>
}

export default async function AreaRootPage({ params }: PageProps) {
	const { area } = await params
	const data = await auth.api.getSession({ headers: await headers() })

	if (!data?.user) return notFound()

	const areaData =
		SpecialAreas[area as keyof typeof SpecialAreas] || Areas[area as keyof typeof Areas]
	if (!areaData) return notFound()

	const areaKey = area as keyof typeof Areas
	const areaName = areaData.title
	const areaValue = areaData.value
	const res = await getFilesAndFolders(areaValue)

	if (!res.ok || !res.folders || !res.files) return notFound()

	return (
		<div className="container mx-auto px-4 py-6">
			<div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
				<div className="flex items-center gap-3">
					<BackButton href="/dashboard/documentacion" />

					<h1 className="text-3xl font-bold text-gray-800">Gestor Documental</h1>
					<Badge className={"mt-0.5 rounded-lg text-sm font-medium"}>
						{areaName.replace(/_/g, " ")}
					</Badge>
				</div>

				<div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
					<Link href={`/dashboard/documentacion/nuevo-archivo?area=${areaKey}`}>
						<Button className="group flex items-center gap-2 border border-green-600 bg-white text-green-600 hover:bg-green-600 hover:text-white">
							<span className="font-medium">Subir Archivo</span>
							<UploadIcon className="h-4 w-4" />
						</Button>
					</Link>

					<Link href={`/dashboard/documentacion/nueva-carpeta?area=${areaKey}&isRootFolder=true`}>
						<Button className="group hover:bg-primary border-primary text-primary flex items-center gap-2 border bg-white hover:text-white">
							<span className="font-medium">Nueva Carpeta</span>
							<PlusIcon className="h-4 w-4" />
						</Button>
					</Link>
				</div>
			</div>

			<FileExplorerTable
				folders={res.folders}
				files={res.files}
				foldersSlugs={[area]}
				isAdmin={data.user.role === "ADMIN" || data.user.role === "SUPERADMIN"}
			/>
		</div>
	)
}
