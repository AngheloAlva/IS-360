"use client"

import { Tag, Info, Files, Building2, Briefcase } from "lucide-react"
import { es } from "date-fns/locale"
import { format } from "date-fns"
import Link from "next/link"

import { useWorkOrderStartupFolders } from "@/hooks/startup-folders/use-work-order-startup-folder"
import { authClient } from "@/lib/auth-client"

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { StartupFolderStatusBadge } from "@/components/ui/startup-folder-status-badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"

export function WorkOrderStartupFoldersList() {
	const { data: session } = authClient.useSession()
	const { data: folders, isLoading } = useWorkOrderStartupFolders()

	const isPartnerCompany = session?.user?.role === "PARTNER_COMPANY"

	if (isLoading) {
		return (
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				{[1, 2, 3].map((item) => (
					<Card key={item} className="overflow-hidden">
						<CardHeader className="pb-2">
							<Skeleton className="h-6 w-3/4" />
						</CardHeader>
						<CardContent>
							<Skeleton className="mb-2 h-4 w-full" />
							<Skeleton className="h-4 w-2/3" />
						</CardContent>
						<CardFooter>
							<Skeleton className="h-9 w-full" />
						</CardFooter>
					</Card>
				))}
			</div>
		)
	}

	if (!folders || folders.length === 0) {
		return (
			<div className="col-span-full flex flex-col items-center justify-center space-y-3 rounded-lg border border-dashed p-8 text-center">
				<Files className="text-muted-foreground h-8 w-8" />
				<div>
					<p className="text-lg font-medium">No hay carpetas de arranque para órdenes de trabajo</p>
					<p className="text-muted-foreground text-sm">
						{isPartnerCompany
							? "Las carpetas de arranque se crean automáticamente al crear una orden de trabajo."
							: "Las carpetas de arranque se crean automáticamente al crear una orden de trabajo para una empresa contratista."}
					</p>
				</div>
			</div>
		)
	}

	return (
		<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
			{folders.map((folder) => (
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
							<span>{folder.workOrder.type}</span>
						</div>

						{folder.workOrder.workName && (
							<div className="mt-1 flex items-center text-sm">
								<Briefcase className="mr-2 h-4 w-4" />
								<span className="line-clamp-1">{folder.workOrder.workName}</span>
							</div>
						)}

						<div className="mt-3 grid grid-cols-2 gap-2 text-sm">
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
					<CardFooter>
						<Button asChild className="hover:bg-primary/80 w-full">
							<Link href={`/dashboard/carpetas-de-arranque/orden/${folder.id}`}>Ver carpeta</Link>
						</Button>
					</CardFooter>
				</Card>
			))}
		</div>
	)
}
