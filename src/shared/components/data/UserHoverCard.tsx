import { MailIcon, PhoneIcon, UserIcon } from "lucide-react"

import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/shared/components/ui/hover-card"
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar"

interface UserHoverCardProps {
	rut?: string | null
	name?: string | null
	email?: string | null
	phone?: string | null
	image?: string | null
	triggerClassName?: string
}

export default function UserHoverCard({
	name,
	email,
	phone,
	rut,
	image,
	triggerClassName,
}: UserHoverCardProps) {
	const displayName = name || "Interno"

	return (
		<HoverCard openDelay={200}>
			<HoverCardTrigger
				className={`text-text flex w-40 cursor-pointer items-center gap-1.5 truncate select-none hover:underline ${triggerClassName ?? ""}`}
			>
				<UserIcon className="text-muted-foreground min-h-3.5 max-w-3.5 min-w-3.5" />
				<span className="line-clamp-1 w-52 truncate">{displayName}</span>
			</HoverCardTrigger>

			<HoverCardContent className="flex w-fit gap-2" side="top">
				<Avatar className="after:rounded-lg">
					<AvatarImage className="rounded-lg" alt={displayName} src={image ?? undefined} />
					<AvatarFallback className="rounded-lg">
						{displayName.slice(0, 2).toUpperCase()}
					</AvatarFallback>
				</Avatar>

				<div className="flex flex-col gap-2">
					<div className="text-text">
						<p className="font-bold">{displayName}</p>
						<p className="text-muted-foreground text-sm">{rut || "Sin RUT"}</p>
						<p className="mt-2 flex items-center gap-1 text-sm font-semibold">
							<MailIcon className="mt-0.5 size-3" />
							{email || "Sin correo"}
						</p>
						{phone ? (
							<p className="mt-1 flex items-center gap-1 text-sm font-semibold">
								<PhoneIcon className="size-3" />
								{phone}
							</p>
						) : null}
					</div>
				</div>
			</HoverCardContent>
		</HoverCard>
	)
}
