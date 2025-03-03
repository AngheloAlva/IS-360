import { Info } from "lucide-react"
import { format } from "date-fns"

import { getAdditionalActivities } from "@/actions/additional-activities/getAdditionalActivities"

import {
	Table,
	TableRow,
	TableBody,
	TableHead,
	TableCell,
	TableHeader,
} from "@/components/ui/table"

export default async function AdditionalActivitiesTable({
	workBookId,
}: {
	workBookId: string
}): Promise<React.ReactElement> {
	const res = await getAdditionalActivities(workBookId)

	const { data: additionalActivities, ok, message } = res

	if (!ok || !additionalActivities) {
		return (
			<Table className="w-full">
				<TableBody>
					<TableRow>
						<TableCell colSpan={6} className="text-center">
							{message || "Error al cargar actividades"}
						</TableCell>
					</TableRow>
				</TableBody>
			</Table>
		)
	}

	return (
		<Table className="w-full">
			<TableHeader>
				<TableRow>
					<TableHead className="text-nowrap">Nombre de Actividad</TableHead>
					<TableHead className="text-nowrap">Comentarios</TableHead>
					<TableHead className="text-nowrap">Fecha de Ejecución</TableHead>
					<TableHead className="text-nowrap">Hora de Inicio</TableHead>
					<TableHead className="text-nowrap">Hora de Fin</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{additionalActivities.length === 0 && (
					<TableRow>
						<TableCell colSpan={5} className="py-6 text-center">
							<span className="flex w-full items-center justify-center gap-1">
								<Info className="h-4 w-4" />
								No hay actividades adicionales
							</span>
						</TableCell>
					</TableRow>
				)}

				{additionalActivities.map((dailyActivity) => (
					<TableRow key={dailyActivity.id}>
						<TableCell>{dailyActivity.activityName}</TableCell>
						<TableCell>{dailyActivity.comments}</TableCell>
						<TableCell>{format(new Date(dailyActivity.executionDate), "dd/MM/yyyy")}</TableCell>
						<TableCell>{dailyActivity.activityStartTime}</TableCell>
						<TableCell>{dailyActivity.activityEndTime}</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	)
}
