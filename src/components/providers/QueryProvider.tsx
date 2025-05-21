"use client"

import { QueryClientProvider } from "@tanstack/react-query"

import { queryClient } from "@/lib/queryClient"

export default function QueryProvider({
	children,
}: {
	children: React.ReactNode
}): React.ReactElement {
	return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
