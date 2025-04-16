import { Toaster } from "sonner"

import { generalFont } from "@/config/fonts"

import type { Metadata } from "next"

import "./globals.css"
import { ThemeProvider } from "@/components/providers/ThemeProvider"

export const metadata: Metadata = {
	title: "OTC",
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang="es" suppressHydrationWarning>
			<body className={`${generalFont.className} font-general antialiased`}>
				<ThemeProvider enableSystem defaultTheme="system">
					{children}
				</ThemeProvider>
				<Toaster />
			</body>
		</html>
	)
}
