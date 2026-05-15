import type { ACTOR_TYPE } from "@/generated/prisma/enums"

interface ActivityLogActor {
	actorType: ACTOR_TYPE
	user: { id: string; name: string } | null
	externalActor: { name: string; email: string } | null
}

export function resolveActorDisplay(log: ActivityLogActor): string {
	if (log.actorType === "USER" && log.user) return log.user.name
	if (log.actorType === "EXTERNAL_VISITOR" && log.externalActor)
		return `${log.externalActor.name} (visitante)`
	if (log.actorType === "SYSTEM") return "Sistema"
	return "Desconocido"
}
