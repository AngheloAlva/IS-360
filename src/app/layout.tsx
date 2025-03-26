import { Toaster } from "sonner"

import { spaceGrotesk } from "@/config/fonts"

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
		<html lang="es">
			<body className={`${spaceGrotesk.className} font-general antialiased`}>
				{children}
				<Toaster />
			</body>
		</html>
	)
}
