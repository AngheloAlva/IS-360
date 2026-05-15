import { Skeleton } from "./skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./table"

interface DataTableSkeletonProps {
	columns: number
	rows?: number
}

export function DataTableSkeleton({
	columns,
	rows = 10,
}: DataTableSkeletonProps): React.ReactElement {
	return (
		<div className="w-full space-y-4">
			<div className="flex items-center gap-2">
				<Skeleton className="h-8 w-62.5" />
			</div>
			<div className="rounded-md border">
				<Table>
					<TableHeader>
						<TableRow>
							{Array.from({ length: columns }).map((_, i) => (
								<TableHead key={i}>
									<Skeleton className="h-4 w-25" />
								</TableHead>
							))}
						</TableRow>
					</TableHeader>
					<TableBody>
						{Array.from({ length: rows }).map((_, i) => (
							<TableRow key={i}>
								{Array.from({ length: columns }).map((_, j) => (
									<TableCell key={j}>
										<Skeleton className="h-4 w-25" />
									</TableCell>
								))}
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>
		</div>
	)
}
