"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"

import { pusherClient } from "@/lib/pusher"

export type Notification = {
	id: string
	type: string
	title: string
	link?: string
	message: string
	createdAt: Date
	isRead: boolean
}

export const useNotifications = () => {
	const [notifications, setNotifications] = useState<Notification[]>([])
	const [unreadCount, setUnreadCount] = useState(0)
	const [isLoading, setIsLoading] = useState(true)

	const fetchNotifications = async (onlyUnread = false) => {
		try {
			setIsLoading(true)
			const response = await fetch(`/api/notifications?onlyUnread=${onlyUnread}`)
			const data = await response.json()

			if (response.ok) {
				setNotifications(data.notifications)

				if (!onlyUnread) {
					const unread = data.notifications.filter((n: Notification) => !n.isRead).length
					setUnreadCount(unread)
				}
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
				setNotifications((prev) =>
					prev.map((notification) =>
						notification.id === id ? { ...notification, isRead: true } : notification
					)
				)
				setUnreadCount((prev) => Math.max(0, prev - 1))
			}
		} catch (error) {
			console.error("Error marking notification as read:", error)
		}
	}

	const markAllAsRead = async () => {
		try {
			const response = await fetch("/api/notifications", {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ markAllAsRead: true }),
			})

			if (response.ok) {
				setNotifications((prev) => prev.map((notification) => ({ ...notification, isRead: true })))
				setUnreadCount(0)
			}
		} catch (error) {
			console.error("Error marking all notifications as read:", error)
		}
	}

	useEffect(() => {
		fetchNotifications()
	}, [])

	useEffect(() => {
		const fetchUserRoles = async () => {
			try {
				const response = await fetch("/api/me")
				if (!response.ok) return

				const data = await response.json()

				const userRoles = data.role?.split(",") || []

				userRoles.forEach((role: string) => {
					if (role && role.trim()) {
						const channel = pusherClient.subscribe(`${role.trim()}-channel`)

						channel.bind("notification", (data: Notification) => {
							setNotifications((prev) => {
								if (prev.some((n) => n.id === data.id)) return prev
								return [data, ...prev]
							})
							setUnreadCount((prev) => prev + 1)
						})
					}
				})

				return userRoles.filter((role: string) => role && role.trim())
			} catch (error) {
				console.error("Error fetching user roles:", error)
				return []
			}
		}

		let userRoles: string[] = []

		;(async () => {
			try {
				userRoles = await fetchUserRoles()

				userRoles.forEach((role: string) => {
					if (role && role.trim()) {
						const channel = pusherClient.subscribe(`${role.trim()}-channel`)

						channel.bind("notification", (data: Notification) => {
							setNotifications((prev) => {
								if (prev.some((n) => n.id === data.id)) return prev

								toast(data.title, {
									description: data.message,
									action: data.link
										? {
												label: "Ver",
												onClick: () => (window.location.href = data.link!),
											}
										: undefined,
								})

								return [data, ...prev]
							})
							setUnreadCount((prev) => prev + 1)
						})
					}
				})
			} catch (error) {
				console.error("Error al suscribirse a los canales:", error)
			}
		})()

		return () => {
			userRoles.forEach((role: string) => {
				if (role) {
					pusherClient.unsubscribe(`${role}-channel`)
				}
			})
		}
	}, [])

	return {
		notifications,
		unreadCount,
		isLoading,
		fetchNotifications,
		markAsRead,
		markAllAsRead,
	}
}
