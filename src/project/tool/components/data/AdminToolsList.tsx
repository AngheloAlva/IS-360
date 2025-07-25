"use client"

import { Building2, Wrench, Eye, Search } from "lucide-react"
import { useState } from "react"

import { useToolFilters } from "../../hooks/useToolFilters"

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Badge } from "@/shared/components/ui/badge"
import {
	Select,
	SelectItem,
	SelectValue,
	SelectTrigger,
	SelectContent,
} from "@/shared/components/ui/select"
import {
	Table,
	TableRow,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
} from "@/shared/components/ui/table"
import Link from "next/link"

interface AdminToolsListProps {
	id?: string
}

export function AdminToolsList({ id }: AdminToolsListProps) {
	const { filters, updateFilters, companiesWithTools } = useToolFilters()
	const [statusFilter, setStatusFilter] = useState<string>("ALL")

	const filteredCompanies = companiesWithTools.filter(() => {
		const matchesStatus = statusFilter === "ALL"
		return matchesStatus
	})

	return (
		<Card id={id}>
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle className="flex items-center gap-2">
							<Building2 className="h-5 w-5" />
							Lista de Empresas con Herramientas
						</CardTitle>
						<p className="text-muted-foreground mt-1 text-sm">
							Gestión de herramientas por empresa contratista
						</p>
					</div>
				</div>

				<div className="mt-4 flex flex-col gap-4 sm:flex-row">
					<div className="relative flex-1">
						<Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
						<Input
							placeholder="Buscar por nombre o RUC..."
							value={filters.search || ""}
							onChange={(e) => updateFilters({ search: e.target.value })}
							className="pl-10"
						/>
					</div>
					<Select value={statusFilter} onValueChange={setStatusFilter}>
						<SelectTrigger className="w-full sm:w-48">
							<SelectValue placeholder="Estado" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="ALL">Todos los estados</SelectItem>
							<SelectItem value="ACTIVE">Activas</SelectItem>
							<SelectItem value="INACTIVE">Inactivas</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</CardHeader>

			<CardContent>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Empresa</TableHead>
							<TableHead className="text-center">Total Herramientas</TableHead>
							<TableHead className="text-center">En Uso</TableHead>
							<TableHead className="text-center">Disponibles</TableHead>
							<TableHead className="text-center">Permisos Activos</TableHead>
							<TableHead>Última Actividad</TableHead>
							<TableHead className="text-center">Acciones</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{filteredCompanies.length === 0 ? (
							<TableRow>
								<TableCell colSpan={8} className="text-muted-foreground py-8 text-center">
									No se encontraron empresas que coincidan con los filtros
								</TableCell>
							</TableRow>
						) : (
							filteredCompanies.map((company) => (
								<TableRow key={company.id}>
									<TableCell>
										<div>
											<p className="font-medium">{company.name}</p>
											<p className="text-muted-foreground text-sm">RUT: {company.rut}</p>
										</div>
									</TableCell>
									<TableCell className="text-center">
										<div className="flex items-center justify-center gap-1">
											<Wrench className="text-muted-foreground h-4 w-4" />
											<span className="font-medium">{company.toolsCount}</span>
										</div>
									</TableCell>
									<TableCell className="text-center">
										<Badge className="bg-orange-500/20 text-orange-500">{company.toolsInUse}</Badge>
									</TableCell>
									<TableCell className="text-center">
										<Badge className="bg-green-500/20 text-green-500">
											{company.toolsAvailable}
										</Badge>
									</TableCell>
									<TableCell className="text-center">
										<Badge className="bg-neutral-500/20 text-neutral-400">
											{company.activePermits}
										</Badge>
									</TableCell>
									<TableCell>
										<span className="text-muted-foreground text-sm">
											{company.lastActivity.toLocaleDateString("es-ES")} a las{" "}
											{company.lastActivity.toLocaleTimeString("es-ES", {
												hour: "2-digit",
												minute: "2-digit",
											})}
										</span>
									</TableCell>
									<TableCell>
										<div className="flex items-center justify-center gap-2">
											<Link href={`/admin/dashboard/herramientas/${company.id}`}>
												<Button size="sm" variant="outline">
													<Eye className="h-4 w-4" />
												</Button>
											</Link>
										</div>
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>

				<div className="text-muted-foreground mt-4 text-sm">
					Mostrando {filteredCompanies.length} de {companiesWithTools.length} empresas
				</div>
			</CardContent>
		</Card>
	)
}
