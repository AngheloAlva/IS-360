import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getWorkBooksOverview } from "@/actions/work-book/admin/getWorkBooksOverview"

export default async function WorkBooksOverview() {
	const overview = await getWorkBooksOverview()

	return (
		<div className="grid gap-4 md:grid-cols-2">
			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium">Total Libros</CardTitle>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth="2"
						className="text-muted-foreground h-4 w-4"
					>
						<path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
					</svg>
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold">{overview.total.current}</div>
					<p className="text-muted-foreground text-xs">
						{overview.total.change > 0 ? "+" : ""}
						{overview.total.change}% desde el mes pasado
					</p>
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium">Planificados</CardTitle>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth="2"
						className="text-muted-foreground h-4 w-4"
					>
						<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
						<circle cx="9" cy="7" r="4" />
						<path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
					</svg>
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold">{overview.active.current}</div>
					<p className="text-muted-foreground text-xs">
						{overview.active.change > 0 ? "+" : ""}
						{overview.active.change}% desde el mes pasado
					</p>
				</CardContent>
			</Card>
		</div>
	)
}
