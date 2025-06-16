"use client"

import * as React from "react"
import { Files, DownloadIcon } from "lucide-react"
import Link from "next/link"

import { useStartupFolder } from "@/project/startup-folder/hooks/use-startup-folder"
import { DocumentCategory } from "@prisma/client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert"
import { CreateStartupFolder } from "../forms/CreateStartupFolder"
import { StartupFolderDocuments } from "./StartupFolderDocuments"
import RefreshButton from "@/shared/components/RefreshButton"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { StartupFolderTable } from "./StartupFolderTable"
import { Button } from "@/shared/components/ui/button"

interface StartupFolderOverviewProps {
	userId: string
	companyId: string
	isOtcMember?: boolean
	isSupervisor?: boolean
	hasPermission?: boolean
}

export default function StartupFolderOverview({
	userId,
	companyId,
	isOtcMember = false,
	isSupervisor = false,
	hasPermission = false,
}: StartupFolderOverviewProps): React.ReactElement {
	const {
		error,
		refetch,
		isFetching,
		data: startupFolders,
		isLoading: isLoadingFolders,
	} = useStartupFolder({
		companyId,
	})

	const [selectedCategory, setSelectedCategory] = React.useState<DocumentCategory | null>(null)

	if (isLoadingFolders) {
		return (
			<div className="space-y-6">
				<Skeleton className="h-28 w-full" />
				<Skeleton className="h-[500px] w-full" />
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
		<div className="w-full space-y-6">
			<div className="rounded-lg bg-gradient-to-r from-teal-600 to-cyan-700 p-6 shadow-lg">
				<div className="flex items-center justify-between">
					<div className="text-white">
						<h1 className="text-3xl font-bold tracking-tight">Carpetas de Arranque</h1>
						<p className="flex flex-col opacity-90">
							{isOtcMember
								? "Revisión de documentación de empresa contratista"
								: "En este módulo podrás gestionar la documentación de la empresa."}
						</p>
					</div>

					<div className="flex items-center gap-2">
						{!isOtcMember && hasPermission && <CreateStartupFolder companyId={companyId} />}

						<Link href={"/carpeta-de-arranque-otc.pdf"} target="_blank">
							<Button className="gap-0 bg-white text-teal-600 transition-all hover:scale-105 hover:bg-white hover:text-teal-600">
								<DownloadIcon className="mr-2 h-4 w-4" />
								Documento base
							</Button>
						</Link>
					</div>
				</div>
			</div>

			<Tabs defaultValue={startupFolders?.[0].id}>
				<div className="flex w-full items-center justify-end gap-2">
					{startupFolders && startupFolders.length > 1 && (
						<TabsList className="w-full">
							{startupFolders.map((folder) => (
								<TabsTrigger value={folder.id} key={folder.id}>
									{folder.name}
								</TabsTrigger>
							))}
						</TabsList>
					)}

					<RefreshButton refetch={refetch} isFetching={isFetching} />
				</div>

				{startupFolders && startupFolders.length > 0 ? (
					startupFolders.map((folder) => (
						<TabsContent value={folder.id} key={folder.id} className="bg-background rounded-lg p-4">
							<div className="space-y-6">
								{selectedCategory ? (
									<StartupFolderDocuments
										userId={userId}
										companyId={companyId}
										isOtcMember={isOtcMember}
										category={selectedCategory}
										startupFolderId={folder.id}
										isSupervisor={isSupervisor}
										onBack={() => setSelectedCategory(null)}
									/>
								) : (
									<StartupFolderTable subFolders={folder} onCategorySelect={setSelectedCategory} />
								)}
							</div>
						</TabsContent>
					))
				) : (
					<div className="col-span-full flex flex-col items-center justify-center space-y-3 rounded-lg border border-dashed p-8 text-center">
						<Files className="text-muted-foreground h-8 w-4" />
						<div>
							<p className="text-lg font-medium">No hay carpeta de arranque</p>
							<p className="text-muted-foreground text-sm">
								Su empresa aún no tiene una carpeta de arranque. Por favor contacte con soporte.
							</p>
						</div>
					</div>
				)}
			</Tabs>
		</div>
	)
}
