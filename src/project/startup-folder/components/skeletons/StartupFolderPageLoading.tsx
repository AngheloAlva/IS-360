import { Skeleton } from "@/shared/components/ui/skeleton"

export default function StartupFolderPageLoading(): React.ReactElement {
	return (
		<div className="w-full space-y-6">
			<div className="rounded-lg bg-linear-to-r from-teal-600 to-cyan-700 p-6 shadow-lg">
				<div className="flex items-center justify-between gap-4">
					<div className="space-y-2">
						<Skeleton className="h-8 w-64 bg-white/30" />
						<Skeleton className="h-4 w-80 bg-white/25" />
					</div>
					<div className="flex items-center gap-2">
						<Skeleton className="h-10 w-10 bg-white/30" />
						<Skeleton className="h-10 w-36 bg-white/30" />
						<Skeleton className="h-10 w-28 bg-white/30" />
					</div>
				</div>
			</div>

			<div className="rounded-lg border p-4">
				<Skeleton className="h-6 w-52" />
				<div className="mt-4 space-y-3">
					<Skeleton className="h-12 w-full" />
					<Skeleton className="h-12 w-full" />
					<Skeleton className="h-12 w-full" />
					<Skeleton className="h-12 w-full" />
				</div>
			</div>
		</div>
	)
}
