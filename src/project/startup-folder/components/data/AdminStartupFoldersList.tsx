"use client"

import { Files, InfoIcon } from "lucide-react"
import { useState } from "react"
import Link from "next/link"

import { useStartupFoldersList } from "@/project/startup-folder/hooks/use-startup-folder"
import { WorkOrderStatusSimpleOptions } from "@/lib/consts/work-order-status"
import { StartupFolderStatus, type WORK_ORDER_STATUS } from "@prisma/client"
import { useDebounce } from "@/shared/hooks/useDebounce"
import { cn } from "@/lib/utils"

import OrderByButton, { type Order, type OrderBy } from "@/shared/components/OrderByButton"
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar"
import { Skeleton } from "@/shared/components/ui/skeleton"
import SearchInput from "@/shared/components/SearchInput"
import { Button } from "@/shared/components/ui/button"
import { Badge } from "@/shared/components/ui/badge"
import {
	Card,
	CardTitle,
	CardFooter,
	CardHeader,
	CardContent,
	CardDescription,
} from "@/shared/components/ui/card"
import {
	Select,
	SelectItem,
	SelectValue,
	SelectGroup,
	SelectLabel,
	SelectTrigger,
	SelectContent,
	SelectSeparator,
} from "@/shared/components/ui/select"
import { generateSlug } from "@/lib/generateSlug"

interface AdminStartupFoldersListProps {
	id: string
}

