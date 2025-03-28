import { PlusIcon, UploadIcon, ChevronLeft } from "lucide-react"
import { notFound } from "next/navigation"
import { headers } from "next/headers"
import Link from "next/link"

import { Areas, SpecialAreas, } from "@/lib/consts/areas"
import { auth } from "@/lib/auth"

import { FileExplorerTable } from "@/components/document-management/FileExplorerTable"
import { getFilesAndFolders } from "@/actions/document-management/getFilesAndFolders"
import { Button } from "@/components/ui/button"
import { AREAS } from "@prisma/client"

interface PageProps {
	params: Promise<{
		area: string
	}>
	
}

export default async function AreaRootPage({ params }: PageProps) {
	const { area } = await params
	const data = await auth.api.getSession({ headers: await headers() })

	if (!data?.user) return notFound()

	// Buscar primero en SpecialAreas y luego en Areas
	const areaData = SpecialAreas[area as keyof typeof SpecialAreas] || Areas[area as keyof typeof Areas]
	if (!areaData) return notFound()

	const areaName = areaData.title
	const areaValue = areaData.value
	const res = await getFilesAndFolders(areaValue as AREAS)

	if (!res.ok || !res.folders || !res.files) return notFound()

	// Paleta mejorada
	const areaColors = {
		bg: "bg-blue-50/20",
		border: "border-blue-200",
		text: "text-blue-700",
		badge: "bg-blue-100",
	}

	return (
		<div className="container mx-auto px-4 py-6">
			{/* Header Section */}
			<div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
				<div className="flex items-center gap-3">
					<Link
						href="/dashboard/documentacion"
						className={`${areaColors.badge} hover:${areaColors.bg} flex items-center gap-2 rounded-full px-3 py-1.5 transition-all duration-300`}
					>
						<ChevronLeft className={`${areaColors.text} h-6 w-6`} />
						<span className={`${areaColors.text} text-sm font-medium`}>Volver</span>
					</Link>

					<div className="flex items-baseline gap-2">
						<h1 className="text-3xl font-bold text-gray-800">Gestor Documental</h1>
						<span
							className={`${areaColors.badge} ${areaColors.text} rounded-lg px-3 py-1 text-sm font-medium`}
						>
							{areaName.replace(/_/g, " ")}
						</span>
					</div>
				</div>

				{/* Action Buttons */}
				<div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
					<Link href={`/dashboard/documentacion/nuevo-archivo?area=${areaName}`}>
						<Button className="group hover:bg-green-600 hover:text-white flex items-center gap-2 bg-white border-green-600 text-green-600 border">
							<span className="font-medium">Subir Archivo</span>
							<UploadIcon className="h-4 w-4" />
						</Button>
					</Link>

					<Link href={`/dashboard/documentacion/nueva-carpeta?area=${areaName}&isRootFolder=true`}>
						<Button className="group hover:bg-primary hover:text-white flex items-center gap-2 bg-white border-primary text-primary border">
							<span className="font-medium">Nueva Carpeta</span>
							<PlusIcon className="h-4 w-4" />
						</Button>
					</Link>
				</div>
			</div>

			{/* File Explorer Container */}
			<div
				className={`rounded-xl border ${areaColors.border} bg-gradient-to-br from-white to-blue-50/30 shadow-sm`}
			>
				<div className="relative overflow-hidden">
					{/* Subtle background pattern */}
					<div className="absolute inset-0 bg-[url('/svg/dot-pattern.svg')] bg-repeat opacity-10" />

					<FileExplorerTable
						folders={res.folders}
						files={res.files}
						foldersSlugs={[area]}
						isAdmin={data.user.role === "ADMIN" || data.user.role === "SUPERADMIN"}
					/>
				</div>
			</div>
		</div>
	)
}
