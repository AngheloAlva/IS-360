"use client"

import {
	Building,
	ChevronsUpDown,
	LogOut,
	RectangleEllipsis,
	ShieldMinus,
	ShieldPlus,
} from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"

import { authClient } from "@/lib/auth-client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
	DropdownMenu,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuGroup,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
	useSidebar,
	SidebarMenu,
	SidebarMenuItem,
	SidebarMenuButton,
} from "@/components/ui/sidebar"

import type { Session } from "@/lib/auth"

export function NavUser({ session }: { session: Session }): React.ReactElement {
	const { isMobile } = useSidebar()
	const router = useRouter()

	const handleLogOut = async () => {
		await authClient.signOut({
			fetchOptions: {
				onSuccess: () => {
					router.push("/")
				},
			},
		})
	}

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<SidebarMenuButton
							size="lg"
							className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
						>
							<Avatar className="h-8 w-8 rounded-lg">
								<AvatarFallback className="text-primary rounded-md">
									<Building />
								</AvatarFallback>
							</Avatar>
							<div className="grid flex-1 text-left text-sm leading-tight">
								<span className="truncate font-semibold">{session?.user.name}</span>
								<span className="truncate text-xs">{session?.user.email}</span>
							</div>
							<ChevronsUpDown className="ml-auto size-4" />
						</SidebarMenuButton>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
						side={isMobile ? "bottom" : "right"}
						align="end"
						sideOffset={4}
					>
						<DropdownMenuLabel className="p-0 font-normal">
							<div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
								<Avatar className="h-8 w-8 rounded-lg">
									<AvatarFallback className="rounded-lg">
										<Building />
									</AvatarFallback>
								</Avatar>
								<div className="grid flex-1 text-left text-sm leading-tight">
									<span className="truncate font-semibold">{session?.user.name}</span>
									<span className="truncate text-xs">{session?.user.email}</span>
								</div>
							</div>
						</DropdownMenuLabel>

						<DropdownMenuSeparator />

						<DropdownMenuGroup>
							{!session.user.twoFactorEnabled ? (
								<Link href="/dashboard/activate-2fa">
									<DropdownMenuItem>
										<ShieldPlus />
										Activar 2FA
									</DropdownMenuItem>
								</Link>
							) : (
								<DropdownMenuItem disabled>
									<ShieldMinus />
									Desactivar 2FA
								</DropdownMenuItem>
							)}
							<Link href="/dashboard/cambiar-contrasena">
								<DropdownMenuItem>
									<RectangleEllipsis />
									Cambiar Contraseña
								</DropdownMenuItem>
							</Link>
						</DropdownMenuGroup>

						<DropdownMenuSeparator />

						<DropdownMenuItem onClick={() => handleLogOut()}>
							<LogOut />
							Log out
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	)
}
