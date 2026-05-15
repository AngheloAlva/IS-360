"use client"

import { useEffect, useState } from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "../ui/button"

export default function ThemeButton(): React.ReactElement | null {
	const { setTheme, theme } = useTheme()
	const [mounted, setMounted] = useState(false)

	useEffect(() => {
		setMounted(true)
	}, [])

	const handleThemeChange = () => {
		setTheme(theme === "dark" ? "light" : "dark")
	}

	if (!mounted) {
		return null
	}

	return (
		<Button size="icon" variant="outline" onClick={handleThemeChange} className="size-8">
			{theme === "dark" ? <Moon className="text-text" /> : <Sun className="text-yellow-500" />}
			<span className="sr-only">Alternar Tema</span>
		</Button>
	)
}
