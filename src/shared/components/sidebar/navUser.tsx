"use client"

import { BuildingIcon, LogOutIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { getImageProps } from "next/image"

import { authClient } from "@/lib/auth-client"

import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar"
import { SidebarMenu, SidebarMenuItem } from "@/shared/components/ui/sidebar"
import { Button } from "../ui/button"

import type { Session } from "@/lib/auth"

export function NavUser({ session }: { session: Session }): React.ReactElement {
	const router = useRouter()

	const { props } = getImageProps({
		width: 40,
		height: 40,
		alt: session.user.name,
		src: session.user.image || "",
	})

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
			<SidebarMenuItem className="bg-accent flex items-center gap-2 rounded-xl p-2">
				<div className="flex items-start gap-2">
					<Avatar className="h-8 w-8 rounded-lg">
						<AvatarImage {...props} />
						<AvatarFallback className="text-primary rounded-md">
							<BuildingIcon />
						</AvatarFallback>
					</Avatar>

					<div className="grid flex-1 text-left text-sm leading-tight">
						<span className="truncate font-semibold">{session?.user.name}</span>
						<span className="truncate text-xs">{session?.user.email}</span>
					</div>
				</div>

				<Button
					size={"icon"}
					variant={"ghost"}
					className="hover:bg-blue-500"
					onClick={() => handleLogOut()}
				>
					<LogOutIcon />
				</Button>
			</SidebarMenuItem>
		</SidebarMenu>
	)
}
