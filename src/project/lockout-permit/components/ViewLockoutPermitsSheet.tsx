"use client"

import { DoorClosedLockedIcon } from "lucide-react"
import { useState } from "react"

import ManageLockoutPermitsDialog from "./dialogs/ManageLockoutPermitsDialog"
import { LockoutPermitItem } from "./LockoutPermitItem"
import { useWorkPermitLockoutPermits } from "@/project/work-permit/hooks/use-work-permit-lockout-permits"

import { Accordion } from "@/shared/components/ui/accordion"
import { Button } from "@/shared/components/ui/button"
import { Badge } from "@/shared/components/ui/badge"
import {
	Sheet,
	SheetTitle,
	SheetHeader,
	SheetTrigger,
	SheetContent,
	SheetDescription,
} from "@/shared/components/ui/sheet"

import type { WorkPermit } from "@/project/work-permit/hooks/use-work-permit"

interface ViewLockoutPermitsSheetProps {
	isOtcMember: boolean
	workPermit: WorkPermit
}

export function ViewLockoutPermitsSheet({ workPermit, isOtcMember }: ViewLockoutPermitsSheetProps) {
	const [isOpen, setIsOpen] = useState(false)
	const lockoutPermitsCount = workPermit.lockoutPermits.length
	const {
		data: lockoutPermitsData,
		isLoading,
		isFetching,
	} = useWorkPermitLockoutPermits(workPermit.id, isOpen)
	const lockoutPermits = lockoutPermitsData?.lockoutPermits || []
	const hasPermits = lockoutPermits.length > 0

	const defaultValue = lockoutPermits.length === 1 ? "permit-0" : undefined

	return (
		<Sheet open={isOpen} onOpenChange={setIsOpen}>
			<SheetTrigger asChild>
				<Button variant="ghost" className="w-full justify-start font-semibold">
					<DoorClosedLockedIcon className="h-4 w-4 text-purple-500" />
					Permisos de Bloqueo
					{lockoutPermitsCount > 0 && (
						<Badge variant="secondary" className="ml-auto text-xs">
							{lockoutPermitsCount}
						</Badge>
					)}
				</Button>
			</SheetTrigger>

			<SheetContent side="right" className="w-full overflow-y-auto sm:max-w-2xl">
				<SheetHeader className="shadow">
					<SheetTitle className="flex items-center gap-2">
						<DoorClosedLockedIcon className="h-5 w-5 text-purple-600" />
						Permisos de Bloqueo
					</SheetTitle>
					<SheetDescription>
						Gestione los permisos de bloqueo y etiquetado asociados a este permiso de trabajo.
					</SheetDescription>
				</SheetHeader>

				<div className="space-y-4 px-4">
					<div className="flex items-center justify-between">
						<p className="text-muted-foreground text-sm">
							{hasPermits
								? `${lockoutPermits.length} permiso${lockoutPermits.length > 1 ? "s" : ""} de bloqueo`
								: "No hay permisos de bloqueo"}
						</p>

						<ManageLockoutPermitsDialog
							isOtcMember={isOtcMember}
							workPermitId={workPermit.id}
							companyId={workPermit.company.id}
						/>
					</div>

					{isLoading || isFetching ? (
						<div className="text-muted-foreground rounded-lg border px-4 py-8 text-center text-sm">
							Cargando permisos de bloqueo...
						</div>
					) : hasPermits ? (
						<Accordion type="single" collapsible defaultValue={defaultValue} className="w-full">
							{lockoutPermits.map((permit, index) => (
								<LockoutPermitItem
									index={index}
									key={permit.id}
									permit={permit}
									isOtcMember={isOtcMember}
									workPermitId={workPermit.id}
								/>
							))}
						</Accordion>
					) : (
						<div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed py-12 text-center">
							<DoorClosedLockedIcon className="text-muted-foreground/50 mb-4 h-12 w-12" />
							<h3 className="mb-2 text-lg font-semibold">No hay permisos de bloqueo</h3>
							<p className="text-muted-foreground mb-4 max-w-sm text-sm">
								Este permiso de trabajo aún no tiene permisos de bloqueo asociados. Cree uno para
								comenzar.
							</p>
							<ManageLockoutPermitsDialog
								workPermitId={workPermit.id}
								companyId={workPermit.company.id}
								isOtcMember={isOtcMember}
							/>
						</div>
					)}
				</div>
			</SheetContent>
		</Sheet>
	)
}
