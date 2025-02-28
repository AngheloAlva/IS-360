import { geistMono, geistSans } from "@/config/fonts"

import "./globals.css"

import type { Metadata } from "next"
import { Toaster } from "sonner"

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
			<body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
				{children}
				<Toaster />
			</body>
		</html>
	)
}
