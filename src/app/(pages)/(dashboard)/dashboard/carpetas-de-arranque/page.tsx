"use client"

import { useEffect, useState } from "react"

import { useDemoUser } from "@/lib/demo-auth"
import { getFirstStartupFolder } from "@/project/startup-folder/actions/get-first-startup-folder"
import StartupFolderInstantRedirect from "@/project/startup-folder/components/navigation/StartupFolderInstantRedirect"
import StartupFolderPageLoading from "@/project/startup-folder/components/skeletons/StartupFolderPageLoading"

import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert"

type ResolveState =
	| { status: "loading" }
	| { status: "denied" }
	| { status: "empty" }
	| { status: "redirect"; targetPath: string }

// The demo DB (PGlite) only runs in the browser, so the first-folder lookup and
// redirect happen client-side instead of in a server component.
export default function StartupFoldersPage(): React.ReactElement {
	const user = useDemoUser()
	const [state, setState] = useState<ResolveState>({ status: "loading" })

	useEffect(() => {
		if (!user) return

		if (!user.id || !user.companyId) {
			setState({ status: "denied" })
			return
		}

		const companyId = user.companyId
		let cancelled = false

		getFirstStartupFolder({ companyId })
			.then((firstFolder) => {
				if (cancelled) return
				if (firstFolder) {
					setState({
						status: "redirect",
						targetPath: `/dashboard/carpetas-de-arranque/${companyId}/${firstFolder.id}`,
					})
				} else {
					setState({ status: "empty" })
				}
			})
			.catch(() => {
				if (!cancelled) setState({ status: "empty" })
			})

		return () => {
			cancelled = true
		}
	}, [user])

	if (state.status === "denied") {
		return (
			<Alert variant="destructive">
				<AlertTitle>Acceso denegado</AlertTitle>
				<AlertDescription>Debe iniciar sesión para acceder a esta página.</AlertDescription>
			</Alert>
		)
	}

	if (state.status === "empty") {
		return (
			<Alert>
				<AlertTitle>Sin carpetas de arranque</AlertTitle>
				<AlertDescription>
					Tu empresa aun no tiene carpetas disponibles para gestionar.
				</AlertDescription>
			</Alert>
		)
	}

	if (state.status === "redirect") {
		return <StartupFolderInstantRedirect targetPath={state.targetPath} />
	}

	return <StartupFolderPageLoading />
}
