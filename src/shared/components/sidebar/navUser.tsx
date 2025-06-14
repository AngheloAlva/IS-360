"use client"

import { Building, ChevronsUpDown, LogOut } from "lucide-react"
import { useRouter } from "next/navigation"

import { authClient } from "@/lib/auth-client"

import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar"
import {
	DropdownMenu,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuSeparator,
} from "@/shared/components/ui/dropdown-menu"
import {
	useSidebar,
	SidebarMenu,
	SidebarMenuItem,
	SidebarMenuButton,
} from "@/shared/components/ui/sidebar"

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
							className="data-[state=open]:bg-primary/70 hover:bg-primary/70 data-[state=open]:text-white"
						>
							<Avatar className="h-8 w-8 rounded-lg">
								<AvatarImage src={session?.user.image || ""} />
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
									<AvatarImage src={session?.user.image || ""} />
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

						<DropdownMenuItem onClick={() => handleLogOut()}>
							<LogOut />
							Cerrar Sesión
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	)
}
