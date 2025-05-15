export default function page(): React.ReactElement {
	return <div></div>
}

// "use client"

// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { Card, CardContent } from "@/components/ui/card"
// import { useEffect, useState } from "react"

// import { AdminWorkOrderStartupFoldersList } from "@/components/sections/startup-folders/admin/AdminWorkOrderStartupFoldersList"
// import { AdminGeneralStartupFoldersList } from "@/components/sections/startup-folders/admin/AdminGeneralStartupFoldersList"

// export default function StartupFoldersPage() {
// 	const [activeTab, setActiveTab] = useState("general")

// 	// Guardar la pestaña activa en localStorage
// 	useEffect(() => {
// 		if (typeof window !== "undefined") {
// 			const savedTab = localStorage.getItem("startupFoldersActiveTab")
// 			if (savedTab) {
// 				setActiveTab(savedTab)
// 			}
// 		}
// 	}, [])

// 	const handleTabChange = (value: string) => {
// 		setActiveTab(value)
// 		if (typeof window !== "undefined") {
// 			localStorage.setItem("startupFoldersActiveTab", value)
// 		}
// 	}

// 	return (
// 		<div className="w-full flex-1">
// 			<div className="mb-8">
// 				<h1 className="text-4xl font-bold">Carpetas de Arranque</h1>
// 				<p className="text-muted-foreground mt-2">
// 					Gestiona la documentación necesaria para comenzar a operar
// 				</p>
// 			</div>

// 			<Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
// 				<TabsList className="h-11 w-full">
// 					<TabsTrigger value="general" className="h-9">
// 						General
// 					</TabsTrigger>
// 					<TabsTrigger value="workorders" className="h-9">
// 						Ordenes de Trabajo
// 					</TabsTrigger>
// 				</TabsList>

// 				<TabsContent value="general" className="space-y-4">
// 					<Card>
// 						<CardContent>
// 							<h2 className="text-2xl font-semibold">Carpeta General de Empresa</h2>
// 							<p className="text-muted-foreground mb-6 text-sm">
// 								Esta carpeta contiene documentación general de tu empresa que aplica a todas las
// 								órdenes de trabajo
// 							</p>

// 							<AdminGeneralStartupFoldersList />
// 						</CardContent>
// 					</Card>
// 				</TabsContent>

// 				<TabsContent value="workorders" className="space-y-4">
// 					<Card>
// 						<CardContent>
// 							<h2 className="text-2xl font-semibold">Carpetas por Orden de Trabajo</h2>
// 							<p className="text-muted-foreground mb-6 text-sm">
// 								Cada orden de trabajo tiene una carpeta específica con los documentos necesarios
// 								para ese trabajo
// 							</p>

// 							<AdminWorkOrderStartupFoldersList />
// 						</CardContent>
// 					</Card>
// 				</TabsContent>
// 			</Tabs>
// 		</div>
// 	)
// }
