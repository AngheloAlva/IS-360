import { Skeleton } from "@/components/ui/skeleton"
import {
	Table,
	TableRow,
	TableBody,
	TableHead,
	TableCell,
	TableHeader,
} from "@/components/ui/table"

export default async function PreventionAreasTableSkeleton(): Promise<React.ReactElement> {
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
					</TableRow>
				))}
			</TableBody>
		</Table>
	)
}
