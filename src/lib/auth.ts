import { getDemoSession } from "./demo-auth/server"
import type { DemoSession } from "./demo-auth/server"

const noopHandler = async (): Promise<Response> =>
	new Response(JSON.stringify({ ok: true }), {
		status: 200,
		headers: { "content-type": "application/json" },
	})

export const auth = {
	handler: noopHandler,
	api: {
		getSession: async (_opts?: unknown): Promise<DemoSession | null> => {
			void _opts
			return getDemoSession()
		},
		userHasPermission: async (_opts?: unknown): Promise<{ success: true; error: null }> => {
			void _opts
			return { success: true, error: null }
		},
		setRole: async (_opts?: unknown): Promise<{ success: true }> => {
			void _opts
			return { success: true }
		},
		createUser: async (_opts?: unknown): Promise<{ user: { id: string }; success: true }> => {
			void _opts
			return { user: { id: `demo-user-${Date.now()}` }, success: true }
		},
		requestPasswordReset: async (
			_opts?: unknown
		): Promise<{ success: true; status: true; message: null }> => {
			void _opts
			return { success: true, status: true, message: null }
		},
	},
	$Infer: {} as {
		Session: DemoSession
	},
}

export type Session = DemoSession
