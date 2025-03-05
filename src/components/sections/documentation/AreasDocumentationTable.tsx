import { ChevronRight } from "lucide-react"
import Link from "next/link"

import { Areas } from "@/lib/consts/areas"

import {
	Table,
	TableRow,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableCaption,
} from "@/components/ui/table"

export default function AreasDocumentationTable(): React.ReactElement {
	return (
		<Table>
			<TableCaption>Áreas de documentación</TableCaption>

			<TableHeader>
				<TableRow>
					<TableHead>Nombre de Area</TableHead>
				</TableRow>
			</TableHeader>

			<TableBody>
				{Object.keys(Areas).map((key, index) => {
					const area = Areas[key as keyof typeof Areas]

					return (
						<TableRow key={index}>
							<TableCell className="flex flex-col gap-1">
								<Link
									href={`/dashboard/documentacion/${key}`}
									className="hover:text-primary flex items-center justify-between py-1 text-lg capitalize transition-colors"
								>
									{area.title.replace(/_/g, " ").toLocaleLowerCase()}

									<ChevronRight className="text-feature h-4 w-4" />
								</Link>
								<p className="text-sm text-gray-500">{area.description}</p>
							</TableCell>
						</TableRow>
					)
				})}
			</TableBody>
		</Table>
	)
}
