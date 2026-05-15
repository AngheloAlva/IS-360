import type { Prisma } from "@/generated/prisma/client"

export async function recomputeSubtreePaths(
	tx: Prisma.TransactionClient,
	rootId: string,
): Promise<void> {
	const root = await tx.location.findUniqueOrThrow({
		where: { id: rootId },
		select: { id: true, name: true, parentId: true },
	})

	const parentPath = root.parentId
		? (
				await tx.location.findUniqueOrThrow({
					where: { id: root.parentId },
					select: { path: true },
				})
			).path
		: null

	const newRootPath = parentPath ? `${parentPath} / ${root.name}` : root.name

	await tx.location.update({
		where: { id: rootId },
		data: { path: newRootPath },
	})

	const descendants = await tx.$queryRaw<
		{ id: string; name: string; parentId: string; depth: number }[]
	>`
		WITH RECURSIVE tree AS (
			SELECT id, name, "parentId", 1 AS depth FROM "Location" WHERE "parentId" = ${rootId}
			UNION ALL
			SELECT l.id, l.name, l."parentId", t.depth + 1 FROM "Location" l
			JOIN tree t ON l."parentId" = t.id
		)
		SELECT id, name, "parentId", depth FROM tree ORDER BY depth ASC, id ASC
	`

	const pathById = new Map<string, string>([[rootId, newRootPath]])

	for (const node of descendants) {
		const parentPathLocal = pathById.get(node.parentId)!
		const newPath = `${parentPathLocal} / ${node.name}`
		pathById.set(node.id, newPath)
		await tx.location.update({ where: { id: node.id }, data: { path: newPath } })
	}
}
