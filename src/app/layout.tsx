import { Toaster } from "sonner"

import { generalFont } from "@/config/fonts"

import { ThemeProvider } from "@/shared/components/providers/ThemeProvider"
import { FontSizeProvider } from "@/shared/components/providers/FontSizeProvider"

import type { Metadata } from "next"

import "./globals.css"
import "./font-size.css"

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
			<body className={`${generalFont.className} font-general bg-background antialiased`}>
				<ThemeProvider enableSystem defaultTheme="system" attribute="class">
					<FontSizeProvider>
						{children}
					</FontSizeProvider>
				</ThemeProvider>
				<Toaster richColors position="top-left" />
			</body>
		</html>
	)
}
