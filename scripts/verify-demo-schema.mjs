import { PGlite } from "@electric-sql/pglite"
import { readFileSync } from "node:fs"

const sql = readFileSync("public/demo-db/schema.sql", "utf8")
const db = await PGlite.create()

try {
	await db.exec(sql)
	const tables = await db.query(
		`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name`
	)
	const enums = await db.query(
		`SELECT typname FROM pg_type WHERE typtype = 'e' ORDER BY typname`
	)
	console.log("OK")
	console.log(`tables: ${tables.rows.length}`)
	console.log(`enums:  ${enums.rows.length}`)
} catch (err) {
	console.error("FAIL")
	console.error(err.message)
	process.exit(1)
} finally {
	await db.close()
}
