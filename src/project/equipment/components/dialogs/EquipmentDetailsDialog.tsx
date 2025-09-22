"use client"

import { es } from "date-fns/locale"
import { format } from "date-fns"
import {
	TagIcon,
	FolderIcon,
	MapPinIcon,
	WrenchIcon,
	CalendarIcon,
	CloudUploadIcon,
} from "lucide-react"

import EquipmentAttachmentLink from "@/project/equipment/components/data/EquipmentAttachmentLink"
import { DialogLabel } from "@/shared/components/ui/dialog-label"
import { ScrollArea } from "@/shared/components/ui/scroll-area"
import { Separator } from "@/shared/components/ui/separator"
import { Badge } from "@/shared/components/ui/badge"
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	DialogDescription,
} from "@/shared/components/ui/dialog"

import type { WorkEquipment } from "@/project/equipment/hooks/use-equipments"

interface EquipmentDetailsDialogProps {
	equipment: WorkEquipment
	children: React.ReactNode
}

export default function EquipmentDetailsDialog({
	equipment,
	children,
}: EquipmentDetailsDialogProps) {
	return (
		<Dialog>
			<DialogTrigger asChild>{children}</DialogTrigger>

			<DialogContent className="overflow-hidden p-0">
				<div className="h-2 w-full bg-emerald-600"></div>

				<DialogHeader className="px-4">
					<DialogTitle className="flex items-center gap-2">
						<WrenchIcon className="size-5" />
						Detalles del Equipo
					</DialogTitle>
					<DialogDescription>Información general del equipo {equipment.tag}</DialogDescription>
				</DialogHeader>

				<ScrollArea className="h-full max-h-[calc(90vh-8rem)] px-6 pb-6">
					<div className="flex flex-col gap-6">
						<div className="flex flex-col gap-2">
							<h3 className="text-lg font-semibold">{equipment.name}</h3>

							<div className="flex flex-wrap gap-2">
								<Badge
									variant="outline"
									className={
										equipment.isOperational
											? "border-emerald-500 bg-emerald-500/10 text-emerald-500"
											: "border-red-500 bg-red-500/10 text-red-500"
									}
								>
									{equipment.isOperational ? "Operacional" : "No Operacional"}
								</Badge>
								{equipment.type && <Badge variant="secondary">{equipment.type}</Badge>}
							</div>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<DialogLabel
								icon={<TagIcon className="size-4" />}
								label="TAG"
								value={equipment.tag}
							/>
							<DialogLabel
								icon={<MapPinIcon className="size-4" />}
								label="Ubicación"
								value={equipment.location}
							/>

							{equipment.description && (
								<DialogLabel
									label="Descripción"
									className="col-span-2"
									value={equipment.description}
								/>
							)}
						</div>

						<div className="grid grid-cols-2 gap-4">
							<DialogLabel
								icon={<WrenchIcon className="size-4" />}
								label="Equipos Hijos"
								value={equipment._count.children}
							/>
							<DialogLabel
								icon={<FolderIcon className="size-4" />}
								label="OTs Asignadas"
								value={equipment._count.workOrders}
							/>
						</div>

						{equipment.attachments.length > 0 && (
							<>
								<Separator />

								<div>
									<h2 className="flex items-center gap-2 text-lg font-semibold">
										<CloudUploadIcon className="size-5" />
										Archivos Adjuntos
									</h2>
									<ul className="mt-4 flex flex-col gap-2">
										{equipment.attachments.map((attachment) => (
											<li
												key={attachment.id}
												className="flex items-center gap-2 text-teal-500 hover:bg-teal-500/20"
											>
												<EquipmentAttachmentLink url={attachment.url} name={attachment.name} />
											</li>
										))}
									</ul>
								</div>
							</>
						)}

						<Separator />

						<div className="grid grid-cols-2 gap-4">
							<DialogLabel
								icon={<CalendarIcon className="size-4" />}
								label="Fecha de Creación"
								value={format(new Date(equipment.createdAt), "PPP", { locale: es })}
							/>
							<DialogLabel
								icon={<CalendarIcon className="size-4" />}
								label="Última Actualización"
								value={format(new Date(equipment.updatedAt), "PPP", { locale: es })}
							/>
						</div>
					</div>
				</ScrollArea>
			</DialogContent>
		</Dialog>
	)
}
