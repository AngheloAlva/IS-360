"use client"

import { useState, lazy, Suspense } from "react"
import { PlusCircleIcon } from "lucide-react"

import { cn } from "@/lib/utils"

import { Skeleton } from "@/shared/components/ui/skeleton"
import {
	Sheet,
	SheetTitle,
	SheetHeader,
	SheetTrigger,
	SheetContent,
	SheetDescription,
} from "@/shared/components/ui/sheet"

const CreateWorkOrderFormContent = lazy(() => import("./CreateWorkOrderFormContent"))

interface LazyCreateWorkOrderFormProps {
	workRequestId?: string
	equipmentId?: string[]
	equipmentName?: string[]
	maintenancePlanTaskId?: string[]
	initialData?: {
		programDate: Date
		workRequest?: string
		description?: string
		responsibleId: string
	}
}

export default function LazyCreateWorkOrderForm({
	initialData,
	equipmentId,
	workRequestId,
	equipmentName,
	maintenancePlanTaskId,
}: LazyCreateWorkOrderFormProps): React.ReactElement {
	const [open, setOpen] = useState(false)

	return (
		<Sheet open={open} onOpenChange={setOpen}>
			<SheetTrigger
				className={cn(
					"flex h-10 cursor-pointer items-center justify-center gap-1.5 rounded-md bg-white px-3 text-sm font-medium text-orange-700 transition-all hover:scale-105",
					{
						"hover:bg-accent text-text hover:text-accent-foreground data-[variant=destructive]:text-destructive-foreground data-[variant=destructive]:hover:bg-destructive/10 dark:data-[variant=destructive]:hover:bg-destructive/40 data-[variant=destructive]:hover:text-destructive-foreground data-[variant=destructive]:*:[svg]:!text-destructive-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex h-fit w-full cursor-default items-center justify-start gap-2 rounded-sm bg-transparent px-2 py-1.5 text-sm outline-hidden select-none hover:scale-100 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4":
							(equipmentId && maintenancePlanTaskId) || workRequestId,
					}
				)}
				onClick={() => setOpen(true)}
			>
				<PlusCircleIcon className="h-4 w-4" />
				<span className="hidden lg:inline">
					{equipmentName ? "Nueva OT" : "Nueva Orden de Trabajo"}
				</span>
			</SheetTrigger>

			<SheetContent className="gap-0 sm:max-w-2xl">
				<SheetHeader className="shadow">
					<SheetTitle>Nueva Orden de Trabajo</SheetTitle>
					<SheetDescription>
						Complete la información en el formulario para crear una nueva Orden de Trabajo.
					</SheetDescription>
				</SheetHeader>

				{open && (
					<Suspense fallback={<FormSkeleton />}>
						<CreateWorkOrderFormContent
							initialData={initialData}
							equipmentId={equipmentId}
							workRequestId={workRequestId}
							equipmentName={equipmentName}
							onClose={() => setOpen(false)}
							maintenancePlanTaskId={maintenancePlanTaskId}
						/>
					</Suspense>
				)}
			</SheetContent>
		</Sheet>
	)
}

function FormSkeleton() {
	return (
		<div className="grid w-full gap-x-3 gap-y-5 overflow-y-auto px-4 pt-4 pb-16 sm:grid-cols-2">
			<div className="sm:col-span-2">
				<Skeleton className="h-6 w-48" />
				<Skeleton className="mt-2 h-4 w-64" />
			</div>

			{Array.from({ length: 8 }).map((_, i) => (
				<div key={i} className="space-y-2">
					<Skeleton className="h-4 w-24" />
					<Skeleton className="h-10 w-full" />
				</div>
			))}

			<div className="flex gap-2 sm:col-span-2">
				<Skeleton className="h-10 flex-1" />
				<Skeleton className="h-10 flex-1" />
			</div>
		</div>
	)
}
