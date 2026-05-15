import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "sonner"

import { generalFont } from "@/config/fonts"

import { FontSizeProvider } from "@/shared/components/providers/FontSizeProvider"
import { ThemeProvider } from "@/shared/components/providers/ThemeProvider"

import type { Metadata } from "next"

import "./globals.css"

export const metadata: Metadata = {
	title: "IS 360",
	description:
		"IS 360 — Demo de sistema de gestión de mantenimiento industrial (CMMS). Órdenes de trabajo, permisos, equipos y planes de mantenimiento en una sola plataforma.",
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang="es" suppressHydrationWarning>
			<body
				className={`${generalFont.className} font-general bg-background selection:bg-primary selection:text-primary-foreground`}
			>
				<ThemeProvider enableSystem defaultTheme="system" attribute="class">
					<FontSizeProvider>{children}</FontSizeProvider>
					<Toaster richColors position="top-left" />
				</ThemeProvider>

				<Analytics />
			</body>
		</html>
	)
}
