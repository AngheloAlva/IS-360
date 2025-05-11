"use client"

import { Tag, Info, Files, Building2, Briefcase, Search } from "lucide-react"
import { es } from "date-fns/locale"
import { format } from "date-fns"
import { useState } from "react"
import Link from "next/link"

import { useAdminAllWorkOrderFolders } from "@/hooks/startup-folders/use-admin-all-work-order-folders"

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { StartupFolderStatusBadge } from "@/components/ui/startup-folder-status-badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { WorkOrderTypeLabels } from "../../../../lib/consts/work-order-types"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"

export function AdminWorkOrderStartupFoldersList() {
	const [searchTerm, setSearchTerm] = useState("")
	const [statusFilter, setStatusFilter] = useState<string>("ALL")
	const { data: folders, isLoading } = useAdminAllWorkOrderFolders()

	const filteredFolders = folders?.filter((folder) => {
		const companyName = folder.workOrder.company?.name?.toLowerCase() || ""
		const otNumber = folder.workOrder.otNumber?.toLowerCase() || ""
		const workName = folder.workOrder.workName?.toLowerCase() || ""
		const search = searchTerm.toLowerCase()

		const matchesSearch =
			companyName.includes(search) || otNumber.includes(search) || workName.includes(search)

		const matchesStatus = statusFilter === "ALL" || folder.status === statusFilter

		return matchesSearch && matchesStatus
	})

	if (isLoading) {
		return (
			<>
				<div className="mb-4 flex gap-2">
					<Skeleton className="h-10 w-full" />
					<Skeleton className="h-10 w-32" />
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
					<p className="text-lg font-medium">No hay carpetas de arranque para órdenes de trabajo</p>
					<p className="text-muted-foreground text-sm">
						Las carpetas de arranque se crean automáticamente al crear una orden de trabajo para una
						empresa contratista.
					</p>
				</div>
			</div>
		)
	}

	return (
		<>
			<div className="mb-4 flex flex-col items-center gap-3 md:flex-row">
				<div className="relative flex-1">
					<Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
					<Input
						type="search"
						className="pl-8"
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						placeholder="Buscar por empresa, número OT o nombre de trabajo..."
					/>
				</div>
				<div className="flex w-full items-center gap-2 md:w-auto">
					<Select value={statusFilter} onValueChange={setStatusFilter}>
						<SelectTrigger className="w-[180px]">
							<SelectValue placeholder="Filtrar por estado" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="ALL">Todos los estados</SelectItem>
							<SelectItem value="DRAFT">Borrador</SelectItem>
							<SelectItem value="SUBMITTED">Enviada</SelectItem>
							<SelectItem value="APPROVED">Aprobada</SelectItem>
							<SelectItem value="REJECTED">Rechazada</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>

			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				{filteredFolders?.map((folder) => (
					<Card key={folder.id} className="overflow-hidden">
						<CardHeader className="pb-2">
							<div className="flex items-center justify-between">
								<CardTitle className="line-clamp-1 text-lg">{folder.workOrder.otNumber}</CardTitle>
								<StartupFolderStatusBadge status={folder.status} />
							</div>
						</CardHeader>

						<CardContent>
							<div className="flex items-center text-sm">
								<Building2 className="mr-2 h-4 w-4" />
								<span>{folder.workOrder.company.name}</span>
							</div>

							<div className="mt-1 flex items-center text-sm">
								<Tag className="mr-2 h-4 w-4" />
								<span>{WorkOrderTypeLabels[folder.workOrder.type]}</span>
							</div>

							{folder.workOrder.workName && (
								<div className="mt-1 flex items-center text-sm">
									<Briefcase className="mr-2 h-4 w-4" />
									<span className="line-clamp-1">{folder.workOrder.workName}</span>
								</div>
							)}

							<div className="mt-3 flex items-center justify-between gap-2 text-sm">
								<div>
									<p className="text-muted-foreground">Documentos</p>
									<p className="font-medium">
										{(folder.workers?.length || 0) +
											(folder.vehicles?.length || 0) +
											(folder.procedures?.length || 0) +
											(folder.environmentals?.length || 0)}
									</p>
								</div>
								<div>
									<p className="text-muted-foreground">Actualización</p>
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
								<Link href={`/admin/dashboard/carpetas-de-arranques/orden/${folder.id}`}>
									Ver carpeta
								</Link>
							</Button>
							{folder.status === "SUBMITTED" && (
								<Button asChild variant="outline" className="hover:bg-secondary/80 w-full">
									<Link href={`/admin/dashboard/carpetas-de-arranques/orden/${folder.id}/revisar`}>
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
