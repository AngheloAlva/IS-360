"use client"

import { Files, Search, CarIcon, UsersIcon, EarthIcon, ShieldPlusIcon } from "lucide-react"
import { useState } from "react"
import Link from "next/link"

import { useStartupFoldersList } from "@/hooks/startup-folders/use-startup-folder"

import { StartupFolderStatusBadge } from "@/components/ui/startup-folder-status-badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
	Card,
	CardTitle,
	CardFooter,
	CardHeader,
	CardContent,
	CardDescription,
} from "@/components/ui/card"

export function AdminStartupFoldersList() {
	const [searchTerm, setSearchTerm] = useState("")

	const { data: folders, isLoading } = useStartupFoldersList({ search: searchTerm })

	return (
		<>
			<div className="mb-4 flex flex-col items-center gap-3 md:flex-row">
				<div className="relative flex-1">
					<Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
					<Input
						type="search"
						value={searchTerm}
						className="bg-background pl-8"
						onChange={(e) => setSearchTerm(e.target.value)}
						placeholder="Buscar por nombre o RUT de empresa..."
					/>
				</div>
			</div>

			{folders?.length === 0 && (
				<div className="col-span-full flex flex-col items-center justify-center space-y-3 rounded-lg border border-dashed p-8 text-center">
					<Files className="text-muted-foreground h-8 w-8" />
					<div>
						<p className="text-lg font-medium">
							No hay carpetas de arranque para órdenes de trabajo
						</p>
						<p className="text-muted-foreground text-sm">
							Las carpetas de arranque se crean automáticamente al crear una orden de trabajo para
							una empresa contratista.
						</p>
					</div>
				</div>
			)}

			{isLoading ? (
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
			) : (
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{folders?.map((folder) => (
						<Card key={folder.id} className="gap-2 overflow-hidden">
							<CardHeader className="pb-2">
								<div className="flex items-center justify-between">
									<div>
										<CardTitle className="line-clamp-1 text-lg">{folder.company.name}</CardTitle>
										<CardDescription>{folder.company.rut}</CardDescription>
									</div>

									<Avatar className="size-14 text-xl">
										<AvatarImage src={folder.company.image} />
										<AvatarFallback>{folder.company.name.slice(0, 2)}</AvatarFallback>
									</Avatar>
								</div>
							</CardHeader>

							<CardContent className="flex flex-col gap-1">
								<h2 className="font-medium">Documentos:</h2>

								<div className="flex items-center text-sm">
									<ShieldPlusIcon className="mr-2 h-4 w-4" />
									<span className="mr-1">Seguridad y Salud Operacional:</span>
									<span>
										{
											folder.safetyAndHealthFolders[0].documents.filter((doc) => doc.url !== "")
												?.length
										}
									</span>
									<StartupFolderStatusBadge
										status={folder.safetyAndHealthFolders[0].status}
										className="ml-auto"
									/>
								</div>

								<div className="flex items-center text-sm">
									<EarthIcon className="mr-2 h-4 w-4" />
									<span className="mr-1">Medio Ambiente:</span>
									<span>
										{
											folder.environmentalFolders[0].documents.filter((doc) => doc.url !== "")
												.length
										}
									</span>
									<StartupFolderStatusBadge
										status={folder.environmentalFolders[0].status}
										className="ml-auto"
									/>
								</div>

								<div className="flex items-center text-sm">
									<UsersIcon className="mr-2 h-4 w-4" />
									<span className="mr-1">Colaboradores:</span>
									<span>
										{folder.workersFolders &&
											folder.workersFolders
												.map((folder) => folder.documents.filter((doc) => doc.url !== "").length)
												.reduce((a, b) => a + b)}
									</span>
									<StartupFolderStatusBadge
										status={folder.workersFolders[0].status}
										className="ml-auto"
									/>
								</div>

								{folder.vehiclesFolders.length > 0 && (
									<div className="flex items-center text-sm">
										<CarIcon className="mr-2 h-4 w-4" />
										<span className="mr-1">Vehículos:</span>
										<span>
											{folder.vehiclesFolders
												.map((folder) => folder.documents.filter((doc) => doc.url !== "").length)
												.reduce((a, b) => a + b)}
										</span>
										<StartupFolderStatusBadge
											status={folder.vehiclesFolders[0].status}
											className="ml-auto"
										/>
									</div>
								)}
							</CardContent>

							<CardFooter className="mt-2">
								<Button asChild variant="default" className="hover:bg-primary/80 w-full">
									<Link href={`/admin/dashboard/carpetas-de-arranques/${folder.company.id}`}>
										Ver carpeta
									</Link>
								</Button>
							</CardFooter>
						</Card>
					))}
				</div>
			)}
		</>
	)
}
