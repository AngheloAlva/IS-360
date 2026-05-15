import { PGlite } from "@electric-sql/pglite"

const DB_NAME = "is-360-demo"
const SCHEMA_URL = "/demo-db/schema.sql"
const SCHEMA_VERSION = 1

let dbPromise: Promise<PGlite> | null = null

async function isSchemaLoaded(db: PGlite, version: number): Promise<boolean> {
	const result = await db.query<{ version: number }>(
		`SELECT version FROM _demo_meta WHERE version = $1 LIMIT 1`,
		[version]
	).catch(() => null)
	return Boolean(result && result.rows.length > 0)
}

async function bootstrap(db: PGlite): Promise<void> {
	if (await isSchemaLoaded(db, SCHEMA_VERSION)) {
		return
	}

	const response = await fetch(SCHEMA_URL)
	if (!response.ok) {
		throw new Error(
			`Failed to load demo DB schema from ${SCHEMA_URL} (HTTP ${response.status})`
		)
	}
	const schemaSQL = await response.text()

	await db.exec(schemaSQL)
	await db.exec(`
		CREATE TABLE IF NOT EXISTS _demo_meta (version INTEGER PRIMARY KEY);
		INSERT INTO _demo_meta (version) VALUES (${SCHEMA_VERSION})
		ON CONFLICT (version) DO NOTHING;
	`)
}

export async function getDemoDb(): Promise<PGlite> {
	if (typeof window === "undefined") {
		throw new Error(
			"Demo DB (PGlite) only runs in the browser. Import it from Client Components."
		)
	}
	if (!dbPromise) {
		dbPromise = (async () => {
			const db = await PGlite.create(`idb://${DB_NAME}`)
			await bootstrap(db)
			return db
		})()
	}
	return dbPromise
}

export async function resetDemoDb(): Promise<void> {
	if (typeof window === "undefined") return

	if (dbPromise) {
		const db = await dbPromise
		await db.close()
		dbPromise = null
	}

	// PGlite stores its IndexedDB under "/pglite/<name>"
	await new Promise<void>((resolve, reject) => {
		const request = indexedDB.deleteDatabase(`/pglite/${DB_NAME}`)
		request.onsuccess = () => resolve()
		request.onerror = () => reject(request.error)
		request.onblocked = () =>
			reject(new Error("Reset blocked — cerrá otras pestañas y volvé a intentar."))
	})
}
