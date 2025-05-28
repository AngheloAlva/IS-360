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
import { MoreHorizontal, ChevronsUpDown, ChevronUp } from "lucide-react"
import { getWorkPermitsTableData } from "@/actions/work-permit/admin/getWorkPermitsTableData"

export default async function WorkPermitsTable() {
	const workPermits = await getWorkPermitsTableData()

	return (
		<Card>
			<CardHeader>
				<CardTitle>Permisos de Trabajo</CardTitle>
			</CardHeader>
			{/* <div className="flex items-center justify-between space-x-2 p-4">
				<div className="flex flex-1 items-center space-x-2">
					<Input placeholder="Filtrar permisos..." className="h-8 w-[150px] lg:w-[250px]" />
				</div>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="outline" size="sm" className="ml-auto h-8">
							Columnas <ChevronDown className="ml-2 h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuLabel>Mostrar columnas</DropdownMenuLabel>
						<DropdownMenuItem>
							<input type="checkbox" className="mr-2" />
							Número OT
						</DropdownMenuItem>
						<DropdownMenuItem>
							<input type="checkbox" className="mr-2" />
							Empresa
						</DropdownMenuItem>
						<DropdownMenuItem>
							<input type="checkbox" className="mr-2" />
							Estado
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div> */}
			<CardContent>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="w-[100px]">
								<Button variant="ghost" size="sm">
									ID
									<ChevronsUpDown className="ml-2 h-4 w-4" />
								</Button>
							</TableHead>
							<TableHead>
								<Button variant="ghost" size="sm">
									Número OT
									<ChevronUp className="ml-2 h-4 w-4" />
								</Button>
							</TableHead>
							<TableHead>Empresa</TableHead>
							<TableHead>Área</TableHead>
							<TableHead>Tipo</TableHead>
							<TableHead>Estado</TableHead>
							<TableHead>Fecha</TableHead>
							<TableHead className="text-right">Acciones</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{workPermits.map((workPermit) => (
							<TableRow key={workPermit.id}>
								<TableCell className="font-medium">{workPermit.id}</TableCell>
								<TableCell>{workPermit.otNumber}</TableCell>
								<TableCell>{workPermit.area}</TableCell>
								<TableCell>{workPermit.type}</TableCell>
								<TableCell>{workPermit.status}</TableCell>
								<TableCell>{workPermit.date}</TableCell>
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
											<DropdownMenuItem>Editar permiso</DropdownMenuItem>
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
