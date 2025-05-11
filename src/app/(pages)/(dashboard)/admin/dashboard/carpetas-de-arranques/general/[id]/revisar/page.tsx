"use client"

import { ChevronLeft, FileText, Folder, Info, CheckCircle, XCircle } from "lucide-react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useParams, useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { es } from "date-fns/locale"
import { format } from "date-fns"
import { useState } from "react"
import { toast } from "sonner"
import { z } from "zod"

import { useAdminGeneralStartupFolder } from "@/hooks/startup-folders/use-admin-general-startup-folder"

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { StartupFolderStatusBadge } from "@/components/ui/startup-folder-status-badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import {
	Form,
	FormItem,
	FormField,
	FormLabel,
	FormMessage,
	FormControl,
} from "@/components/ui/form"
import {
	AlertDialog,
	AlertDialogTitle,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTrigger,
	AlertDialogContent,
	AlertDialogDescription,
} from "@/components/ui/alert-dialog"

import type { CompanyDocument } from "@prisma/client"

const reviewSchema = z.object({
	reviewNotes: z.string().min(1, "Las notas de revisión son requeridas"),
})

type ReviewFormValues = z.infer<typeof reviewSchema>

export default function ReviewGeneralStartupFolderPage() {
	const [action, setAction] = useState<"APPROVE" | "REJECT" | null>(null)
	const [submitting, setSubmitting] = useState(false)

	const router = useRouter()
	const params = useParams()

	const form = useForm<ReviewFormValues>({
		resolver: zodResolver(reviewSchema),
		defaultValues: {
			reviewNotes: "",
		},
	})

	const {
		error,
		isLoading,
		data: folder,
	} = useAdminGeneralStartupFolder({ folderId: params.id as string })

	const documentsByCategory = folder?.documents?.reduce(
		(acc: Record<string, CompanyDocument[]>, doc) => {
			if (!acc[doc.subcategory]) {
				acc[doc.subcategory] = []
			}
			acc[doc.subcategory].push(doc)
			return acc
		},
		{}
	)

	const subcategoryNames: Record<string, string> = {
		BASIC_INFO: "Información Básica",
		PROCEDURES: "Procedimientos y Otros",
		PERSONNEL: "Personal",
		VEHICLES: "Vehículos y Equipos",
		ENVIRONMENTAL: "Medio Ambiente",
	}

	async function handleReview(status: "APPROVED" | "REJECTED") {
		try {
			setSubmitting(true)

			const values = form.getValues()

			const response = await fetch(`/api/admin/startup-folders/general/${params.id}/review`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					status,
					reviewNotes: values.reviewNotes,
				}),
			})

			if (!response.ok) {
				const errorData = await response.json()
				throw new Error(errorData.message || "Error al procesar la revisión")
			}

			toast.success(
				status === "APPROVED" ? "Carpeta aprobada correctamente" : "Carpeta rechazada correctamente"
			)

			// Redirigir a la página de la carpeta
			router.push(`/admin/dashboard/carpetas-de-arranques/general/${params.id}`)
			router.refresh()
		} catch (error) {
			console.error("Error al procesar la revisión:", error)
			toast.error(error instanceof Error ? error.message : "Error al procesar la revisión")
		} finally {
			setSubmitting(false)
			setAction(null)
		}
	}

	if (isLoading) {
		return (
			<div className="container mx-auto py-6">
				<div className="mb-4">
					<Skeleton className="h-8 w-40" />
				</div>
				<div className="mb-8">
					<Skeleton className="mb-2 h-10 w-3/4" />
					<Skeleton className="h-6 w-1/2" />
				</div>
				<Card>
					<CardHeader>
						<Skeleton className="h-8 w-64" />
					</CardHeader>
					<CardContent>
						<Skeleton className="mb-2 h-6 w-full" />
						<Skeleton className="mb-2 h-6 w-full" />
						<Skeleton className="h-6 w-3/4" />
					</CardContent>
				</Card>
			</div>
		)
	}

	if (error) {
		return (
			<div className="container mx-auto py-6">
				<Button variant="outline" onClick={() => router.back()} className="mb-6">
					<ChevronLeft className="mr-2 h-4 w-4" /> Volver
				</Button>
				<Card>
					<CardContent className="pt-6">
						<div className="flex flex-col items-center justify-center py-12 text-center">
							<Info className="text-muted-foreground mb-4 h-12 w-12" />
							<h2 className="mb-2 text-2xl font-semibold">Error</h2>
							<p className="text-muted-foreground">{error.message}</p>
							<Button onClick={() => router.back()} className="mt-4">
								Volver
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		)
	}

	return (
		<div className="container mx-auto py-6">
			<Button variant="outline" onClick={() => router.back()} className="mb-6">
				<ChevronLeft className="mr-2 h-4 w-4" /> Volver
			</Button>

			<div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
				<div>
					<h1 className="flex items-center gap-2 text-3xl font-bold">
						Revisar Carpeta: {folder?.company?.name}
					</h1>
					<p className="text-muted-foreground mt-1">RUT: {folder?.company?.rut}</p>
				</div>
				<StartupFolderStatusBadge status={folder?.status || "DRAFT"} />
			</div>

			<div className="grid gap-6">
				<Card>
					<CardHeader>
						<CardTitle>Documentos a revisar</CardTitle>
					</CardHeader>
					<CardContent>
						{folder?.documents?.length === 0 ? (
							<div className="flex flex-col items-center justify-center py-12 text-center">
								<Folder className="text-muted-foreground mb-4 h-12 w-12" />
								<h2 className="mb-2 text-xl font-semibold">No hay documentos</h2>
								<p className="text-muted-foreground">Esta carpeta no tiene documentos cargados.</p>
							</div>
						) : (
							<Tabs defaultValue={Object.keys(documentsByCategory || {})[0] || "BASIC_INFO"}>
								<TabsList className="mb-4">
									{Object.keys(documentsByCategory || {}).map((category) => (
										<TabsTrigger key={category} value={category}>
											{subcategoryNames[category] || category}
										</TabsTrigger>
									))}
								</TabsList>

								{Object.entries(documentsByCategory || {}).map(([category, docs]) => (
									<TabsContent key={category} value={category}>
										<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
											{docs.map((doc) => (
												<Card key={doc.id}>
													<CardHeader className="pb-2">
														<CardTitle className="text-base">{doc.name}</CardTitle>
													</CardHeader>
													<CardContent className="pb-2">
														<div className="text-muted-foreground flex items-center text-sm">
															<FileText className="mr-2 h-4 w-4" />
															<span>
																{doc.uploadedAt
																	? `Subido el ${format(new Date(doc.uploadedAt), "dd MMM yyyy", { locale: es })}`
																	: "No subido"}
															</span>
														</div>
													</CardContent>
													<CardFooter>
														{doc.url ? (
															<Button asChild variant="outline" className="w-full">
																<a href={doc.url} target="_blank" rel="noopener noreferrer">
																	Ver documento
																</a>
															</Button>
														) : (
															<Button disabled variant="outline" className="w-full">
																Sin documento
															</Button>
														)}
													</CardFooter>
												</Card>
											))}
										</div>
									</TabsContent>
								))}
							</Tabs>
						)}
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Revisión de carpeta</CardTitle>
					</CardHeader>
					<CardContent>
						<Form {...form}>
							<form className="space-y-6">
								<FormField
									control={form.control}
									name="reviewNotes"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Notas de revisión</FormLabel>
											<FormControl>
												<Textarea
													placeholder="Ingrese sus comentarios sobre la revisión de esta carpeta..."
													className="min-h-32"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<div className="flex flex-col justify-end gap-4 sm:flex-row">
									<AlertDialog
										open={action === "REJECT"}
										onOpenChange={(open) => !open && setAction(null)}
									>
										<AlertDialogTrigger asChild>
											<Button
												variant="destructive"
												onClick={() => {
													if (form.formState.isValid) {
														setAction("REJECT")
													} else {
														form.trigger()
													}
												}}
												disabled={submitting}
											>
												<XCircle className="mr-2 h-4 w-4" />
												Rechazar carpeta
											</Button>
										</AlertDialogTrigger>
										<AlertDialogContent>
											<AlertDialogHeader>
												<AlertDialogTitle>¿Rechazar esta carpeta?</AlertDialogTitle>
												<AlertDialogDescription>
													Esta acción notificará al contratista que su carpeta ha sido rechazada y
													deberá corregirla.
												</AlertDialogDescription>
											</AlertDialogHeader>
											<AlertDialogFooter>
												<AlertDialogCancel>Cancelar</AlertDialogCancel>
												<AlertDialogAction
													onClick={() => handleReview("REJECTED")}
													className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
												>
													Rechazar
												</AlertDialogAction>
											</AlertDialogFooter>
										</AlertDialogContent>
									</AlertDialog>

									<AlertDialog
										open={action === "APPROVE"}
										onOpenChange={(open) => !open && setAction(null)}
									>
										<AlertDialogTrigger asChild>
											<Button
												variant="default"
												onClick={() => {
													if (form.formState.isValid) {
														setAction("APPROVE")
													} else {
														form.trigger()
													}
												}}
												disabled={submitting}
											>
												<CheckCircle className="mr-2 h-4 w-4" />
												Aprobar carpeta
											</Button>
										</AlertDialogTrigger>
										<AlertDialogContent>
											<AlertDialogHeader>
												<AlertDialogTitle>¿Aprobar esta carpeta?</AlertDialogTitle>
												<AlertDialogDescription>
													Esta acción marcará la carpeta como aprobada y notificará al contratista.
												</AlertDialogDescription>
											</AlertDialogHeader>
											<AlertDialogFooter>
												<AlertDialogCancel>Cancelar</AlertDialogCancel>
												<AlertDialogAction onClick={() => handleReview("APPROVED")}>
													Aprobar
												</AlertDialogAction>
											</AlertDialogFooter>
										</AlertDialogContent>
									</AlertDialog>
								</div>
							</form>
						</Form>
					</CardContent>
				</Card>
			</div>
		</div>
	)
}
