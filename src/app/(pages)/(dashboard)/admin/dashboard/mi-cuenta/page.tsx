// import { ShieldCheckIcon, ShieldEllipsisIcon, UserIcon, UserLockIcon } from "lucide-react"
// import { unauthorized } from "next/navigation"
// import { headers } from "next/headers"

// import { auth } from "@/lib/auth"

// import {
// 	Card,
// 	CardContent,
// 	CardTitle,
// 	CardHeader,
// 	CardDescription,
// } from "@/shared/components/ui/card"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs"
// import ChangePassword from "@/project/auth/components/forms/ChangePassword"
// import Activate2FA from "@/project/auth/components/forms/Activate2FA"
// import { ProfileForm } from "@/project/auth/components/forms/ProfileForm"

// export default async function AdminAccountPage(): Promise<React.ReactElement> {
// 	const session = await auth.api.getSession({
// 		headers: await headers(),
// 	})

// 	if (!session?.user) {
// 		unauthorized()
// 	}

// 	return (
// 		<>
// 			<div className="mx-auto flex w-full max-w-3xl items-center justify-start gap-2">
// 				<UserIcon className="text-primary bg-primary/10 size-10 rounded-lg p-1" />

// 				<div className="flex flex-col">
// 					<h1 className="text-text text-2xl font-bold">Mi Cuenta</h1>
// 					<p className="text-muted-foreground text-sm">
// 						Personaliza tu cuenta y protege tu información.
// 					</p>
// 				</div>
// 			</div>

// 			<Tabs defaultValue="personal" className="mx-auto flex w-full max-w-3xl flex-row gap-4">
// 				<TabsList className="bg-background flex h-fit flex-col justify-start gap-1">
// 					<TabsTrigger
// 						className="data-[state=active]:bg-primary w-full justify-start py-2 font-bold tracking-wide data-[state=active]:text-white"
// 						value="personal"
// 					>
// 						Datos Personales
// 					</TabsTrigger>

// 					<TabsTrigger
// 						className="w-full justify-start py-2 font-bold tracking-wide data-[state=active]:bg-purple-500 data-[state=active]:text-white"
// 						value="password"
// 					>
// 						Cambiar Contraseña
// 					</TabsTrigger>

// 					<TabsTrigger
// 						className="w-full justify-start py-2 font-bold tracking-wide data-[state=active]:bg-green-500 data-[state=active]:text-white"
// 						value="2fa"
// 					>
// 						Activar 2FA
// 					</TabsTrigger>
// 				</TabsList>

// 				<Card className="w-full">
// 					<TabsContent value="personal">
// 						<CardHeader className="flex flex-row items-start justify-between gap-2">
// 							<div className="space-y-1">
// 								<CardTitle>Datos Personales</CardTitle>
// 								<CardDescription>
// 									Edita tus datos personales para que sean actualizados en la plataforma.
// 								</CardDescription>
// 							</div>
// 							<UserLockIcon className="bg-primary/10 text-primary size-10 min-w-10 rounded-md p-1" />
// 						</CardHeader>

// 						<CardContent className="pt-6">
// 							<ProfileForm user={session.user} />
// 						</CardContent>
// 					</TabsContent>

// 					<TabsContent value="password">
// 						<CardHeader className="flex flex-row items-start justify-between gap-2">
// 							<div className="space-y-1">
// 								<CardTitle>Cambiar Contraseña</CardTitle>
// 								<CardDescription>
// 									Ingresa tu contraseña actual y crea una nueva contraseña segura.
// 								</CardDescription>
// 							</div>
// 							<ShieldEllipsisIcon className="size-10 min-w-10 rounded-md bg-purple-500/10 p-1 text-purple-500" />
// 						</CardHeader>

// 						<CardContent className="pt-6">
// 							<ChangePassword />
// 						</CardContent>
// 					</TabsContent>

// 					<TabsContent value="2fa">
// 						<CardHeader className="flex flex-row items-start justify-between gap-2">
// 							<div className="space-y-1">
// 								<CardTitle>Activar 2FA</CardTitle>
// 								<CardDescription>
// 									Ingresa tu contraseña actual y activa la autenticación de dos factores para
// 									proteger tu cuenta.
// 								</CardDescription>
// 							</div>
// 							<ShieldCheckIcon className="size-10 min-w-10 rounded-md bg-green-500/10 p-1 text-green-500" />
// 						</CardHeader>

// 						<CardContent className="pt-6">
// 							<Activate2FA />
// 						</CardContent>
// 					</TabsContent>
// 				</Card>
// 			</Tabs>
// 		</>
// 	)
// }

import { redirect } from "next/navigation"

export default function MiCuentaPage() {
	redirect("/admin/dashboard/mi-cuenta/datos-personales")
}
