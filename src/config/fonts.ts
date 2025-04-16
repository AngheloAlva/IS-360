import { Geist, Geist_Mono, Space_Grotesk, Manrope } from "next/font/google"

export const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
})

export const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
})

export const spaceGrotesk = Space_Grotesk({
	variable: "--font-space-grotesk",
	subsets: ["latin"],
})

export const generalFont = Manrope({
	variable: "--font-general",
	subsets: ["latin"],
})
