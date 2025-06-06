"use client"

import { Files, Search, DotIcon } from "lucide-react"
import { useState } from "react"
import Link from "next/link"

import { useStartupFoldersList } from "@/hooks/startup-folders/use-startup-folder"

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

	const { data: companiesWithFolders, isLoading } = useStartupFoldersList({ search: searchTerm })

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

			{companiesWithFolders?.length === 0 && (
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
					{companiesWithFolders?.map((company) => (
						<Card key={company.id} className="gap-2 overflow-hidden">
							<CardHeader className="pb-2">
								<div className="flex items-center justify-between">
									<div>
										<CardTitle className="line-clamp-1 text-lg">{company.name}</CardTitle>
										<CardDescription>{company.rut}</CardDescription>
									</div>

									<Avatar className="size-14 text-xl">
										<AvatarImage src={company.image || ""} />
										<AvatarFallback>{company.name.slice(0, 2)}</AvatarFallback>
									</Avatar>
								</div>
							</CardHeader>

							<CardContent className="mb-2 flex flex-col gap-1">
								<h2 className="font-semibold">Carpetas de arranque:</h2>

								<div className="flex flex-col gap-1 text-sm">
									{company.StartupFolders.map((folder) => (
										<span key={folder.id} className="flex items-center">
											<DotIcon className="mr-2 h-2 w-2" />
											{folder.name}
										</span>
									))}
								</div>

								<div className="mt-3 flex items-center gap-1 font-semibold">
									<h2>¿Hay carpetas para revisión?:</h2>

									{company.StartupFolders.some(
										(folder) =>
											folder.environmentalFolders.some((folder) => folder.status === "SUBMITTED") ||
											folder.safetyAndHealthFolders.some(
												(folder) => folder.status === "SUBMITTED"
											) ||
											folder.workersFolders.some((folder) => folder.status === "SUBMITTED") ||
											folder.vehiclesFolders.some((folder) => folder.status === "SUBMITTED")
									) ? (
										<span className="text-primary">Sí</span>
									) : (
										<span className="text-muted-foreground">No</span>
									)}
								</div>
							</CardContent>

							<CardFooter className="mt-auto">
								<Button asChild variant="default" className="hover:bg-primary/80 w-full">
									<Link href={`/admin/dashboard/carpetas-de-arranques/${company.id}`}>
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
