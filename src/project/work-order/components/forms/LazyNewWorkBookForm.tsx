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

const NewWorkBookFormContent = lazy(() => import("./NewWorkBookFormContent"))

interface LazyNewWorkBookFormProps {
	userId: string
	companyId: string
	className?: string
}

export default function LazyNewWorkBookForm({
	userId,
	className,
	companyId,
}: LazyNewWorkBookFormProps): React.ReactElement {
	const [open, setOpen] = useState(false)

	return (
		<Sheet open={open} onOpenChange={setOpen}>
			<SheetTrigger
				className={cn(
					"flex h-9 cursor-pointer items-center justify-center gap-1.5 rounded-md bg-white px-3 py-1 text-sm font-semibold tracking-wide text-blue-600 transition-all hover:scale-105",
					className
				)}
				onClick={() => setOpen(true)}
			>
				<PlusCircleIcon className="h-4 w-4" />
				<span className="hidden lg:inline">Libro de Obras</span>
			</SheetTrigger>

			<SheetContent className="gap-0 sm:max-w-xl">
				<SheetHeader className="shadow">
					<SheetTitle>Nuevo Libro de Obras</SheetTitle>
					<SheetDescription>
						Complete la información en el formulario para crear un nuevo libro de obras.
					</SheetDescription>
				</SheetHeader>

				{open && (
					<Suspense fallback={<WorkBookFormSkeleton />}>
						<NewWorkBookFormContent
							userId={userId}
							companyId={companyId}
							onClose={() => setOpen(false)}
						/>
					</Suspense>
				)}
			</SheetContent>
		</Sheet>
	)
}

// Componente de skeleton específico para el formulario de libro de obras
function WorkBookFormSkeleton() {
	return (
		<div className="grid w-full gap-x-3 gap-y-5 overflow-y-scroll px-4 pt-4 pb-16 sm:grid-cols-2">
			<div className="sm:col-span-2">
				<Skeleton className="h-5 w-40" />
				<Skeleton className="mt-2 h-4 w-64" />
			</div>

			{/* Selector de orden de trabajo */}
			<div className="space-y-2 sm:col-span-2">
				<Skeleton className="h-4 w-24" />
				<Skeleton className="h-10 w-full" />
			</div>

			{/* Información de la OT seleccionada */}
			<div className="bg-secondary-background/20 grid gap-y-4 rounded-lg p-3 shadow sm:col-span-2 sm:grid-cols-2">
				{Array.from({ length: 8 }).map((_, i) => (
					<div key={i} className="space-y-1">
						<Skeleton className="h-4 w-20" />
						<Skeleton className="h-4 w-32" />
					</div>
				))}
			</div>

			{/* Separador */}
			<div className="sm:col-span-2">
				<Skeleton className="h-px w-full" />
			</div>

			{/* Datos del libro de obras */}
			<div className="sm:col-span-2">
				<Skeleton className="h-6 w-48" />
				<Skeleton className="mt-2 h-4 w-64" />
			</div>

			{/* Campos del formulario */}
			<div className="space-y-2">
				<Skeleton className="h-4 w-24" />
				<Skeleton className="h-10 w-full" />
			</div>
			<div className="space-y-2">
				<Skeleton className="h-4 w-24" />
				<Skeleton className="h-10 w-full" />
			</div>

			{/* Botones */}
			<div className="mt-10 flex items-center justify-center gap-2 sm:col-span-2">
				<Skeleton className="h-10 w-1/2" />
				<Skeleton className="h-10 w-1/2" />
			</div>
		</div>
	)
}
