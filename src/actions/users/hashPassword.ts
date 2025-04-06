"use server"

import { createHash } from "crypto"

export async function hashPassword(password: string): Promise<string> {
	// Convert password to Uint8Array
	const encoder = new TextEncoder()
	const data = encoder.encode(password)

	// Create SHA-256 hash
	const hash = createHash("sha256")
	hash.update(data)

	return hash.digest("hex")
}
