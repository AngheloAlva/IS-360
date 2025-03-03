import { getPreventionAreas } from "@/actions/prevention-areas/getPreventionAreas"
import { Info } from "lucide-react"

import {
	Table,
	TableRow,
	TableBody,
	TableHead,
	TableCell,
	TableHeader,
} from "@/components/ui/table"

export default async function PreventionAreasTable({
	workBookId,
}: {
	workBookId: string
}): Promise<React.ReactElement> {
	const res = await getPreventionAreas(workBookId)

	const { data: preventionAreas, ok, message } = res

	if (!ok || !preventionAreas) {
		return (
			<Table className="w-full">
				<TableBody>
					<TableRow>
						<TableCell colSpan={4} className="text-center">
							{message || "Error al cargar áreas de prevención"}
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
					<TableHead className="text-nowrap">Nombre</TableHead>
					<TableHead className="text-nowrap">Recomendaciones</TableHead>
					<TableHead className="text-nowrap">Otros</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{preventionAreas.length === 0 && (
					<TableRow>
						<TableCell colSpan={3} className="py-6 text-center">
							<span className="flex w-full items-center justify-center gap-1">
								<Info className="h-4 w-4" />
								No hay áreas de prevención
							</span>
						</TableCell>
					</TableRow>
				)}

				{preventionAreas.map((area) => (
					<TableRow key={area.id}>
						<TableCell>{area.name}</TableCell>
						<TableCell>{area.recommendations || "-"}</TableCell>
						<TableCell>{area.others || "-"}</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	)
}
