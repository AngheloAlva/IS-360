import { User, Clock, MapPin, PenTool, Calendar, FileText, Briefcase } from "lucide-react"
import { format } from "date-fns"

import { WorkOrderTypeLabels } from "@/lib/consts/work-order-types"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RequestWorkBookClosure } from "./RequestWorkBookClosure"

import type { WorkOrder } from "@prisma/client"

interface WorkBookGeneralDataProps {
	userId: string
	canClose: boolean
	data: WorkOrder & { company: { name: string; rut: string } } & {
		supervisor: { name: string; phone: string | null }
	} & { responsible: { name: string; phone: string | null } }
}

export default function WorkBookGeneralData({
	data,
	userId,
	canClose,
}: WorkBookGeneralDataProps): React.ReactElement {
	return (
		<div className="grid w-full gap-6 md:grid-cols-12">
			<Card className="md:col-span-12">
				<CardHeader className="flex flex-row items-center justify-between pb-3">
					<div>
						<CardTitle className="flex items-center gap-2 text-xl">
							<FileText className="text-primary h-5 w-5" />
							Detalles de la Orden de Trabajo
						</CardTitle>
						<CardDescription>
							Información detallada sobre el trabajo solicitado y sus especificaciones
						</CardDescription>
					</div>

					{canClose && <RequestWorkBookClosure workOrderId={data.id} userId={userId} />}
				</CardHeader>

				<CardContent>
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
										{data.company.name}{" "}
										<span className="text-muted-foreground">- {data.company.rut}</span>
									</p>
								</div>
							</div>

							<div className="flex items-start gap-3">
								<div className="mt-0.5 rounded-md bg-purple-500/10 p-1.5 text-purple-500">
									<MapPin className="h-5 w-5" />
								</div>
								<div>
									<p className="text-muted-foreground text-sm font-medium">Ubicación</p>
									<p className="font-medium">{data.workLocation}</p>
								</div>
							</div>
						</div>

						<div className="space-y-4">
							<div className="flex items-start gap-3">
								<div className="mt-0.5 rounded-md bg-indigo-500/10 p-1.5 text-indigo-500">
									<Calendar className="h-5 w-5" />
								</div>
								<div>
									<p className="text-muted-foreground text-sm font-medium">Fecha de Inicio</p>
									<p className="font-medium">
										{data.workStartDate ? format(data.workStartDate, "dd/MM/yyyy") : "No iniciada"}
									</p>
								</div>
							</div>

							<div className="flex items-start gap-3">
								<div className="mt-0.5 rounded-md bg-rose-500/10 p-1.5 text-rose-500">
									<Clock className="h-5 w-5" />
								</div>
								<div>
									<p className="text-muted-foreground text-sm font-medium">Fecha de Término</p>
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
									<p className="text-muted-foreground text-sm font-medium">Responsable</p>
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
									<p className="text-muted-foreground text-sm font-medium">Inspector OTC</p>
									<p className="font-medium">
										{data.responsible.name}{" "}
										<span className="text-muted-foreground">- {data.responsible.phone}</span>
									</p>
								</div>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	)
}
