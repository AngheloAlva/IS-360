"use client"

import { Building2, Files, Info, Search } from "lucide-react"
import { es } from "date-fns/locale"
import { format } from "date-fns"
import { useState } from "react"
import Link from "next/link"

import { useAdminAllGeneralFolders } from "@/hooks/startup-folders/use-admin-all-general-folders"

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { StartupFolderStatusBadge } from "@/components/ui/startup-folder-status-badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export function AdminGeneralStartupFoldersList() {
	const [searchTerm, setSearchTerm] = useState("")

	const { data: folders, isLoading } = useAdminAllGeneralFolders()

	const filteredFolders = folders?.filter((folder) => {
		const companyName = folder.company.name.toLowerCase()
		const companyRut = folder.company.rut.toLowerCase()
		const search = searchTerm.toLowerCase()

		return companyName.includes(search) || companyRut.includes(search)
	})

	if (isLoading) {
		return (
			<>
				<div className="mb-4">
					<Skeleton className="h-10 w-full" />
				</div>
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{[1, 2, 3, 4, 5, 6].map((item) => (
						<Card key={item} className="overflow-hidden">
							<CardHeader className="pb-2">
								<Skeleton className="h-6 w-3/4" />
							</CardHeader>
							<CardContent>
								<Skeleton className="mb-2 h-4 w-full" />
								<Skeleton className="h-4 w-2/3" />
								<div className="mt-2 flex items-start gap-4">
									<Skeleton className="h-12 w-20" />
									<Skeleton className="h-12 w-28" />
								</div>
							</CardContent>
							<CardFooter>
								<Skeleton className="h-9 w-full" />
							</CardFooter>
						</Card>
					))}
				</div>
			</>
		)
	}

	if (!folders || folders.length === 0) {
		return (
			<div className="col-span-full flex flex-col items-center justify-center space-y-3 rounded-lg border border-dashed p-8 text-center">
				<Files className="text-muted-foreground h-8 w-8" />
				<div>
					<p className="text-lg font-medium">No hay carpetas de arranque generales</p>
					<p className="text-muted-foreground text-sm">
						Las carpetas de arranque generales se crean automáticamente al crear una empresa
						contratista.
					</p>
				</div>
			</div>
		)
	}

	return (
		<>
			<div className="mb-4 flex items-center gap-3">
				<div className="relative flex-1">
					<Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
					<Input
						type="search"
						className="pl-8"
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						placeholder="Buscar por nombre o RUT de empresa..."
					/>
				</div>
				<p className="text-muted-foreground text-sm">
					{filteredFolders?.length || 0} carpeta(s) encontrada(s)
				</p>
			</div>

			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				{filteredFolders?.map((folder) => (
					<Card key={folder.id} className="overflow-hidden">
						<CardHeader className="pb-2">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									<Avatar className="size-10">
										<AvatarFallback>
											{folder.company.name.charAt(0).toUpperCase()}
											{folder.company.name.charAt(1)}
										</AvatarFallback>
									</Avatar>
									<CardTitle className="line-clamp-1 text-lg">{folder.company.name}</CardTitle>
								</div>
								<StartupFolderStatusBadge status={folder.status} />
							</div>
						</CardHeader>

						<CardContent>
							<div className="flex items-center text-sm">
								<Building2 className="mr-2 h-4 w-4" />
								<span>RUT: {folder.company.rut}</span>
							</div>

							<div className="mt-2 flex items-start justify-between gap-4 text-sm">
								<div>
									<p className="text-muted-foreground">Documentos</p>
									<p className="font-medium">{folder.documents?.length || 0}</p>
								</div>
								<div>
									<p className="text-muted-foreground">Última actualización</p>
									<p className="font-medium">
										{format(new Date(folder.updatedAt), "dd MMM yyyy", { locale: es })}
									</p>
								</div>
							</div>
							{folder.reviewedAt && (
								<div className="text-muted-foreground mt-1 flex items-center gap-1 text-xs">
									<Info className="h-3 w-3" />
									<span>
										Revisado por {folder.reviewer?.name || "OTC"} el{" "}
										{format(new Date(folder.reviewedAt), "dd MMM yyyy", { locale: es })}
									</span>
								</div>
							)}
						</CardContent>

						<CardFooter className="gap-2">
							<Button asChild variant="default" className="hover:bg-primary/80 w-full">
								<Link href={`/admin/dashboard/carpetas-de-arranques/general/${folder.id}`}>
									Ver carpeta
								</Link>
							</Button>

							{folder.status === "SUBMITTED" && (
								<Button asChild variant="outline" className="hover:bg-primary/80 w-full">
									<Link
										href={`/admin/dashboard/carpetas-de-arranques/general/${folder.id}/revisar`}
									>
										Revisar
									</Link>
								</Button>
							)}
						</CardFooter>
					</Card>
				))}
			</div>
		</>
	)
}
