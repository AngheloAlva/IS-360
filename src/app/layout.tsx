import { Toaster } from "sonner"

import { generalFont } from "@/config/fonts"

import { ThemeProvider } from "@/shared/components/providers/ThemeProvider"

import type { Metadata } from "next"

import "./globals.css"

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
				<ThemeProvider enableSystem defaultTheme="system" attribute="class">
					{children}
				</ThemeProvider>
				<Toaster richColors position="top-left" />
			</body>
		</html>
	)
}
