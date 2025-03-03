import { Info } from "lucide-react"
import { format } from "date-fns"

import { getOtcInspections } from "@/actions/otc-inspections/getOtcInspections"

import {
	Table,
	TableRow,
	TableBody,
	TableHead,
	TableHeader,
	TableCell,
} from "@/components/ui/table"

export default async function OtcInspectionsTable({
	workBookId,
}: {
	workBookId: string
}): Promise<React.ReactElement> {
	const res = await getOtcInspections(workBookId)

	const { data: otcInspectorData, ok, message } = res

	if (!ok || !otcInspectorData) {
		return (
			<Table className="w-full">
				<TableBody>
					<TableRow>
						<TableCell colSpan={8} className="text-center">
							{message || "Error al cargar inspecciones"}
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
					<TableHead className="text-nowrap">Nombre del Inspector</TableHead>
					<TableHead className="text-nowrap">Fecha de Ejecución</TableHead>
					<TableHead className="text-nowrap">Hora de Inicio</TableHead>
					<TableHead className="text-nowrap">Hora de Fin</TableHead>
					<TableHead className="text-nowrap">Comentarios de Supervisión</TableHead>
					<TableHead className="text-nowrap">Observaciones de Seguridad</TableHead>
					<TableHead className="text-nowrap">No Conformidades</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{otcInspectorData.length === 0 && (
					<TableRow>
						<TableCell colSpan={7} className="py-6 text-center">
							<span className="flex w-full items-center justify-center gap-1">
								<Info className="h-4 w-4" />
								No hay inspecciones de OTC
							</span>
						</TableCell>
					</TableRow>
				)}

				{otcInspectorData.map((inspection) => (
					<TableRow key={inspection.id}>
						<TableCell>{inspection.inspectorName}</TableCell>
						<TableCell>{format(inspection.dateOfExecution, "dd/MM/yyyy")}</TableCell>
						<TableCell>{inspection.activityStartTime}</TableCell>
						<TableCell>{inspection.activityEndTime}</TableCell>
						<TableCell>{inspection.supervisionComments}</TableCell>
						<TableCell>{inspection.safetyObservations}</TableCell>
						<TableCell>{inspection.nonConformities || "-"}</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	)
}
