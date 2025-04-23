"use client"

import { WorkEntry } from "@/hooks/work-orders/use-work-entries"
import { ExternalLink, X } from "lucide-react"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerHeader,
	DrawerTitle,
} from "@/components/ui/drawer"
import Link from "next/link"

interface WorkBookEntryDetailsProps {
	entry: WorkEntry | null
	isLoading: boolean
	onClose: () => void
}

export function WorkBookEntryDetails({ entry, isLoading, onClose }: WorkBookEntryDetailsProps) {
	if (!entry && !isLoading) return null

	return (
		<Drawer
			open={entry !== null || isLoading}
			onOpenChange={(open) => !open && onClose()}
			direction="right"
		>
			<DrawerContent>
				<DrawerHeader className="border-border/50 border-b px-4 py-2">
					<div className="flex items-center justify-between">
						<DrawerTitle>{isLoading ? "Cargando..." : "Detalles de la Entrada"}</DrawerTitle>
						<DrawerClose asChild>
							<Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
								<X className="h-4 w-4" />
							</Button>
						</DrawerClose>
					</div>
				</DrawerHeader>
				<ScrollArea className="p-4">
					{isLoading ? (
						<div className="space-y-4">
							<Skeleton className="h-8 w-3/4" />
							<Skeleton className="h-4 w-full" />
							<Skeleton className="h-4 w-full" />
							<Skeleton className="h-20 w-full" />
							<Skeleton className="h-4 w-2/3" />
							<Skeleton className="h-4 w-1/2" />
							<Skeleton className="h-20 w-full" />
						</div>
					) : entry ? (
						<div className="space-y-6">
							<div>
								<h3 className="text-2xl font-semibold">{entry.activityName}</h3>
								<p className="text-muted-foreground text-sm">
									Creado por {entry.createdBy.name} el{" "}
									{new Date(entry.createdAt).toLocaleDateString()}
								</p>
							</div>

							<div className="space-y-2">
								<h4 className="font-semibold">Detalles de la Actividad</h4>
								<div className="grid grid-cols-2 gap-4">
									<div>
										<p className="text-muted-foreground text-sm">Hora de inicio</p>
										<p>{entry.activityStartTime}</p>
									</div>
									<div>
										<p className="text-muted-foreground text-sm">Hora de fin</p>
										<p>{entry.activityEndTime}</p>
									</div>
								</div>
							</div>

							<div className="space-y-2">
								<h4 className="font-semibold">Comentarios</h4>
								<p className="text-sm">{entry.comments || "Sin comentarios"}</p>
							</div>

							{entry.supervisionComments && (
								<div className="space-y-2">
									<h4 className="font-semibold">Comentarios de Supervisión</h4>
									<p className="text-sm">{entry.supervisionComments}</p>
								</div>
							)}

							{entry.safetyObservations && (
								<div className="space-y-2">
									<h4 className="font-semibold">Observaciones de Seguridad</h4>
									<p className="text-sm">{entry.safetyObservations}</p>
								</div>
							)}

							{entry.nonConformities && (
								<div className="space-y-2">
									<h4 className="font-semibold">No Conformidades</h4>
									<p className="text-sm">{entry.nonConformities}</p>
								</div>
							)}

							{entry.recommendations && (
								<div className="space-y-2">
									<h4 className="font-semibold">Recomendaciones</h4>
									<p className="text-sm">{entry.recommendations}</p>
								</div>
							)}

							<div className="space-y-2">
								<h4 className="font-semibold">Usuarios Asignados</h4>
								<div className="flex flex-wrap gap-2">
									{entry.assignedUsers.map((user) => (
										<span
											key={user.name}
											className="bg-primary/10 text-primary rounded-full px-3 py-1 text-sm"
										>
											{user.name}
										</span>
									))}
								</div>
							</div>

							{entry.attachments.length > 0 && (
								<div className="space-y-2">
									<h4 className="font-semibold">Archivos Adjuntos</h4>
									{entry.attachments.map((attachment) => (
										<Link
											target="_blank"
											key={attachment.name}
											href={attachment.url}
											rel="noopener noreferrer"
											className="text-primary text-sm hover:underline flex items-center gap-1 flex-nowrap"
										>
											{attachment.name}
											<ExternalLink className="h-4 w-4" />
										</Link>
									))}
								</div>
							)}
						</div>
					) : null}
				</ScrollArea>
			</DrawerContent>
		</Drawer>
	)
}
