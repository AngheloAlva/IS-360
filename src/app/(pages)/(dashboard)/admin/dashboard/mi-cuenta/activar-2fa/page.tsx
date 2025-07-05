import { ShieldCheckIcon } from "lucide-react"
import { unauthorized } from "next/navigation"
import { headers } from "next/headers"

import { auth } from "@/lib/auth"

import Activate2FA from "@/project/auth/components/forms/Activate2FA"
import { Separator } from "@/shared/components/ui/separator"
import {
	Card,
	CardTitle,
	CardHeader,
	CardContent,
	CardDescription,
} from "@/shared/components/ui/card"

export default async function Activar2FAPage(): Promise<React.ReactElement> {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user) {
		unauthorized()
	}

	return (
		<Card className="w-full">
			<CardHeader className="flex flex-row items-start justify-between gap-2">
				<div className="space-y-1">
					<CardTitle>Activar 2FA</CardTitle>
					<CardDescription>
						Ingresa tu contraseña actual y activa la autenticación de dos factores para proteger tu
						cuenta.
					</CardDescription>
				</div>
				<ShieldCheckIcon className="size-10 min-w-10 rounded-md bg-green-500/10 p-1 text-green-500" />
			</CardHeader>

			<Separator className="my-2" />

			<CardContent>
				<Activate2FA />
			</CardContent>
		</Card>
	)
}
