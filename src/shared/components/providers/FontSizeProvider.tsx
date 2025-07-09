"use client"

import { createContext, useContext, useEffect, useState } from "react"

type FontSize = "small" | "medium" | "large" | "x-large"

interface FontSizeContextType {
	fontSize: FontSize
	setFontSize: (size: FontSize) => void
}

const FontSizeContext = createContext<FontSizeContextType | undefined>(undefined)

export function FontSizeProvider({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	const [fontSize, setFontSize] = useState<FontSize>("medium")

	useEffect(() => {
		const savedFontSize = localStorage.getItem("otc-font-size") as FontSize | null
		if (savedFontSize) {
			setFontSize(savedFontSize)
		}
	}, [])

	useEffect(() => {
		localStorage.setItem("otc-font-size", fontSize)

		document.documentElement.dataset.fontSize = fontSize
	}, [fontSize])

	return (
		<FontSizeContext.Provider value={{ fontSize, setFontSize }}>
			{children}
		</FontSizeContext.Provider>
	)
}

export function useFontSize() {
	const context = useContext(FontSizeContext)

	if (context === undefined) {
		throw new Error("useFontSize debe ser usado dentro de un FontSizeProvider")
	}

	return context
}
