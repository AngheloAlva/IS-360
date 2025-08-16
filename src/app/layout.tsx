import { Toaster } from "sonner"

import { generalFont } from "@/config/fonts"

import { ThemeProvider } from "@/shared/components/providers/ThemeProvider"
import { FontSizeProvider } from "@/shared/components/providers/FontSizeProvider"

import type { Metadata } from "next"

import "./globals.css"
import "./font-size.css"
import { ConstructionIcon } from "lucide-react"

export const metadata: Metadata = {
	title: "OTC",
}

export default function RootLayout({}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang="es" suppressHydrationWarning>
			<body className={`${generalFont.className} font-general bg-background antialiased`}>
				<ThemeProvider enableSystem defaultTheme="system" attribute="class">
					<FontSizeProvider>
						<div className="flex h-screen w-screen flex-1 flex-col items-center justify-between">
							<div></div>

							<div className="h-fit max-w-md text-center">
								<h1 className="text-text/60 mb-6 text-5xl font-bold">EN MANTENIMIENTO</h1>

								<div className="mb-6 flex items-center justify-center">
									<div className="text-8xl font-bold text-blue-500">5</div>
									<div className="mx-2 flex h-20 w-20 items-center justify-center rounded-xl bg-blue-500 p-4">
										<div className="bg-background rounded-lg p-1.5">
											<ConstructionIcon className="size-11 text-blue-500" />
										</div>
									</div>
									<div className="text-8xl font-bold text-blue-500">3</div>
								</div>

								<p className="text-muted-foreground mb-8">
									El sitio se encuentra en mantenimiento, por favor vuelva a intentar más tarde.
								</p>
							</div>

							<div className="text-muted-foreground py-4 text-center text-xs">
								© {new Date().getFullYear()} - OTC 360
							</div>
						</div>
					</FontSizeProvider>
				</ThemeProvider>
				<Toaster richColors position="top-left" />
			</body>
		</html>
	)
}
