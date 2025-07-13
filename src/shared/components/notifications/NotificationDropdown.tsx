"use client"

import { BellIcon, ChevronRight, EyeIcon } from "lucide-react"
import { es } from "date-fns/locale"
import { format } from "date-fns"
import { useState } from "react"
import Link from "next/link"

import { useNotifications, type Notification } from "@/hooks/use-notifications"

import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover"
import { Button } from "@/shared/components/ui/button"

export const NotificationDropdown = () => {
	const [open, setOpen] = useState(false)
	const { notifications, unreadCount, isLoading, markAsRead } = useNotifications()

	const handleMarkAsRead = (id: string) => {
		markAsRead(id)
	}

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button variant="outline" size="icon" className="relative size-8">
					<BellIcon className="h-5 w-5" />
					{unreadCount > 0 && (
						<span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
							{unreadCount > 9 ? "9+" : unreadCount}
						</span>
					)}
				</Button>
			</PopoverTrigger>

			<PopoverContent className="w-96 p-0 shadow-xl" align="end">
				<div className="flex items-center justify-between border-b p-3">
					<div className="flex w-full items-center justify-between gap-2">
						<h3 className="font-medium">Notificaciones</h3>
						<BellIcon className="size-4" />
					</div>
				</div>

				<div className="max-h-80 overflow-y-auto">
					{isLoading ? (
						<div className="flex items-center justify-center p-4">
							<span>Cargando notificaciones...</span>
						</div>
					) : notifications.length === 0 ? (
						<div className="flex items-center justify-center p-4">
							<span className="text-muted-foreground">No hay notificaciones</span>
						</div>
					) : (
						<div className="divide-y">
							{notifications.slice(0, 5).map((notification) => (
								<div
									key={notification.id}
									className={`hover:bg-muted/50 group p-3 ${!notification.isRead ? "bg-muted/20" : ""}`}
								>
									{notification.link ? (
										<Link
											href={notification.link}
											onClick={() => handleMarkAsRead(notification.id)}
											className="block"
										>
											<NotificationItem notification={notification} />
										</Link>
									) : (
										<div onClick={() => handleMarkAsRead(notification.id)}>
											<NotificationItem notification={notification} />
										</div>
									)}
								</div>
							))}

							{notifications.length > 0 && (
								<div className="text-center">
									<Link
										href="/notifications"
										className="hover:bg-muted/50 flex w-full items-center justify-center gap-1 p-2 text-sm font-medium tracking-wide text-blue-500 hover:underline"
										onClick={() => setOpen(false)}
									>
										Ver todas
										<EyeIcon className="size-4" />
									</Link>
								</div>
							)}
						</div>
					)}
				</div>
			</PopoverContent>
		</Popover>
	)
}

const NotificationItem = ({ notification }: { notification: Notification }) => {
	return (
		<>
			<div className="flex items-center justify-between">
				<h4 className="text-sm font-medium">{notification.title}</h4>
				<span className="text-muted-foreground text-xs text-nowrap">
					{format(new Date(notification.createdAt), "dd MMM, HH:mm", {
						locale: es,
					})}
				</span>
			</div>

			<p className="text-muted-foreground text-xs">{notification.message}</p>

			{notification.link && (
				<div className="mt-1 flex items-center justify-end text-xs group-hover:text-green-500">
					<span className="">Ver</span>
					<ChevronRight className="size-3.5 transition group-hover:translate-x-0.5" />
				</div>
			)}
		</>
	)
}
