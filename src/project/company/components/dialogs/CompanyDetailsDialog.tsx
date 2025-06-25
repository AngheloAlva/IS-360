"use client"

import { BuildingIcon, CalendarIcon, UserIcon, UsersIcon } from "lucide-react"
import { es } from "date-fns/locale"
import { format } from "date-fns"

import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar"
import { DialogLabel } from "@/shared/components/ui/dialog-label"
import { ScrollArea } from "@/shared/components/ui/scroll-area"
import { Separator } from "@/shared/components/ui/separator"
import { Badge } from "@/shared/components/ui/badge"
import {
	Dialog,
	DialogTitle,
	DialogHeader,
	DialogTrigger,
	DialogContent,
	DialogDescription,
} from "@/shared/components/ui/dialog"

import type { Company } from "@/project/company/hooks/use-companies"

interface CompanyDetailsDialogProps {
	company: Company
	children: React.ReactNode
}

export default function CompanyDetailsDialog({ children, company }: CompanyDetailsDialogProps) {
	return (
		<Dialog>
			<DialogTrigger asChild>{children}</DialogTrigger>

			<DialogContent className="overflow-hidden p-0">
				<div className="h-2 w-full bg-blue-600"></div>

				<DialogHeader className="px-4">
					<DialogTitle className="flex items-center gap-2">
						<BuildingIcon className="size-5" />
						Detalles de la Empresa
					</DialogTitle>
					<DialogDescription>Información general de la empresa {company.name}</DialogDescription>
				</DialogHeader>

				<ScrollArea className="h-full max-h-[calc(90vh-8rem)] px-6 pb-6">
					<div className="flex flex-col gap-6">
						<div className="flex flex-col gap-4">
							<div className="flex items-center gap-4">
								<Avatar className="size-16 text-lg">
									<AvatarImage src={company.image || ""} alt={company.name} />
									<AvatarFallback>{company.name.slice(0, 2)}</AvatarFallback>
								</Avatar>

								<div>
									<h3 className="text-lg font-semibold">{company.name}</h3>
									<p className="text-muted-foreground text-sm">RUT: {company.rut}</p>
								</div>
							</div>

							<div className="mt-2">
								<p className="text-muted-foreground flex items-center gap-1.5 text-sm font-medium">
									<UsersIcon className="size-4" />
									Supervisores ({company.users?.length || 0})
								</p>
								<div className="mt-2 flex flex-wrap gap-2">
									{company.users?.map((user) => (
										<Badge className="bg-blue-600 text-white" key={user.id}>
											{user.name}
										</Badge>
									))}
									{(!company.users || company.users.length === 0) && (
										<span className="text-muted-foreground text-sm">
											No hay supervisores asignados
										</span>
									)}
								</div>
							</div>
						</div>

						<Separator />

						<div className="grid grid-cols-2 gap-4">
							<DialogLabel
								icon={<CalendarIcon className="size-4" />}
								label="Fecha de registro"
								value={format(company.createdAt, "dd/MM/yyyy HH:mm", { locale: es })}
							/>

							{company.createdBy && (
								<DialogLabel
									icon={<UserIcon className="size-4" />}
									label="Creado por"
									value={company.createdBy.name}
								/>
							)}
						</div>
					</div>
				</ScrollArea>
			</DialogContent>
		</Dialog>
	)
}
