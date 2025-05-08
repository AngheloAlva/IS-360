"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useEffect, useState } from "react"

import { WorkOrderStartupFoldersList } from "@/components/sections/startup-folders/WorkOrderStartupFoldersList"
import { GeneralStartupFoldersList } from "@/components/sections/startup-folders/GeneralStartupFoldersList"

export default function StartupFoldersPage() {
	const [activeTab, setActiveTab] = useState("general")

	// Guardar la pestaña activa en localStorage
	useEffect(() => {
		if (typeof window !== "undefined") {
			const savedTab = localStorage.getItem("startupFoldersActiveTab")
			if (savedTab) {
				setActiveTab(savedTab)
			}
		}
	}, [])

	const handleTabChange = (value: string) => {
		setActiveTab(value)
		if (typeof window !== "undefined") {
			localStorage.setItem("startupFoldersActiveTab", value)
		}
	}

	return (
		<div className="container mx-auto py-6">
			<div className="mb-8">
				<h1 className="text-4xl font-bold">Carpetas de Arranque</h1>
				<p className="text-muted-foreground mt-2">
					Gestiona la documentación necesaria para comenzar a operar
				</p>
			</div>

			<Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
				<TabsList className="grid w-full max-w-md grid-cols-2">
					<TabsTrigger value="general">Carpeta General</TabsTrigger>
					<TabsTrigger value="workorders">Carpetas por Orden de Trabajo</TabsTrigger>
				</TabsList>

				<div className="mt-6">
					<TabsContent value="general" className="space-y-4">
						<Card>
							<CardContent className="pt-6">
								<h2 className="text-2xl font-semibold">Carpeta General de Empresa</h2>
								<p className="text-muted-foreground text-sm">
									Esta carpeta contiene documentación general de tu empresa que aplica a todas las
									órdenes de trabajo
								</p>
								<Separator className="my-4" />
								<GeneralStartupFoldersList />
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent value="workorders" className="space-y-4">
						<Card>
							<CardContent className="pt-6">
								<h2 className="text-2xl font-semibold">Carpetas por Orden de Trabajo</h2>
								<p className="text-muted-foreground text-sm">
									Cada orden de trabajo tiene una carpeta específica con los documentos necesarios
									para ese trabajo
								</p>
								<Separator className="my-4" />
								<WorkOrderStartupFoldersList />
							</CardContent>
						</Card>
					</TabsContent>
				</div>
			</Tabs>
		</div>
	)
}
