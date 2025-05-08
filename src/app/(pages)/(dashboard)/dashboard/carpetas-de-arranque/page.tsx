"use client"

import { useState, useEffect } from "react"
import { authClient } from "@/lib/auth-client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Files, Building2, FolderArchive } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

import { useCompanyGeneralStartupFolders } from "@/hooks/startup-folders/use-general-startup-folder"
import { GeneralStartupFoldersList } from "@/components/sections/startup-folders/GeneralStartupFoldersList"
import { WorkOrderStartupFoldersList } from "@/components/sections/startup-folders/WorkOrderStartupFoldersList"

export default function StartupFoldersPage() {
	const [activeTab, setActiveTab] = useState("general")
	const { data: session } = authClient.useSession()
	const { data: folders, isLoading: isLoadingFolders, error } = useCompanyGeneralStartupFolders()

	// Guardar la pestaña activa en localStorage
	useEffect(() => {
		const savedTab = localStorage.getItem("startup-folders-active-tab")
		if (savedTab) setActiveTab(savedTab)
	}, [])

	// Actualizar localStorage cuando cambia la pestaña activa
	const handleTabChange = (value: string) => {
		setActiveTab(value)
		localStorage.setItem("startup-folders-active-tab", value)
	}

	if (!session?.user) {
		return (
			<Alert variant="destructive">
				<AlertTitle>Acceso denegado</AlertTitle>
				<AlertDescription>Debe iniciar sesión para acceder a esta página.</AlertDescription>
			</Alert>
		)
	}

	if (isLoadingFolders) {
		return (
			<div className="space-y-4">
				<Skeleton className="h-10 w-1/3" />
				<Skeleton className="h-20 w-full" />
				<Skeleton className="h-[400px] w-full" />
			</div>
		)
	}

	if (error) {
		return (
			<Alert variant="destructive">
				<AlertTitle>Error</AlertTitle>
				<AlertDescription>
					Error al cargar las carpetas de arranque. Por favor, inténtelo de nuevo más tarde.
				</AlertDescription>
			</Alert>
		)
	}

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold tracking-tight">Carpetas de Arranque</h1>
				<p className="text-muted-foreground">
					Gestione la documentación necesaria para trabajar con nosotros
				</p>
			</div>

			<Tabs defaultValue={activeTab} onValueChange={handleTabChange} className="space-y-4">
				<TabsList>
					<TabsTrigger value="general" className="flex items-center gap-2">
						<Building2 className="h-4 w-4" />
						<span>Carpeta General</span>
					</TabsTrigger>
					<TabsTrigger value="ordenes" className="flex items-center gap-2">
						<FolderArchive className="h-4 w-4" />
						<span>Órdenes de Trabajo</span>
					</TabsTrigger>
				</TabsList>

				<TabsContent value="general">
					<Card>
						<CardContent className="pt-6">
							<div className="flex items-center gap-2">
								<Building2 className="text-muted-foreground h-5 w-5" />
								<h2 className="text-xl font-semibold tracking-tight">
									Carpeta de Arranque General
								</h2>
							</div>
							<p className="text-muted-foreground mt-1">
								Esta carpeta contiene documentación general de tu empresa que aplica a todas las
								órdenes de trabajo
							</p>
							<Separator className="my-4" />

							{folders && folders.length > 0 ? (
								<GeneralStartupFoldersList />
							) : (
								<div className="col-span-full flex flex-col items-center justify-center space-y-3 rounded-lg border border-dashed p-8 text-center">
									<Files className="text-muted-foreground h-8 w-8" />
									<div>
										<p className="text-lg font-medium">No hay carpeta de arranque general</p>
										<p className="text-muted-foreground text-sm">
											Su empresa aún no tiene una carpeta de arranque general. Por favor contacte
											con soporte.
										</p>
									</div>
								</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="ordenes">
					<Card>
						<CardContent className="pt-6">
							<div className="flex items-center gap-2">
								<FolderArchive className="text-muted-foreground h-5 w-5" />
								<h2 className="text-xl font-semibold tracking-tight">
									Carpetas de Órdenes de Trabajo
								</h2>
							</div>
							<p className="text-muted-foreground mt-1">
								Cada orden de trabajo tiene una carpeta específica con los documentos necesarios
								para ese trabajo
							</p>
							<Separator className="my-4" />
							<WorkOrderStartupFoldersList />
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	)
}
