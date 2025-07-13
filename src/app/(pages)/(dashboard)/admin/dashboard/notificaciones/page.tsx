"use client"

import { useState, useEffect } from "react"
import { es } from "date-fns/locale"
import { format } from "date-fns"
import Link from "next/link"

import { Tabs, TabsContent, TabsContents, TabsList, TabsTrigger } from "@/shared/components/ui/tabs"
import ModuleHeader from "@/shared/components/ModuleHeader"
import { Button } from "@/shared/components/ui/button"

type Notification = {
	id: string
	type: string
	title: string
	link?: string
	isRead: boolean
	message: string
	createdAt: string
}

export default function NotificationsPage() {
	const [notifications, setNotifications] = useState<Notification[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [activeTab, setActiveTab] = useState("all")
	const [pagination, setPagination] = useState({
		total: 0,
		pages: 1,
		page: 1,
		limit: 10,
	})

	const fetchNotifications = async (page = 1, onlyUnread = false) => {
		try {
			setIsLoading(true)
			const response = await fetch(
				`/api/notifications?page=${page}&limit=10&onlyUnread=${onlyUnread}`
			)
			const data = await response.json()

			if (response.ok) {
				setNotifications(data.notifications)
				setPagination(data.pagination)
			}
		} catch (error) {
			console.error("Error fetching notifications:", error)
		} finally {
			setIsLoading(false)
		}
	}

	const markAsRead = async (id: string) => {
		try {
			const response = await fetch("/api/notifications", {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ id }),
			})

			if (response.ok) {
				// Actualizar estado local
				setNotifications((prev) =>
					prev.map((notification) =>
						notification.id === id ? { ...notification, isRead: true } : notification
					)
				)
			}
		} catch (error) {
			console.error("Error marking notification as read:", error)
		}
	}

	const handleTabChange = (value: string) => {
		setActiveTab(value)
		fetchNotifications(1, value === "unread")
	}

	const handlePageChange = (page: number) => {
		fetchNotifications(page, activeTab === "unread")
	}

	useEffect(() => {
		fetchNotifications()
	}, [])

	return (
		<div className="w-full flex-1 space-y-6">
			<ModuleHeader
				title="Notificaciones"
				className="from-blue-500 to-purple-600"
				description="Puedes ver y gestionar tus notificaciones aquí"
			/>

			<Tabs value={activeTab} onValueChange={handleTabChange}>
				<TabsList className="mb-4">
					<TabsTrigger value="all">Todas</TabsTrigger>
					<TabsTrigger value="unread">No leídas</TabsTrigger>
				</TabsList>

				<TabsContents>
					<TabsContent value="all" className="space-y-4">
						{renderNotificationsList()}
					</TabsContent>
					<TabsContent value="unread" className="space-y-4">
						{renderNotificationsList()}
					</TabsContent>
				</TabsContents>
			</Tabs>

			{pagination.pages > 1 && (
				<div className="mt-6 flex justify-center">
					<div className="flex space-x-2">
						{Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
							<Button
								key={page}
								variant={page === pagination.page ? "default" : "outline"}
								size="sm"
								onClick={() => handlePageChange(page)}
							>
								{page}
							</Button>
						))}
					</div>
				</div>
			)}
		</div>
	)

	function renderNotificationsList() {
		if (isLoading) {
			return (
				<div className="bg-background flex items-center justify-center rounded-lg py-8">
					<span>Cargando...</span>
				</div>
			)
		}

		if (notifications.length === 0) {
			return (
				<div className="bg-background flex items-center justify-center rounded-lg border py-8">
					<span className="text-muted-foreground">No hay notificaciones</span>
				</div>
			)
		}

		return notifications.map((notification) => (
			<div
				key={notification.id}
				className={`rounded-lg border p-4 ${!notification.isRead ? "bg-muted/20" : ""}`}
				onClick={() => !notification.isRead && markAsRead(notification.id)}
			>
				<div className="mb-2 flex items-center justify-between">
					<h3 className="font-medium">{notification.title}</h3>
					<span className="text-muted-foreground text-sm">
						{format(new Date(notification.createdAt), "dd MMMM yyyy, HH:mm", {
							locale: es,
						})}
					</span>
				</div>
				<p className="text-muted-foreground mb-3">{notification.message}</p>
				{notification.link && (
					<div className="flex justify-end">
						<Link href={notification.link}>
							<Button variant="outline" size="sm">
								Ver detalles
							</Button>
						</Link>
					</div>
				)}
			</div>
		))
	}
}
