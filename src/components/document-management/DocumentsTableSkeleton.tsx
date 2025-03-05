import { Skeleton } from "@/components/ui/skeleton"
import {
	Table,
	TableRow,
	TableBody,
	TableHead,
	TableCell,
	TableHeader,
} from "@/components/ui/table"

export default function DocumentsTableSkeleton(): React.ReactElement {
	return (
		<Table className="w-full">
			<TableHeader>
				<TableRow>
					<TableHead className="text-nowrap"></TableHead>
					<TableHead className="text-nowrap"></TableHead>
					<TableHead className="text-nowrap"></TableHead>
					<TableHead className="text-nowrap"></TableHead>
					<TableHead className="text-nowrap"></TableHead>
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
					</TableRow>
				))}
			</TableBody>
		</Table>
	)
}
