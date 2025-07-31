"use client"

import { es } from "date-fns/locale"
import { format } from "date-fns"
import {
	MailIcon,
	UserIcon,
	FilesIcon,
	PhoneIcon,
	ShieldIcon,
	LandPlotIcon,
	BuildingIcon,
	ContactRoundIcon,
	CalendarIcon,
} from "lucide-react"

import { USER_ROLE_LABELS } from "@/lib/permissions"
import { AreasLabels } from "@/lib/consts/areas"

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

import type { ApiUser } from "@/project/user/types/api-user"
import { getImageProps } from "next/image"

interface UserDetailsDialogProps {
	user: ApiUser
	children: React.ReactNode
}

export default function UserDetailsDialog({ children, user }: UserDetailsDialogProps) {
	const { props } = getImageProps({
		width: 64,
		height: 64,
		alt: user.name,
		src: user.image || "",
	})

	return (
		<Dialog>
			<DialogTrigger asChild>{children}</DialogTrigger>

			<DialogContent className="overflow-hidden p-0">
				<div className="h-2 w-full bg-purple-500"></div>

				<DialogHeader className="px-4">
					<DialogTitle className="flex items-center gap-2">
						<UserIcon className="size-5" />
						Detalles del Usuario
					</DialogTitle>
					<DialogDescription>Información general del usuario {user.name}</DialogDescription>
				</DialogHeader>

				<ScrollArea className="h-full max-h-[calc(90vh-8rem)] px-6 pb-6">
					<div className="flex flex-col gap-6">
						<div className="flex flex-col gap-4">
							<div className="flex items-center gap-4">
								<Avatar className="size-16 text-lg">
									<AvatarImage {...props} />
									<AvatarFallback>{user.name.slice(0, 2)}</AvatarFallback>
								</Avatar>

								<div>
									<h3 className="text-lg font-semibold">{user.name}</h3>
									<p className="text-muted-foreground text-sm">RUT: {user.rut}</p>
								</div>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<DialogLabel
									label="Email"
									value={user.email}
									className="col-span-2"
									icon={<MailIcon className="size-4" />}
								/>
								<DialogLabel
									icon={<PhoneIcon className="size-4" />}
									label="Teléfono"
									value={user.phone || "No registrado"}
								/>
								{user.company && (
									<DialogLabel
										icon={<BuildingIcon className="size-4" />}
										label="Empresa"
										value={user.company.name}
									/>
								)}
								{user.area && (
									<DialogLabel
										icon={<LandPlotIcon className="size-4" />}
										label="Área"
										value={AreasLabels[user.area as keyof typeof AreasLabels]}
									/>
								)}
								{user.internalRole && (
									<DialogLabel
										icon={<ContactRoundIcon className="size-4" />}
										label="Cargo"
										value={user.internalRole}
									/>
								)}

								<DialogLabel
									label="Fecha de creación"
									icon={<CalendarIcon className="size-4" />}
									value={format(new Date(user.createdAt), "dd/MM/yyyy HH:mm", { locale: es })}
								/>
							</div>
						</div>

						<Separator />

						<div className="grid grid-cols-2 gap-6">
							<div className="col-span-2">
								<p className="flex items-center gap-2 font-medium">
									<ShieldIcon className="size-4" />
									Roles
								</p>

								<span className="text-muted-foreground text-sm">
									Modulos donde el usuario tiene permisos para crear, editar y eliminar.
								</span>

								<div className="mt-3 flex flex-wrap gap-2 font-medium">
									{user.role.split(",").map((role) => (
										<Badge key={role} className="bg-indigo-600 font-medium">
											{USER_ROLE_LABELS[role as keyof typeof USER_ROLE_LABELS]}
										</Badge>
									))}
								</div>
							</div>

							<div className="col-span-2">
								<p className="flex items-center gap-2 font-medium">
									<FilesIcon className="size-4" />
									Áreas de documentación
								</p>

								<span className="text-muted-foreground text-sm">
									Areas de la documentacion donde el usuario podra crear, editar y eliminar archivos
									o carpetas
								</span>

								<div className="mt-3 flex flex-wrap gap-2 font-medium">
									{user.documentAreas.map((area) => (
										<Badge key={area} className="bg-fuchsia-600 font-medium">
											{AreasLabels[area as keyof typeof AreasLabels]}
										</Badge>
									))}
								</div>
							</div>
						</div>
					</div>
				</ScrollArea>
			</DialogContent>
		</Dialog>
	)
}
