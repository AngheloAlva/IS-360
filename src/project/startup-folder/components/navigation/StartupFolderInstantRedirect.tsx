"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"

import StartupFolderPageLoading from "../skeletons/StartupFolderPageLoading"

interface StartupFolderInstantRedirectProps {
	targetPath: string
}

export default function StartupFolderInstantRedirect({
	targetPath,
}: StartupFolderInstantRedirectProps): React.ReactElement {
	const router = useRouter()

	useEffect(() => {
		router.replace(targetPath)
	}, [router, targetPath])

	return <StartupFolderPageLoading />
}
