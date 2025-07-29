import { Building2 } from "lucide-react"
import Link from "next/link"

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"

interface StatsCardProps {
	href?: string
	title: string
	description: string
	data: string | number
	icon: React.ReactElement
}

export default function StatsCard(props: StatsCardProps): React.ReactElement {
	return (
		<Link href="/admin/dashboard/empresas">
			<Card className="group relative cursor-pointer overflow-hidden border-none pt-0 transition-all hover:scale-105">
				<div className="bg-gradient-to-br from-blue-500 to-blue-600 p-1.5" />

				<div className="absolute top-0 left-0 h-16 w-16 -translate-x-4 -translate-y-4 rounded-full bg-blue-500/30 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-100" />
				<div className="absolute right-0 bottom-0 h-16 w-16 translate-x-4 translate-y-4 rounded-full bg-blue-600/30 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-100" />

				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle>Empresas</CardTitle>
					<div className="rounded-lg bg-blue-100 p-1.5 text-blue-600">
						<Building2 className="size-5.5" />
					</div>
				</CardHeader>

				<CardContent>
					<div className="text-2xl font-bold">{data.companies}</div>
					<p className="text-muted-foreground text-xs">{data.activeCompanies} empresas activas</p>
				</CardContent>
			</Card>
		</Link>
	)
}
