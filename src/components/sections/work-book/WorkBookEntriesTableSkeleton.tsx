import { Skeleton } from "@/components/ui/skeleton"
import {
	Table,
	TableRow,
	TableBody,
	TableHead,
	TableCell,
	TableHeader,
} from "@/components/ui/table"

export default async function WorkBookEntriesTableSkeleton(): Promise<React.ReactElement> {
	return (
		<Table className="w-full">
			<TableHeader>
				<TableRow>
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
						<TableCell>
							<Skeleton className="h-9 w-full" />
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	)
}
