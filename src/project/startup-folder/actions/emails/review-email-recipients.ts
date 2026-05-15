import { DocumentCategory } from "@/generated/prisma/enums"

const REVIEW_REQUEST_RECIPIENTS: Record<DocumentCategory, string[]> = {
	[DocumentCategory.SAFETY_AND_HEALTH]: ["demo@ingsimple.cl"],
	[DocumentCategory.ENVIRONMENTAL]: ["demo@ingsimple.cl"],
	[DocumentCategory.ENVIRONMENT]: ["demo@ingsimple.cl"],
	[DocumentCategory.TECHNICAL_SPECS]: ["demo@ingsimple.cl"],
	[DocumentCategory.PERSONNEL]: ["demo@ingsimple.cl"],
	[DocumentCategory.VEHICLES]: ["demo@ingsimple.cl"],
	[DocumentCategory.BASIC]: ["demo@ingsimple.cl"],
}

export function getReviewRequestRecipients(category: DocumentCategory): string[] {
	return REVIEW_REQUEST_RECIPIENTS[category]
}
