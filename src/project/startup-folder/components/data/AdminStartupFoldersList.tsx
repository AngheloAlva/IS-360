/* eslint-disable react-hooks/exhaustive-deps */
"use client"

import {
	InfoIcon,
	FilesIcon,
	FilterXIcon,
	CheckCircleIcon,
	AlertCircleIcon,
	LayoutListIcon,
	FileSpreadsheetIcon,
} from "lucide-react"
import { memo, useMemo, useCallback } from "react"
import { getImageProps } from "next/image"
import Link from "next/link"

import { exportStartupFoldersToExcel } from "../../export-startup-folders-excel"
import { useStartupFolderFilters } from "../../hooks/use-startup-folder-filters"
import { WorkOrderStatusSimpleOptions } from "@/lib/consts/work-order-status"
import { StartupFolderStatus, type WORK_ORDER_STATUS } from "@/generated/prisma/enums"
import { generateSlug } from "@/lib/generateSlug"
import { cn } from "@/lib/utils"

import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar"
import OrderByButton from "@/shared/components/OrderByButton"
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

interface AdminStartupFoldersListProps {
	id: string
}

const AdminStartupFoldersList = memo(({ id }: AdminStartupFoldersListProps) => {
	const {
		filters,
		actions,
		isLoading,
		isFetching,
		startupFolders: companiesWithFolders,
	} = useStartupFolderFilters()

	const filteredCompanies = useMemo(() => {
		if (!companiesWithFolders) return []
		if (!filters.onlyWithArchivedFolders) return companiesWithFolders

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		return companiesWithFolders.filter((company: any) => {
			return company._count?.StartupFolders > 0
		})
	}, [companiesWithFolders, filters.onlyWithArchivedFolders])

	const memoizedFilters = useMemo(
		() => ({
			search: filters.search,
			otStatus: filters.otStatus,
			withOtActive: filters.withOtActive,
			onlyWithReviewRequest: filters.onlyWithReviewRequest,
			onlyWithArchivedFolders: filters.onlyWithArchivedFolders,
		}),
		[
			filters.search,
			filters.onlyWithReviewRequest,
			filters.onlyWithArchivedFolders,
			filters.otStatus,
			filters.withOtActive,
		]
	)

	const handleOtStatusChange = useCallback(
		(value: "all" | WORK_ORDER_STATUS) => {
			actions.setOtStatus(value === "all" ? undefined : (value as WORK_ORDER_STATUS))
		},
		[actions.setOtStatus]
	)

	const getCompanyStartupFolderHref = useCallback(
		(company: {
			id: string
			name: string
			StartupFolders: { id: string; createdAt: string | Date }[]
		}) => {
			const companyParam = `${generateSlug(company.name)}_${company.id}`
			if (!company.StartupFolders || company.StartupFolders.length === 0) {
				return `/admin/dashboard/carpetas-de-arranque/${companyParam}`
			}

			const sortedFolders = [...company.StartupFolders].sort(
				(a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
			)

			return `/admin/dashboard/carpetas-de-arranque/${companyParam}/${sortedFolders[0].id}`
		},
		[]
	)

	return (
		<div className="flex flex-col gap-2">
			<div className="flex items-center gap-2">
				<div className="bg-background rounded-lg p-1.5">
					<LayoutListIcon className="size-4.5" />
				</div>
				<h2 className="text-xl font-bold">Lista de Carpetas</h2>
			</div>

			<div className="mt-1 flex w-full flex-wrap gap-2" id={id}>
				<SearchInput
					setPage={() => {}}
					className="flex-1"
					onChange={actions.setSearch}
					inputClassName="bg-background"
					value={memoizedFilters.search}
					placeholder="Buscar por nombre o RUT de empresa..."
				/>

				<Select
					onValueChange={(value: "all" | "review" | "archived") => {
						if (value === "review") {
							actions.setonlyWithReviewRequest(true)
							actions.setOnlyWithArchivedFolders(false)
						} else if (value === "archived") {
							actions.setonlyWithReviewRequest(false)
							actions.setOnlyWithArchivedFolders(true)
						} else {
							actions.setonlyWithReviewRequest(false)
							actions.setOnlyWithArchivedFolders(false)
						}
					}}
					value={
						filters.onlyWithReviewRequest
							? "review"
							: filters.onlyWithArchivedFolders
								? "archived"
								: "all"
					}
				>
					<SelectTrigger className="border-input bg-background w-fit border">
						<SelectValue placeholder="Filtrar empresas" />
					</SelectTrigger>
					<SelectContent>
						<SelectGroup>
							<SelectLabel>Filtrar por estado</SelectLabel>
							<SelectSeparator />
							<SelectItem value={"all"}>Todas las empresas</SelectItem>
							<SelectItem value={"review"}>Solo en revisión</SelectItem>
							<SelectItem value={"archived"}>Con carpetas archivadas</SelectItem>
						</SelectGroup>
					</SelectContent>
				</Select>

				<Select value={memoizedFilters.otStatus ?? "all"} onValueChange={handleOtStatusChange}>
					<SelectTrigger className="border-input bg-background w-fit border">
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
							actions.setWithOtActive(true)
						} else {
							actions.setWithOtActive(false)
						}
					}}
					value={memoizedFilters.withOtActive ? "true" : "false"}
				>
					<SelectTrigger className="border-input bg-background w-fit border">
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
						actions.setOrderBy(orderBy)
						actions.setOrder(order)
					}}
				/>

				<Button
					size={"icon"}
					variant="outline"
					onClick={actions.resetFilters}
					className="size-8 border-teal-600 text-teal-600 hover:bg-teal-600 hover:text-white"
				>
					<FilterXIcon />
				</Button>

				<Button
					size={"icon"}
					variant="outline"
					onClick={() => {
						if (filteredCompanies?.length) {
							void exportStartupFoldersToExcel(filteredCompanies)
						}
					}}
					disabled={!filteredCompanies?.length}
					title="Exportar a Excel"
					className="size-8 border-emerald-600 text-emerald-600 hover:bg-emerald-600 hover:text-white"
				>
					<FileSpreadsheetIcon />
				</Button>
			</div>

			{!isLoading && filteredCompanies?.length === 0 && (
				<div className="col-span-full flex flex-col items-center justify-center space-y-3 rounded-lg border border-dashed p-8 text-center">
					<FilesIcon className="text-muted-foreground h-8 w-8" />
					<div>
						<p className="text-lg font-semibold">
							No hay carpetas de arranque para órdenes de trabajo
						</p>
						<p className="text-muted-foreground text-sm">
							Las carpetas de arranque se crean automáticamente al crear una orden de trabajo para
							una empresa contratista.
						</p>
					</div>
				</div>
			)}

			{isLoading || isFetching ? (
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
					{filteredCompanies?.map((company) => {
						const { props } = getImageProps({
							width: 56,
							height: 56,
							alt: company.name,
							src: company.image || "",
						})

						return (
							<Link className="h-full" href={getCompanyStartupFolderHref(company)}>
								<Card
									key={company.id}
									className="hover:bg-muted relative h-full transition-all hover:scale-102 hover:shadow-md hover:ring-teal-500"
								>
									<CardHeader className="sm:pb-2">
										<div className="flex items-center gap-4">
											<Avatar className="size-14 text-lg after:rounded-lg">
												<AvatarImage className="rounded-lg" {...props} />
												<AvatarFallback className="rounded-lg text-base uppercase">
													{company.name.slice(0, 2)}
												</AvatarFallback>
											</Avatar>

											<div>
												<CardTitle className="line-clamp-1 text-lg font-semibold">
													{company.name}
												</CardTitle>
												<CardDescription className="text-sm">{company.rut}</CardDescription>
											</div>
										</div>
									</CardHeader>

									<CardContent>
										<div>
											<h2 className="text-muted-foreground text-sm font-semibold">
												Carpetas de arranque:
											</h2>

											<div className="mt-1.5 flex flex-wrap gap-1.5 text-sm">
												{company.StartupFolders?.filter((f) => !f.isDeleted)
													.length > 0 ? (
													company.StartupFolders.filter((f) => !f.isDeleted).map((folder) => (
														<Badge
															key={folder.id}
															className={cn(
																"bg-accent text-text flex h-fit items-center tracking-wide text-wrap whitespace-normal",
																{
																	"border border-cyan-500 bg-cyan-500/10 text-cyan-500":
																		folder.status === StartupFolderStatus.COMPLETED,
																	"border border-amber-500 bg-amber-500/10 text-amber-500":
																		folder.isArchived,
																}
															)}
														>
															{folder.status === StartupFolderStatus.COMPLETED &&
																!folder.isArchived && <CheckCircleIcon />}
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
												folder.environmentalFolders?.[0]?.status === "SUBMITTED" ||
												folder.environmentFolders?.[0]?.status === "SUBMITTED" ||
												folder.safetyAndHealthFolders?.[0]?.status === "SUBMITTED" ||
												folder.workersFolders.some((folder) => folder.status === "SUBMITTED") ||
												folder.vehiclesFolders.some((folder) => folder.status === "SUBMITTED") ||
												folder.basicFolders.some((folder) => folder.status === "SUBMITTED")
										) && (
											<div className="w-full rounded-md bg-teal-500/10 px-3 py-2 text-xs md:text-sm">
												<span className="flex items-center font-semibold text-teal-500">
													<InfoIcon className="mr-1.5 size-3.5" />
													Hay carpetas pendientes de revisión
												</span>
											</div>
										)}

										{company.StartupFolders.some(
											(folder) =>
												folder.environmentalFolders?.[0]?.status === "EXPIRED" ||
												folder.environmentFolders?.[0]?.status === "EXPIRED" ||
												folder.safetyAndHealthFolders?.[0]?.status === "EXPIRED" ||
												folder.workersFolders.some((folder) => folder.status === "EXPIRED") ||
												folder.vehiclesFolders.some((folder) => folder.status === "EXPIRED") ||
												folder.basicFolders.some((folder) => folder.status === "EXPIRED")
										) && (
											<div className="w-full rounded-md bg-purple-500/10 px-3 py-2 text-xs md:text-sm">
												<span className="flex items-center font-semibold text-purple-500">
													<AlertCircleIcon className="mr-1.5 size-3.5" />
													Hay carpetas expiradas
												</span>
											</div>
										)}

										{/*<Button
										asChild
										className="h-9 w-full bg-teal-600 font-semibold tracking-wide text-white transition-colors hover:bg-teal-700 hover:text-white"
									>
										<Link
											href={`/admin/dashboard/carpetas-de-arranque/${generateSlug(company.name)}_${company.id}`}
										>
											Ver carpeta
										</Link>
									</Button>*/}
									</CardFooter>
								</Card>
							</Link>
						)
					})}
				</div>
			)}
		</div>
	)
})

AdminStartupFoldersList.displayName = "AdminStartupFoldersList"
export { AdminStartupFoldersList }
