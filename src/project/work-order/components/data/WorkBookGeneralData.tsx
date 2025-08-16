import { format } from "date-fns"
import {
	User,
	Clock,
	MapPin,
	PenTool,
	Calendar,
	FileText,
	Briefcase,
	SettingsIcon,
} from "lucide-react"

import { WorkOrderTypeLabels } from "@/lib/consts/work-order-types"
import { WORK_ORDER_STATUS } from "@prisma/client"

import { CloseWorkBook } from "../forms/CloseWorkBook"
import {
	Accordion,
	AccordionItem,
	AccordionTrigger,
	AccordionContent,
} from "@/shared/components/ui/accordion"

import type { WorkBookById } from "@/project/work-order/hooks/use-work-book-by-id"

interface WorkBookGeneralDataProps {
	userId: string
	data: WorkBookById
	hasPermission: boolean
}

export default function WorkBookGeneralData({
	data,
	userId,
	hasPermission,
}: WorkBookGeneralDataProps): React.ReactElement {
	return (
		<div className="grid w-full gap-2">
			<Accordion type="single" className="space-y-2" collapsible>
				<AccordionItem value="work-order-details" className="bg-background rounded-md">
					<AccordionTrigger className="px-6 py-4 hover:cursor-pointer">
						<div className="flex items-center gap-2">
							<FileText className="bg-primary/10 text-primary size-10 rounded-md p-1.5" />
							<div className="text-left">
								<p className="font-semibold">Detalles de la Orden de Trabajo</p>
								<p className="text-muted-foreground text-sm font-normal">
									Información detallada sobre el trabajo solicitado y sus especificaciones.
								</p>
							</div>
						</div>
					</AccordionTrigger>

					<AccordionContent className="px-6">
						<div className="grid gap-6 md:grid-cols-2">
							<div className="space-y-4">
								<div className="flex items-start gap-3">
									<div className="mt-0.5 rounded-md bg-pink-500/10 p-1.5 text-pink-500">
										<PenTool className="h-5 w-5" />
									</div>
									<div>
										<p className="text-muted-foreground text-sm font-medium">Trabajo Solicitado</p>
										<p className="font-medium">{data.workRequest}</p>
									</div>
								</div>

								<div className="flex items-start gap-3">
									<div className="mt-0.5 rounded-md bg-amber-500/10 p-1.5 text-amber-500">
										<FileText className="h-5 w-5" />
									</div>
									<div>
										<p className="text-muted-foreground text-sm font-medium">Tipo de Trabajo</p>
										<p className="font-medium">{WorkOrderTypeLabels[data.type]}</p>
									</div>
								</div>

								<div className="flex items-start gap-3">
									<div className="mt-0.5 rounded-md bg-green-500/10 p-1.5 text-green-500">
										<Briefcase className="h-5 w-5" />
									</div>
									<div>
										<p className="text-muted-foreground text-sm font-medium">Contratista</p>
										<p className="font-medium">
											{data.company?.name ? data.company.name : "Interno"}{" "}
											<span className="text-muted-foreground">
												{data.company?.rut && " - " + data.company.rut}
											</span>
										</p>
									</div>
								</div>

								<div className="flex items-start gap-3">
									<div className="mt-0.5 rounded-md bg-purple-500/10 p-1.5 text-purple-500">
										<MapPin className="h-5 w-5" />
									</div>
									<div>
										<p className="text-muted-foreground text-sm font-medium">Ubicación</p>
										<p className="font-medium">{data.workBookLocation || "No proporcionada"}</p>
									</div>
								</div>
							</div>

							<div className="space-y-4">
								<div className="flex items-start gap-3">
									<div className="mt-0.5 rounded-md bg-indigo-500/10 p-1.5 text-indigo-500">
										<Calendar className="h-5 w-5" />
									</div>
									<div>
										<p className="text-muted-foreground text-sm font-medium">
											Fecha Programada de Inicio
										</p>
										<p className="font-medium">{format(data.programDate, "dd/MM/yyyy")}</p>
									</div>
								</div>

								<div className="flex items-start gap-3">
									<div className="mt-0.5 rounded-md bg-rose-500/10 p-1.5 text-rose-500">
										<Clock className="h-5 w-5" />
									</div>
									<div>
										<p className="text-muted-foreground text-sm font-medium">
											Fecha Programada de Término
										</p>
										<p className="font-medium">
											{data.estimatedEndDate
												? format(data.estimatedEndDate, "dd/MM/yyyy")
												: "No terminada"}
										</p>
									</div>
								</div>

								<div className="flex items-start gap-3">
									<div className="mt-0.5 rounded-md bg-cyan-500/10 p-1.5 text-cyan-500">
										<User className="h-5 w-5" />
									</div>
									<div>
										<p className="text-muted-foreground text-sm font-medium">Supervisor externo</p>
										<p className="font-medium">
											{data.supervisor.name}{" "}
											<span className="text-muted-foreground">- {data.supervisor.phone}</span>
										</p>
									</div>
								</div>

								<div className="flex items-start gap-3">
									<div className="mt-0.5 rounded-md bg-orange-500/10 p-1.5 text-orange-500">
										<User className="h-5 w-5" />
									</div>
									<div>
										<p className="text-muted-foreground text-sm font-medium">Responsable OTC</p>
										<p className="font-medium">
											{data.responsible.name}{" "}
											<span className="text-muted-foreground">- {data.responsible.phone}</span>
										</p>
									</div>
								</div>
							</div>
						</div>

						{(hasPermission || data.responsibleId === userId) &&
							data.status !== WORK_ORDER_STATUS.COMPLETED && (
								<div className="mt-2 flex justify-end gap-2">
									<CloseWorkBook userId={data.responsible.id} workOrderId={data.id} />
								</div>
							)}
					</AccordionContent>
				</AccordionItem>

				<AccordionItem value="equipment-info" className="bg-background rounded-md">
					<AccordionTrigger className="px-6 py-4 hover:cursor-pointer">
						<div className="flex items-center gap-2">
							<SettingsIcon className="size-10 rounded-md bg-green-500/10 p-1.5 text-green-500" />
							<div>
								<p className="font-semibold">Información del/los equipo(s)</p>
								<p className="text-muted-foreground text-sm font-normal">
									Información sobre el equipo(s) solicitado(s) y su documentación.
								</p>
							</div>
						</div>
					</AccordionTrigger>

					<AccordionContent className="px-6">
						<div className="grid gap-6 md:grid-cols-2">
							{data.equipment.map((equipment) => (
								<div key={equipment.id}>
									<p className="text-muted-foreground font-semibold">{equipment.name}</p>
									<p className="text-muted-foreground text-sm font-medium">TAG: {equipment.tag}</p>
									<p className="text-muted-foreground text-sm font-medium">
										Tipo: {equipment.type}
									</p>
									<p className="text-muted-foreground text-sm font-medium">
										Ubicación: {equipment.location}
									</p>

									{equipment.attachments.map((attachment) => (
										<div key={attachment.id}>
											<p className="text-muted-foreground text-sm font-medium">{attachment.name}</p>
											<p className="text-muted-foreground text-sm font-medium">{attachment.url}</p>
										</div>
									))}
								</div>
							))}
						</div>
					</AccordionContent>
				</AccordionItem>
			</Accordion>
		</div>
	)
}
