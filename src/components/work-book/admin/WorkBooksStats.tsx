import { getWorkBooksStats } from "@/actions/work-book/admin/getWorkBooksStats"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function WorkBooksStats() {
	const stats = await getWorkBooksStats()

	return (
		<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
			<Card>
				<CardHeader>
					<CardTitle className="text-sm font-medium">Empresas Más Activas</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						{stats.topCompanies.map((company) => (
							<div key={company.name} className="flex items-center">
								<div className="flex-1 space-y-1">
									<p className="text-sm leading-none font-medium">{company.name}</p>
									<p className="text-muted-foreground text-sm">
										{company.books} libros activos
									</p>
								</div>
								<div>{company.percentage}%</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle className="text-sm font-medium">Tipos de Trabajo</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						{stats.workTypes.map((type) => (
							<div key={type.name} className="flex items-center">
								<div className="flex-1 space-y-1">
									<p className="text-sm leading-none font-medium">{type.name}</p>
									<p className="text-muted-foreground text-sm">{type.books} libros</p>
								</div>
								<div>{type.percentage}%</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle className="text-sm font-medium">Ubicaciones de Trabajo</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						{stats.workLocations.map((location) => (
							<div key={location.name} className="flex items-center">
								<div className="flex-1 space-y-1">
									<p className="text-sm leading-none font-medium">{location.name}</p>
									<p className="text-muted-foreground text-sm">
										{location.books} libros
									</p>
								</div>
								<div>{location.percentage}%</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		</div>
	)
}
