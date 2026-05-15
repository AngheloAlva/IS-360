import { auth } from "@/lib/auth"
import { submitSafetyTalkAttempt } from "@/project/safety-talk/actions/submit-attempt"
import { NextRequest } from "next/server"

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  })
  if (!session?.user) {
    return Response.json({ error: "No autorizado" }, { status: 401 })
  }

  try {
    const data = await request.json()
    await submitSafetyTalkAttempt(data)
    return Response.json({ success: true })
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Error al enviar el intento" },
      { status: 400 }
    )
  }
}

export const dynamic = "force-dynamic"
