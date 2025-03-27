import { HeartIcon, Info } from "lucide-react"
import { format } from "date-fns"

import { cn } from "@/lib/utils"

import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import {
	Table,
	TableRow,
	TableBody,
	TableHead,
	TableCell,
	TableHeader,
} from "@/components/ui/table"

import type { WorkEntry } from "@/types/work-order"

const EntryTypeLabel: Record<WorkEntry["entryType"], string> = {
	DAILY_ACTIVITY: "Actividad Diaria",
	ADDITIONAL_ACTIVITY: "Actividad Adicional",
	PREVENTION_AREA: "Área de Prevención",
	OTC_INSPECTION: "Inspección OTC",
	COMMENT: "Comentario",
	USER_NOTE: "Nota de Usuario",
}

const EntryTypeColor: Record<WorkEntry["entryType"], string> = {
	DAILY_ACTIVITY: "bg-blue-500",
	ADDITIONAL_ACTIVITY: "bg-cyan-500",
	PREVENTION_AREA: "bg-emerald-500",
	OTC_INSPECTION: "bg-purple-500",
	COMMENT: "bg-gray-500",
	USER_NOTE: "bg-red-500",
}

export default function WorkBookEntriesTable({
	entries,
}: {
	entries: WorkEntry[]
}): React.ReactElement {
	return (
		<Card className="w-full p-1.5">
			<Table className="w-full">
				<TableHeader>
					<TableRow>
						<TableHead />
						<TableHead className="text-nowrap">Tipo</TableHead>
						<TableHead className="text-nowrap">Fecha</TableHead>
						<TableHead className="text-nowrap">Actividad/Título</TableHead>
						<TableHead className="text-nowrap">Contenido</TableHead>
						<TableHead className="text-nowrap">Horario</TableHead>
						<TableHead className="text-nowrap">Creado por</TableHead>
						<TableHead className="text-nowrap">Personal Asignado</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{!entries ||
						(entries.length === 0 && (
							<TableRow>
								<TableCell colSpan={7} className="text-center">
									<span className="flex w-full items-center justify-center gap-1 py-6">
										<Info className="h-4 w-4" />
										No hay entradas en el libro de obras
									</span>
								</TableCell>
							</TableRow>
						))}

					{entries.map((entry) => (
						<TableRow key={entry.id}>
							<TableCell>
								<HeartIcon />
							</TableCell>
							<TableCell>
								<Badge className={cn("text-sm", EntryTypeColor[entry.entryType])}>
									{EntryTypeLabel[entry.entryType]}
								</Badge>
								{entry.isFavorite && <span className="ml-2">⭐</span>}
							</TableCell>
							<TableCell>{format(new Date(entry.executionDate), "dd/MM/yyyy")}</TableCell>
							<TableCell>{entry.activityName || entry.preventionName || "N/A"}</TableCell>
							<TableCell className="max-w-96">
								{entry.entryType === "DAILY_ACTIVITY" && (
									<>
										{entry.comments && (
											<div>
												<b>Comentarios:</b> {entry.comments}
											</div>
										)}
									</>
								)}
								{entry.entryType === "ADDITIONAL_ACTIVITY" && (
									<>
										{entry.comments && (
											<div>
												<b>Comentarios:</b> {entry.comments}
											</div>
										)}
									</>
								)}
								{entry.entryType === "PREVENTION_AREA" && (
									<>
										{entry.recommendations && (
											<div>
												<b>Recomendaciones:</b> {entry.recommendations}
											</div>
										)}
										{entry.others && (
											<div>
												<b>Otros:</b> {entry.others}
											</div>
										)}
									</>
								)}
								{entry.entryType === "OTC_INSPECTION" && (
									<>
										{entry.supervisionComments && (
											<div>
												<b>Supervisión:</b> {entry.supervisionComments}
											</div>
										)}
										{entry.safetyObservations && (
											<div>
												<b>Observaciones de Seguridad:</b> {entry.safetyObservations}
											</div>
										)}
										{entry.nonConformities && (
											<div>
												<b>No Conformidades:</b> {entry.nonConformities}
											</div>
										)}
									</>
								)}
								{entry.entryType === "USER_NOTE" && (
									<>
										{entry.noteStatus && (
											<Badge
												className={cn("ml-2", {
													"bg-yellow-500": entry.noteStatus === "PENDING",
													"bg-blue-500": entry.noteStatus === "ACKNOWLEDGED",
													"bg-green-500": entry.noteStatus === "RESOLVED",
												})}
											>
												{entry.noteStatus}
											</Badge>
										)}
									</>
								)}
							</TableCell>
							<TableCell>
								{entry.activityStartTime ? (
									<>
										{entry.activityStartTime}{" "}
										{entry.activityEndTime && ` - ${entry.activityEndTime}`}
									</>
								) : (
									"N/A"
								)}
							</TableCell>
							<TableCell>
								<div className="flex flex-col">
									<span>{entry.createdBy.name}</span>
								</div>
							</TableCell>
							<TableCell>
								{entry.assignedUsers.map((user, index) => (
									<div key={index} className="flex flex-col">
										<span>{user.name}</span>
									</div>
								))}
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</Card>
	)
}
