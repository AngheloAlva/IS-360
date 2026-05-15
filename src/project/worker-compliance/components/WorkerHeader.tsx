import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar"
import { Badge } from "@/shared/components/ui/badge"

interface WorkerHeaderProps {
	name: string
	rut: string
	company: string | null
	role: string
	image?: string | null
}

export function WorkerHeader({ name, rut, company, role, image }: WorkerHeaderProps) {
	const initials = name
		.split(" ")
		.slice(0, 2)
		.map((n) => n[0])
		.join("")
		.toUpperCase()

	return (
		<div className="flex items-center gap-4 rounded-xl border bg-card p-4 shadow-sm">
			<Avatar className="size-16">
				{image && <AvatarImage src={image} alt={name} />}
				<AvatarFallback className="text-lg font-semibold">{initials}</AvatarFallback>
			</Avatar>

			<div className="flex flex-col gap-1">
				<h2 className="text-xl font-bold leading-tight">{name}</h2>
				<p className="text-muted-foreground text-sm">
					RUT: <span className="font-medium text-foreground">{rut}</span>
				</p>
				{company && (
					<p className="text-muted-foreground text-sm">
						Empresa: <span className="font-medium text-foreground">{company}</span>
					</p>
				)}
				<Badge variant="secondary" className="w-fit text-xs">
					{role}
				</Badge>
			</div>
		</div>
	)
}
