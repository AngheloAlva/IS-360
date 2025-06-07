"use client"

import { ClockIcon, UsersIcon, TagsIcon } from "lucide-react"

import { USER_ROLE, USER_ROLE_LABELS } from "@/lib/permissions"
import { useUserStats } from "@/hooks/users/useUserStats"
import { Areas, AreasLabels } from "@/lib/consts/areas"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import BarChart from "../../charts/BarChart"
import PieChart from "../../charts/PieChart"

import type { ChartConfig } from "@/components/ui/chart"

const rolesChartConfig = {
	...Object.keys(USER_ROLE).reduce(
		(acc, key) => {
			acc[key as keyof typeof USER_ROLE] = {
				label: USER_ROLE_LABELS[key as keyof typeof USER_ROLE],
			}
			return acc
		},
		{} as Record<keyof typeof USER_ROLE, { label: string }>
	),
} satisfies ChartConfig

const areaChartConfig = {
	type: {
		label: "Usuarios",
	},
	...Object.keys(Areas).reduce(
		(acc, key) => {
			acc[key as keyof typeof Areas] = {
				label: AreasLabels[key as keyof typeof AreasLabels],
			}
			return acc
		},
		{} as Record<keyof typeof Areas, { label: string }>
	),
} satisfies ChartConfig

export function UserStatsCards() {
	const { data: userData, isLoading } = useUserStats()

	if (isLoading || !userData) {
		return (
			<div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-4">
				<Card className="animate-pulse lg:col-span-2">
					<CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-2">
						<Skeleton className="size-12" />
						<Skeleton className="h-6 w-32" />
					</CardHeader>
					<CardContent>
						<Skeleton className="h-[250px]" />
					</CardContent>
				</Card>

				<Card className="animate-pulse">
					<CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-2">
						<Skeleton className="size-12" />
						<Skeleton className="h-6 w-32" />
					</CardHeader>
					<CardContent>
						<Skeleton className="h-[250px]" />
					</CardContent>
				</Card>

				<Card className="animate-pulse">
					<CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-2">
						<Skeleton className="size-12" />
						<Skeleton className="h-6 w-32" />
					</CardHeader>
					<CardContent>
						<Skeleton className="h-[250px]" />
					</CardContent>
				</Card>
			</div>
		)
	}

	const totalRoles = userData.usersByRole.reduce((acc, role) => acc + role.count, 0)

	return (
		<div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-4">
			<Card className="lg:col-span-2">
				<CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-2">
					<UsersIcon className="min-h-12 min-w-12 rounded-lg bg-teal-500/10 p-2 text-teal-500" />
					<CardTitle className="font-semibold">Usuarios por Área</CardTitle>
				</CardHeader>

				<CardContent className="px-0 pb-0">
					<BarChart
						data={userData.usersByArea.map((area, index) => ({
							value: area.count,
							fill: "var(--chart-" + index + ")",
							name: AreasLabels[area.area as keyof typeof AreasLabels],
						}))}
						config={areaChartConfig}
					/>
				</CardContent>
			</Card>

			<Card className="gap-0">
				<CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-2">
					<TagsIcon className="min-h-12 min-w-12 rounded-lg bg-blue-500/10 p-2 text-blue-500" />
					<CardTitle className="font-semibold">Distribución de Roles</CardTitle>
				</CardHeader>

				<CardContent className="h-full flex-1 py-0">
					<PieChart
						data={userData.usersByRole.map((role, index) => ({
							name: role.role,
							value: role.count,
							fill: "var(--chart-" + index + ")",
						}))}
						totalLabel="Roles"
						total={totalRoles}
						config={rolesChartConfig}
					/>
				</CardContent>
			</Card>

			<Card className="lg:col-span-1">
				<CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-2">
					<ClockIcon className="min-h-12 min-w-12 rounded-lg bg-amber-500/10 p-2 text-amber-500" />
					<CardTitle className="font-semibold">Usuarios Activos</CardTitle>
				</CardHeader>
				<CardContent className="p-0">
					<div className="divide-y">
						{userData.recentlyActiveUsers.map((user) => (
							<div key={user.id} className="flex items-center gap-2 p-2">
								<Avatar className="h-8 w-8">
									<AvatarImage src={user.image || ""} alt={user.name} />
									<AvatarFallback className="text-xs">
										{user.name
											.split(" ")
											.map((n) => n[0])
											.join("")}
									</AvatarFallback>
								</Avatar>
								<div className="min-w-0 flex-1">
									<p className="truncate text-sm font-medium">{user.name}</p>
								</div>
								<div className="text-muted-foreground text-xs whitespace-nowrap">
									{user.lastActive}
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		</div>
	)
}
