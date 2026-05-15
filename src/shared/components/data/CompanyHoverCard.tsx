import { Building2Icon, MailIcon, MapPinIcon, PhoneIcon } from "lucide-react"
import Link from "next/link"

import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/shared/components/ui/hover-card"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { getImageProps } from "next/image"

interface CompanyHoverCardProps {
	href: string
	name?: string
	rut?: string | null
	image?: string | null
	triggerClassName?: string
}

export default function CompanyHoverCard({
	rut,
	name,
	href,
	image,
	triggerClassName,
}: CompanyHoverCardProps) {
	const { props } = getImageProps({
		width: 32,
		height: 32,
		alt: name || "",
		src: image || "",
	})

	return (
		<HoverCard openDelay={200}>
			<HoverCardTrigger
				className={`text-text flex w-56 cursor-pointer items-center gap-1.5 truncate hover:text-rose-500 hover:underline ${triggerClassName ?? ""}`}
			>
				<Building2Icon className="text-muted-foreground size-4" />
				<span className="truncate text-nowrap">{name}</span>
			</HoverCardTrigger>

			<HoverCardContent className="flex w-fit gap-2" side="top">
				<Avatar className="after:rounded-lg">
					<AvatarImage className="rounded-lg" alt={name} src={image ?? undefined} />
					<AvatarFallback className="rounded-lg">{name?.slice(0, 2).toUpperCase()}</AvatarFallback>
				</Avatar>

				<div className="flex flex-col gap-2">
					<div className="text-text">
						<p className="font-bold">{name}</p>
						<p className="text-muted-foreground text-sm">{rut || "Sin RUT"}</p>

						<Link
							href={href}
							className="text-primary inline-flex items-center gap-1 text-xs font-semibold hover:underline"
						>
							Ver mas
						</Link>
					</div>
				</div>
			</HoverCardContent>
		</HoverCard>
	)
}
