import { format, addDays } from "date-fns"
import Link from "next/link"

import {
	Table,
	TableRow,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
} from "@/shared/components/ui/table"

interface SecurityItemsTableProps {
	items: Array<{
		name: string
		description: string
		href: string
	}>
}

export function SecurityItemsTable({ items }: SecurityItemsTableProps) {
	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>Nombre</TableHead>
					<TableHead>Descripcion</TableHead>
					<TableHead>Puntuacion</TableHead>
					<TableHead>Fecha realizada</TableHead>
					<TableHead>Fecha de vencimiento</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{items?.map((item, index) => (
					<TableRow key={index}>
						<TableCell>
							<Link href={item.href} className="hover:text-primary">
								{item.name}
							</Link>
						</TableCell>
						<TableCell>{item.description}</TableCell>
						<TableCell>x de 10</TableCell>
						<TableCell>{format(new Date(), "dd/MM/yyyy")}</TableCell>
						<TableCell>{format(addDays(new Date(), 30), "dd/MM/yyyy")}</TableCell>
					</TableRow>
				))}

				{items.length === 0 && (
					<TableRow>
						<TableCell colSpan={6} className="py-8 text-center text-gray-500">
							No hay charlas de seguridad
						</TableCell>
					</TableRow>
				)}
			</TableBody>
		</Table>
	)
}
