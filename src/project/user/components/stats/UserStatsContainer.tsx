"use client"

import { UsersIcon, ShieldCheckIcon } from "lucide-react"

import { useUserStats } from "@/project/user/hooks/use-user-stats"

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Skeleton } from "@/shared/components/ui/skeleton"

export function UserStatsContainer() {
	const { data: userData, isLoading } = useUserStats()

	if (isLoading)
		return (
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				{Array.from({ length: 4 }).map((_, i) => (
					<Card key={i} className="col-span-1">
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-base font-medium">
								<Skeleton className="h-4 w-[150px]" />
							</CardTitle>
						</CardHeader>
						<CardContent>
							<Skeleton className="h-[85px] w-full" />
						</CardContent>
					</Card>
				))}
			</div>
		)

	return (
		<div className="space-y-4">
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<Card className="overflow-hidden border-none pt-0">
					<div className="bg-gradient-to-br from-purple-500 to-purple-600 p-1.5" />

					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-base font-medium">Total Usuarios</CardTitle>
						<div className="rounded-lg bg-purple-500/20 p-1.5 text-purple-500">
							<UsersIcon className="h-5 w-5 text-purple-500" />
						</div>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{userData?.basicStats.totalUsers || 0}</div>
						<p className="text-muted-foreground text-xs">Usuarios registrados</p>
					</CardContent>
				</Card>

				<Card className="overflow-hidden border-none pt-0">
					<div className="bg-gradient-to-br from-purple-600 to-indigo-500 p-1.5" />
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-base font-medium">2FA Habilitado</CardTitle>
						<div className="rounded-lg bg-purple-600/20 p-1.5 text-purple-600">
							<ShieldCheckIcon className="h-5 w-5 text-purple-500" />
						</div>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{userData?.basicStats.twoFactorEnabled || 0}</div>
						<p className="text-muted-foreground text-xs">Usuarios con 2FA</p>
					</CardContent>
				</Card>

				<Card className="overflow-hidden border-none pt-0">
					<div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-1.5" />
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-base font-medium">Contratistas</CardTitle>
						<div className="rounded-lg bg-indigo-500/20 p-1.5 text-indigo-500">
							<UsersIcon className="h-5 w-5 text-indigo-500" />
						</div>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{userData?.basicStats.totalContractors}</div>
						<p className="text-muted-foreground text-xs">Empresas contratistas</p>
					</CardContent>
				</Card>

				<Card className="overflow-hidden border-none pt-0">
					<div className="bg-gradient-to-br from-indigo-600 to-indigo-700 p-1.5" />
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-base font-medium">Supervisores</CardTitle>
						<div className="rounded-lg bg-indigo-600/20 p-1.5 text-indigo-600">
							<UsersIcon className="h-5 w-5 text-indigo-600" />
						</div>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{userData?.basicStats.totalSupervisors}</div>
						<p className="text-muted-foreground text-xs">Supervisores activos</p>
					</CardContent>
				</Card>
			</div>
		</div>
	)
}
