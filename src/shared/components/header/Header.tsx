import { FontSizeSelector } from "../font-size/FontSizeSelector"
import { SidebarTrigger } from "../ui/sidebar"
import { Separator } from "../ui/separator"
import PageName from "../sidebar/PageName"
import ThemeButton from "./ThemeButton"

import type { Session } from "@/lib/auth"

export default function Header({
	session,
}: Readonly<{
	session: Session
}>): React.ReactElement {
	return (
		<header className="bg-background flex h-16 shrink-0 items-center justify-between gap-2 border-b px-4 shadow transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 md:px-8">
			<div className="flex items-center gap-2">
				<SidebarTrigger className="border-input -ml-1 size-8 border" />
				<Separator orientation="vertical" className="mx-2 min-h-8" />
				<PageName externalPath={session.user.accessRole === "PARTNER_COMPANY"} />
			</div>

			<div className="flex items-center gap-2">
				<FontSizeSelector />
				<ThemeButton />
			</div>
		</header>
	)
}
