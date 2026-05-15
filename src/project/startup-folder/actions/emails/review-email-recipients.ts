import { DocumentCategory } from "@/generated/prisma/enums"

const REVIEW_REQUEST_RECIPIENTS: Record<DocumentCategory, string[]> = {
	[DocumentCategory.SAFETY_AND_HEALTH]: [
		"cristian.pavez@oleotrasandino.cl",
		"katherine.burgos@oleotrasandino.cl",
		"eric.maltez@oleotrasandino.cl",
	],
	[DocumentCategory.ENVIRONMENTAL]: [
		"bcarrillo@dbj.cl",
		"katherine.burgos@oleotrasandino.cl",
		"eric.maltez@oleotrasandino.cl",
	],
	[DocumentCategory.ENVIRONMENT]: [
		"bcarrillo@dbj.cl",
		"katherine.burgos@oleotrasandino.cl",
		"eric.maltez@oleotrasandino.cl",
	],
	[DocumentCategory.TECHNICAL_SPECS]: [
		"jaime.chavez@oleotrasandino.cl",
		"eric.maltez@oleotrasandino.cl",
	],
	[DocumentCategory.PERSONNEL]: [
		"cristian.pavez@oleotrasandino.cl",
		"katherine.burgos@oleotrasandino.cl",
		"eric.maltez@oleotrasandino.cl",
	],
	[DocumentCategory.VEHICLES]: [
		"cristian.pavez@oleotrasandino.cl",
		"katherine.burgos@oleotrasandino.cl",
		"eric.maltez@oleotrasandino.cl",
	],
	[DocumentCategory.BASIC]: ["katherine.burgos@oleotrasandino.cl", "eric.maltez@oleotrasandino.cl"],
}

export function getReviewRequestRecipients(category: DocumentCategory): string[] {
	return REVIEW_REQUEST_RECIPIENTS[category]
}
