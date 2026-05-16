import { getDemoDb } from "@/lib/demo-db/client"

export const generateOTNumber = async () => {
	const db = await getDemoDb()

	await db.query(
		`INSERT INTO "Counter" ("id", "value") VALUES ('ot_counter', 1)
		 ON CONFLICT ("id") DO UPDATE SET "value" = "Counter"."value" + 1`,
		[]
	)

	const { rows } = await db.query<{ value: number }>(
		`SELECT "value" FROM "Counter" WHERE "id" = 'ot_counter'`,
		[]
	)

	const value = rows[0]?.value ?? 1

	const now = new Date()
	const day = now.getDate().toString().padStart(2, "0")
	const month = (now.getMonth() + 1).toString().padStart(2, "0")
	const year = now.getFullYear().toString().slice(-2)

	return `OT-${value.toString().padStart(4, "0")}${day}${month}${year}`
}
