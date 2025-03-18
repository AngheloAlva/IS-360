import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, ChevronUp, LinkIcon } from "lucide-react"
import { getWorkBooksTableData } from "@/actions/work-books/admin/getWorkBooksTableData"
import Link from "next/link"

export default async function WorkBooksTable() {
	const workBooks = await getWorkBooksTableData()

	return (
		<Card>
			<CardHeader>
				<CardTitle>Libros de Trabajo</CardTitle>
			</CardHeader>
			<CardContent>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead></TableHead>
							<TableHead>
								<Button variant="ghost" size="sm">
									Número OT
									<ChevronUp className="ml-2 h-4 w-4" />
								</Button>
							</TableHead>
							<TableHead>Empresa</TableHead>
							<TableHead>Nombre del Trabajo</TableHead>
							<TableHead>Ubicación</TableHead>
							<TableHead>Tipo</TableHead>
							<TableHead>Estado</TableHead>
							<TableHead>Fecha</TableHead>
							<TableHead className="text-right">Acciones</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{workBooks.map((workBook) => (
							<TableRow key={workBook.id}>
								<TableCell>
									<Link
										className="text-primary hover:text-feature"
										href={`/dashboard/admin/libros-de-obras/${workBook.id}`}
									>
										<LinkIcon className="h-5 w-5" />
									</Link>
								</TableCell>
								<TableCell>{workBook.otNumber}</TableCell>
								<TableCell>{workBook.company}</TableCell>
								<TableCell>{workBook.workName}</TableCell>
								<TableCell>{workBook.location}</TableCell>
								<TableCell>{workBook.type}</TableCell>
								<TableCell>{workBook.status}</TableCell>
								<TableCell>{workBook.date}</TableCell>
								<TableCell className="text-right">
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button variant="ghost" className="h-8 w-8 p-0">
												<span className="sr-only">Abrir menú</span>
												<MoreHorizontal className="h-4 w-4" />
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align="end">
											<DropdownMenuLabel>Acciones</DropdownMenuLabel>
											<DropdownMenuItem>Ver detalles</DropdownMenuItem>
											<DropdownMenuItem>Editar libro</DropdownMenuItem>
											<DropdownMenuItem className="text-red-600">Eliminar</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</CardContent>
		</Card>
	)
}
