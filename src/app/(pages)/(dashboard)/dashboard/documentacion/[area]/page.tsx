import { FolderIcon, UploadIcon } from "lucide-react"
import { notFound } from "next/navigation"
import { headers } from "next/headers"
import Link from "next/link"

import { Areas } from "@/lib/consts/areas"
import { auth } from "@/lib/auth"

import { FileExplorerTable } from "@/components/sections/documentation/FileExplorerTable"
import BackButton from "@/components/shared/BackButton"
import { Button } from "@/components/ui/button"

import type { MODULES, USER_ROLE } from "@prisma/client"

interface PageProps {
	params: Promise<{
		area: string
	}>
}

export default async function AreaRootPage({ params }: PageProps) {
	const { area } = await params
	const data = await auth.api.getSession({ headers: await headers() })

	if (!data?.user) return notFound()

	const areaData = Areas[area as keyof typeof Areas]
	if (!areaData) return notFound()

	const areaKey = area
	const areaName = areaData.title
	const areaValue = areaData.value

	return (
		<div>
			<div className="mb-8 flex gap-4 md:items-center md:justify-between">
				<div className="flex items-center gap-3">
					<BackButton href="/dashboard/documentacion" />

					<h1 className="text-text text-3xl font-bold">{areaName}</h1>
				</div>

				<div className="hidden gap-2 md:flex md:gap-3">
					<Link href={`/dashboard/documentacion/nuevo-archivo?area=${areaKey}`}>
						<Button size={"lg"} className="bg-green-600 text-white">
							<UploadIcon className="h-4 w-4" />
							<span className="hidden font-medium sm:block">Subir Archivo</span>
						</Button>
					</Link>

					<Link href={`/dashboard/documentacion/nueva-carpeta?area=${areaKey}&isRootFolder=true`}>
						<Button size={"lg"}>
							<FolderIcon className="h-4 w-4" />
							<span className="hidden font-medium sm:block">Nueva Carpeta</span>
						</Button>
					</Link>
				</div>
			</div>

			<FileExplorerTable
				areaValue={areaValue}
				foldersSlugs={[area]}
				userRole={data.user.role as USER_ROLE}
				userModules={data.user.modules as MODULES[]}
				backPath="/dashboard/documentacion"
				lastPath={"/dashboard/documentacion/" + area}
			/>

			<div className="mx-auto mt-6 flex items-center justify-center gap-2 md:hidden md:gap-3">
				<Link
					href={`/dashboard/documentacion/nuevo-archivo?area=${areaKey}`}
					className="w-1/2 sm:w-fit"
				>
					<Button size={"lg"} className="w-full bg-green-600 text-xs text-white sm:text-sm">
						<UploadIcon className="h-4 w-4" />
						<span className="font-medium">Subir Archivo</span>
					</Button>
				</Link>

				<Link
					href={`/dashboard/documentacion/nueva-carpeta?area=${areaKey}&isRootFolder=true`}
					className="w-1/2 sm:w-fit"
				>
					<Button size={"lg"} className="w-full text-xs sm:text-sm">
						<FolderIcon className="h-4 w-4" />
						<span className="font-medium">Nueva Carpeta</span>
					</Button>
				</Link>
			</div>
		</div>
	)
}
