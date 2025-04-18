"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Switch } from "@/components/ui/switch"

export default function ThemeButton(): React.ReactElement {
	const { setTheme, theme } = useTheme()

	return (
		<div className="flex items-center gap-2">
			<Sun className="h-[1.2rem] w-[1.2rem] text-yellow-500" />
			<Switch
				checked={theme === "dark"}
				onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
			/>
			<Moon className="text-text h-[1.2rem] w-[1.2rem]" />
			<span className="sr-only">Alternar Tema</span>
		</div>
	)
}
