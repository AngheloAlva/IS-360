import { notFound } from "next/navigation"
import { toast } from "sonner"

import ResetPassword from "@/components/sections/auth/ResetPassword"

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

export default async function ResetPasswordPage(props: {
	searchParams: SearchParams
}): Promise<React.ReactElement> {
	const searchParams = await props.searchParams
	const token = searchParams.token as string | undefined
	const error = searchParams.error as string | undefined

	if (error === "invalid_token" || !token) {
		toast.error("El token es inválido", {
			description: "El token es inválido, por favor intenta de nuevo.",
		})
		notFound()
	}

	return <ResetPassword token={token} />
}
