import { ACTIVITY_TYPE } from "@/generated/prisma/enums"

export const ActivityTypeLabels: Record<string, string> = {
	[ACTIVITY_TYPE.CREATE]: "Crear",
	[ACTIVITY_TYPE.UPDATE]: "Actualizar",
	[ACTIVITY_TYPE.DELETE]: "Eliminar",
	[ACTIVITY_TYPE.SUBMIT]: "Enviar",
	[ACTIVITY_TYPE.APPROVE]: "Aprobar",
	[ACTIVITY_TYPE.REJECT]: "Rechazar",
	[ACTIVITY_TYPE.CANCEL]: "Cancelar",
	[ACTIVITY_TYPE.COMPLETE]: "Completar",
	[ACTIVITY_TYPE.VIEW]: "Ver",
	[ACTIVITY_TYPE.DOWNLOAD]: "Descargar",
	[ACTIVITY_TYPE.UPLOAD]: "Subir",
	[ACTIVITY_TYPE.COMMENT]: "Comentar",
	[ACTIVITY_TYPE.ASSIGN]: "Asignar",
	[ACTIVITY_TYPE.UNASSIGN]: "Desasignar",
	[ACTIVITY_TYPE.LOGIN]: "Iniciar sesión",
	[ACTIVITY_TYPE.LOGOUT]: "Cerrar sesión",
}

export const ActivityTypeOptions = Object.entries(ActivityTypeLabels).map(([value, label]) => ({
	value,
	label,
}))
