import { Skeleton } from "@/components/ui/skeleton"
import {
	Table,
	TableRow,
	TableBody,
	TableHead,
	TableHeader,
	TableCell,
} from "@/components/ui/table"

export default function OtcInspectionsTableSkeleton(): React.ReactElement {
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
				{Array.from({ length: 5 }).map((_, index) => (
					<TableRow key={index}>
						<TableCell>
							<Skeleton className="h-9 w-full" />
						</TableCell>
						<TableCell>
							<Skeleton className="h-9 w-full" />
						</TableCell>
						<TableCell>
							<Skeleton className="h-9 w-full" />
						</TableCell>
						<TableCell>
							<Skeleton className="h-9 w-full" />
						</TableCell>
						<TableCell>
							<Skeleton className="h-9 w-full" />
						</TableCell>
						<TableCell>
							<Skeleton className="h-9 w-full" />
						</TableCell>
						<TableCell>
							<Skeleton className="h-9 w-full" />
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	)
}
