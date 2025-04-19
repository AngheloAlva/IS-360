"use client"

import { FileText, FileEdit } from "lucide-react"

import {
	Table,
	TableRow,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
} from "@/components/ui/table"

interface RecentChange {
	id: string
	fileName: string
	previousName: string
	modifiedBy: string
	modifiedAt: string
	reason: string
	userRole: string
	userArea: string | null
}

interface RecentChangesTableProps {
	data: RecentChange[]
}

export function RecentChangesTable({ data }: RecentChangesTableProps) {
	return (
		<div className="max-h-[300px] overflow-auto">
			<Table>
				<TableHeader className="sticky top-0">
					<TableRow>
						<TableHead>Archivo</TableHead>
						<TableHead>Modificado por</TableHead>
						<TableHead>Fecha</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{data.map((change) => (
						<TableRow key={change.id}>
							<TableCell className="font-medium">
								<div className="flex items-center gap-2">
									{change.fileName === change.previousName ? (
										<FileText className="h-4 w-4 text-blue-500" />
									) : (
										<FileEdit className="h-4 w-4 text-amber-500" />
									)}
									<span className="truncate" title={change.fileName}>
										{change.fileName}
									</span>
								</div>
							</TableCell>
							<TableCell>{change.modifiedBy}</TableCell>
							<TableCell>{change.modifiedAt}</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	)
}
