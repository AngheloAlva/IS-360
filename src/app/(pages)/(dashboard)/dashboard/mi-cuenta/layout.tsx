"use client"

import { usePathname } from "next/navigation"
import { UserIcon } from "lucide-react"
import Link from "next/link"

import { cn } from "@/lib/utils"

import { navOther } from "@/shared/components/sidebar/sidebar-data"

export default function MiCuentaLayout({ children }: { children: React.ReactNode }) {
	const pathname = usePathname()

	return (
		<>
			<div className="mx-auto flex w-full items-center justify-start gap-2">
				<UserIcon className="text-primary bg-primary/10 size-10 rounded-lg p-1" />

				<div className="flex flex-col">
					<h1 className="text-text text-xl font-bold lg:text-2xl">Mi Cuenta</h1>
					<p className="text-muted-foreground text-sm lg:text-base">
						Personaliza tu cuenta y protege tu información.
					</p>
				</div>
			</div>

			<div className="mx-auto flex w-full flex-1 flex-row gap-4">
				<div className="flex h-fit flex-col justify-start gap-1">
					{navOther.map((item) => {
						const isActive = pathname === item.url
						const Icon = item.icon

						return (
							<Link
								key={item.url}
								href={item.url}
								className={cn(
									"flex w-full items-center justify-start gap-3 rounded-md px-3 py-2 text-sm font-semibold tracking-wide text-nowrap transition-colors",
									isActive ? "bg-blue-500 text-white" : "text-foreground hover:bg-blue-500/10"
								)}
							>
								<Icon className="size-4" />
								{item.name}
							</Link>
						)
					})}
				</div>

				<div className="w-full">{children}</div>
			</div>
		</>
	)
}
