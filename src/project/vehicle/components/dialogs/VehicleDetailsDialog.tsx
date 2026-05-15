"use client"

import { format } from "date-fns"
import { es } from "date-fns/locale"
import {
	TagIcon,
	CarIcon,
	HashIcon,
	CalendarIcon,
	BadgeCheckIcon,
	PaintbrushIcon,
} from "lucide-react"

import { VehicleTypeOptions } from "@/lib/consts/vehicle-types"

import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar"
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

import type { Vehicle } from "@/project/vehicle/hooks/use-vehicles-by-company"

interface VehicleDetailsDialogProps {
	vehicle: Vehicle
	children: React.ReactNode
}

export default function VehicleDetailsDialog({ vehicle, children }: VehicleDetailsDialogProps) {
	const vehicleType = VehicleTypeOptions.find((option) => option.value === vehicle.type)

	return (
		<Dialog>
			<DialogTrigger asChild>{children}</DialogTrigger>

			<DialogContent className="overflow-hidden p-0">
				<div className="h-2 w-full bg-emerald-500"></div>

				<DialogHeader className="px-4">
					<DialogTitle className="flex items-center gap-2">
						<CarIcon className="size-5" />
						Detalles del Vehículo
					</DialogTitle>
					<DialogDescription>
						Información detallada sobre el vehículo y sus características
					</DialogDescription>
				</DialogHeader>

				<ScrollArea className="h-full max-h-[calc(90vh-8rem)] px-6 pb-6">
					<div className="flex flex-col gap-6">
						<div className="flex flex-col gap-4">
							<div className="flex items-center gap-4">
								<Avatar className="size-16 text-lg">
									<AvatarFallback>{vehicle.plate?.slice(0, 2)}</AvatarFallback>
								</Avatar>

								<div>
									<h3 className="text-lg font-semibold">{vehicle.plate}</h3>
									<p className="text-muted-foreground text-sm">Matrícula: {vehicle.plate}</p>
								</div>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<DialogLabel
									icon={<HashIcon className="size-4" />}
									label="Matrícula"
									value={vehicle.plate || "No especificada"}
								/>
								<DialogLabel
									icon={<TagIcon className="size-4" />}
									label="Marca"
									value={vehicle.brand || "No especificada"}
								/>
								<DialogLabel
									icon={<CarIcon className="size-4" />}
									label="Modelo"
									value={vehicle.model || "No especificado"}
								/>
								<DialogLabel
									icon={<PaintbrushIcon className="size-4" />}
									label="Color"
									value={vehicle.color || "No especificado"}
								/>
							</div>
						</div>

						<Separator />

						{/* Additional Details */}
						<div className="flex flex-col gap-4">
							<h2 className="flex items-center gap-2 text-lg font-semibold">
								<BadgeCheckIcon className="size-5" />
								Detalles Adicionales
							</h2>

							<div className="grid grid-cols-2 gap-4">
								<DialogLabel
									icon={<CalendarIcon className="size-4" />}
									label="Año"
									value={vehicle.year?.toString() || "No especificado"}
								/>
								<DialogLabel
									icon={<CarIcon className="size-4" />}
									label="Tipo"
									value={
										<Badge variant="outline" className="font-normal">
											{vehicleType?.label || vehicle.type || "No especificado"}
										</Badge>
									}
								/>
								<DialogLabel
									icon={<BadgeCheckIcon className="size-4" />}
									label="Principal"
									value={
										<Badge
											className={
												vehicle.isMain
													? "bg-teal-500 font-normal hover:bg-teal-600"
													: "bg-emerald-900 font-normal hover:bg-emerald-900"
											}
										>
											{vehicle.isMain ? "Sí" : "No"}
										</Badge>
									}
								/>
								<DialogLabel
									icon={<CalendarIcon className="size-4" />}
									label="Fecha de registro"
									value={format(new Date(vehicle.createdAt), "dd/MM/yyyy", {
										locale: es,
									})}
								/>
							</div>
						</div>
					</div>
				</ScrollArea>
			</DialogContent>
		</Dialog>
	)
}
