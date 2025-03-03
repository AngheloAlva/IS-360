import { Info } from "lucide-react"
import { format } from "date-fns"

import { getDailyActivities } from "@/actions/daily-activities/getDailyActivities"

import {
	Table,
	TableRow,
	TableBody,
	TableHead,
	TableCell,
	TableHeader,
} from "@/components/ui/table"

export default async function DailyActivitiesTable({
	workBookId,
}: {
	workBookId: string
}): Promise<React.ReactElement> {
	const res = await getDailyActivities(workBookId)

	const { data: dailyActivities, ok, message } = res

	if (!ok || !dailyActivities) {
		return (
			<Table className="w-full">
				<TableBody>
					<TableRow>
						<TableCell colSpan={7} className="text-center">
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
					<TableHead className="text-nowrap">Personal</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{dailyActivities.length > 0 ? (
					dailyActivities.map((dailyActivity) => (
						<TableRow key={dailyActivity.id}>
							<TableCell>{dailyActivity.activityName}</TableCell>
							<TableCell className="max-w-96">{dailyActivity.comments}</TableCell>
							<TableCell>{format(new Date(dailyActivity.executionDate), "dd/MM/yyyy")}</TableCell>
							<TableCell>{dailyActivity.activityStartTime}</TableCell>
							<TableCell>{dailyActivity.activityEndTime}</TableCell>
							<TableCell>
								{dailyActivity.personnel.map((person, index) => (
									<div key={index}>
										{person.name} - {person.position}
									</div>
								))}
							</TableCell>
						</TableRow>
					))
				) : (
					<TableRow>
						<TableCell colSpan={6} className="py-6 text-center">
							<span className="flex w-full items-center justify-center gap-1">
								<Info className="h-4 w-4" />
								No hay actividades diarias
							</span>
						</TableCell>
					</TableRow>
				)}
			</TableBody>
		</Table>
	)
}
