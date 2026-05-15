"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useEffect } from "react"
import Image from "next/image"
import { ShieldCheckIcon, WrenchIcon, HardHatIcon } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { DEMO_ROLE_LABELS, DEMO_USERS, setDemoUser, useDemoUser } from "@/lib/demo-auth"
import { Button } from "@/shared/components/ui/button"
import type { DemoRole } from "@/lib/demo-auth"

const ROLE_ICONS: Record<DemoRole, React.ComponentType<{ className?: string }>> = {
	admin: ShieldCheckIcon,
	"internal-tech": WrenchIcon,
	supervisor: HardHatIcon,
}

function targetFor(role: DemoRole): string {
	return role === "supervisor" ? "/dashboard/inicio" : "/admin/dashboard/inicio"
}

export default function LoginPage(): React.ReactElement {
	const router = useRouter()
	const params = useSearchParams()
	const user = useDemoUser()

	useEffect(() => {
		if (!user) return
		const callback = params.get("callbackUrl")
		router.replace(callback && callback.startsWith("/") ? callback : targetFor(user.role))
	}, [user, router, params])

	const choose = (role: DemoRole) => {
		setDemoUser(DEMO_USERS[role])
	}

	return (
		<section className="bg-secondary-background min-h-screen p-4 xl:p-6">
			<div className="mx-auto flex h-full max-w-5xl flex-col gap-8 py-10">
				<header className="flex items-center gap-4">
					<Image
						alt="IS 360"
						width={56}
						height={56}
						src="/logo.svg"
						className="size-14 rounded-md shadow"
					/>
					<div>
						<h1 className="text-xl font-bold xl:text-2xl">Bienvenido a IS 360</h1>
						<p className="text-muted-foreground text-sm">
							Esta es una demo — elegí un rol para recorrer la plataforma.
						</p>
					</div>
				</header>

				<div className="grid gap-4 md:grid-cols-3">
					{(Object.keys(DEMO_USERS) as DemoRole[]).map((role) => {
						const Icon = ROLE_ICONS[role]
						const labels = DEMO_ROLE_LABELS[role]
						return (
							<Card key={role} className="flex flex-col">
								<CardHeader>
									<div className="bg-primary/10 text-primary mb-3 flex size-10 items-center justify-center rounded-md">
										<Icon className="size-5" />
									</div>
									<CardTitle>{labels.title}</CardTitle>
									<CardDescription>{labels.description}</CardDescription>
								</CardHeader>
								<CardContent className="mt-auto">
									<Button className="w-full" onClick={() => choose(role)}>
										Entrar como {labels.title}
									</Button>
								</CardContent>
							</Card>
						)
					})}
				</div>

				<p className="text-muted-foreground mt-auto text-center text-sm">
					IS 360 © {new Date().getFullYear()} — los datos no se guardan en servidor
				</p>
			</div>
		</section>
	)
}
