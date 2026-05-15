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
		<header className="bg-sidebar flex shrink-0 items-center justify-between gap-2 border-b px-4 py-2 shadow transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
			<div className="flex items-center gap-2">
				<SidebarTrigger className="border-input -ml-1 size-8 border" />
				<Separator orientation="vertical" className="mx-2 min-h-8" />
				<PageName externalPath={session.user.accessRole === "PARTNER_COMPANY"} />
			</div>

			<div className="flex items-center gap-2">
				<ThemeButton />
			</div>
		</header>
	)
}
