"use client"

import {
	Users,
	Clock,
	Shield,
	UserCog,
	HardHat,
	Briefcase,
	Building2,
	UserCheck,
	ShieldCheck,
} from "lucide-react"

import { UserRolesLabels } from "@/lib/consts/user-roles"
import { useUserStats } from "@/hooks/useUserStats"
import { AreasLabels } from "@/lib/consts/areas"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"

export function UserStatsCards() {
	const { data: userData, isLoading } = useUserStats()

	if (isLoading || !userData) {
		return (
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				{[...Array(4)].map((_, i) => (
					<Card key={i} className="animate-pulse">
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<Skeleton className="h-4 w-32" />
							<Skeleton className="h-4 w-4" />
						</CardHeader>
						<CardContent>
							<Skeleton className="h-32" />
						</CardContent>
					</Card>
				))}
			</div>
		)
	}

	return (
		<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
			<Card>
				<CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-2">
					<Users className="bg-primary/10 text-primary min-h-12 min-w-12 rounded-xl p-2" />
					<CardTitle className="font-semibold">Distribución de Usuarios por Rol</CardTitle>
				</CardHeader>

				<CardContent className="flex h-full flex-col justify-between gap-4">
					<div className="space-y-2">
						{userData.usersByRole.map((roleData) => (
							<div key={roleData.role} className="flex items-center">
								<div className="w-full">
									<div className="mb-1 flex justify-between text-sm">
										<span>{UserRolesLabels[roleData.role as keyof typeof UserRolesLabels]}</span>
										<span>{roleData.count} usuarios</span>
									</div>
									<Progress
										className="h-2"
										indicatorClassName={`${roleData.color}`}
										value={(roleData.count / userData.totalUsers) * 100}
									/>
								</div>
							</div>
						))}
					</div>

					<div className="text-muted-foreground text-xs">
						Total: {userData.totalUsers} usuarios registrados
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-2">
					<ShieldCheck className="min-h-12 min-w-12 rounded-lg bg-purple-500/10 p-2 text-purple-500" />
					<CardTitle className="font-semibold">Seguridad de Cuentas</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold">
						{Math.round((userData.twoFactorEnabled / userData.totalUsers) * 100)}%
					</div>
					<p className="text-muted-foreground text-xs">
						Usuarios con autenticación de dos factores
					</p>
					<div className="mt-4">
						<div className="mb-1 flex items-center justify-between text-xs">
							<span>Con 2FA</span>
							<span>{userData.twoFactorEnabled} usuarios</span>
						</div>
						<Progress
							value={(userData.twoFactorEnabled / userData.totalUsers) * 100}
							className="h-2"
							indicatorClassName="bg-green-500"
						/>

						<div className="mt-2 mb-1 flex items-center justify-between text-xs">
							<span>Sin 2FA</span>
							<span>{userData.totalUsers - userData.twoFactorEnabled} usuarios</span>
						</div>
						<Progress
							value={
								((userData.totalUsers - userData.twoFactorEnabled) / userData.totalUsers) * 100
							}
							className="h-2"
							indicatorClassName="bg-orange-500"
						/>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-2">
					<Building2 className="min-h-12 min-w-12 rounded-lg bg-teal-500/10 p-2 text-teal-500" />
					<CardTitle className="font-semibold">Usuarios por Área</CardTitle>
				</CardHeader>
				<CardContent className="flex h-full flex-col justify-between gap-4">
					<div className="flex flex-wrap gap-1">
						{userData.usersByArea.map((areaData) => (
							<Badge
								key={areaData.area}
								variant="outline"
								className="flex items-center gap-1 border-emerald-600 bg-emerald-600/5 text-emerald-600"
							>
								<span>{areaData.count}</span>
								<span title={areaData.area} className="max-w-24 truncate">
									{AreasLabels[areaData.area as keyof typeof AreasLabels]}
								</span>
							</Badge>
						))}
					</div>

					<div>
						<div className="text-muted-foreground flex items-center justify-between text-xs">
							<span>Áreas más pobladas:</span>
							<span>{AreasLabels[userData.usersByArea[0]?.area as keyof typeof AreasLabels]}</span>
						</div>
						<div className="text-muted-foreground flex items-center justify-between text-xs">
							<span>Áreas menos pobladas:</span>
							<span>
								{
									AreasLabels[
										userData.usersByArea[userData.usersByArea.length - 1]
											?.area as keyof typeof AreasLabels
									]
								}
							</span>
						</div>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-2">
					<Clock className="min-h-12 min-w-12 rounded-lg bg-amber-500/10 p-2 text-amber-500" />
					<CardTitle className="font-semibold">Usuarios Recientemente Activos</CardTitle>
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
									<p className="text-muted-foreground flex items-center gap-1 text-xs">
										{user.role === "SUPERADMIN" && <Shield className="h-3 w-3" />}
										{user.role === "ADMIN" && <UserCog className="h-3 w-3" />}
										{user.role === "OPERATOR" && <HardHat className="h-3 w-3" />}
										{user.role === "USER" && <UserCheck className="h-3 w-3" />}
										{user.role === "PARTNER_COMPANY" && <Briefcase className="h-3 w-3" />}
										<span>{UserRolesLabels[user.role as keyof typeof UserRolesLabels]}</span>
									</p>
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