export function AdminStartupFoldersList({ id }: AdminStartupFoldersListProps) {
	const [otStatus, setOtStatus] = useState<WORK_ORDER_STATUS | undefined>(undefined)
	const [withOtActive, setWithOtActive] = useState(false)
	const [orderBy, setOrderBy] = useState<OrderBy>("name")
	const [searchTerm, setSearchTerm] = useState("")
	const [order, setOrder] = useState<Order>("asc")

	const debouncedSearch = useDebounce(searchTerm)

	const { data: companiesWithFolders, isLoading } = useStartupFoldersList({
		order,
		orderBy,
		otStatus,
		withOtActive,
		search: debouncedSearch,
	})

	return (
		<>
			<div className="mb-4 grid w-full grid-cols-2 gap-2 lg:grid-cols-5" id={id}>
				<SearchInput
					value={searchTerm}
					onChange={setSearchTerm}
					inputClassName="bg-background"
					className="col-span-2 sm:col-span-1 lg:col-span-2"
					placeholder="Buscar por nombre o RUT de empresa..."
				/>

				<Select
					onValueChange={(value: "all" | WORK_ORDER_STATUS) => {
						if (value === "all") {
							setOtStatus(undefined)
						} else {
							setOtStatus(value as WORK_ORDER_STATUS)
						}
					}}
					value={otStatus ?? "all"}
				>
					<SelectTrigger className="border-input bg-background col-span-2 border sm:col-span-1">
						<SelectValue placeholder="Estado" />
					</SelectTrigger>
					<SelectContent>
						<SelectGroup>
							<SelectLabel>Estado OT</SelectLabel>
							<SelectSeparator />
							<SelectItem value="all">Todos los estados de OT</SelectItem>

							{WorkOrderStatusSimpleOptions.map((status) => (
								<SelectItem key={status.value} value={status.value}>
									{status.label}
								</SelectItem>
							))}
						</SelectGroup>
					</SelectContent>
				</Select>

				<Select
					onValueChange={(value: "true" | "false") => {
						if (value === "true") {
							setWithOtActive(true)
						} else {
							setWithOtActive(false)
						}
					}}
					value={withOtActive ? "true" : "false"}
				>
					<SelectTrigger className="border-input bg-background w-full border">
						<SelectValue placeholder="Mostrar todas las empresas" />
					</SelectTrigger>
					<SelectContent>
						<SelectGroup>
							<SelectItem value="false">Todas las empresas</SelectItem>
							<SelectItem value="true">Solo empresas con OT activa</SelectItem>
						</SelectGroup>
					</SelectContent>
				</Select>

				<OrderByButton
					onChange={(orderBy, order) => {
						setOrderBy(orderBy)
						setOrder(order)
					}}
					className="w-full"
				/>
			</div>

			{companiesWithFolders?.length === 0 && (
				<div className="col-span-full flex flex-col items-center justify-center space-y-3 rounded-lg border border-dashed p-8 text-center">
					<Files className="text-muted-foreground h-8 w-8" />
					<div>
						<p className="text-lg font-medium">
							No hay carpetas de arranque para órdenes de trabajo
						</p>
						<p className="text-muted-foreground text-sm">
							Las carpetas de arranque se crean automáticamente al crear una orden de trabajo para
							una empresa contratista.
						</p>
					</div>
				</div>
			)}

			{isLoading ? (
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{[1, 2, 3, 4, 5, 6].map((item) => (
						<Card key={item} className="overflow-hidden">
							<CardHeader className="pb-2">
								<Skeleton className="h-6 w-3/4" />
							</CardHeader>
							<CardContent>
								<Skeleton className="mb-2 h-4 w-full" />
								<Skeleton className="h-4 w-2/3" />
								<div className="mt-2 flex items-start gap-4">
									<Skeleton className="h-12 w-20" />
									<Skeleton className="h-12 w-28" />
								</div>
							</CardContent>
							<CardFooter>
								<Skeleton className="h-9 w-full" />
							</CardFooter>
						</Card>
					))}
				</div>
			) : (
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{companiesWithFolders?.map((company) => (
						<Card key={company.id} className="group relative transition-all hover:shadow-md">
							<CardHeader className="sm:pb-2">
								<div className="flex items-center gap-4">
									<Avatar className="size-14 text-lg">
										<AvatarImage src={company.image || ""} />
										<AvatarFallback>{company.name.slice(0, 2)}</AvatarFallback>
									</Avatar>

									<div>
										<CardTitle className="line-clamp-1 text-lg font-semibold">
											{company.name}
										</CardTitle>
										<CardDescription className="text-xs">{company.rut}</CardDescription>
									</div>
								</div>
							</CardHeader>

							<CardContent>
								<div>
									<h2 className="text-muted-foreground text-sm font-medium">
										Carpetas de arranque:
									</h2>

									<div className="mt-1.5 flex flex-wrap gap-1.5 text-sm">
										{company.StartupFolders?.length > 0 ? (
											company.StartupFolders.map((folder) => (
												<Badge
													key={folder.id}
													className={cn(
														"bg-accent text-text flex items-center text-xs text-wrap whitespace-normal sm:text-sm",
														{
															"border border-cyan-500 bg-cyan-500/10 text-cyan-600":
																folder.status === StartupFolderStatus.COMPLETED,
														}
													)}
												>
													{folder.name}
												</Badge>
											))
										) : (
											<Badge className="bg-accent text-text flex items-center text-wrap whitespace-normal">
												No hay carpetas de arranque
											</Badge>
										)}
									</div>
								</div>
							</CardContent>

							<CardFooter className="mt-auto flex flex-col gap-2">
								{company.StartupFolders.some(
									(folder) =>
										folder.environmentalFolders.some((folder) => folder.status === "SUBMITTED") ||
										folder.safetyAndHealthFolders.some((folder) => folder.status === "SUBMITTED") ||
										folder.workersFolders.some((folder) => folder.status === "SUBMITTED") ||
										folder.vehiclesFolders.some((folder) => folder.status === "SUBMITTED") ||
										folder.basicFolders.some((folder) => folder.status === "SUBMITTED")
								) && (
									<div className="w-full rounded-md bg-teal-500/10 px-3 py-2 text-xs md:text-sm">
										<span className="flex items-center font-medium text-teal-500">
											<InfoIcon className="mr-1.5 size-3.5" />
											Hay carpetas pendientes de revisión
										</span>
									</div>
								)}

								<Button
									asChild
									className="w-full bg-teal-600 text-white transition-colors hover:bg-teal-700 hover:text-white"
								>
									<Link
										href={`/admin/dashboard/carpetas-de-arranques/${generateSlug(company.name)}_${company.id}`}
									>
										Ver carpeta
									</Link>
								</Button>
							</CardFooter>
						</Card>
					))}
				</div>
			)}
		</>
	)
}
