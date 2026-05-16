"use client"

import { useEffect, useState } from "react"

import { DEMO_USERS } from "./demo-auth/users"
import { getDemoUser, clearDemoUser, setDemoUser } from "./demo-auth/storage"
import type { DemoUser } from "./demo-auth/types"

type DemoSessionData = {
	user: DemoUser
	session: { id: string; userId: string }
}

type FetchOptions<TData = unknown> = {
	onRequest?: (ctx?: unknown) => void
	onSuccess?: (ctx: { data: TData }) => void | Promise<void>
	onError?: (ctx: { error: { message: string; code?: string; status?: number } }) => void
}

type CallOptions<TData = unknown> = FetchOptions<TData> & {
	fetchOptions?: FetchOptions<TData>
}

function pickFetchOptions<TData>(
	opts: FetchOptions<TData> | CallOptions<TData> | undefined
): FetchOptions<TData> | undefined {
	if (!opts) return undefined
	if ("fetchOptions" in opts && opts.fetchOptions) return opts.fetchOptions
	return opts as FetchOptions<TData>
}

type DemoResult<TData> = {
	data: TData | null
	error: { message: string; code?: string; status?: number } | null
}

function toSessionData(user: DemoUser | null): DemoSessionData | null {
	if (!user) return null
	return {
		user,
		session: { id: `demo-session-${user.id}`, userId: user.id },
	}
}

function useSession(): {
	data: DemoSessionData | null
	isPending: boolean
	error: null
	refetch: () => void
} {
	const [user, setUser] = useState<DemoUser | null>(null)
	const [isPending, setIsPending] = useState(true)

	useEffect(() => {
		setUser(getDemoUser())
		setIsPending(false)
		const handler = () => setUser(getDemoUser())
		window.addEventListener("demo-user-changed", handler)
		window.addEventListener("storage", handler)
		return () => {
			window.removeEventListener("demo-user-changed", handler)
			window.removeEventListener("storage", handler)
		}
	}, [])

	return {
		data: toSessionData(user),
		isPending,
		error: null,
		refetch: () => setUser(getDemoUser()),
	}
}

async function runFetchOptions<TData>(
	result: DemoResult<TData>,
	fetchOptions?: FetchOptions<TData>
): Promise<DemoResult<TData>> {
	fetchOptions?.onRequest?.()
	if (result.error) {
		fetchOptions?.onError?.({ error: result.error })
	} else if (result.data !== null) {
		await fetchOptions?.onSuccess?.({ data: result.data })
	}
	return result
}

type SignInData = { user: DemoUser; twoFactorRedirect: false }

async function signInEmail(
	body: { email?: string; password?: string; rememberMe?: boolean },
	opts?: CallOptions<SignInData>
): Promise<DemoResult<SignInData>> {
	const email = (body?.email ?? "").toLowerCase()
	const match = Object.values(DEMO_USERS).find((u) => u.email.toLowerCase() === email)
	const result: DemoResult<SignInData> = match
		? { data: { user: match, twoFactorRedirect: false }, error: null }
		: { data: null, error: { message: "Usuario demo no encontrado", code: "NOT_FOUND" } }
	if (match) setDemoUser(match)
	return runFetchOptions(result, pickFetchOptions(opts))
}

async function signOut(opts?: CallOptions<{ success: true }>): Promise<DemoResult<{ success: true }>> {
	clearDemoUser()
	return runFetchOptions({ data: { success: true }, error: null }, pickFetchOptions(opts))
}

function makeNoop<TData = { success: true }>(data: TData = { success: true } as TData) {
	return async (
		_body?: unknown,
		opts?: CallOptions<TData>
	): Promise<DemoResult<TData>> => {
		void _body
		return runFetchOptions({ data, error: null }, pickFetchOptions(opts))
	}
}

export const authClient = {
	useSession,
	signOut,
	signIn: {
		email: signInEmail,
	},
	changePassword: makeNoop(),
	requestPasswordReset: makeNoop(),
	resetPassword: makeNoop(),
	twoFactor: {
		enable: makeNoop<{ totpURI: string; backupCodes: string[] }>({
			totpURI: "otpauth://totp/demo",
			backupCodes: [],
		}),
		sendOtp: makeNoop(),
		verifyOtp: makeNoop(),
	},
}
