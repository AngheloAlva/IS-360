import { ShieldEllipsisIcon } from "lucide-react"
import { unauthorized } from "next/navigation"
import { headers } from "next/headers"

import { auth } from "@/lib/auth"

import ChangePassword from "@/project/auth/components/forms/ChangePassword"
import { Separator } from "@/shared/components/ui/separator"
import {
	Card,
	CardTitle,
	CardHeader,
	CardContent,
	CardDescription,
} from "@/shared/components/ui/card"

export default async function CambiarContrasenaPage(): Promise<React.ReactElement> {
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
					<CardTitle>Cambiar Contraseña</CardTitle>
					<CardDescription>
						Ingresa tu contraseña actual y crea una nueva contraseña segura.
					</CardDescription>
				</div>
				<ShieldEllipsisIcon className="size-10 min-w-10 rounded-md bg-purple-500/10 p-1 text-purple-500" />
			</CardHeader>

			<Separator className="my-2" />

			<CardContent>
				<ChangePassword />
			</CardContent>
		</Card>
	)
}
